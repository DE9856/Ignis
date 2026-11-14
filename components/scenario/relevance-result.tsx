import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { Investigation } from "@/lib/okf/types";
import {
  FACTOR_LABELS,
  type CoverageLevel,
  type FactorOutcome,
  type GapFinding,
  type RelevanceResult as Result,
} from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";
import { formatPercent } from "@/lib/utils/numbers";

const OUTCOME_STYLES: Record<FactorOutcome, string> = {
  match: "border-reviewed/60 text-reviewed",
  mismatch: "border-danger/60 text-danger",
  unknown: "border-line-strong text-ink-muted border-dashed",
  not_specified: "hidden",
};

const COVERAGE_LABELS: Record<CoverageLevel, { label: string; className: string }> = {
  covered: { label: "Covered", className: "text-reviewed" },
  unknown: { label: "Unknown", className: "text-ink-muted" },
  gap: { label: "Gap", className: "text-danger" },
  no_evidence: { label: "No evidence", className: "text-ink-faint" },
};

interface RelevanceResultProps {
  investigations: Investigation[];
  results: Result[];
  gaps: GapFinding[];
  /** True once the scenario has at least one comparable value. */
  hasCriteria: boolean;
}

/** Ranked investigations plus the per-factor evidence gaps for the current scenario. */
export function RelevanceResult({ investigations, results, gaps, hasCriteria }: RelevanceResultProps) {
  if (results.length === 0) {
    return (
      <EmptyState description="Ranking needs at least one verified investigation record. None exist yet, so no relevance scores are shown." />
    );
  }
  if (!hasCriteria) {
    return (
      <EmptyState
        title="Scenario is empty"
        description="Enter at least one cabin condition, material, fuel or safety objective to rank investigations."
      />
    );
  }

  const byId = new Map(investigations.map((investigation) => [investigation.id, investigation]));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs">
        <ProvenanceBadge value="COMPUTED" />
        <span className="text-ink-muted">Scores are counted by fixed rules. See Methodology.</span>
      </div>

      <ol className="divide-y divide-line rounded-md border border-line">
        {results.map((result, index) => {
          const investigation = byId.get(result.investigationId);
          return (
            <li
              key={result.investigationId}
              className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 px-3 py-2.5"
            >
              <span className="font-mono text-xs text-ink-faint tabular-nums">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {investigation?.shortTitle ?? investigation?.title ?? result.investigationId}
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1">
                  {result.factors.map((assessment) => (
                    <li
                      key={assessment.factor}
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[11px] leading-none",
                        OUTCOME_STYLES[assessment.outcome],
                      )}
                    >
                      {FACTOR_LABELS[assessment.factor]}: {assessment.outcome}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-ink tabular-nums">{formatPercent(result.score)}</p>
                <p className="text-[11px] text-ink-faint">
                  {result.matched} of {result.matched + result.mismatched + result.unknown} factors
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div>
        <h3 className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Evidence gaps</h3>
        <table className="mt-2 w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] text-ink-muted uppercase">
              <th scope="col" className="py-1.5 font-medium">
                Factor
              </th>
              <th scope="col" className="py-1.5 font-medium">
                Coverage
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Match
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Mismatch
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Unknown
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {gaps.map((gap) => (
              <tr key={gap.factor}>
                <th scope="row" className="py-1.5 font-normal text-ink">
                  {FACTOR_LABELS[gap.factor]}
                </th>
                <td
                  className={cn("py-1.5 font-mono text-xs uppercase", COVERAGE_LABELS[gap.level].className)}
                >
                  {COVERAGE_LABELS[gap.level].label}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums">{gap.matched}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">{gap.mismatched}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">{gap.unknown}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
