import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import type { RefObject } from "react";
export function IntroScreen({
  reduced,
  ready,
  resumed,
  count,
  enterRef,
  onEnter,
}: {
  reduced: boolean;
  ready: boolean;
  resumed: boolean;
  count: number;
  enterRef: RefObject<HTMLButtonElement | null>;
  onEnter: () => void;
}) {
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
        COLLECTED MOMENTS. EVERLASTING STORIES.
        <span />
      </div>
      <h1>
        A walk through
        <br />
        our <em>memories.</em>
      </h1>
      <p>
        Every photograph holds a story.
        <br />
        Step inside and rediscover them.
      </p>
      <button
        ref={enterRef}
        className="primary-button enter-button"
        disabled={!ready}
        onClick={onEnter}
      >
        <span>
          {ready
            ? resumed
              ? "Continue your journey"
              : "Enter the Memory Forest"
            : "Opening the forest…"}
        </span>
        <ArrowRight size={18} />
      </button>
      <div className="intro-detail">
        <Leaf size={13} />
        <span>{count} memories. One beautiful journey.</span>
      </div>
    </motion.section>
  );
}
