// "Daniel", a deep, authoritative British narrator (Attenborough-adjacent),
// the best documentary fit among ElevenLabs' premade voices. Override with
// ELEVENLABS_VOICE_ID to use any voice from the Voice Library.
const DEFAULT_VOICE_ID = "onwK4e9ZLuTAKqWW03F9";

// Narration is cached (server + browser), so latency is irrelevant, reach for
// the newest, most expressive model. If it's unavailable for this account we
// fall back to the stable flagship below.
const DEFAULT_MODEL_ID = "eleven_v3";
const FALLBACK_MODEL_ID = "eleven_multilingual_v2";

/**
 * Synthesize speech with ElevenLabs and return the MP3 bytes.
 * Requires ELEVENLABS_API_KEY; voice + model are configurable via env.
 * Tries the configured/newest model, then falls back once on failure.
 */
export async function synthesize(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const primaryModel = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;

  try {
    return await tts(text, voiceId, primaryModel, apiKey);
  } catch (err) {
    if (primaryModel !== FALLBACK_MODEL_ID) {
      // The newest model may be gated or reject these settings, fall back to
      // the proven flagship so narration still works.
      console.warn(
        `ElevenLabs model "${primaryModel}" failed; falling back to ${FALLBACK_MODEL_ID}.`,
        err instanceof Error ? err.message : err,
      );
      return await tts(text, voiceId, FALLBACK_MODEL_ID, apiKey);
    }
    throw err;
  }
}

async function tts(
  text: string,
  voiceId: string,
  modelId: string,
  apiKey: string,
): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs error ${res.status}: ${detail.slice(0, 300)}`);
  }

  return res.arrayBuffer();
}
