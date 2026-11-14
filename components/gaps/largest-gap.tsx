import { CircleCheck } from "lucide-react";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { Enter } from "@/components/motion/enter";
import { scenarioFactorText } from "@/components/scenario/factor-display";
import { EmptyState } from "@/components/shared/empty-state";
import { GRAVITY_LABELS, pluralize, SAFETY_LABELS } from "@/components/shared/labels";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import { GRAVITY_CONDITIONS, SAFETY_OBJECTIVES, type Investigation } from "@/lib/okf/types";
import { FACTOR_LABELS, type GapFinding, type ScenarioFactor } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

import { COVERAGE_LEVEL_MEANING, CoverageLevelBadge, LEVEL_ORDER } from "./coverage-level";

/** Uncovered factors, largest gap first. Ordering only; no score is computed here. */
export function orderUncovered(gaps: GapFinding[]): GapFinding[] {
  return gaps
    .filter((gap) => gap.level !== "covered")
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}

interface LargestGapProps {
  analysis: ScenarioAnalysis;
  /** `compact` for the dashboard: headline gap only. */
  variant?: "full" | "compact";
  className?: string;
}

/**
 * The largest evidence gap for the scenario, with what the reviewed corpus
 * does contain for that condition. Until the methodology defines gap priority,
 * gaps are ordered by coverage level (gap, then no evidence, then unknown).
 */
export function LargestGap({ analysis, variant = "full", className }: LargestGapProps) {
  if (analysis.consideredCount === 0) {
    return (
      <EmptyState
        size="compact"
        description="Gaps are found by comparing the scenario with reviewed investigations."
        className={className}
      />
    );
  }
  if (analysis.gaps.length === 0) {
    return (
      <EmptyState
        size="compact"
        title="No scenario conditions set"
        description="Set a condition to see where reviewed evidence runs out."
        className={className}
      />
    );
  }

  const uncovered = orderUncovered(analysis.gaps);
  if (uncovered.length === 0) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-md border border-line bg-sunken/50 px-3.5 py-3",
          className,
        )}
      >
        <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-evidence-direct" />
        <div>
          <p className="text-sm2 font-medium text-ink">No uncovered conditions</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Every condition in this scenario has at least one reviewed investigation that tested it. That is
            coverage of test conditions, not proof that findings transfer.
          </p>
        </div>
      </div>
    );
  }

  const [largest, ...others] = uncovered;
  const investigations = analysis.ranked.map((entry) => entry.investigation);

  return (
    <div className={cn("space-y-3", className)}>
      <Enter key={largest.factor} variant="slide">
        <div className="rounded-md border border-line bg-sunken/50">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-lg leading-tight font-medium text-ink">{FACTOR_LABELS[largest.factor]}</p>
              <p className="mt-1 font-mono text-xs text-ink-muted">
                Scenario: {scenarioFactorText(largest.factor, analysis.scenario)}
              </p>
            </div>
            <CoverageLevelBadge level={largest.level} />
          </div>
          <div className="space-y-2.5 px-3.5 py-3">
            <p className="text-xs text-ink-muted">{COVERAGE_LEVEL_MEANING[largest.level]}</p>
            {variant === "full" ? (
              <CorpusContents factor={largest.factor} investigations={investigations} />
            ) : null}
          </div>
        </div>
      </Enter>

      {others.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs text-ink-faint">Also uncovered</p>
          <ul className="flex flex-wrap gap-1.5">
            {others.map((gap) => (
              <li
                key={gap.factor}
                className="inline-flex items-center gap-2 rounded-md border border-line px-2 py-1 text-xs text-ink"
              >
                {FACTOR_LABELS[gap.factor]}
                <CoverageLevelBadge level={gap.level} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {variant === "full" ? (
        <p className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
          <ProvenanceBadge value="COMPUTED" />
          Ordered by coverage level until gap priority is set by the validated methodology.
        </p>
      ) : null}
    </div>
  );
}

/** What the reviewed corpus records for one condition: the "reviewed evidence" list. */
function CorpusContents({
  factor,
  investigations,
}: {
  factor: ScenarioFactor;
  investigations: Investigation[];
}) {
  const rows = corpusRows(factor, investigations);
  return (
    <div>
      <p className="mb-1.5 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
        Reviewed evidence for {FACTOR_LABELS[factor].toLowerCase()}
      </p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-3 text-xs">
            <span className={row.count === 0 ? "text-ink-faint" : "text-ink"}>{row.label}</span>
            <span
              className={cn(
                "shrink-0 font-mono tabular-nums",
                row.count === 0 ? "text-danger" : "text-ink-muted",
              )}
            >
              {row.count === 0 ? "none in reviewed corpus" : pluralize(row.count, "record")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function corpusRows(
  factor: ScenarioFactor,
  investigations: Investigation[],
): { label: string; count: number }[] {
  const count = (test: (investigation: Investigation) => boolean) => investigations.filter(test).length;

  switch (factor) {
    case "gravity":
      return [
        ...GRAVITY_CONDITIONS.map((condition) => ({
          label: GRAVITY_LABELS[condition],
          count: count((investigation) => investigation.gravityCondition === condition),
        })),
        {
          label: "Gravity not reported",
          count: count((investigation) => investigation.gravityCondition === null),
        },
      ].filter((row) => row.count > 0 || row.label !== "Gravity not reported");
    case "safetyObjective":
      return SAFETY_OBJECTIVES.map((objective) => ({
        label: SAFETY_LABELS[objective],
        count: count((investigation) => investigation.safetyCategories.includes(objective)),
      }));
    case "material":
    case "fuelType": {
      const values = new Map<string, number>();
      for (const investigation of investigations) {
        const value = investigation[factor];
        if (value) values.set(value, (values.get(value) ?? 0) + 1);
      }
      const rows = [...values.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6)
        .map(([label, total]) => ({ label, count: total }));
      const missing = count((investigation) => investigation[factor] === null);
      return missing > 0 ? [...rows, { label: "Not reported", count: missing }] : rows;
    }
    case "oxygen":
    case "pressure":
    case "airflow": {
      const [min, max] = (
        {
          oxygen: ["oxygenMin", "oxygenMax"],
          pressure: ["pressureMin", "pressureMax"],
          airflow: ["airflowMin", "airflowMax"],
        } as const
      )[factor];
      const closed = count((investigation) => investigation[min] !== null && investigation[max] !== null);
      const open = count((investigation) => (investigation[min] === null) !== (investigation[max] === null));
      const missing = count((investigation) => investigation[min] === null && investigation[max] === null);
      return [
        { label: "Full range reported", count: closed },
        { label: "One bound only", count: open },
        { label: "Not reported", count: missing },
      ];
    }
  }
}
