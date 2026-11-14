import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { displayTitle } from "@/components/experiments/experiment-fields";
import { Disclosure } from "@/components/shared/disclosure";
import { EmptyState } from "@/components/shared/empty-state";
import { pluralize } from "@/components/shared/labels";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import { cn } from "@/lib/utils/cn";
import { formatPercent } from "@/lib/utils/numbers";

import { FactorPips } from "./evidence-state";
import { ProvisionalScoreExplanation } from "./score-explanation";

interface RelevanceListProps {
  analysis: ScenarioAnalysis;
  /** Show only the first N. The full list lives on the Scenario Builder. */
  limit?: number;
  /** Open the first explanation by default, so the "why" is visible without a click. */
  openFirst?: boolean;
  className?: string;
  /** Extra classes for the empty states, e.g. a margin when the list sits flush in a panel. */
  emptyClassName?: string;
}

/**
 * Investigations ranked against the scenario. Every score sits next to its
 * basis (one pip per compared factor) and opens to the full explanation.
 */
export function RelevanceList({
  analysis,
  limit,
  openFirst = false,
  className,
  emptyClassName,
}: RelevanceListProps) {
  if (analysis.consideredCount === 0) {
    return (
      <EmptyState
        description="Ranking starts once human-reviewed investigation records exist. No scores are shown until then."
        className={emptyClassName}
      />
    );
  }

  if (!analysis.hasCriteria) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        title="Set at least one scenario condition"
        description={`${pluralize(analysis.consideredCount, "reviewed investigation")} ready to compare. Enter an oxygen level, pressure, gravity, airflow, material, fuel or safety objective.`}
        className={emptyClassName}
      />
    );
  }

  const rows = limit ? analysis.ranked.slice(0, limit) : analysis.ranked;

  return (
    <ol className={cn("divide-y divide-line", className)}>
      {rows.map(({ rank, investigation, result }) => {
        const compared = result.matched + result.mismatched + result.unknown;
        return (
          <li
            key={investigation.id}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-x-3 px-4 py-3"
          >
            <span className="pt-0.5 font-mono text-xs text-ink-faint tabular-nums">
              {String(rank).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/explore#${investigation.id}`}
                  className="group inline-flex min-w-0 items-center gap-1 text-sm font-medium text-ink hover:text-accent"
                >
                  <span className="truncate">{displayTitle(investigation)}</span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
                {investigation.status !== "stable" ? <StatusBadge status={investigation.status} /> : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-faint">
                {[investigation.program, investigation.platform].filter(Boolean).join(" · ") ||
                  "Program not reported"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <p className="font-mono text-lg leading-none font-medium text-ink">
                {formatPercent(result.score)}
              </p>
              <p className="text-2xs text-ink-faint">relevance</p>
              <FactorPips outcomes={result.factors.map((factor) => factor.outcome)} className="mt-1" />
              <p className="font-mono text-2xs text-ink-muted tabular-nums">
                {result.matched}/{compared} match
              </p>
            </div>

            <Disclosure
              className="col-span-3 -mt-5 sm:col-span-2 sm:col-start-2"
              summary="Why this score"
              defaultOpen={openFirst && rank === 1}
              bodyClassName="mt-2"
            >
              <ProvisionalScoreExplanation
                scenario={analysis.scenario}
                investigation={investigation}
                result={result}
              />
            </Disclosure>
          </li>
        );
      })}
    </ol>
  );
}
