import { AnimatedNumber } from "@/components/motion/animated-number";
import { EmptyState } from "@/components/shared/empty-state";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import { FACTOR_LABELS } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

import { CoverageLevelBadge } from "./coverage-level";

/**
 * Overall evidence coverage for the scenario: how many of the conditions it
 * specifies have at least one matching reviewed investigation, then each
 * condition's level. A count of conditions, not a percentage and not a risk.
 */
export function ScenarioCoverageSummary({
  analysis,
  className,
}: {
  analysis: ScenarioAnalysis;
  className?: string;
}) {
  if (analysis.consideredCount === 0) {
    return (
      <EmptyState
        size="compact"
        description="Coverage is measured against human-reviewed investigation records."
        className={className}
      />
    );
  }
  if (analysis.gaps.length === 0) {
    return (
      <EmptyState
        size="compact"
        title="No scenario conditions set"
        description="Coverage is reported for each condition the scenario specifies."
        className={className}
      />
    );
  }

  const covered = analysis.gaps.filter((gap) => gap.level === "covered").length;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="flex items-baseline gap-2">
        <span className="shrink-0 text-3xl leading-none font-semibold whitespace-nowrap text-ink">
          <AnimatedNumber value={covered} format={(n) => String(Math.round(n))} />
          <span className="text-ink-faint"> / {analysis.gaps.length}</span>
        </span>
        <span className="text-xs leading-snug text-ink-muted">
          scenario conditions with matching reviewed evidence
        </span>
      </p>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-1">
        {analysis.gaps.map((gap) => (
          <li key={gap.factor} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-ink">{FACTOR_LABELS[gap.factor]}</span>
            <CoverageLevelBadge level={gap.level} />
          </li>
        ))}
      </ul>
    </div>
  );
}
