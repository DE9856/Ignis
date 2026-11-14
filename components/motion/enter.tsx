"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { gsap, MOTION, motionAllowed, useGSAP } from "./gsap";

interface EnterProps {
  children: ReactNode;
  /** `rise`: children rise in one after another. `slide`: the block slides in from the right. */
  variant?: "rise" | "slide";
  /** For `rise`: which descendants rise in turn. Defaults to the direct children. */
  selector?: string;
  className?: string;
}

/**
 * Animates content that appears after an interaction (search results, a record
 * opening). It runs once when the element mounts, so give it a `key` that
 * changes with the content to replay it. Content mounted on the client is
 * animated before the browser paints it, so nothing flashes.
 */
export function Enter({ children, variant = "rise", selector = ":scope > *", className }: EnterProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motionAllowed() || !root.current) return;
      if (variant === "slide") {
        gsap.from(root.current, {
          autoAlpha: 0,
          x: 18,
          duration: MOTION.base,
          clearProps: "opacity,visibility,transform",
        });
        return;
      }
      gsap.from(Array.from(root.current.querySelectorAll(selector)), {
        autoAlpha: 0,
        y: 14,
        duration: MOTION.base,
        stagger: 0.07,
        clearProps: "opacity,visibility,transform",
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn(className)}>
      {children}
    </div>
  );
}
