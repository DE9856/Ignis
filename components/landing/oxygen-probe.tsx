"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import type { LandingRange } from "@/lib/integration/landing";
import { cn } from "@/lib/utils/cn";
import { formatNumber, formatRange } from "@/lib/utils/numbers";

/** Axis for the probe, % O₂ by volume. Wide enough for every reviewed range. */
const AXIS = { min: 0, max: 50 };
const pct = (value: number) => ((value - AXIS.min) / (AXIS.max - AXIS.min)) * 100;

function covers(row: LandingRange, value: number): boolean {
  if (row.min === null && row.max === null) return false;
  const low = row.min ?? row.max ?? 0;
  const high = row.max ?? row.min ?? 0;
  return value >= low && value <= high;
}

/**
 * The page's proof: move the oxygen level and see which reviewed records
 * tested it. Records whose sources do not state oxygen are hatched, because
 * absence is a result, not an empty cell.
 */
export function OxygenProbe({ rows }: { rows: LandingRange[] }) {
  const id = useId();
  const [value, setValue] = useState(21);

  const reported = rows.filter((row) => row.min !== null || row.max !== null);
  const covered = rows.filter((row) => covers(row, value));
  const unreported = rows.length - reported.length;
  const cursor = `${pct(value)}%`;

  return (
    <div className="rounded-lg border border-line bg-surface ticks">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-[16rem] flex-1">
          <label
            htmlFor={id}
            className="flex items-baseline justify-between gap-3 text-[0.8125rem] font-medium text-ink"
          >
            Cabin oxygen
            <output
              htmlFor={id}
              className="font-mono text-2xl font-medium tracking-tight text-accent tabular-nums"
            >
              {formatNumber(value)} <span className="text-sm text-ink-muted">% O₂</span>
            </output>
          </label>
          <input
            id={id}
            type="range"
            min={AXIS.min}
            max={AXIS.max}
            step={0.5}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--color-accent)]"
          />
          <div aria-hidden className="mt-1 flex justify-between font-mono text-2xs text-ink-faint">
            <span>0</span>
            <span>25</span>
            <span>50 %</span>
          </div>
        </div>
        <p aria-live="polite" className="max-w-[22rem] text-[0.9375rem] leading-snug text-ink-muted">
          <span className="text-2xl font-medium tracking-tight text-ink tabular-nums">
            {covered.length} of {rows.length}
          </span>{" "}
          reviewed records tested {formatNumber(value)} % oxygen.{" "}
          {unreported > 0 ? <>{unreported} don&apos;t state an oxygen level at all.</> : null}
        </p>
      </div>

      <ul className="divide-y divide-line/70 px-4 py-2 sm:px-6">
        {rows.map((row) => {
          const hit = covers(row, value);
          const known = row.min !== null || row.max !== null;
          const low = row.min ?? row.max ?? 0;
          const high = row.max ?? row.min ?? 0;
          return (
            <li
              key={row.id}
              className="grid grid-cols-[6.5rem_1fr] items-center gap-3 py-2 sm:grid-cols-[9rem_1fr_7.5rem]"
            >
              <Link
                href={`/explore#${row.id}`}
                className={cn(
                  "truncate text-[0.8125rem] font-medium transition-colors hover:text-ink",
                  hit ? "text-ink" : "text-ink-muted",
                )}
              >
                {row.label}
              </Link>
              <div className="relative h-5">
                <div
                  className={cn("absolute inset-x-0 inset-y-1.5 rounded-sm", known ? "bg-track" : "hatch")}
                />
                {known ? (
                  <div
                    className={cn(
                      "absolute inset-y-1 rounded-sm transition-colors duration-300",
                      hit ? "bg-reviewed" : "bg-mark-muted",
                    )}
                    style={{ left: `${pct(low)}%`, width: `max(3px, ${pct(high) - pct(low)}%)` }}
                  />
                ) : null}
                <div aria-hidden className="absolute -inset-y-1 w-px bg-accent" style={{ left: cursor }} />
              </div>
              <p
                className={cn(
                  "col-span-2 -mt-1 font-mono text-2xs tabular-nums sm:col-span-1 sm:mt-0 sm:text-right",
                  hit ? "text-reviewed" : "text-ink-faint",
                )}
              >
                {known ? formatRange(row.min, row.max, "%") : "Not stated"}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6">
        <p className="flex items-center gap-4 text-xs text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-4 rounded-sm bg-reviewed" /> Tested this level
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-4 rounded-sm hatch" /> Not stated in the sources
          </span>
        </p>
        <Link
          href={`/scenario?oxygen=${value}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-accent underline-offset-4 hover:underline"
        >
          Run a full scenario at {formatNumber(value)} % O₂
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </div>
  );
}
