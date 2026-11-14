import type { GravityCondition, SafetyObjective } from "@/lib/okf/types";
import type { MethodologyDimension } from "@/lib/ranking/methodology";
import { UNKNOWN_LABEL } from "@/lib/utils/numbers";

/**
 * Display wording shared by every screen. Wording only: nothing here decides
 * what a value means, and nothing here supplies a value that is missing.
 */

/** Shown where an investigation record does not state a value. */
export const NOT_REPORTED = "Not reported";

/** Shown where the user left a scenario field blank. */
export const NOT_SPECIFIED = "Not specified";

/** `formatRange()` and friends return UNKNOWN_LABEL for a missing value; records say "Not reported". */
export function asReported(value: string): string {
  return value === UNKNOWN_LABEL ? NOT_REPORTED : value;
}

export function isMissingDisplay(value: string): boolean {
  return value === UNKNOWN_LABEL || value === NOT_REPORTED || value === NOT_SPECIFIED;
}

export const SAFETY_LABELS: Record<SafetyObjective, string> = {
  prevention: "Prevention",
  detection: "Detection",
  suppression: "Suppression",
};

export const SAFETY_LETTERS: Record<SafetyObjective, string> = {
  prevention: "P",
  detection: "D",
  suppression: "S",
};

export const GRAVITY_LABELS: Record<GravityCondition, string> = {
  microgravity: "Microgravity",
  partial_gravity: "Partial gravity",
  normal_gravity: "1 g",
  hypergravity: "Hypergravity",
  variable: "Variable gravity",
};

/** Labels for the validated methodology's dimensions (lib/ranking/methodology.ts). */
export const DIMENSION_LABELS: Record<MethodologyDimension, string> = {
  safetyObjective: "Safety objective",
  materialFuel: "Material / fuel",
  oxygen: "Oxygen",
  airflow: "Airflow",
  pressure: "Pressure",
  gravity: "Gravity",
  measurement: "Measurement relevance",
};

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
