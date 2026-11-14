import { isVerified } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";

import { activeMethodology, type MethodologyConfig } from "./methodology";
import { containsTerm, evidenceGravityLevel, scoreInvestigation } from "./scoring";
import {
  SCENARIO_FACTORS,
  type FactorAssessment,
  type FactorOutcome,
  type MissionScenario,
  type RelevanceResult,
} from "./types";

/**
 * Deterministic scenario-to-investigation relevance.
 *
 * With an approved methodology (lib/ranking/methodology.ts) the score is the
 * methodology relevance from scoring.ts. Without one, it falls back to the
 * PLACEHOLDER share of matched factors, which the app labels as provisional.
 *
 * The per-factor outcomes below are a simple match/mismatch/unknown view for
 * display. The methodology's evidence states are in `result.breakdown`.
 *
 * Fixed rules that survive any re-weighting:
 * - a missing investigation value is `unknown`, never a match
 * - same inputs always give the same order (ties break on investigation id)
 * - no randomness, no model calls
 */

/** Scenario and investigation gravity levels closer than this count as equal (factor view only). */
export const GRAVITY_TOLERANCE_G = 0.01;

export interface RankingOptions {
  /** Default false: only human-verified investigations are ranked. */
  includeUnverified?: boolean;
  /**
   * Methodology to score with. Defaults to the approved production methodology.
   * Pass null to force the placeholder score (tests of the fallback path).
   */
  methodology?: MethodologyConfig | null;
}

function assessRange(value: number | null, min: number | null, max: number | null): FactorOutcome {
  if (value === null) return "not_specified";
  if (min !== null && value < min) return "mismatch";
  if (max !== null && value > max) return "mismatch";
  return min !== null && max !== null ? "match" : "unknown";
}

function assessText(value: string | null, candidate: string | null): FactorOutcome {
  if (value === null) return "not_specified";
  if (candidate === null) return "unknown";
  return containsTerm(candidate, value) ? "match" : "mismatch";
}

function assessGravity(value: number | null, investigation: Investigation): FactorOutcome {
  if (value === null) return "not_specified";
  const candidate = evidenceGravityLevel(investigation);
  if (candidate === null) return "unknown";
  return Math.abs(value - candidate) <= GRAVITY_TOLERANCE_G ? "match" : "mismatch";
}

function resolveMethodology(options: RankingOptions): MethodologyConfig | null {
  return options.methodology === undefined ? activeMethodology() : activeMethodology(options.methodology);
}

export function assessInvestigation(
  scenario: MissionScenario,
  investigation: Investigation,
  options: RankingOptions = {},
): RelevanceResult {
  const outcomes: Record<(typeof SCENARIO_FACTORS)[number], FactorOutcome> = {
    oxygen: assessRange(scenario.oxygenPercent, investigation.oxygenMin, investigation.oxygenMax),
    pressure: assessRange(scenario.pressureKPa, investigation.pressureMin, investigation.pressureMax),
    airflow: assessRange(scenario.airflowMetersPerSecond, investigation.airflowMin, investigation.airflowMax),
    gravity: assessGravity(scenario.gravityG, investigation),
    material: assessText(scenario.material, investigation.material),
    fuelType: assessText(scenario.fuelType, investigation.fuelType),
    safetyObjective:
      scenario.safetyObjective === null
        ? "not_specified"
        : investigation.safetyCategories.length === 0
          ? "unknown"
          : investigation.safetyCategories.includes(scenario.safetyObjective)
            ? "match"
            : "mismatch",
  };

  const factors: FactorAssessment[] = SCENARIO_FACTORS.map((factor) => ({
    factor,
    outcome: outcomes[factor],
  }));
  const count = (outcome: FactorOutcome) => factors.filter((factor) => factor.outcome === outcome).length;
  const matched = count("match");
  const mismatched = count("mismatch");
  const unknown = count("unknown");
  const compared = matched + mismatched + unknown;

  const methodology = resolveMethodology(options);
  const breakdown = methodology === null ? null : scoreInvestigation(scenario, investigation, methodology);
  const placeholderScore = compared === 0 ? null : matched / compared;
  const score =
    breakdown === null
      ? placeholderScore
      : breakdown.relevanceScore === null
        ? null
        : breakdown.relevanceScore / 100;

  return {
    investigationId: investigation.id,
    score,
    matched,
    mismatched,
    unknown,
    factors,
    breakdown,
  };
}

export function rankInvestigations(
  scenario: MissionScenario,
  investigations: Investigation[],
  options: RankingOptions = {},
): RelevanceResult[] {
  return investigations
    .filter((investigation) => options.includeUnverified || isVerified(investigation))
    .map((investigation) => assessInvestigation(scenario, investigation, options))
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        (b.breakdown?.directCoverage ?? -1) - (a.breakdown?.directCoverage ?? -1) ||
        a.mismatched - b.mismatched ||
        a.investigationId.localeCompare(b.investigationId),
    );
}
