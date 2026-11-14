"use client";

import { Pause, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

export interface JourneyStep {
  id: string;
  title: string;
  heading: string;
  body: string;
  detail: ReactNode;
}

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const motionOk = () => !window.matchMedia(REDUCE).matches;

/** Long enough to read a panel; judges should not have to chase it. */
const ADVANCE_MS = 6000;

/**
 * How a NASA source becomes searchable evidence, as four panels. The active
 * panel takes most of the width. It advances on its own unless the reader
 * hovers, focuses, pauses it, or prefers reduced motion.
 */
export function Journey({ steps }: { steps: JourneyStep[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const autoplay = useSyncExternalStore(subscribeMotion, motionOk, () => false);

  const running = autoplay && !held && !paused;

  useEffect(() => {
    if (!running) return;
    const node = root.current;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (node) observer.observe(node);
    const timer = window.setInterval(() => {
      if (visible) setActive((index) => (index + 1) % steps.length);
    }, ADVANCE_MS);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [running, steps.length]);

  const onKey = useCallback(
    (event: KeyboardEvent, index: number) => {
      const next =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % steps.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + steps.length) % steps.length
            : null;
      if (next === null) return;
      event.preventDefault();
      setActive(next);
      root.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
    },
    [steps.length],
  );

  return (
    <div
      ref={root}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div className="mb-4 flex items-center justify-end">
        {autoplay ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-raised hover:text-ink"
          >
            {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
            {paused ? "Play steps" : "Pause steps"}
          </button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="From NASA source to searchable evidence"
        className="flex flex-col gap-2 lg:h-[25rem] lg:flex-row"
      >
        {steps.map((step, index) => {
          const on = index === active;
          return (
            <div
              key={step.id}
              onPointerEnter={() => setActive(index)}
              className={cn(
                "ease-panel relative flex min-w-0 flex-col overflow-hidden rounded-lg border ticks lg:basis-0",
                on ? "border-line-strong bg-surface lg:grow-[3.25]" : "border-line bg-canvas lg:grow",
              )}
            >
              {on && running ? (
                <span
                  key={`progress-${active}`}
                  aria-hidden
                  className="journey-progress absolute inset-x-0 top-0 h-px origin-left bg-ink-muted"
                  style={{ animationDuration: `${ADVANCE_MS}ms` }}
                />
              ) : null}
              <button
                type="button"
                role="tab"
                id={`journey-tab-${step.id}`}
                aria-selected={on}
                aria-controls={`journey-panel-${step.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKey(event, index)}
                className="flex w-full items-center gap-3 px-4 pt-4 pb-3 text-left lg:px-5 lg:pt-5"
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-2xs transition-colors",
                    on ? "border-ink text-ink" : "border-line-strong text-ink-faint",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-sm font-medium transition-colors",
                    on ? "sr-only" : "text-ink-muted",
                  )}
                >
                  {step.title}
                </span>
              </button>

              <div
                role="tabpanel"
                id={`journey-panel-${step.id}`}
                aria-labelledby={`journey-tab-${step.id}`}
                hidden={!on}
                className="flex min-h-0 flex-1 flex-col px-4 pb-5 lg:px-5"
              >
                <h3 className="max-w-[28rem] text-[clamp(1.375rem,2.2vw,1.875rem)] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-ink">
                  {step.heading}
                </h3>
                <p className="mt-3 max-w-[36rem] text-[0.9375rem] leading-relaxed text-ink-muted">
                  {step.body}
                </p>
                <div className="mt-6">{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
