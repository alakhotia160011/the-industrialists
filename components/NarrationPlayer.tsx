"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

// App-wide: at most one narration plays at a time. Plain Audio objects live
// outside React, so without this a clip keeps playing after you navigate away
// and a second profile's clip would overlap it.
let currentlyPlaying: HTMLAudioElement | null = null;

export default function NarrationPlayer({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Cache the generated audio URL so replays are instant (no second request).
  const urlRef = useRef<string | null>(null);

  // Stop and clean up this player's audio when the component unmounts (e.g. the
  // user navigates back to the homepage), so it can't keep playing in the void.
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        if (currentlyPlaying === audio) currentlyPlaying = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  async function ensureAudio(): Promise<HTMLAudioElement> {
    if (audioRef.current && urlRef.current) return audioRef.current;

    setStatus("loading");
    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `Narration failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    urlRef.current = url;

    const audio = new Audio(url);
    audio.addEventListener("ended", () => {
      setStatus("idle");
      if (currentlyPlaying === audio) currentlyPlaying = null;
    });
    audio.addEventListener("pause", () => {
      if (!audio.ended) setStatus("paused");
    });
    audio.addEventListener("play", () => {
      setStatus("playing");
      currentlyPlaying = audio;
    });
    audioRef.current = audio;
    return audio;
  }

  async function onClick() {
    try {
      if (status === "playing") {
        audioRef.current?.pause();
        return;
      }
      const audio = await ensureAudio();
      // Halt any narration playing elsewhere in the app before starting this one.
      if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
      }
      currentlyPlaying = audio;
      await audio.play();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const label =
    status === "loading"
      ? "Generating audio…"
      : status === "playing"
        ? "Pause narration"
        : status === "paused"
          ? "Resume narration"
          : status === "error"
            ? "Retry narration"
            : "Listen to this profile";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={status === "loading"}
        aria-label={`${label} of ${name}`}
        className="inline-flex items-center gap-2.5 border border-ink bg-ink px-5 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-paper transition-colors hover:border-accent hover:bg-accent disabled:opacity-60"
      >
        <Icon status={status} />
        {label}
      </button>
      {status === "error" && (
        <span className="font-mono text-[0.7rem] tracking-wide text-brass">
          Couldn&apos;t generate audio — check the ElevenLabs key.
        </span>
      )}
    </div>
  );
}

function Icon({ status }: { status: Status }) {
  if (status === "loading") {
    return (
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
    );
  }
  if (status === "playing") {
    return (
      <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <rect x="1.5" y="1" width="3" height="10" rx="0.5" />
        <rect x="7.5" y="1" width="3" height="10" rx="0.5" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M2 1.2v9.6a.6.6 0 0 0 .92.5l7.4-4.8a.6.6 0 0 0 0-1L2.92.7A.6.6 0 0 0 2 1.2Z" />
    </svg>
  );
}
