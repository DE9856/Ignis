import { IgnisError } from "@/lib/core/errors";
import { canUseForAnalytics, type TrustOptions } from "@/lib/domain/provenance";
import { isKnownNumber } from "@/lib/domain/units";
import { SAFETY_OBJECTIVES, type Investigation } from "@/lib/okf/types";
import { analyzeGaps } from "@/lib/ranking/gap-analysis";
import { getMethodologyStatus } from "@/lib/ranking/methodology";
import { rankInvestigations } from "@/lib/ranking/relevance";
import type { GapFinding, MissionScenario, RelevanceResult } from "@/lib/ranking/types";

/**
 * Adapters between a scenario, the investigations and the ranking code.
 * No scoring logic lives here; it only prepares inputs and joins outputs.
 */

/** Problems that make a scenario unusable. Physical impossibilities only, no judgement calls. */
export function findScenarioProblems(scenario: MissionScenario): string[] {
  const problems: string[] = [];
  const check = (label: string, value: number | null, test: (v: number) => boolean, rule: string) => {
    if (value === null) return;
    if (!isKnownNumber(value) || !test(value)) problems.push(`${label} ${rule}`);
  };
  check("Oxygen", scenario.oxygenPercent, (v) => v >= 0 && v <= 100, "must be between 0 and 100 percent");
  check("Pressure", scenario.pressureKPa, (v) => v >= 0, "cannot be negative");
  check("Airflow", scenario.airflowMetersPerSecond, (v) => v >= 0, "cannot be negative");
  check("Gravity", scenario.gravityG, (v) => v >= 0, "cannot be negative");
  if (scenario.safetyObjective !== null && !SAFETY_OBJECTIVES.includes(scenario.safetyObjective)) {
    problems.push("Safety objective is not one of prevention, detection, suppression");
  }
  return problems;
}

export function assertValidScenario(scenario: MissionScenario): void {
  const problems = findScenarioProblems(scenario);
  if (problems.length > 0) throw new IgnisError("INVALID_SCENARIO", { detail: problems.join("; ") });
}

/** The investigations the relevance engine is allowed to see. */
export function selectRelevanceInputs(
  investigations: Investigation[],
  options: TrustOptions = {},
): Investigation[] {
  return investigations.filter((investigation) => canUseForAnalytics(investigation, options));
}

export interface RankedInvestigation {
  rank: number;
  investigation: Investigation;
  result: RelevanceResult;
}

export interface ScenarioAnalysis {
  scenario: MissionScenario;
  /** Investigations that were eligible for ranking. */
  consideredCount: number;
  ranked: RankedInvestigation[];
  gaps: GapFinding[];
  /** False when the scenario specifies nothing comparable. */
  hasCriteria: boolean;
  /**
   * False until Member 3's methodology is installed. While false, scores come
   * from the placeholder rules and must be presented as provisional.
   */
  methodologyConfigured: boolean;
}

/** scenario + investigations -> ranking -> gap analysis, joined for display. */
export function analyzeScenario(
  scenario: MissionScenario,
  investigations: Investigation[],
  options: TrustOptions = {},
): ScenarioAnalysis {
  assertValidScenario(scenario);

  const inputs = selectRelevanceInputs(investigations, options);
  const byId = new Map(inputs.map((investigation) => [investigation.id, investigation]));
  // The inputs are already trust-filtered, so the engine must not filter again.
  const results = rankInvestigations(scenario, inputs, { includeUnverified: true });

  return {
    scenario,
    consideredCount: inputs.length,
    ranked: results.flatMap((result, index) => {
      const investigation = byId.get(result.investigationId);
      return investigation ? [{ rank: index + 1, investigation, result }] : [];
    }),
    gaps: analyzeGaps(results),
    hasCriteria: results.some((result) => result.score !== null),
    methodologyConfigured: getMethodologyStatus().configured,
  };
}
