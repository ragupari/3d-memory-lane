import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useDecryptedUrl } from "../../utils/mediaCrypto";

// 1-sample silent WAV used to unlock the HTMLAudioElement synchronously on the first keystroke/click
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const NORMAL_VOLUME = 0.35;
const DUCKED_VOLUME = 0.05;

export function AudioControl({ ducked = false }: { ducked?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState(false);
  const enabledRef = useRef(true);
  const duckedRef = useRef(ducked);
  const primedRef = useRef(false);
  const bgmUrl = useDecryptedUrl("/audio/bgm.mp3");

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    duckedRef.current = ducked;
    if (ref.current && bgmUrl) {
      ref.current.volume = ducked ? DUCKED_VOLUME : NORMAL_VOLUME;
    }
  }, [ducked, bgmUrl]);

  // Prime the <audio> element synchronously on the user's first keystroke or click (e.g. typing the passcode)
  useEffect(() => {
    const primeAudioOnGesture = () => {
      const audio = ref.current;
      if (!audio || primedRef.current || bgmUrl) return;
      primedRef.current = true;
      audio.src = SILENT_WAV;
      audio.volume = 0;
      void audio
        .play()
        .then(() => {
          audio.pause();
        })
        .catch(() => {
          primedRef.current = false;
        });
    };

    window.addEventListener("keydown", primeAudioOnGesture, { capture: true });
    window.addEventListener("pointerdown", primeAudioOnGesture, {
      capture: true,
    });
    window.addEventListener("touchstart", primeAudioOnGesture, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("keydown", primeAudioOnGesture, {
        capture: true,
      });
      window.removeEventListener("pointerdown", primeAudioOnGesture, {
        capture: true,
      });
      window.removeEventListener("touchstart", primeAudioOnGesture, {
        capture: true,
      });
    };
  }, [bgmUrl]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio || !bgmUrl) return;

    audio.src = bgmUrl;
    audio.loop = true;
    audio.volume = duckedRef.current ? DUCKED_VOLUME : NORMAL_VOLUME;
    audio.load();

    const tryAutoPlay = () => {
      if (!enabledRef.current || !ref.current || !bgmUrl) return;
      ref.current.volume = duckedRef.current ? DUCKED_VOLUME : NORMAL_VOLUME;
      ref.current
        .play()
        .then(() => {
          setError(false);
        })
        .catch(() => {
          /* Browser blocked unmuted autoplay; will start on next gesture */
        });
    };

    tryAutoPlay();

    const onFirstGesture = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest(".sound-control")) return;
      if (enabledRef.current && ref.current && ref.current.paused) {
        tryAutoPlay();
      }
    };

    window.addEventListener("pointerdown", onFirstGesture, { capture: true });
    window.addEventListener("keydown", onFirstGesture, { capture: true });
    window.addEventListener("touchstart", onFirstGesture, {
      capture: true,
      passive: true,
    });
    window.addEventListener("wheel", onFirstGesture, { passive: true });

    const visibility = () => {
      if (!ref.current) return;
      if (document.hidden) ref.current.pause();
      else if (enabledRef.current) {
        void ref.current.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture, {
        capture: true,
      });
      window.removeEventListener("keydown", onFirstGesture, { capture: true });
      window.removeEventListener("touchstart", onFirstGesture, {
        capture: true,
      });
      window.removeEventListener("wheel", onFirstGesture);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [bgmUrl]);

  const toggle = async () => {
    const audio = ref.current;
    if (!audio || !bgmUrl) return;
    const targetVolume = duckedRef.current ? DUCKED_VOLUME : NORMAL_VOLUME;

    if (enabled) {
      if (audio.paused) {
        try {
          audio.volume = targetVolume;
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
        audio.volume = targetVolume;
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
      <audio
        ref={ref}
        loop
        preload="auto"
        onCanPlay={() => {
          if (
            enabledRef.current &&
            ref.current &&
            bgmUrl &&
            ref.current.paused
          ) {
            ref.current.volume = duckedRef.current
              ? DUCKED_VOLUME
              : NORMAL_VOLUME;
            void ref.current.play().catch(() => {});
          }
        }}
      />
      {bgmUrl && (
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
      )}
    </>
  );
}
