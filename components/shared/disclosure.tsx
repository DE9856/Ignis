"use client";

import { ChevronRight } from "lucide-react";
import { useRef, type MouseEvent, type ReactNode } from "react";

import { gsap, MOTION, motionAllowed, useGSAP } from "@/components/motion/gsap";
import { cn } from "@/lib/utils/cn";

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  bodyClassName?: string;
}

/**
 * Native <details> with a consistent trigger. Used for every "why" path: score
 * explanations, why-retrieved drawers, system status. Keyboard and screen-reader
 * behaviour come from the browser and it works without JavaScript; with
 * JavaScript, the panel eases open and closed instead of jumping.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
  summaryClassName,
  bodyClassName,
}: DisclosureProps) {
  const details = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: details });

  function toggle(event: MouseEvent<HTMLElement>) {
    const element = details.current;
    const panel = body.current;
    if (!element || !panel || !motionAllowed()) return;
    event.preventDefault();
    // contextSafe at event time: the tweens join the component's context and are reverted on unmount.
    contextSafe(() => animate(element, panel))();
  }

  function animate(element: HTMLDetailsElement, panel: HTMLDivElement) {
    gsap.killTweensOf(panel);

    if (!element.open) {
      element.open = true;
      gsap.fromTo(
        panel,
        { height: 0, autoAlpha: 0, overflow: "hidden" },
        {
          height: "auto",
          autoAlpha: 1,
          duration: MOTION.base,
          ease: MOTION.easeOut,
          clearProps: "height,opacity,visibility,overflow",
        },
      );
    } else {
      gsap.to(panel, {
        height: 0,
        autoAlpha: 0,
        overflow: "hidden",
        duration: MOTION.fast,
        ease: MOTION.easeIn,
        onComplete: () => {
          element.open = false;
          gsap.set(panel, { clearProps: "height,opacity,visibility,overflow" });
        },
      });
    }
  }

  return (
    <details ref={details} className={cn("group/disclosure", className)} open={defaultOpen}>
      <summary
        onClick={toggle}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm text-xs font-medium text-ink-muted transition-colors select-none hover:text-ink",
          summaryClassName,
        )}
      >
        <ChevronRight
          aria-hidden
          className="size-3.5 shrink-0 transition-transform duration-300 group-open/disclosure:rotate-90"
        />
        {summary}
      </summary>
      <div ref={body}>
        <div className={cn("pt-3", bodyClassName)}>{children}</div>
      </div>
    </details>
  );
}
