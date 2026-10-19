import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
export function AudioControl() {
  const ref = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const audio = ref.current!;
    audio.volume = 0.2;
    const visibility = () => {
      if (document.hidden) audio.pause();
      else if (enabled) void audio.play().catch(() => setEnabled(false));
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [enabled]);
  const toggle = async () => {
    if (enabled) {
      ref.current?.pause();
      setEnabled(false);
    } else {
      try {
        await ref.current?.play();
        setEnabled(true);
        setError(false);
      } catch {
        setError(true);
      }
    }
  };
  return (
    <>
      <audio ref={ref} src="/audio/forest-ambient.wav" loop preload="none" />
      <button
        className="sound-control"
        onClick={() => void toggle()}
        aria-pressed={enabled}
        aria-label={enabled ? "Mute forest ambience" : "Play forest ambience"}
      >
        {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>
          {error ? "Audio unavailable" : enabled ? "Sound on" : "Sound off"}
        </span>
      </button>
    </>
  );
}
