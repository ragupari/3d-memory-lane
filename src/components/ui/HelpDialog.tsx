import { useRef, useEffect } from "react";
import { X, Heart, ArrowRight } from "lucide-react";
export function HelpDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      prev?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="help-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="help-title"
    >
      <button
        autoFocus
        className="icon-button close-dialog"
        aria-label="Close instructions"
        onClick={onClose}
      >
        <X size={19} />
      </button>
      <Heart size={27} strokeWidth={1.2} />
      <span className="eyebrow">THERE’S NO HURRY HERE</span>
      <h2 id="help-title" className="cursive-heading">
        Find Your Own Pace
      </h2>
      <p>
        Stroll along the bridge toward the Eiffel Tower and let every moment
        find you.
      </p>
      <dl>
        <div>
          <dt>Walk forward & back</dt>
          <dd>Scroll · W / S · ↑ / ↓</dd>
        </div>
        <div>
          <dt>On your phone</dt>
          <dd>Swipe up / down</dd>
        </div>
        <div>
          <dt>Look around</dt>
          <dd>Move your mouse · Drag sideways</dd>
        </div>
        <div>
          <dt>Photos, videos & audio</dt>
          <dd>Click a frame or Listen button</dd>
        </div>
        <div>
          <dt>Auto walk</dt>
          <dd>Space, outside a button</dd>
        </div>
        <div>
          <dt>Close / leave</dt>
          <dd>Escape</dd>
        </div>
      </dl>
      <p className="help-small">
        Your walk is saved on this device. Memories gently shimmer and fade as
        you stroll along the bridge.
      </p>
      <button className="primary-button" onClick={onClose}>
        Let’s wander
        <ArrowRight size={16} />
      </button>
    </dialog>
  );
}
