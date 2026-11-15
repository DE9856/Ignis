import { IgnisError } from "@/lib/core/errors";
import { canUseForAnalytics, type TrustOptions } from "@/lib/domain/provenance";
import { isKnownNumber } from "@/lib/domain/units";
import { SAFETY_OBJECTIVES, type Investigation, type SafetyObjective } from "@/lib/okf/types";
import { analyzeGaps } from "@/lib/ranking/gap-analysis";
import { activeMethodology, getMethodologyStatus } from "@/lib/ranking/methodology";
import { rankInvestigations } from "@/lib/ranking/relevance";
import {
  analyzeCoverage,
  generateResearchQuestions,
  MICROGRAVITY_MAX_G,
  NORMAL_GRAVITY_TOLERANCE_G,
} from "@/lib/ranking/scoring";
import type {
  GapFinding,
  GapResult,
  MissionScenario,
  RelevanceResult,
  ResearchQuestion,
} from "@/lib/ranking/types";

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

/**
 * Reference atmosphere the question words are relative to: Earth sea-level air
 * (about 21% oxygen, 101.3 kPa). A wording aid only; it decides no scores.
 */
const AIR_OXYGEN_PERCENT = 21;
const AIR_PRESSURE_KPA = 101.325;
const WORDING_MARGIN = 0.5;

/** Topic per objective, and how a material attaches to it ("flame spread of cotton"). */
const OBJECTIVE_TOPICS: Record<SafetyObjective, [topic: string, preposition: string]> = {
  prevention: ["flammability and flame spread", "of"],
  detection: ["smoke and fire detection", "for"],
  suppression: ["flame extinguishment and suppression", "for"],
};

function joinWords(words: string[]): string {
  return words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/**
 * The scenario as a question for the Evidence Desk, or null when nothing is
 * specified.
 *
 * Qualitative on purpose: it names how the atmosphere departs from Earth air
 * ("elevated oxygen", "reduced pressure") rather than exact values. The exact
 * values are compared by the deterministic ranking; the grounded summary
 * reliably answers "how does X affect Y" from the passages, while a question
 * about one exact value no record states is answered "not established". It
 * always asks about microgravity, because that is all the reviewed evidence
 * covers; the caller states the bound for a lunar or Martian scenario.
 */
export function scenarioQuestion(scenario: MissionScenario): string | null {
  const factors: string[] = [];
  const { oxygenPercent: oxygen, pressureKPa: pressure, airflowMetersPerSecond: airflow } = scenario;
  if (oxygen !== null && oxygen > AIR_OXYGEN_PERCENT + WORDING_MARGIN) factors.push("elevated oxygen");
  if (oxygen !== null && oxygen < AIR_OXYGEN_PERCENT - WORDING_MARGIN) factors.push("reduced oxygen");
  if (pressure !== null && pressure < AIR_PRESSURE_KPA - WORDING_MARGIN) factors.push("reduced pressure");
  if (pressure !== null && pressure > AIR_PRESSURE_KPA + WORDING_MARGIN) factors.push("elevated pressure");
  if (airflow !== null) factors.push(airflow === 0 ? "still air" : "forced airflow");

  const subject = scenario.material ?? (scenario.fuelType ? `${scenario.fuelType} fuels` : null);
  const specified = [oxygen, pressure, airflow, scenario.gravityG, subject, scenario.safetyObjective].some(
    (value) => value !== null,
  );
  if (!specified) return null;

  const [topic, preposition] = OBJECTIVE_TOPICS[scenario.safetyObjective ?? "prevention"];
  const about = subject ? `${topic} ${preposition} ${subject}` : topic;
  return factors.length > 0
    ? `How ${factors.length === 1 ? "does" : "do"} ${joinWords(factors)} affect ${about} in microgravity?`
    : `What does the reviewed evidence report about ${about} in microgravity?`;
}

/**
 * True for a lunar, Martian or other partial-gravity scenario, which microgravity
 * evidence only bounds. Same thresholds as the gravity rule in scoring.ts.
 */
export function isPartialGravityScenario(scenario: MissionScenario): boolean {
  const g = scenario.gravityG;
  return g !== null && g > MICROGRAVITY_MAX_G && g < 1 - NORMAL_GRAVITY_TOLERANCE_G;
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
   * False when no approved methodology is installed. While false, scores come
   * from the placeholder rules and must be presented as provisional.
   */
  methodologyConfigured: boolean;
  /** `MethodologyConfig.id` that produced the scores, or null for the placeholder. */
  methodologyId: string | null;
  /**
   * Research coverage gaps per scenario dimension, highest priority first.
   * Corpus coverage, never a hazard rating. Empty without an approved methodology.
   */
  coverage: GapResult[];
  /** Labelled PROJECT-GENERATED RESEARCH QUESTION. Not NASA recommendations. */
  researchQuestions: ResearchQuestion[];
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
  const methodology = activeMethodology();
  const breakdowns = results.flatMap((result) => (result.breakdown ? [result.breakdown] : []));
  const coverage = methodology === null ? [] : analyzeCoverage(scenario, breakdowns, methodology);

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
    methodologyId: methodology?.id ?? null,
    coverage,
    researchQuestions: generateResearchQuestions(scenario, coverage),
  };
}
