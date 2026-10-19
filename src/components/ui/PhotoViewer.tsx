import { useEffect, useRef, useState } from "react";
import { X, MapPin, Calendar, ArrowUpRight } from "lucide-react";
import type { MemoryPhoto } from "../../types/memory";
export function PhotoViewer({
  photo,
  onClose,
}: {
  photo: MemoryPhoto;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
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
              This photograph couldn’t be loaded.
              <br />
              Its story is still here.
            </p>
          ) : (
            <img
              src={photo.src}
              alt={photo.title ?? "A photograph from the memory forest"}
              onError={() => setFailed(true)}
            />
          )}
        </div>
        <div className="photo-caption">
          <span className="eyebrow">A MOMENT TO KEEP</span>
          <h2 id="memory-title">{photo.title ?? "A little memory"}</h2>
          {photo.caption && <p>{photo.caption}</p>}
          <div className="metadata">
            {photo.date && (
              <span>
                <Calendar size={13} />
                {new Date(photo.date + "T12:00:00").toLocaleDateString(
                  undefined,
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </span>
            )}
            {photo.location && (
              <span>
                <MapPin size={13} />
                {photo.location}
              </span>
            )}
          </div>
          <a href={photo.src} target="_blank" rel="noreferrer">
            Open original <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </dialog>
  );
}
