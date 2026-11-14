"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { gsap, motionAllowed, useGSAP } from "@/components/motion/gsap";
import type { LandingViewModel } from "@/lib/integration/landing";
import { formatNumber } from "@/lib/utils/numbers";

import { FlameCanvas } from "./flame-canvas";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const FIELDS = [
  { name: "oxygen", label: "Oxygen", unit: "% O₂" },
  { name: "pressure", label: "Pressure", unit: "kPa" },
  { name: "gravity", label: "Gravity", unit: "g" },
];

function Tile({
  children,
  className,
  style,
  bobDelay,
}: {
  children: ReactNode;
  className: string;
  style: CSSProperties;
  bobDelay: string;
}) {
  return (
    <div className={`seq absolute ${className}`} style={style}>
      <div
        className="bob rounded-md border border-line bg-surface/85 ticks px-3.5 py-3 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.8)] backdrop-blur-sm"
        style={{ "--bob-delay": bobDelay } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export function Hero({ data }: { data: LandingViewModel }) {
  const root = useRef<HTMLElement>(null);
  const flame = useRef<HTMLDivElement>(null);

  // The flame leans a little toward the pointer. Fine pointers only, never with reduced motion.
  useGSAP(
    () => {
      const target = flame.current;
      if (!target || !motionAllowed() || !window.matchMedia("(pointer: fine)").matches) return;
      const x = gsap.quickTo(target, "x", { duration: 1.2, ease: "power3.out" });
      const y = gsap.quickTo(target, "y", { duration: 1.2, ease: "power3.out" });
      const r = gsap.quickTo(target, "rotation", { duration: 1.4, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        const dx = event.clientX / window.innerWidth - 0.5;
        const dy = event.clientY / window.innerHeight - 0.5;
        x(dx * 28);
        y(dy * 20);
        r(dx * 4);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  const oxygen =
    data.oxygen.min !== null && data.oxygen.max !== null
      ? `${formatNumber(data.oxygen.min)}–${formatNumber(data.oxygen.max)}`
      : null;

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative isolate z-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--color-ink)_35%,transparent),transparent)]"
      />

      <div className="relative z-10 mx-auto grid min-h-[min(100svh,60rem)] max-w-[84rem] items-center gap-10 px-4 pt-36 pb-16 sm:px-6 md:pt-28 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pt-24">
        {/* Visual: first in the DOM order for the entrance, second for reading on small screens. */}
        <div className="relative order-2 mx-auto aspect-square w-full max-w-[34rem] lg:order-2 lg:col-span-6 lg:max-w-none">
          <div className="seq absolute inset-[-12%]" style={delay(180)}>
            <div ref={flame} className="size-full will-change-transform">
              <FlameCanvas />
            </div>
          </div>

          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="seq-ring absolute inset-[6%] overflow-visible"
            style={delay(80)}
          >
            <g className="orbit" style={{ transformOrigin: "50px 50px" }}>
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="2.4"
                pathLength={100}
                strokeDasharray="71 29"
                strokeLinecap="butt"
                transform="rotate(118 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="41"
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="0.35"
                pathLength={360}
                strokeDasharray="0.6 4.4"
              />
              <circle cx="50" cy="4" r="1.3" fill="var(--color-accent)" />
            </g>
          </svg>

          <Tile className="top-[6%] left-0 hidden sm:left-[2%] sm:block" style={delay(300)} bobDelay="0s">
            <p className="text-2xl leading-none font-medium tracking-tight text-ink tabular-nums">
              {data.reviewed}
            </p>
            <p className="mt-1.5 max-w-[11rem] text-xs leading-snug text-ink-muted">
              NASA investigations, each checked by a second reviewer
            </p>
          </Tile>

          {oxygen ? (
            <Tile className="right-0 bottom-[12%] sm:right-[2%]" style={delay(380)} bobDelay="-1.2s">
              <p className="text-xs text-ink-muted">Oxygen tested</p>
              <p className="mt-1 font-mono text-xl leading-none font-medium tracking-tight text-ink tabular-nums">
                {oxygen} <span className="text-sm text-ink-muted">% O₂</span>
              </p>
              <p className="mt-1.5 text-xs text-ink-faint">
                Stated in {data.oxygen.reporting} of {data.reviewed} records
              </p>
            </Tile>
          ) : null}

          <Tile
            className="top-[6%] left-0 sm:top-[38%] sm:right-[-2%] sm:left-auto"
            style={delay(460)}
            bobDelay="-2.3s"
          >
            <div className="flex items-stretch gap-3">
              <span aria-hidden className="w-2.5 shrink-0 rounded-sm hatch" />
              <div>
                <p className="text-2xl leading-none font-medium tracking-tight text-ink tabular-nums">
                  {data.conditionsUnknown}
                </p>
                <p className="mt-1.5 max-w-[9rem] text-xs leading-snug text-ink-muted">
                  condition values the sources don&apos;t state, left Unknown
                </p>
              </div>
            </div>
          </Tile>
        </div>

        {/* Copy. */}
        <div className="order-1 lg:order-1 lg:col-span-6 lg:pr-6">
          <h1
            id="hero-title"
            className="seq text-[clamp(2.75rem,6vw,6rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance text-ink"
            style={delay(520)}
          >
            Fire in orbit doesn&apos;t rise.
          </h1>
          <p
            className="seq mt-5 max-w-[34rem] text-[clamp(1.25rem,2vw,1.625rem)] leading-snug tracking-[-0.01em] text-balance text-ink-muted"
            style={delay(580)}
          >
            Check a spacecraft fire scenario against what NASA actually tested, and see where testing stops.
          </p>

          <form
            action="/scenario"
            method="get"
            className="seq mt-8 max-w-[34rem] rounded-lg border border-line bg-surface ticks p-4 sm:p-5"
            style={delay(640)}
          >
            <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
              Enter the cabin conditions you know. IGNIS ranks the reviewed investigations that tested
              something comparable. Leave a field blank and it stays out of the comparison.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {FIELDS.map((field) => (
                <label key={field.name} className="block">
                  <span className="mb-1 block text-xs font-medium text-ink">{field.label}</span>
                  <span className="relative block">
                    <input
                      name={field.name}
                      inputMode="decimal"
                      autoComplete="off"
                      className="h-10 w-full rounded-md border border-line-strong bg-sunken pr-11 pl-2.5 font-mono text-sm text-ink tabular-nums transition-colors hover:border-ink-faint/60 focus-visible:border-accent/70"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center font-mono text-2xs text-ink-faint">
                      {field.unit}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-[0.8125rem] font-medium text-accent-ink transition-[filter] hover:brightness-110"
              >
                Check the evidence
                <ArrowRight aria-hidden className="size-4" />
              </button>
              <Link
                href="/explore"
                className="text-[0.8125rem] font-medium text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-accent"
              >
                Browse all {data.reviewed} investigations
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
