import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { GrowIn } from "@/components/motion/grow-in";
import { GapStateBadge, gapStateLevel } from "@/components/scenario/evidence-state";
import { DIMENSION_LABELS, pluralize } from "@/components/shared/labels";
import type { GapResult } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";
import { formatNumber, formatPercent } from "@/lib/utils/numbers";

const FILL = ["", "bg-evidence-bounding", "bg-evidence-related", "bg-evidence-direct"] as const;

/** The gap with the highest priority, or null when no priority is known. Selection only. */
export function largestGapResult(gaps: GapResult[]): GapResult | null {
  return gaps
    .filter((gap) => gap.priority !== null)
    .reduce<GapResult | null>(
      (best, gap) => (best === null || (gap.priority ?? 0) > (best.priority ?? 0) ? gap : best),
      null,
    );
}

/**
 * MISSION EVIDENCE COVERAGE: one bar per methodology dimension, for the draft
 * GapResult contract. Coverage is evidence coverage (what was tested), labelled
 * as such on every row and never worded as risk.
 */
export function GapCoverageBars({ gaps, className }: { gaps: GapResult[]; className?: string }) {
  const largest = largestGapResult(gaps);

  return (
    <div className={cn("space-y-3", className)}>
      <GrowIn>
        <ul className="space-y-2.5">
          {gaps.map((gap) => {
            const level = gapStateLevel(gap.state);
            const width = gap.coverage === null ? 0 : Math.max(0, Math.min(1, gap.coverage)) * 100;
            const isLargest = largest?.dimension === gap.dimension;
            return (
              <li
                key={gap.dimension}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[10rem_minmax(0,1fr)_3.5rem_6.5rem]"
              >
                <p className={cn("text-sm2", isLargest ? "font-medium text-ink" : "text-ink")}>
                  {DIMENSION_LABELS[gap.dimension]}
                  {isLargest ? <span className="sr-only"> (largest evidence gap)</span> : null}
                </p>
                <div className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                  <div
                    role="img"
                    aria-label={`${DIMENSION_LABELS[gap.dimension]} evidence coverage ${formatPercent(gap.coverage)}`}
                    className={cn(
                      "relative h-2.5 overflow-hidden rounded-full bg-track",
                      gap.state === "MISSING" && "hatch",
                      isLargest && "ring-1 ring-danger/50 ring-offset-2 ring-offset-surface",
                    )}
                  >
                    {level > 0 ? (
                      <span
                        data-grow
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out",
                          FILL[level],
                        )}
                        style={{ width: `${width}%` }}
                      />
                    ) : null}
                  </div>
                </div>
                <p className="col-start-2 row-start-1 text-right font-mono text-xs text-ink tabular-nums sm:col-start-3">
                  {formatPercent(gap.coverage)}
                </p>
                <div className="hidden justify-self-end sm:col-start-4 sm:block">
                  <GapStateBadge state={gap.state} />
                </div>
              </li>
            );
          })}
        </ul>
      </GrowIn>
      {largest ? (
        <p className="text-xs text-ink-muted">
          Largest gap: <span className="font-medium text-ink">{DIMENSION_LABELS[largest.dimension]}</span>,
          priority <span className="font-mono text-ink">{formatNumber(largest.priority)}</span>, supported by{" "}
          {pluralize(largest.supportingInvestigationIds.length, "investigation")}.
        </p>
      ) : null}
      <p className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
        <ProvenanceBadge value="COMPUTED" />
        Percentages are evidence coverage of test conditions, never fire risk.
      </p>
    </div>
  );
}
