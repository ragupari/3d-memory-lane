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

  const fallback = (
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
  );

  return (
    <main className="app-shell" data-distance={journey.zone * 8}>
      <div className="scene" style={{ touchAction: webgl ? "none" : "pan-y" }}>
        {webgl ? (
          <Suspense
            fallback={<div className="canvas-loading">Opening the bridge…</div>}
          >
            <ForestScene
              nav={journey}
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
        {!entered && webgl && (
          <IntroScreen
            reduced={reduced}
            ready={ready}
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
          <AudioControl />
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
      {selected && (
        <PhotoViewer
          key={selected.id}
          photo={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}

