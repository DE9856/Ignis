"use client";

import { useEffect, useRef, type RefObject } from "react";

import { gsap, MOTION, motionAllowed, useGSAP } from "./gsap";

type Positions = Map<string, { x: number; y: number }>;

/** Positions of `[data-flip-id]` children relative to the container, so scrolling does not count as movement. */
function measure(container: HTMLElement): Positions {
  const origin = container.getBoundingClientRect();
  const positions: Positions = new Map();
  container.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((element) => {
    const rect = element.getBoundingClientRect();
    positions.set(element.dataset.flipId as string, { x: rect.left - origin.left, y: rect.top - origin.top });
  });
  return positions;
}

/**
 * FLIP for lists that re-order or re-flow: when `orderKey` changes, items that
 * stayed glide from their old place to their new one, and new items fade in.
 * Used for the ranked investigations (a scenario edit re-ranks them) and the
 * explorer cards (a filter change re-flows them). Items carry `data-flip-id`.
 */
export function useFlipList(container: RefObject<HTMLElement | null>, orderKey: string) {
  const last = useRef<Positions>(new Map());

  useGSAP(
    () => {
      const root = container.current;
      if (!root) {
        last.current = new Map();
        return;
      }
      const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-flip-id]"));
      gsap.set(elements, { clearProps: "transform" });
      const next = measure(root);
      const previous = last.current;

      if (motionAllowed() && previous.size > 0) {
        for (const element of elements) {
          const id = element.dataset.flipId as string;
          const was = previous.get(id);
          const now = next.get(id);
          if (!now) continue;
          if (!was) {
            gsap.fromTo(
              element,
              { autoAlpha: 0, y: 10 },
              { autoAlpha: 1, y: 0, duration: MOTION.base, clearProps: "opacity,visibility,transform" },
            );
            continue;
          }
          const dx = was.x - now.x;
          const dy = was.y - now.y;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
          gsap.fromTo(
            element,
            { x: dx, y: dy },
            { x: 0, y: 0, duration: MOTION.slow, ease: "power3.inOut", clearProps: "transform" },
          );
        }
      }
      last.current = next;
    },
    { dependencies: [orderKey], scope: container },
  );

  // Layout can also change without a re-order (a panel opens, the window resizes).
  // Re-measure then, so the next re-order starts from where items really are.
  useEffect(() => {
    const root = container.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!gsap.isTweening(root.querySelectorAll("[data-flip-id]"))) last.current = measure(root);
      });
    });
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [container]);
}
