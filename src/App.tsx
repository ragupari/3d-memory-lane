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
  ChevronRight,
  Footprints,
  HelpCircle,
  Leaf,
  Maximize,
  Minimize,
  Mouse,
  Pause,
  Play,
  RotateCcw,
  Trees,
} from "lucide-react";
import { useMemoryJourney } from "./hooks/useMemoryJourney";
import { PhotoViewer } from "./components/ui/PhotoViewer";
import { HelpDialog } from "./components/ui/HelpDialog";
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
  const [help, setHelp] = useState(false);
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
        !help &&
        !ending &&
        !(e.target as HTMLElement).closest("button,dialog")
      ) {
        e.preventDefault();
        setAuto((a) => !a);
      }
      if (e.key === "Escape" && !selected) {
        if (help) setHelp(false);
        else if (entered) {
          setEntered(false);
          setAuto(false);
          setTimeout(() => enterRef.current?.focus(), 0);
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [entered, selected, help, ending]);
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
  const complete = journey.discovered.size === journey.layout.length;
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
      <Trees size={32} />
      <h2>A quieter way to remember.</h2>
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
            fallback={<div className="canvas-loading">Opening the forest…</div>}
          >
            <ForestScene
              nav={journey}
              active={entered && !selected && !ending && !help}
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
          aria-label="Memory Forest home"
        >
          <Trees strokeWidth={1.2} size={29} />
          <span>
            memory forest<span className="wordmark-dot">.</span>
          </span>
        </button>
        <div className="header-right">
          <span className="private-note">
            <span />A LITTLE PLACE OUTSIDE OF TIME
          </span>
          <button
            className="icon-button"
            aria-label="How to explore"
            onClick={() => {
              setHelp(true);
              setAuto(false);
            }}
          >
            <HelpCircle size={19} />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {!entered && webgl && (
          <IntroScreen
            reduced={reduced}
            ready={ready}
            resumed={journey.resumed}
            count={journey.layout.length}
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
          <div className="journey-progress">
            <span className="eyebrow">YOUR JOURNEY</span>
            <div aria-live="polite">
              <strong>
                {String(journey.discovered.size).padStart(2, "0")}
              </strong>
              <span>
                {" "}
                / {String(journey.layout.length).padStart(2, "0")} memories
                discovered
              </span>
            </div>
            <div className="progress-track">
              <span
                style={{
                  width: `${journey.layout.length ? (journey.discovered.size / journey.layout.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          {!journey.layout.length && (
            <div className="empty-state">
              <h2>Your story starts here.</h2>
              <p>
                Add photographs to the manifest to fill this forest with
                memories.
              </p>
            </div>
          )}
          <div className="nearby-memories">
            <span className="eyebrow">ALONG THE PATH</span>
            {nearby.map((item) => (
              <button key={item.photo.id} onClick={() => inspect(item.photo)}>
                <span
                  className={
                    journey.discovered.has(item.photo.id)
                      ? "memory-dot discovered"
                      : "memory-dot"
                  }
                />
                {item.photo.title ?? "Untitled memory"}
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
          <nav className="walking-controls" aria-label="Forest navigation">
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
              {auto ? <Pause size={15} /> : <Play size={15} />}
              <span>{auto ? "Pause walk" : "Auto walk"}</span>
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
            Leave the forest
          </button>
        </>
      )}
      {ending && (
        <motion.section
          className="ending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Leaf size={30} strokeWidth={1} />
          <span className="eyebrow">
            {complete
              ? "EVERY MOMENT, REMEMBERED"
              : "A LITTLE MORE TO DISCOVER"}
          </span>
          <h1 ref={endRef} tabIndex={-1}>
            {complete ? (
              <>
                Every journey ends.
                <br />
                <em>Our memories remain.</em>
              </>
            ) : (
              <>
                The path ends here.
                <br />
                <em>A few stories await.</em>
              </>
            )}
          </h1>
          <p>
            {complete
              ? "Thank you for taking the time to remember."
              : `${journey.discovered.size} of ${journey.layout.length} memories discovered. Walk back to find the others.`}
          </p>
          <button
            className="primary-button"
            onClick={() => {
              if (complete) {
                journey.restart();
              } else {
                const next = journey.layout.find(
                  (item) => !journey.discovered.has(item.photo.id),
                );
                journey.target.current = Math.max(0, (next?.distance ?? 8) - 8);
              }
              setEnding(false);
            }}
          >
            <RotateCcw size={16} />
            {complete ? "Relive the journey" : "Find remaining memories"}
          </button>
          <button
            className="text-button"
            onClick={() => {
              journey.target.current = Math.max(
                0,
                journey.distance.current - 8,
              );
              setEnding(false);
            }}
          >
            <ArrowLeft size={14} />
            Walk back
          </button>
        </motion.section>
      )}
      <footer className="site-footer">
        <div className="footer-left">
          <span className="status-dot" />
          {entered
            ? "TAKE YOUR TIME. STAY A LITTLE."
            : "A QUIET PLACE FOR THE MOMENTS THAT STAY."}
        </div>
        <div className="navigation-hint">
          {entered ? (
            <>
              <Mouse size={15} />
              <span>Scroll to wander</span>
              <span className="hint-divider" />
              <span>Click a photograph to remember</span>
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
      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </main>
  );
}
