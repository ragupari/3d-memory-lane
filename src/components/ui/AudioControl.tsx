import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function AudioControl() {
  const ref = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState(false);
  const enabledRef = useRef(true);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.volume = 0.35;

    const tryAutoPlay = () => {
      if (!enabledRef.current || !ref.current) return;
      ref.current
        .play()
        .then(() => {
          setError(false);
        })
        .catch(() => {
          /* Browser blocked unmuted autoplay; will start on first interaction */
        });
    };

    tryAutoPlay();

    const onFirstGesture = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest(".sound-control")) return;
      if (enabledRef.current && ref.current && ref.current.paused) {
        tryAutoPlay();
      }
    };

    window.addEventListener("pointerdown", onFirstGesture);
    window.addEventListener("keydown", onFirstGesture);
    window.addEventListener("touchstart", onFirstGesture);

    const visibility = () => {
      if (!ref.current) return;
      if (document.hidden) ref.current.pause();
      else if (enabledRef.current) {
        void ref.current.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  const toggle = async () => {
    const audio = ref.current;
    if (!audio) return;

    if (enabled) {
      if (audio.paused) {
        try {
          await audio.play();
          setError(false);
        } catch {
          setError(true);
        }
        return;
      }
      audio.pause();
      setEnabled(false);
    } else {
      try {
        await audio.play();
        setEnabled(true);
        setError(false);
      } catch {
        setError(true);
      }
    }
  };

  return (
    <>
      <audio ref={ref} src="/audio/bgm.mp3" loop preload="auto" autoPlay />
      <button
        className="sound-control"
        onClick={() => void toggle()}
        aria-pressed={enabled}
        aria-label={
          enabled ? "Mute background music" : "Play background music"
        }
      >
        {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>
          {error ? "Audio unavailable" : enabled ? "Sound on" : "Sound off"}
        </span>
      </button>
    </>
  );
}

