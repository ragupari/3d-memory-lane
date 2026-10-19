import { useRef, useEffect } from "react";
import { X, Leaf, ArrowRight } from "lucide-react";
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
      <Leaf size={27} strokeWidth={1} />
      <span className="eyebrow">THERE’S NO HURRY HERE</span>
      <h2 id="help-title">Find your own pace.</h2>
      <p>Follow the path. Let the little moments find you.</p>
      <dl>
        <div>
          <dt>Move forward & back</dt>
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
          <dt>Open a memory</dt>
          <dd>Click a photo or its title</dd>
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
        Your journey is saved on this device. Every photograph appears once, and
        you can always walk back.
      </p>
      <button className="primary-button" onClick={onClose}>
        Let’s wander
        <ArrowRight size={16} />
      </button>
    </dialog>
  );
}
