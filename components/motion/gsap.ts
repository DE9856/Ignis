"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The one place GSAP is configured. Import gsap, ScrollTrigger and useGSAP from
 * here so plugins are registered exactly once, and so every animation shares
 * the same timing.
 *
 * Motion rules for IGNIS (components/README.md):
 * - Motion explains change: values growing in, items moving to a new rank,
 *   panels opening. It never hides a value or delays reading it.
 * - Short: 0.25 to 0.7 s. Ease out on entry, ease in on exit.
 * - Everything is skipped when the reader prefers reduced motion.
 */

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const MOTION = {
  fast: 0.25,
  base: 0.45,
  slow: 0.7,
  stagger: 0.05,
  easeOut: "power3.out",
  easeIn: "power2.in",
} as const;

gsap.defaults({ ease: MOTION.easeOut, duration: MOTION.base });

/** True when animation is allowed. Read at call time, so a settings change applies immediately. */
export function motionAllowed(): boolean {
  return typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, useGSAP };
