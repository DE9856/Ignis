"use client";

import { useRef, type ReactNode } from "react";

import { gsap, MOTION, motionAllowed, ScrollTrigger, useGSAP } from "./gsap";

interface GrowInProps {
  children: ReactNode;
  className?: string;
}

/**
 * Bars on screen at load grow in through CSS (see [data-grow] in globals.css),
 * which runs from first paint. This wrapper handles the ones below the fold:
 * they wait at their baseline and grow out from it when scrolled to, so the
 * reader sees them measured out rather than already drawn. Later value changes
 * glide through CSS width transitions; nothing here replays.
 */
export function GrowIn({ children, className }: GrowInProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motionAllowed() || !root.current) return;
      const fold = window.innerHeight * 0.95;
      const below = gsap.utils
        .toArray<HTMLElement>("[data-grow]")
        .filter((mark) => mark.getBoundingClientRect().top > fold);
      if (below.length === 0) return;

      gsap.set(below, { scaleX: 0, transformOrigin: "left center" });
      ScrollTrigger.batch(below, {
        start: "top 96%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            scaleX: 1,
            duration: MOTION.slow + 0.15,
            ease: "expo.out",
            stagger: 0.04,
            overwrite: true,
            clearProps: "transform",
          }),
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
