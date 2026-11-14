import Link from "next/link";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { ExperimentValue } from "@/components/experiments/experiment-value";
import { DIMENSION_LABELS } from "@/components/shared/labels";
import type { Investigation } from "@/lib/okf/types";
import {
  FACTOR_LABELS,
  type MissionScenario,
  type RelevanceBreakdown,
  type RelevanceResult,
} from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";
import { formatNumber, formatPercent } from "@/lib/utils/numbers";

import { EvidenceStateBadge, FactorOutcomeBadge } from "./evidence-state";
import { factorValues } from "./factor-display";

interface ProvisionalScoreExplanationProps {
  scenario: MissionScenario;
  investigation: Investigation;
  result: RelevanceResult;
  className?: string;
}

/**
 * Why a provisional relevance score is what it is: every factor the scenario
 * specified, what the scenario asked for, what this record states, and the
 * outcome the placeholder rules assigned. Nothing here is recomputed.
 */
export function ProvisionalScoreExplanation({
  scenario,
  investigation,
  result,
  className,
}: ProvisionalScoreExplanationProps) {
  const compared = result.factors.filter((factor) => factor.outcome !== "not_specified");
  const skipped = result.factors.filter((factor) => factor.outcome === "not_specified");
  const total = result.matched + result.mismatched + result.unknown;

  return (
    <div className={cn("overflow-hidden rounded-md border border-line bg-sunken/50", className)}>
      <table className="w-full text-left text-sm2">
        <caption className="sr-only">
          Factor-by-factor basis of the relevance score for {investigation.shortTitle ?? investigation.title}
        </caption>
        <thead>
          <tr className="border-b border-line text-2xs tracking-[0.06em] text-ink-faint uppercase">
            <th scope="col" className="py-2 pr-2 pl-3 font-medium">
              Factor
            </th>
            <th scope="col" className="hidden px-2 py-2 font-medium sm:table-cell">
              Scenario
            </th>
            <th scope="col" className="hidden px-2 py-2 font-medium sm:table-cell">
              This record
            </th>
            <th scope="col" className="py-2 pr-3 pl-2 text-right font-medium">
              Outcome
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {compared.map(({ factor, outcome }) => {
            const values = factorValues(factor, scenario, investigation);
            return (
              <tr key={factor} className="align-top">
                <th scope="row" className="py-2 pr-2 pl-3 font-medium text-ink">
                  {FACTOR_LABELS[factor]}
                  <dl className="mt-1 space-y-0.5 text-xs font-normal sm:hidden">
                    <div className="flex gap-2">
                      <dt className="text-ink-faint">Scenario</dt>
                      <dd>
                        <ExperimentValue value={values.scenario} numeric={values.numeric} />
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-ink-faint">Record</dt>
                      <dd>
                        <ExperimentValue value={values.record} numeric={values.numeric} />
                      </dd>
                    </div>
                  </dl>
                </th>
                <td className="hidden px-2 py-2 sm:table-cell">
                  <ExperimentValue value={values.scenario} numeric={values.numeric} />
                </td>
                <td className="hidden px-2 py-2 sm:table-cell">
                  <ExperimentValue value={values.record} numeric={values.numeric} />
                </td>
                <td className="py-2 pr-3 pl-2 text-right">
                  <FactorOutcomeBadge outcome={outcome} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="space-y-2 border-t border-line px-3 py-2.5 text-xs text-ink-muted">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <ProvenanceBadge value="COMPUTED" />
          <span>
            Provisional rule: matched factors ÷ factors compared, equal weights.{" "}
            <span className="font-mono text-ink tabular-nums">
              {result.matched} ÷ {total} = {formatPercent(result.score)}
            </span>
          </span>
        </p>
        <p>
          A value the record does not report counts as unknown, never as a match.
          {skipped.length > 0 ? (
            <>
              {" "}
              Not in this scenario, so not compared:{" "}
              {skipped.map(({ factor }) => FACTOR_LABELS[factor]).join(", ")}.
            </>
          ) : null}{" "}
          <Link
            href="/methodology#relevance"
            className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
          >
            How relevance is ranked
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * The validated methodology's per-dimension breakdown (RelevanceBreakdown, a
 * draft contract in lib/ranking/types.ts). Each row shows the state, the weight,
 * the state multiplier and the resulting contribution, so the total can be
 * traced line by line. Relevance and direct-condition coverage stay separate.
 */
export function ScoreBreakdown({
  breakdown,
  className,
}: {
  breakdown: RelevanceBreakdown;
  className?: string;
}) {
  const maxWeight = Math.max(...breakdown.dimensions.map((dimension) => dimension.weight), 0);
  const sum = breakdown.dimensions.reduce((total, dimension) => total + dimension.contribution, 0);

  return (
    <div className={cn("overflow-hidden rounded-md border border-line bg-sunken/50", className)}>
      <table className="w-full text-left text-sm2">
        <caption className="sr-only">Dimension-by-dimension basis of the relevance score</caption>
        <thead>
          <tr className="border-b border-line text-2xs tracking-[0.06em] text-ink-faint uppercase">
            <th scope="col" className="py-2 pr-2 pl-3 font-medium">
              Dimension
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              State
            </th>
            <th scope="col" className="hidden px-2 py-2 text-right font-medium md:table-cell">
              Weight × multiplier
            </th>
            <th scope="col" className="py-2 pr-3 pl-2 text-right font-medium">
              Contribution
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {breakdown.dimensions.map((dimension) => (
            <tr key={dimension.dimension} className="align-top">
              <th scope="row" className="py-2 pr-2 pl-3 font-medium text-ink">
                {DIMENSION_LABELS[dimension.dimension]}
                {dimension.explanation ? (
                  <p className="mt-0.5 max-w-sm text-xs font-normal text-ink-muted">
                    {dimension.explanation}
                  </p>
                ) : null}
              </th>
              <td className="px-2 py-2">
                <EvidenceStateBadge state={dimension.state} />
              </td>
              <td className="hidden px-2 py-2 text-right font-mono text-xs text-ink-muted tabular-nums md:table-cell">
                {formatNumber(dimension.weight)} × {formatNumber(dimension.multiplier)}
              </td>
              <td className="py-2 pr-3 pl-2">
                <div className="flex items-center justify-end gap-2">
                  <span
                    aria-hidden
                    className="relative hidden h-1.5 w-20 overflow-hidden rounded-full bg-track sm:block"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-line-strong/70"
                      style={{ width: maxWeight > 0 ? `${(dimension.weight / maxWeight) * 100}%` : "0%" }}
                    />
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-evidence-direct transition-[width] duration-500 ease-out"
                      style={{
                        width: maxWeight > 0 ? `${(dimension.contribution / maxWeight) * 100}%` : "0%",
                      }}
                    />
                  </span>
                  <span className="w-10 text-right font-mono text-ink tabular-nums">
                    {formatNumber(dimension.contribution)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="grid gap-x-6 gap-y-2 border-t border-line px-3 py-2.5 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-ink-faint">Sum of contributions</dt>
          <dd className="font-mono text-ink tabular-nums">{formatNumber(sum)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Mission relevance</dt>
          <dd className="font-mono text-ink tabular-nums">{formatNumber(breakdown.relevanceScore)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Direct-condition coverage</dt>
          <dd className="font-mono text-ink tabular-nums">{formatNumber(breakdown.directCoverage)}</dd>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-ink-muted sm:col-span-3">
          <ProvenanceBadge value="COMPUTED" />
          <span>
            Methodology <span className="font-mono text-ink">{breakdown.methodologyId}</span>. Relevance is
            not a probability and not a safety score.
          </span>
        </p>
      </dl>
    </div>
  );
}
