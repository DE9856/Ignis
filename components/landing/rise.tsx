"use client";

import { useRef, type ReactNode } from "react";

import { gsap, motionAllowed, ScrollTrigger, useGSAP } from "@/components/motion/gsap";

/**
 * Direct children rise in, staggered, the first time the group scrolls into
 * view. Visible by default: without JavaScript or with reduced motion,
 * nothing is hidden.
 */
export function Rise({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const node = root.current;
      if (!node || !motionAllowed() || node.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      const items = Array.from(node.children);
      gsap.set(items, { autoAlpha: 0, y: 32 });
      ScrollTrigger.create({
        trigger: node,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(items, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: "expo.out",
            clearProps: "transform,opacity,visibility",
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
