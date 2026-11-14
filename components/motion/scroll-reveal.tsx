"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { gsap, MOTION, motionAllowed, ScrollTrigger, useGSAP } from "./gsap";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before the first panel's CSS entrance, so it follows the page header. */
  delay?: number;
}

/**
 * Wraps a page's stack of panels. Panels already on screen are left alone (the
 * CSS entrance in globals.css handles those, with no flash before hydration);
 * panels below the fold rise in as they are scrolled to, in batches.
 * Without JavaScript, or with reduced motion, every panel is simply visible.
 */
export function ScrollReveal({ children, className, delay = 140 }: ScrollRevealProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motionAllowed() || !root.current) return;
      const fold = window.innerHeight * 0.92;
      const below = Array.from(root.current.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.getBoundingClientRect().top > fold,
      );
      if (below.length === 0) return;

      gsap.set(below, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(below, {
        start: "top 94%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: MOTION.slow,
            stagger: 0.08,
            overwrite: true,
            clearProps: "transform,opacity,visibility",
          }),
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-stagger
      style={{ "--stagger-base": `${delay}ms` } as CSSProperties}
      className={cn("space-y-5", className)}
    >
      {children}
    </div>
  );
}
