import type { SafetyObjective } from "@/lib/okf/types";

import type { EvidenceState, MethodologyDimension } from "./methodology";

/**
 * A mission fire-safety scenario entered by the user.
 * Any field left blank is `null` and is simply not compared.
 */
export interface MissionScenario {
  id: string;
  name: string;
  description: string | null;
  /** Cabin oxygen concentration, percent by volume. */
  oxygenPercent: number | null;
  /** Cabin pressure, kPa. Convert psia / atm at the form boundary, not here. */
  pressureKPa: number | null;
  airflowMetersPerSecond: number | null;
  /** Gravity level in g (1 = Earth surface). */
  gravityG: number | null;
  material: string | null;
  fuelType: string | null;
  safetyObjective: SafetyObjective | null;
  assumptionNotes: string | null;
}

export const SCENARIO_FACTORS = [
  "oxygen",
  "pressure",
  "airflow",
  "gravity",
  "material",
  "fuelType",
  "safetyObjective",
] as const;
export type ScenarioFactor = (typeof SCENARIO_FACTORS)[number];

/**
 * - match: the investigation's reviewed data covers the scenario value
 * - mismatch: the investigation's data excludes the scenario value
 * - unknown: the investigation does not state enough to tell
 * - not_specified: the scenario left this factor blank
 */
export type FactorOutcome = "match" | "mismatch" | "unknown" | "not_specified";

export interface FactorAssessment {
  factor: ScenarioFactor;
  outcome: FactorOutcome;
}

export interface RelevanceResult {
  investigationId: string;
  /** 0..1, or null when the scenario specifies no comparable factor. */
  score: number | null;
  matched: number;
  mismatched: number;
  unknown: number;
  factors: FactorAssessment[];
}

/**
 * - covered: at least one investigation matches
 * - unknown: none match, but some do not state the value
 * - gap: every investigation excludes the scenario value
 * - no_evidence: there are no investigations to compare
 */
export type CoverageLevel = "covered" | "unknown" | "gap" | "no_evidence";

export interface GapFinding {
  factor: ScenarioFactor;
  level: CoverageLevel;
  matched: number;
  mismatched: number;
  unknown: number;
}

export const FACTOR_LABELS: Record<ScenarioFactor, string> = {
  oxygen: "Oxygen",
  pressure: "Pressure",
  airflow: "Airflow",
  gravity: "Gravity",
  material: "Material",
  fuelType: "Fuel type",
  safetyObjective: "Safety objective",
};

/* -------------------------------------------------------------------------- */
/* Target result shapes for the validated methodology.                         */
/*                                                                            */
/* DRAFT CONTRACT. These follow the vocabulary in Member 3's brief so that     */
/* Member 4 can build the score explanation and gap views against real types.  */
/* Nothing produces them yet; field meanings are fixed by docs/methodology.md  */
/* when Member 3 delivers it. Change them only in a `contract:` pull request.  */
/* -------------------------------------------------------------------------- */

export interface DimensionAssessment {
  dimension: MethodologyDimension;
  state: EvidenceState;
  weight: number;
  multiplier: number;
  /** weight x multiplier. */
  contribution: number;
  /** Short reason for the state, written by deterministic code. */
  explanation: string | null;
}

export interface RelevanceBreakdown {
  investigationId: string;
  /** `MethodologyConfig.id` that produced this result. */
  methodologyId: string;
  /** Mission relevance. Not a probability and not a safety score. Null when not computable. */
  relevanceScore: number | null;
  /** Direct-condition coverage, a separate output from relevance. Null when not computable. */
  directCoverage: number | null;
  dimensions: DimensionAssessment[];
}

export const GAP_COVERAGE_STATES = ["DIRECT", "BOUNDING", "INDIRECT", "MISSING"] as const;
export type GapCoverageState = (typeof GAP_COVERAGE_STATES)[number];

export interface GapResult {
  dimension: MethodologyDimension;
  state: GapCoverageState;
  /** Evidence coverage for this dimension. Never a risk level. */
  coverage: number | null;
  priority: number | null;
  supportingInvestigationIds: string[];
}

export const RESEARCH_QUESTION_LABEL = "PROJECT-GENERATED RESEARCH QUESTION";

export interface ResearchQuestion {
  label: typeof RESEARCH_QUESTION_LABEL;
  text: string;
  basedOn: MethodologyDimension;
}
