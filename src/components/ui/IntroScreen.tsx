import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

const ROMANTIC_DENIALS = [
  "This bridge of memories was built for one heart alone — only my dearest may cross beneath these golden lights.",
  "The lanterns whisper a different name… these cherished moments belong only to the one who holds my heart.",
  "Every star above this Parisian bridge waits only for my beloved. Please whisper the right name to enter.",
];

export function IntroScreen({
  reduced,
  ready,
  resumed,
  enterRef,
  onEnter,
}: {
  reduced: boolean;
  ready: boolean;
  resumed: boolean;
  enterRef: RefObject<HTMLButtonElement | null>;
  onEnter: () => void;
}) {
  const [letters, setLetters] = useState<string[]>(["", "", "", ""]);
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);
  const [denyCount, setDenyCount] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const slotRefs = useRef<(HTMLInputElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      slotRefs.current[0]?.focus();
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  const evaluateCode = (currentLetters: string[]) => {
    const word = currentLetters.join("").trim().toUpperCase();
    if (word.length < 4) {
      setDeniedMessage(
        "Whisper all four letters of your name to step onto our bridge of memories.",
      );
      setDenyCount((c) => c + 1);
      return;
    }
    if (word === "AMMU") {
      setDeniedMessage(null);
      setUnlocked(true);
      if (ready) {
        window.setTimeout(() => {
          onEnter();
        }, 320);
      }
    } else {
      setUnlocked(false);
      setDeniedMessage(ROMANTIC_DENIALS[denyCount % ROMANTIC_DENIALS.length]);
      setDenyCount((c) => c + 1);
    }
  };

  const handleChange = (index: number, rawValue: string) => {
    const char = rawValue.replace(/[^a-zA-Z]/g, "").slice(-1).toUpperCase();
    const next = [...letters];
    next[index] = char;
    setLetters(next);
    if (deniedMessage) setDeniedMessage(null);

    if (char && index < 3) {
      slotRefs.current[index + 1]?.focus();
    }

    if (char && index === 3 && next.every((c) => c.length === 1)) {
      evaluateCode(next);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (letters[index]) {
        const next = [...letters];
        next[index] = "";
        setLetters(next);
        setDeniedMessage(null);
      } else if (index > 0) {
        const next = [...letters];
        next[index - 1] = "";
        setLetters(next);
        setDeniedMessage(null);
        slotRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      slotRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      slotRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      evaluateCode(letters);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 4);
    if (!pasted) return;
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setLetters(next);
    const focusIdx = Math.min(3, pasted.length);
    slotRefs.current[focusIdx]?.focus();
    if (pasted.length === 4) {
      evaluateCode(next);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    evaluateCode(letters);
  };

  return (
    <motion.section
      className="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: reduced ? 0 : 0.7 }}
    >
      <div className="intro-kicker">
        <span />
        OUR ROMANTIC PROMENADE · CHERISHED MOMENTS
        <span />
      </div>
      <h1 className="cursive-heading">
        A Walk Across
        <br />
        Our Memories
      </h1>
      <p>
        Stroll along our starlit Parisian bridge toward the Eiffel Tower and
        rediscover every photograph, short video, and audio memory along the
        way.
      </p>

      <form className="who-are-you-form" onSubmit={handleSubmit}>
        <label className="who-are-you-prompt" htmlFor="ammu-letter-0">
          Who are you?
        </label>

        <motion.div
          key={denyCount}
          className="letter-slots"
          animate={
            deniedMessage && !reduced
              ? { x: [0, -8, 8, -6, 6, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
        >
          {letters.map((char, idx) => (
            <input
              key={idx}
              id={`ammu-letter-${idx}`}
              ref={(el) => {
                slotRefs.current[idx] = el;
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label={`Letter ${idx + 1} of 4`}
              className={`letter-slot ${char ? "filled" : ""} ${
                deniedMessage ? "denied" : ""
              } ${unlocked ? "unlocked" : ""}`}
              value={char}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
            />
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {deniedMessage && (
            <motion.div
              key={`deny-${denyCount}`}
              className="romantic-denial"
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <Heart size={14} />
              <span>{deniedMessage}</span>
            </motion.div>
          )}
          {unlocked && (
            <motion.div
              key="welcome-ammu"
              className="romantic-welcome"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles size={14} />
              <span>Welcome, my dearest Ammu ♥</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={enterRef}
          type="submit"
          className="primary-button enter-button"
          disabled={!ready}
        >
          <span>
            {ready
              ? resumed
                ? "Continue your journey"
                : "Begin Our Walk"
              : "Opening the bridge…"}
          </span>
          <ArrowRight size={18} />
        </button>
      </form>
    </motion.section>
  );
}

