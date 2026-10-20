import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Camera,
  ChevronRight,
  Film,
  Footprints,
  Heart,
  Maximize,
  Minimize,
  Mouse,
  Music,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMemoryJourney } from "./hooks/useMemoryJourney";
import { PhotoViewer } from "./components/ui/PhotoViewer";
import { IntroScreen } from "./components/ui/IntroScreen";
import { AudioControl } from "./components/ui/AudioControl";
import type { MemoryPhoto } from "./types/memory";

const ForestScene = lazy(() => import("./components/forest/ForestScene"));

export default function App() {
  const journey = useMemoryJourney();
  const reduced = Boolean(useReducedMotion());
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<MemoryPhoto | null>(null);
  const [auto, setAuto] = useState(false);
  const [ending, setEnding] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const enterRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const context = c.getContext("webgl2");
      setWebgl(Boolean(context));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const listener = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  useEffect(() => {
    if (ending) endRef.current?.focus();
  }, [ending]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        entered &&
        !selected &&
        !ending &&
        !(e.target as HTMLElement).closest("button,dialog")
      ) {
        e.preventDefault();
        setAuto((a) => !a);
      }
      if (e.key === "Escape" && !selected) {
        if (entered) {
          setEntered(false);
          setAuto(false);
          setTimeout(() => enterRef.current?.focus(), 0);
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [entered, selected, ending]);

  const onReady = useCallback(() => setReady(true), []);
  const onEnd = useCallback(() => {
    setEnding(true);
    setAuto(false);
  }, []);

  const inspect = (photo: MemoryPhoto) => {
    setSelected(photo);
    setAuto(false);
    journey.discover([photo.id]);
  };

  const move = (step: number) => {
    journey.target.current = Math.max(
      0,
      Math.min(journey.length, journey.target.current + step),
    );
  };

  const nearby = journey.layout.filter(
    (p) =>
      p.distance >= journey.zone * 8 - 4 && p.distance < journey.zone * 8 + 16,
  );

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* Native fullscreen is optional. */
    }
  };

  const fallback = entered ? (
    <div className="fallback">
      <Heart size={32} />
      <h2 className="cursive-heading">A quieter way to remember.</h2>
      <p>
        3D isn’t available in this browser. You can still explore every story.
      </p>
      <div>
        {journey.layout.map((p) => (
          <button key={p.photo.id} onClick={() => inspect(p.photo)}>
            {p.photo.title ?? "View memory"}
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <main className="app-shell" data-distance={journey.zone * 8}>
      <div className="scene" style={{ touchAction: webgl ? "none" : "pan-y" }}>
        {webgl ? (
          <Suspense
            fallback={<div className="canvas-loading">Opening the bridge…</div>}
          >
            <ForestScene
              nav={journey}
              unlocked={entered}
              active={entered && !selected && !ending}
              auto={auto}
              reduced={reduced}
              onSelect={inspect}
              onEnd={onEnd}
              onReady={onReady}
              onFailure={() => setWebgl(false)}
              fallback={fallback}
            />
          </Suspense>
        ) : (
          fallback
        )}
      </div>
      <div className="scene-vignette" aria-hidden="true" />
      <header className="site-header">
        <button
          className="wordmark"
          onClick={() => {
            setEntered(false);
            setAuto(false);
            setEnding(false);
          }}
          aria-label="Parishi ♥ Ammu home"
        >
          <span className="cursive-heading">Parishi</span>
          <Heart strokeWidth={1.6} size={22} fill="none" />
          <span className="cursive-heading">Ammu</span>
        </button>
      </header>
      <AnimatePresence>
        {!entered && (
          <IntroScreen
            reduced={reduced}
            ready={ready || !webgl}
            resumed={journey.resumed}
            enterRef={enterRef}
            onEnter={() => {
              setEntered(true);
              setTimeout(
                () => document.getElementById("forward-control")?.focus(),
                100,
              );
            }}
          />
        )}
      </AnimatePresence>
      {entered && !ending && webgl && (
        <>
          {!journey.layout.length && (
            <div className="empty-state">
              <h2 className="cursive-heading">Your story starts here.</h2>
              <p>
                Add photographs to the manifest to fill this bridge with
                memories.
              </p>
            </div>
          )}
          <div className="nearby-memories">
            <span className="eyebrow">ALONG THE BRIDGE</span>
            {nearby.map((item, idx) => {
              const mType = item.photo.type ?? "photo";
              const deltaDist = Math.abs(
                item.distance - (journey.zone * 8 + 5),
              );
              const partialFade = Math.max(
                0.45,
                Math.min(1, 1.15 - deltaDist * 0.06),
              );
              return (
                <div
                  key={item.photo.id}
                  className="nearby-memory-item scroll-fade-item"
                  style={{
                    opacity: partialFade,
                    transform: `translateX(${(1 - partialFade) * (idx % 2 ? 6 : -4)}px)`,
                  }}
                >
                  <button onClick={() => inspect(item.photo)}>
                    <span
                      className={
                        journey.discovered.has(item.photo.id)
                          ? "memory-dot discovered"
                          : "memory-dot"
                      }
                    />
                    <span className="nearby-type-icon" aria-hidden="true">
                      {mType === "video" ? (
                        <Film size={11} />
                      ) : mType === "audio" ? (
                        <Music size={11} />
                      ) : (
                        <Camera size={11} />
                      )}
                    </span>
                    <span className="nearby-title-text">
                      {item.photo.title ?? "Untitled memory"}
                    </span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
          <nav className="walking-controls" aria-label="Bridge navigation">
            <button
              className="icon-button"
              aria-label="Move backward"
              onClick={() => move(-4)}
            >
              <ArrowDown size={18} />
            </button>
            <button
              className="auto-button"
              aria-pressed={auto}
              onClick={() => setAuto((a) => !a)}
            >
              <span>{auto ? "Stop walk" : "Auto walk"}</span>
            </button>
            <button
              id="forward-control"
              className="icon-button"
              aria-label="Move forward"
              onClick={() => move(4)}
            >
              <ArrowUp size={18} />
            </button>
          </nav>
          <button
            className="leave-button"
            onClick={() => {
              setEntered(false);
              setAuto(false);
            }}
          >
            <ArrowLeft size={13} />
            Return to entrance
          </button>
        </>
      )}
      {ending && (
        <motion.section
          className="ending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Sparkles size={30} strokeWidth={1.2} />
          <div
            className="kneeling-boy-rose-scene"
            role="img"
            aria-label="A boy kneeling on one knee and offering a red rose"
          >
            <svg
              viewBox="0 0 240 200"
              className="kneeling-boy-rose-svg"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="roseHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.65" />
                  <stop offset="55%" stopColor="#ffe070" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ffe070" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="groundGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffe070" stopOpacity="0.32" />
                  <stop offset="70%" stopColor="#ff758f" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#090d1a" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Soft Starlit Bridge Ground Glow & Scattered Rose Petals */}
              <ellipse
                cx="116"
                cy="176"
                rx="82"
                ry="14"
                fill="url(#groundGlow)"
              />
              <ellipse cx="78" cy="177" rx="5" ry="2.2" fill="#e11d48" opacity="0.85" />
              <ellipse cx="144" cy="179" rx="4.5" ry="2" fill="#fb7185" opacity="0.8" />
              <ellipse cx="162" cy="173" rx="5.2" ry="2.1" fill="#e11d48" opacity="0.85" />
              <ellipse cx="96" cy="182" rx="4.2" ry="1.8" fill="#fb7185" opacity="0.75" />

              {/* Back Leg (Right Knee Resting on the Bridge) */}
              <path
                d="M90 128 L76 168 L48 168"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Back Dress Shoe */}
              <path
                d="M46 162 L35 174 L49 175 Z"
                fill="#0f172a"
                stroke="#ffe07055"
                strokeWidth="1"
              />

              {/* Front Leg (Left Knee Raised at 90 Degrees) */}
              <path
                d="M96 126 L128 126 L128 168"
                stroke="#26354d"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Front Dress Shoe */}
              <path
                d="M121 166 L146 166 C149 166 150 174 145 174 L120 174 Z"
                fill="#0f172a"
                stroke="#ffe07055"
                strokeWidth="1"
              />

              {/* Tailored Suit Jacket Torso */}
              <path
                d="M76 74 C76 67 108 67 110 74 L106 130 C106 134 78 134 78 130 Z"
                fill="#1b263b"
                stroke="#ffe07044"
                strokeWidth="1.2"
              />
              {/* Crisp White Shirt V-Collar & Crimson Tie */}
              <polygon points="94,72 104,72 99,94" fill="#fff9f2" />
              <polygon points="98,75 102,75 100,92" fill="#e11d48" />
              {/* Gold Lapel Boutonniere */}
              <circle cx="93" cy="84" r="2.3" fill="#ffe070" />

              {/* Left Arm (Gently Resting Near Front Knee) */}
              <path
                d="M88 82 L112 108 L124 118"
                stroke="#24324a"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="126" cy="119" r="5" fill="#f3c6a0" />

              {/* Head, Warm Smile & Styled Hair Looking Up Toward Her */}
              <g transform="translate(95, 48) rotate(-8)">
                {/* Neck */}
                <rect x="-5" y="13" width="10" height="10" rx="3" fill="#eab68f" />
                {/* Face */}
                <circle cx="1" cy="0" r="16.5" fill="#f3c6a0" />
                {/* Hair */}
                <path
                  d="M-15 2 C-17 -14 -2 -20 12 -16 C19 -14 21 -5 15 -2 C9 -6 -1 -6 -9 -2 Z"
                  fill="#1a1412"
                />
                {/* Eye & Gentle Smile */}
                <circle cx="9" cy="-2" r="1.8" fill="#1a1412" />
                <circle cx="6" cy="3" r="2.8" fill="#f48c8c" opacity="0.45" />
                <path
                  d="M6 6 Q11 9.5 14 5.5"
                  stroke="#9e3f35"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* Extended Right Arm Offering the Rose */}
              <path
                d="M98 80 L132 86 L162 78"
                stroke="#1b263b"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* White Shirt Cuff & Offering Hand */}
              <rect
                x="159"
                y="72"
                width="6"
                height="11"
                rx="2"
                transform="rotate(-14 162 78)"
                fill="#fff9f2"
              />
              <circle cx="168" cy="76" r="5.8" fill="#f3c6a0" />

              {/* Glowing Aura Around the Offered Red Rose */}
              <circle cx="186" cy="54" r="32" fill="url(#roseHalo)" />

              {/* Blooming Red Rose & Stem */}
              <g className="offered-rose-bloom">
                {/* Green Stem */}
                <path
                  d="M165 86 Q174 72 184 56"
                  stroke="#16a34a"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Leaves */}
                <path
                  d="M173 72 Q164 67 167 61 Q175 63 173 72 Z"
                  fill="#22c55e"
                />
                <path
                  d="M177 67 Q187 65 186 58 Q179 59 177 67 Z"
                  fill="#16a34a"
                />
                {/* Layered Crimson & Ruby Rose Petals */}
                <circle cx="186" cy="51" r="11" fill="#9f1239" />
                <path
                  d="M175 52 C173 42 184 37 188 44 C194 37 201 44 197 53 C194 60 179 60 175 52 Z"
                  fill="#e11d48"
                />
                <path
                  d="M179 49 C179 42 187 40 190 46 C194 42 197 48 193 53 C189 57 181 55 179 49 Z"
                  fill="#fb7185"
                />
                <path
                  d="M183 48 C184 44 190 44 190 49 C190 52 184 52 183 48 Z"
                  fill="#ffe4e6"
                />
              </g>

              {/* Floating Golden Sparkles & Little Heart Above Rose */}
              <path
                d="M198 28 C198 25 202 23 204 26 C206 23 210 25 210 28 C210 32 204 35 204 37 C204 35 198 32 198 28 Z"
                fill="#ff4d6d"
              />
              <circle cx="168" cy="36" r="2" fill="#ffe070" />
              <circle cx="212" cy="48" r="1.8" fill="#fff3b0" />
              <circle cx="182" cy="24" r="1.5" fill="#ffe070" />
            </svg>
          </div>
          <h1 ref={endRef} tabIndex={-1} className="cursive-heading">
            Love you Always and Forever,
            <br />
            Ammukutty{" "}
            <Heart strokeWidth={1.5} fill="none" className="ending-heart" />
          </h1>
          <button
            className="primary-button ending-walk-again"
            onClick={() => {
              journey.restart();
              setEnding(false);
              setEntered(true);
            }}
          >
            <RotateCcw size={16} />
            <span>Walk again</span>
          </button>
        </motion.section>
      )}
      <footer className="site-footer">
        <div className="footer-left" />
        <div className="navigation-hint">
          {entered ? (
            <>
              <Mouse size={15} />
              <span>Scroll to stroll</span>
              <span className="hint-divider" />
              <span>Click a photo, video, or audio clip</span>
            </>
          ) : (
            <>
              <Footprints size={15} />
              <span>Best explored slowly</span>
            </>
          )}
        </div>
        <div className="footer-actions">
          <AudioControl
            ducked={Boolean(
              selected &&
                (selected.type === "video" || selected.type === "audio"),
            )}
          />
          {document.fullscreenEnabled && (
            <button
              className="icon-button fullscreen"
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>
          )}
        </div>
      </footer>
      {entered && selected && (
        <PhotoViewer
          key={selected.id}
          photo={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}

