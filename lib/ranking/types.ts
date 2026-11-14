import type { SafetyObjective } from "@/lib/okf/types";

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
