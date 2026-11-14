import { isVerified } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";

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
 * PROVISIONAL: equal weights and the gravity tolerance below are scaffold
 * placeholders, not a reviewed methodology. Change them here and record the
 * reasoning on the Methodology page.
 *
 * Fixed rules that should survive any re-weighting:
 * - a missing investigation value is `unknown`, never a match
 * - same inputs always give the same order (ties break on investigation id)
 * - no randomness, no model calls
 */

/** Scenario and investigation gravity levels closer than this count as equal. */
export const GRAVITY_TOLERANCE_G = 0.01;

export interface RankingOptions {
  /** Default false: only human-verified investigations are ranked. */
  includeUnverified?: boolean;
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
  return value.trim().toLowerCase() === candidate.trim().toLowerCase() ? "match" : "mismatch";
}

function assessGravity(value: number | null, candidate: number | null): FactorOutcome {
  if (value === null) return "not_specified";
  if (candidate === null) return "unknown";
  return Math.abs(value - candidate) <= GRAVITY_TOLERANCE_G ? "match" : "mismatch";
}

export function assessInvestigation(
  scenario: MissionScenario,
  investigation: Investigation,
): RelevanceResult {
  const outcomes: Record<(typeof SCENARIO_FACTORS)[number], FactorOutcome> = {
    oxygen: assessRange(scenario.oxygenPercent, investigation.oxygenMin, investigation.oxygenMax),
    pressure: assessRange(scenario.pressureKPa, investigation.pressureMin, investigation.pressureMax),
    airflow: assessRange(scenario.airflowMetersPerSecond, investigation.airflowMin, investigation.airflowMax),
    gravity: assessGravity(scenario.gravityG, investigation.gravityValue),
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

  return {
    investigationId: investigation.id,
    score: compared === 0 ? null : matched / compared,
    matched,
    mismatched,
    unknown,
    factors,
  };
}

export function rankInvestigations(
  scenario: MissionScenario,
  investigations: Investigation[],
  options: RankingOptions = {},
): RelevanceResult[] {
  return investigations
    .filter((investigation) => options.includeUnverified || isVerified(investigation))
    .map((investigation) => assessInvestigation(scenario, investigation))
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        a.mismatched - b.mismatched ||
        a.investigationId.localeCompare(b.investigationId),
    );
}
