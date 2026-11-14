import Link from "next/link";

import { NOT_REPORTED, NOT_SPECIFIED } from "@/components/shared/labels";
import { rangeContains } from "@/lib/domain/units";
import { cn } from "@/lib/utils/cn";
import { formatNumber, formatRange } from "@/lib/utils/numbers";

import { formatTick, niceTicks, toPercent } from "./scale";

export interface EnvelopeRow {
  id: string;
  label: string;
  href?: string;
  min: number | null;
  max: number | null;
  /** Shown in the track when no number is recorded, e.g. "Microgravity, level not reported". */
  note?: string;
}

interface ConditionEnvelopeProps {
  title: string;
  unit: string;
  scenarioValue: number | null;
  rows: EnvelopeRow[];
  className?: string;
}

/**
 * Tested-condition envelopes: each reviewed record's stated range on one shared
 * axis, with the scenario value drawn across them. Shows at a glance whether
 * the scenario sits inside anything that was tested. Only stated bounds are
 * drawn; an open bound is drawn as open, and nothing is filled in.
 */
export function ConditionEnvelope({ title, unit, scenarioValue, rows, className }: ConditionEnvelopeProps) {
  const known = rows.flatMap((row) => [row.min, row.max]).filter((value): value is number => value !== null);
  const values = scenarioValue !== null ? [...known, scenarioValue] : known;

  if (values.length === 0) {
    return (
      <figure className={cn("rounded-md border border-line bg-sunken/40 p-3", className)}>
        <EnvelopeCaption title={title} unit={unit} scenarioValue={scenarioValue} />
        <p className="mt-3 rounded-[3px] bg-track/40 hatch px-2 py-2 text-xs text-ink-faint italic">
          No reviewed record reports {title.toLowerCase()}.
        </p>
      </figure>
    );
  }

  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const domain = [ticks[0], ticks[ticks.length - 1]] as const;
  const scenarioX = scenarioValue !== null ? toPercent(scenarioValue, domain) : null;

  return (
    <figure className={cn("rounded-md border border-line bg-sunken/40 p-3", className)}>
      <EnvelopeCaption title={title} unit={unit} scenarioValue={scenarioValue} />

      <div className="mt-3 grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_4.75rem] gap-x-3">
        {/* Plot column: gridlines and scenario marker span every row. */}
        <div
          className="relative col-start-2 row-span-full"
          style={{ gridRow: `1 / span ${rows.length + 1}` }}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden
              className="absolute inset-y-0 w-px bg-line"
              style={{ left: `${toPercent(tick, domain)}%` }}
            />
          ))}
          {scenarioX !== null ? (
            <span
              aria-hidden
              className="absolute -top-1 bottom-5 z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent"
              style={{ left: `${scenarioX}%` }}
            />
          ) : null}
        </div>

        {rows.map((row, index) => {
          const contains = rangeContains({ min: row.min, max: row.max }, scenarioValue);
          const rangeText = formatRange(row.min, row.max);
          const reported = row.min !== null || row.max !== null;
          return (
            <div key={row.id} className="contents">
              <div
                className="flex h-7 min-w-0 items-center text-xs"
                style={{ gridRow: index + 1, gridColumn: 1 }}
              >
                {row.href ? (
                  <Link href={row.href} className="truncate text-ink hover:text-accent">
                    {row.label}
                  </Link>
                ) : (
                  <span className="truncate text-ink">{row.label}</span>
                )}
              </div>
              <div className="relative h-7" style={{ gridRow: index + 1, gridColumn: 2 }}>
                <EnvelopeMark row={row} domain={domain} contains={contains} />
              </div>
              <div
                className="flex h-7 items-center justify-end text-right font-mono text-2xs tabular-nums"
                style={{ gridRow: index + 1, gridColumn: 3 }}
              >
                {reported ? (
                  <span className="text-ink-muted">{rangeText}</span>
                ) : (
                  <span className="font-sans text-ink-faint italic">{NOT_REPORTED}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Axis */}
        <div className="relative h-5" style={{ gridRow: rows.length + 1, gridColumn: 2 }}>
          {ticks.map((tick, index) => (
            <span
              key={tick}
              className={cn(
                "absolute bottom-0 font-mono text-2xs text-ink-faint tabular-nums",
                index === 0 ? "" : index === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
              )}
              style={{ left: `${toPercent(tick, domain)}%` }}
            >
              {formatTick(tick)}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

function EnvelopeCaption({
  title,
  unit,
  scenarioValue,
}: {
  title: string;
  unit: string;
  scenarioValue: number | null;
}) {
  return (
    <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="text-sm2 font-medium text-ink">
        {title} <span className="font-mono text-2xs font-normal text-ink-faint">{unit}</span>
      </span>
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span aria-hidden className="h-3 w-0.5 rounded-full bg-accent" />
        Scenario{" "}
        <span className="font-mono text-ink tabular-nums">
          {scenarioValue === null ? NOT_SPECIFIED : formatNumber(scenarioValue, unit)}
        </span>
      </span>
    </figcaption>
  );
}

function EnvelopeMark({
  row,
  domain,
  contains,
}: {
  row: EnvelopeRow;
  domain: readonly [number, number];
  contains: boolean | null;
}) {
  const fill =
    contains === true ? "bg-evidence-direct" : contains === false ? "bg-mark-muted" : "bg-ink-faint/70";
  const status =
    contains === true ? "covers the scenario value" : contains === false ? "excludes the scenario value" : "";
  const label = `${row.label}: ${formatRange(row.min, row.max)} ${status}`.trim();

  if (row.min === null && row.max === null) {
    return (
      <span className="absolute inset-x-0 top-1/2 flex h-4 -translate-y-1/2 items-center rounded-[3px] hatch px-2 text-2xs text-ink-faint italic">
        {row.note ? <span className="truncate rounded-sm bg-sunken/90 px-1">{row.note}</span> : null}
      </span>
    );
  }

  if (row.min !== null && row.max !== null) {
    const left = toPercent(row.min, domain);
    const right = toPercent(row.max, domain);
    if (right - left < 1.2) {
      return (
        <span
          role="img"
          aria-label={label}
          className={cn(
            "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-sunken",
            fill,
          )}
          style={{ left: `${(left + right) / 2}%` }}
        />
      );
    }
    return (
      <span
        role="img"
        aria-label={label}
        className={cn("absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full", fill)}
        style={{ left: `${left}%`, width: `${right - left}%` }}
      />
    );
  }

  // One bound only: a solid cap at the stated bound and an open, dashed run beyond it.
  const bound = (row.min ?? row.max) as number;
  const x = toPercent(bound, domain);
  const towardsHigh = row.min !== null;
  return (
    <span role="img" aria-label={label} className="absolute inset-0">
      <span
        className="absolute top-1/2 border-t-2 border-dashed border-ink-faint/60"
        style={towardsHigh ? { left: `${x}%`, right: 0 } : { left: 0, width: `${x}%` }}
      />
      <span
        className={cn("absolute top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full", fill)}
        style={{ left: `${x}%` }}
      />
    </span>
  );
}
