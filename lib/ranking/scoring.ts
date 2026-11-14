import type { Investigation, SafetyObjective } from "@/lib/okf/types";

import {
  METHODOLOGY_DIMENSIONS,
  type EvidenceState,
  type MethodologyConfig,
  type MethodologyDimension,
} from "./methodology";
import {
  RESEARCH_QUESTION_LABEL,
  type DimensionAssessment,
  type GapCoverageState,
  type GapResult,
  type MissionScenario,
  type RelevanceBreakdown,
  type ResearchQuestion,
} from "./types";

/**
 * IGNIS methodology v1: deterministic evidence-state rules.
 *
 * OWNERSHIP: Member 3. Every rule here is documented in docs/methodology.md;
 * change both together and record the reason there.
 *
 * Fixed principles:
 * - outputs measure similarity between a scenario and reviewed evidence, never fire risk
 * - UNKNOWN never earns credit
 * - microgravity evidence is never DIRECT for a partial-gravity scenario (Moon, Mars)
 * - no randomness and no model calls; same inputs give the same outputs
 */

/** A value outside a tested range by at most this fraction of the nearest bound is RELATED. */
export const RANGE_RELATED_TOLERANCE = 0.2;

/** Scenario gravity at or below this level (g) is treated as microgravity. */
export const MICROGRAVITY_MAX_G = 0.01;

/** Two known gravity levels closer than this (g) are the same condition. */
export const GRAVITY_MATCH_TOLERANCE_G = 0.02;

/** Scenario gravity within this distance of 1 g is treated as normal gravity. */
export const NORMAL_GRAVITY_TOLERANCE_G = 0.05;

/**
 * Measurement keywords per safety goal. A measurement matches when its text
 * contains one of these phrases (case-insensitive, punctuation ignored).
 */
export const MEASUREMENT_KEYWORDS: Record<SafetyObjective, readonly string[]> = {
  prevention: [
    "flame spread",
    "spread rate",
    "flammability",
    "oxygen index",
    "limiting oxygen",
    "ignition",
    "burning rate",
    "regression",
    "heat release",
    "flame length",
    "flame size",
    "flame growth",
    "flame shape",
  ],
  detection: [
    "smoke",
    "particle",
    "particulate",
    "aerosol",
    "carbon monoxide",
    "carbon dioxide",
    "co2",
    "detector",
    "soot",
  ],
  suppression: [
    "extinction",
    "extinguish",
    "suppress",
    "quench",
    "nitrogen",
    "carbon dioxide",
    "co2",
    "diluent",
    "dilution",
    "inert",
  ],
};

/** Gap coverage state for the best evidence state found for a dimension. */
const GAP_STATE_FOR: Record<EvidenceState, GapCoverageState> = {
  DIRECT: "DIRECT",
  RELATED: "INDIRECT",
  BOUNDING: "BOUNDING",
  UNKNOWN: "MISSING",
  NOT_RELEVANT: "MISSING",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Whole-word phrase containment, ignoring case and punctuation. */
export function containsTerm(haystack: string, needle: string): boolean {
  const term = normalizeText(needle);
  if (term === "") return false;
  return ` ${normalizeText(haystack)} `.includes(` ${term} `);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface StateWithReason {
  state: EvidenceState;
  explanation: string;
}

const state = (value: EvidenceState, explanation: string): StateWithReason => ({
  state: value,
  explanation,
});

/* -------------------------------------------------------------------------- */
/* Dimension rules                                                             */
/* -------------------------------------------------------------------------- */

function assessRange(value: number, min: number | null, max: number | null, unit: string): StateWithReason {
  if (min === null || max === null) {
    return state("UNKNOWN", "The investigation does not state a complete tested range.");
  }
  const range = `${min}–${max} ${unit}`;
  if (value >= min && value <= max) return state("DIRECT", `${value} ${unit} is inside the tested ${range}.`);

  const bound = value < min ? min : max;
  const distance = Math.abs(value - bound);
  if (bound > 0 && distance <= RANGE_RELATED_TOLERANCE * bound) {
    return state(
      "RELATED",
      `${value} ${unit} is outside the tested ${range}, within ${RANGE_RELATED_TOLERANCE * 100}% of the nearest bound.`,
    );
  }
  return state("NOT_RELEVANT", `${value} ${unit} is well outside the tested ${range}.`);
}

type GravityClass = "micro" | "partial" | "normal" | "hyper";

function classifyScenarioGravity(g: number): GravityClass {
  if (g <= MICROGRAVITY_MAX_G) return "micro";
  if (Math.abs(g - 1) <= NORMAL_GRAVITY_TOLERANCE_G) return "normal";
  return g > 1 ? "hyper" : "partial";
}

/** Gravity level of the evidence in g, from gravityValue or, failing that, gravityCondition. */
export function evidenceGravityLevel(investigation: Investigation): number | null {
  if (investigation.gravityValue !== null) return investigation.gravityValue;
  if (investigation.gravityCondition === "microgravity") return 0;
  if (investigation.gravityCondition === "normal_gravity") return 1;
  return null;
}

function assessGravity(scenarioG: number, investigation: Investigation): StateWithReason {
  const evidence = evidenceGravityLevel(investigation);
  if (evidence === null) return state("UNKNOWN", "The investigation does not state its gravity level.");

  const scenarioClass = classifyScenarioGravity(scenarioG);
  const evidenceIsMicro = evidence <= MICROGRAVITY_MAX_G;

  if (scenarioClass === "micro") {
    return evidenceIsMicro
      ? state("DIRECT", "Microgravity evidence for a microgravity scenario.")
      : state("NOT_RELEVANT", `Evidence at ${evidence} g does not describe microgravity.`);
  }

  if (scenarioClass === "partial") {
    // Gravity rule: microgravity is never DIRECT for Moon or Mars; at most BOUNDING.
    if (evidenceIsMicro) {
      return state("BOUNDING", `Microgravity evidence only bounds a ${scenarioG} g scenario from below.`);
    }
    if (Math.abs(evidence - scenarioG) <= GRAVITY_MATCH_TOLERANCE_G) {
      return state("DIRECT", `Evidence at ${evidence} g matches the ${scenarioG} g scenario.`);
    }
    return state("BOUNDING", `Evidence at ${evidence} g only bounds a ${scenarioG} g scenario.`);
  }

  // Normal gravity or hypergravity scenario: only a matching level counts.
  if (!evidenceIsMicro && Math.abs(evidence - scenarioG) <= GRAVITY_MATCH_TOLERANCE_G) {
    return state("DIRECT", `Evidence at ${evidence} g matches the ${scenarioG} g scenario.`);
  }
  return state("NOT_RELEVANT", `Evidence at ${evidence} g does not describe a ${scenarioG} g scenario.`);
}

function assessSafetyObjective(objective: SafetyObjective, investigation: Investigation): StateWithReason {
  if (investigation.safetyCategories.length === 0) {
    return state("UNKNOWN", "The investigation has no reviewed safety category.");
  }
  return investigation.safetyCategories.includes(objective)
    ? state("DIRECT", `The investigation is categorised under ${objective}.`)
    : state("NOT_RELEVANT", `The investigation is not categorised under ${objective}.`);
}

function sameText(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

function assessMaterialFuel(
  material: string | null,
  fuelType: string | null,
  investigation: Investigation,
): StateWithReason {
  if (
    material !== null &&
    investigation.material !== null &&
    containsTerm(investigation.material, material)
  ) {
    return state("DIRECT", `The investigation tested ${material}.`);
  }

  const fuelKnown = fuelType !== null && investigation.fuelType !== null;
  const fuelMatches = fuelKnown && sameText(fuelType, investigation.fuelType as string);

  if (material === null) {
    if (!fuelKnown) return state("UNKNOWN", "The investigation does not state its fuel type.");
    return fuelMatches
      ? state("DIRECT", `The investigation used ${fuelType} fuel.`)
      : state("NOT_RELEVANT", `The investigation used ${investigation.fuelType} fuel, not ${fuelType}.`);
  }

  // A material was named but not found in the investigation's material list.
  if (fuelMatches) {
    return state("RELATED", `${material} was not tested, but the investigation used ${fuelType} fuel.`);
  }
  if (fuelKnown) {
    return state("NOT_RELEVANT", `${material} was not tested and the fuel type differs.`);
  }
  if (investigation.material === null) {
    return state("UNKNOWN", "The investigation does not state its material.");
  }
  return state("NOT_RELEVANT", `${material} is not among the tested materials.`);
}

function assessMeasurement(objective: SafetyObjective, investigation: Investigation): StateWithReason {
  if (investigation.measurements.length === 0) {
    return state("UNKNOWN", "The investigation lists no measurements.");
  }
  const keywords = MEASUREMENT_KEYWORDS[objective];
  const hit = investigation.measurements.find((measurement) =>
    keywords.some((keyword) => containsTerm(measurement, keyword)),
  );
  return hit
    ? state("DIRECT", `Measured "${hit}", which is relevant to ${objective}.`)
    : state("RELATED", `Has measurements, but none on the ${objective} keyword list.`);
}

/** The state for one dimension, or null when the scenario leaves that dimension blank. */
function assessDimension(
  dimension: MethodologyDimension,
  scenario: MissionScenario,
  investigation: Investigation,
): StateWithReason | null {
  switch (dimension) {
    case "safetyObjective":
      return scenario.safetyObjective === null
        ? null
        : assessSafetyObjective(scenario.safetyObjective, investigation);
    case "materialFuel":
      return scenario.material === null && scenario.fuelType === null
        ? null
        : assessMaterialFuel(scenario.material, scenario.fuelType, investigation);
    case "oxygen":
      return scenario.oxygenPercent === null
        ? null
        : assessRange(scenario.oxygenPercent, investigation.oxygenMin, investigation.oxygenMax, "% O2");
    case "airflow":
      return scenario.airflowMetersPerSecond === null
        ? null
        : assessRange(
            scenario.airflowMetersPerSecond,
            investigation.airflowMin,
            investigation.airflowMax,
            "m/s",
          );
    case "pressure":
      return scenario.pressureKPa === null
        ? null
        : assessRange(scenario.pressureKPa, investigation.pressureMin, investigation.pressureMax, "kPa");
    case "gravity":
      return scenario.gravityG === null ? null : assessGravity(scenario.gravityG, investigation);
    case "measurement":
      return scenario.safetyObjective === null
        ? null
        : assessMeasurement(scenario.safetyObjective, investigation);
  }
}

/* -------------------------------------------------------------------------- */
/* Relevance                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Relevance (0..100) and direct-condition coverage (0..100) for one investigation.
 * Both are normalised over the dimensions the scenario specifies. Neither is a
 * fire-risk probability.
 */
export function scoreInvestigation(
  scenario: MissionScenario,
  investigation: Investigation,
  config: MethodologyConfig,
): RelevanceBreakdown {
  const dimensions: DimensionAssessment[] = [];
  for (const dimension of METHODOLOGY_DIMENSIONS) {
    const assessed = assessDimension(dimension, scenario, investigation);
    if (assessed === null) continue;
    const weight = config.weights[dimension];
    const multiplier = config.stateMultipliers[assessed.state];
    dimensions.push({
      dimension,
      state: assessed.state,
      weight,
      multiplier,
      contribution: weight * multiplier,
      explanation: assessed.explanation,
    });
  }

  const totalWeight = dimensions.reduce((sum, entry) => sum + entry.weight, 0);
  const earned = dimensions.reduce((sum, entry) => sum + entry.contribution, 0);
  const direct = dimensions
    .filter((entry) => entry.state === "DIRECT")
    .reduce((sum, entry) => sum + entry.weight, 0);

  return {
    investigationId: investigation.id,
    methodologyId: config.id,
    relevanceScore: totalWeight === 0 ? null : round1((100 * earned) / totalWeight),
    directCoverage: totalWeight === 0 ? null : round1((100 * direct) / totalWeight),
    dimensions,
  };
}

/* -------------------------------------------------------------------------- */
/* Research coverage gaps                                                      */
/* -------------------------------------------------------------------------- */

/** Evidence states from strongest to weakest, as used to pick a dimension's best evidence. */
const STATE_STRENGTH: readonly EvidenceState[] = ["DIRECT", "RELATED", "BOUNDING", "UNKNOWN", "NOT_RELEVANT"];

/**
 * Corpus coverage per scenario dimension, from the strongest evidence any
 * reviewed investigation provides. Gap Priority = Importance Weight × (1 − Coverage),
 * with the dimension weight as importance and the state multiplier as coverage.
 * This is a research coverage gap, never a hazard rating.
 */
export function analyzeCoverage(
  scenario: MissionScenario,
  breakdowns: RelevanceBreakdown[],
  config: MethodologyConfig,
): GapResult[] {
  const specified = METHODOLOGY_DIMENSIONS.filter((dimension) => isSpecified(dimension, scenario));

  const results = specified.map((dimension): GapResult => {
    const assessments = breakdowns.flatMap((breakdown) =>
      breakdown.dimensions
        .filter((entry) => entry.dimension === dimension)
        .map((entry) => ({ id: breakdown.investigationId, state: entry.state })),
    );
    const best = STATE_STRENGTH.find((candidate) => assessments.some((entry) => entry.state === candidate));
    const gapState: GapCoverageState = best === undefined ? "MISSING" : GAP_STATE_FOR[best];
    const coverage = gapState === "MISSING" || best === undefined ? 0 : config.stateMultipliers[best];
    const weight = config.weights[dimension];

    return {
      dimension,
      state: gapState,
      coverage,
      priority: round1(weight * (1 - coverage)),
      supportingInvestigationIds:
        gapState === "MISSING"
          ? []
          : assessments
              .filter((entry) => entry.state === best)
              .map((entry) => entry.id)
              .sort(),
    };
  });

  return results.sort(
    (a, b) =>
      (b.priority ?? 0) - (a.priority ?? 0) ||
      METHODOLOGY_DIMENSIONS.indexOf(a.dimension) - METHODOLOGY_DIMENSIONS.indexOf(b.dimension),
  );
}

function isSpecified(dimension: MethodologyDimension, scenario: MissionScenario): boolean {
  switch (dimension) {
    case "safetyObjective":
    case "measurement":
      return scenario.safetyObjective !== null;
    case "materialFuel":
      return scenario.material !== null || scenario.fuelType !== null;
    case "oxygen":
      return scenario.oxygenPercent !== null;
    case "airflow":
      return scenario.airflowMetersPerSecond !== null;
    case "pressure":
      return scenario.pressureKPa !== null;
    case "gravity":
      return scenario.gravityG !== null;
  }
}

/* -------------------------------------------------------------------------- */
/* Research questions                                                          */
/* -------------------------------------------------------------------------- */

const STATE_CLAUSE: Record<Exclude<GapCoverageState, "DIRECT">, string> = {
  INDIRECT: "The reviewed evidence covers only nearby conditions.",
  BOUNDING: "The reviewed evidence only bounds this condition.",
  MISSING: "The reviewed evidence does not establish this.",
};

function conditionPhrase(dimension: MethodologyDimension, scenario: MissionScenario): string {
  switch (dimension) {
    case "oxygen":
      return `at ${scenario.oxygenPercent}% oxygen`;
    case "pressure":
      return `at ${scenario.pressureKPa} kPa`;
    case "airflow":
      return `at an airflow of ${scenario.airflowMetersPerSecond} m/s`;
    case "gravity":
      return `at ${scenario.gravityG} g`;
    case "materialFuel":
      return `for ${scenario.material ?? `${scenario.fuelType} fuel`}`;
    case "safetyObjective":
      return `for fire ${scenario.safetyObjective}`;
    case "measurement":
      return `to fire ${scenario.safetyObjective}`;
  }
}

function questionText(dimension: MethodologyDimension, scenario: MissionScenario): string {
  const where = conditionPhrase(dimension, scenario);
  switch (dimension) {
    case "safetyObjective":
      return `What reviewed evidence exists ${where} under the scenario conditions?`;
    case "measurement":
      return `Which measurements relevant ${where} have been made under the scenario conditions?`;
    case "materialFuel":
      return `How do flame spread and extinction behave ${where} under the scenario conditions?`;
    default:
      return `How do flame spread and extinction behave ${where}?`;
  }
}

/**
 * Deterministic research questions, one per dimension that is not DIRECT,
 * in gap-priority order. These are project-generated, not NASA recommendations.
 */
export function generateResearchQuestions(scenario: MissionScenario, gaps: GapResult[]): ResearchQuestion[] {
  return gaps
    .filter(
      (gap): gap is GapResult & { state: Exclude<GapCoverageState, "DIRECT"> } => gap.state !== "DIRECT",
    )
    .map((gap) => ({
      label: RESEARCH_QUESTION_LABEL,
      text: `${questionText(gap.dimension, scenario)} ${STATE_CLAUSE[gap.state]}`,
      basedOn: gap.dimension,
    }));
}
