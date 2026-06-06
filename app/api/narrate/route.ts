import { synthesize } from "@/lib/elevenlabs";
import { getPerson, getProfile } from "@/lib/profiles";

export const runtime = "nodejs";

// In-memory cache (per warm server instance) so repeat requests skip ElevenLabs.
const memCache = new Map<string, ArrayBuffer>();

export async function POST(request: Request) {
  let slug: string;
  try {
    const body = await request.json();
    slug = String(body?.slug ?? "");
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const person = getPerson(slug);
  if (!person) {
    return Response.json({ error: "Unknown industrialist" }, { status: 404 });
  }

  if (memCache.has(slug)) {
    return audioResponse(memCache.get(slug)!);
  }

  // Try durable cache (Vercel Blob) when configured.
  const cached = await readBlobCache(slug);
  if (cached) {
    memCache.set(slug, cached);
    return audioResponse(cached);
  }

  const profile = getProfile(slug);
  const script =
    profile?.narrationScript?.trim() ||
    `${person.name} led ${person.company} from ${person.years}. A full narrated profile is being researched.`;

  let audio: ArrayBuffer;
  try {
    audio = await synthesize(script);
  } catch (err) {
    console.error("Narration failed:", err);
    return Response.json(
      { error: "Narration failed", detail: String(err) },
      { status: 502 },
    );
  }

  memCache.set(slug, audio);
  await writeBlobCache(slug, audio); // no-op if Blob isn't configured

  return audioResponse(audio);
}

function audioResponse(audio: ArrayBuffer): Response {
  return new Response(audio, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

const blobKey = (slug: string) => `narration/${slug}.mp3`;

async function readBlobCache(slug: string): Promise<ArrayBuffer | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: blobKey(slug), limit: 1 });
    const hit = blobs.find((b) => b.pathname === blobKey(slug));
    if (!hit) return null;
    const res = await fetch(hit.url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch (err) {
    console.error("Blob read failed:", err);
    return null;
  }
}

async function writeBlobCache(slug: string, audio: ArrayBuffer): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    const { put } = await import("@vercel/blob");
    await put(blobKey(slug), Buffer.from(audio), {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error("Blob write failed:", err);
  }
}
