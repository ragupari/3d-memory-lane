import { useEffect, useRef, useState } from "react";
import { X, Calendar, Play, Pause } from "lucide-react";
import type { MemoryPhoto } from "../../types/memory";

export function PhotoViewer({
  photo,
  onClose,
}: {
  photo: MemoryPhoto;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrent, setAudioCurrent] = useState("0:00");

  const mediaType = photo.type ?? "photo";
  const descriptionText = photo.description ?? photo.caption;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);

  const toggleAudio = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (audioPlaying) {
      el.pause();
      setAudioPlaying(false);
    } else {
      try {
        await el.play();
        setAudioPlaying(true);
      } catch {
        setAudioPlaying(false);
      }
    }
  };

  const formatSec = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <dialog
      className="photo-dialog"
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="memory-title"
    >
      <div className="photo-sheet">
        <button
          autoFocus
          className="icon-button close-dialog"
          onClick={onClose}
          aria-label="Close memory"
        >
          <X size={20} />
        </button>
        <div className="photo-image">
          {failed ? (
            <p>
              This memory media couldn’t be loaded.
              <br />
              Its story is still here.
            </p>
          ) : (
            <>
              {(mediaType !== "video" ||
                (photo.src &&
                  photo.src !== photo.videoSrc &&
                  !/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(photo.src))) && (
                <img
                  src={photo.src}
                  alt={photo.title ?? "A cherished memory"}
                  onError={() => {
                    if (mediaType !== "video") setFailed(true);
                  }}
                  className={
                    mediaType === "video" ? "viewer-backdrop-img" : undefined
                  }
                />
              )}
              {mediaType === "video" && photo.videoSrc && (
                <video
                  className="viewer-video"
                  src={photo.videoSrc}
                  poster={
                    photo.src &&
                    photo.src !== photo.videoSrc &&
                    !/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(photo.src)
                      ? photo.src
                      : undefined
                  }
                  onError={() => setFailed(true)}
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              )}
              {mediaType === "audio" && photo.audioSrc && (
                <div className="viewer-audio-overlay">
                  <audio
                    ref={audioRef}
                    src={photo.audioSrc}
                    onTimeUpdate={() => {
                      const el = audioRef.current;
                      if (!el) return;
                      setAudioCurrent(formatSec(el.currentTime));
                      setAudioProgress(
                        el.duration ? (el.currentTime / el.duration) * 100 : 0,
                      );
                    }}
                    onEnded={() => setAudioPlaying(false)}
                  />
                  <div className="audio-visualizer-card">
                    <div
                      className={`audio-waveform ${audioPlaying ? "playing" : ""}`}
                      aria-hidden="true"
                    >
                      {Array.from({ length: 18 }, (_, i) => (
                        <span
                          key={i}
                          style={{ animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </div>
                    <div className="audio-controls-row">
                      <button
                        type="button"
                        className="audio-play-btn"
                        onClick={() => void toggleAudio()}
                        aria-label={
                          audioPlaying
                            ? "Pause audio clip"
                            : "Listen to audio clip"
                        }
                      >
                        {audioPlaying ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                        <span>
                          {audioPlaying ? "Pause clip" : "Listen to clip"}
                        </span>
                      </button>
                      <div className="audio-progress-bar">
                        <span style={{ width: `${audioProgress}%` }} />
                      </div>
                      <span className="audio-time-label">
                        {audioCurrent} / {photo.duration ?? "0:12"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="photo-caption">
          <h2 id="memory-title" className="cursive-heading">
            {photo.title ?? "A little memory"}
          </h2>
          {descriptionText && (
            <p className="memory-description">{descriptionText}</p>
          )}
          {photo.date && (
            <div className="metadata">
              <span>
                <Calendar size={13} />
                <strong>Date:</strong>{" "}
                {new Date(photo.date + "T12:00:00").toLocaleDateString(
                  undefined,
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
