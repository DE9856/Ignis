import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { GrowIn } from "@/components/motion/grow-in";
import { scenarioFactorText } from "@/components/scenario/factor-display";
import { EmptyState } from "@/components/shared/empty-state";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import { FACTOR_LABELS, type GapFinding } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

import { CoverageLevelBadge } from "./coverage-level";

/**
 * Evidence coverage per scenario factor, from the provisional gap analysis.
 * Each bar splits the reviewed investigations into those that cover the
 * scenario value, those that do not report it, and those that tested outside
 * it. These are counts of records, labelled as evidence coverage, never risk.
 */
export function EvidenceGapView({ analysis, className }: { analysis: ScenarioAnalysis; className?: string }) {
  if (analysis.consideredCount === 0) {
    return (
      <EmptyState
        description="Coverage is counted against human-reviewed investigation records. None are loaded yet."
        className={className}
      />
    );
  }
  if (analysis.gaps.length === 0) {
    return (
      <EmptyState
        title="No scenario conditions set"
        description="Coverage is shown for each condition the scenario specifies."
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <CoverageLegend />
      <GrowIn>
        <ul className="divide-y divide-line rounded-md border border-line">
          {analysis.gaps.map((gap) => (
            <GapRow
              key={gap.factor}
              gap={gap}
              scenarioValue={scenarioFactorText(gap.factor, analysis.scenario)}
            />
          ))}
        </ul>
      </GrowIn>
      <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        <ProvenanceBadge value="COMPUTED" />
        Evidence coverage across {analysis.consideredCount} reviewed{" "}
        {analysis.consideredCount === 1 ? "investigation" : "investigations"}. It describes what was tested,
        not how likely a fire is.
      </p>
    </div>
  );
}

function GapRow({ gap, scenarioValue }: { gap: GapFinding; scenarioValue: string }) {
  const total = gap.matched + gap.unknown + gap.mismatched;
  const label = `${FACTOR_LABELS[gap.factor]}: ${gap.matched} of ${total} reviewed investigations cover ${scenarioValue}, ${gap.unknown} do not report it, ${gap.mismatched} tested outside it.`;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3 py-2.5 md:grid-cols-[9rem_7rem_minmax(0,1fr)_7.5rem_6.5rem]">
      <div className="min-w-0 md:contents">
        <p className="text-sm2 font-medium text-ink">{FACTOR_LABELS[gap.factor]}</p>
        <p className="truncate font-mono text-xs text-ink-muted tabular-nums">{scenarioValue}</p>
      </div>
      <div className="col-start-2 row-start-1 justify-self-end md:col-start-5">
        <CoverageLevelBadge level={gap.level} />
      </div>
      <div
        role="img"
        aria-label={label}
        data-grow
        className="col-span-2 flex h-2.5 gap-[2px] md:col-span-1 md:col-start-3 md:row-start-1"
      >
        {total === 0 ? (
          <span className="h-full flex-1 rounded-full bg-track hatch" />
        ) : (
          <>
            <Segment count={gap.matched} total={total} className="bg-evidence-direct" />
            <Segment count={gap.unknown} total={total} className="bg-track hatch" />
            <Segment count={gap.mismatched} total={total} className="bg-mark-muted" />
          </>
        )}
      </div>
      <p className="col-span-2 font-mono text-2xs text-ink-muted tabular-nums md:col-span-1 md:col-start-4 md:row-start-1 md:text-right">
        <span className="text-ink">{gap.matched}</span>/{total} cover
        {gap.unknown > 0 ? <span className="text-ink-faint"> · {gap.unknown} n/r</span> : null}
      </p>
    </li>
  );
}

function Segment({ count, total, className }: { count: number; total: number; className: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "h-full rounded-[2px] transition-[flex-grow] duration-500 ease-out first:rounded-l-full last:rounded-r-full",
        className,
      )}
      style={{ flexGrow: count, flexBasis: 0 }}
      title={`${count} of ${total}`}
    />
  );
}

export function CoverageLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted", className)}>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2.5 w-3.5 rounded-[2px] bg-evidence-direct" />
        Covers the scenario value
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2.5 w-3.5 rounded-[2px] bg-track hatch" />
        Not reported (n/r)
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2.5 w-3.5 rounded-[2px] bg-mark-muted" />
        Tested outside it
      </li>
    </ul>
  );
}
