"use client";

import { useRef } from "react";

import { gsap, MOTION, motionAllowed, useGSAP } from "./gsap";

interface AnimatedNumberProps {
  /** The value to show. Null renders `fallback` and never animates. */
  value: number | null;
  format: (value: number) => string;
  fallback?: string;
  className?: string;
}

/**
 * A number that counts to its new value when it changes, so a re-ranked score
 * visibly moves rather than silently swapping. The final value is in the markup
 * from the first render and is what assistive technology reads.
 */
export function AnimatedNumber({ value, format, fallback = "", className }: AnimatedNumberProps) {
  const visual = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | null>(null);
  const text = value === null ? fallback : format(value);

  useGSAP(
    () => {
      const from = previous.current;
      previous.current = value;
      if (value === null || from === null || from === value || !motionAllowed() || !visual.current) return;
      const counter = { n: from };
      gsap.to(counter, {
        n: value,
        duration: MOTION.slow,
        ease: "power2.out",
        onUpdate: () => {
          if (visual.current) visual.current.textContent = format(counter.n);
        },
        onComplete: () => {
          if (visual.current) visual.current.textContent = format(value);
        },
      });
    },
    { dependencies: [value], revertOnUpdate: true },
  );

  return (
    <span className={className}>
      <span ref={visual} aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
