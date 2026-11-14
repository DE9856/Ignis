/**
 * Where the validated scoring methodology plugs in.
 *
 * OWNERSHIP: the numbers belong to Member 3. This file defines the shape and
 * the single place the approved configuration is installed. When
 * `PRODUCTION_METHODOLOGY` is null, the app reports scoring as awaiting
 * methodology and relevance.ts falls back to its labelled placeholder score.
 *
 * Do not put provisional weights here to "get things working". Use TEST_CONFIG
 * from lib/dev/test-config.ts in tests and development.
 */

export const METHODOLOGY_DIMENSIONS = [
  "safetyObjective",
  "materialFuel",
  "oxygen",
  "airflow",
  "pressure",
  "gravity",
  "measurement",
] as const;
export type MethodologyDimension = (typeof METHODOLOGY_DIMENSIONS)[number];

export const EVIDENCE_STATES = ["DIRECT", "RELATED", "BOUNDING", "UNKNOWN", "NOT_RELEVANT"] as const;
export type EvidenceState = (typeof EVIDENCE_STATES)[number];

export interface MethodologyConfig {
  /** Stable identifier, recorded with every computed result. */
  id: string;
  label: string;
  /** Reviewer who approved it, e.g. `human:member3`. Null means not approved. */
  approvedBy: string | null;
  approvedAt: string | null;
  weights: Record<MethodologyDimension, number>;
  stateMultipliers: Record<EvidenceState, number>;
}

/**
 * IGNIS methodology v1, approved by Member 3 (scientific validation).
 * Rules that turn records into evidence states live in scoring.ts; the
 * reasoning for every number is in docs/methodology.md. Weights sum to 100.
 */
export const IGNIS_METHODOLOGY_V1: MethodologyConfig = {
  id: "ignis-methodology-v1",
  label: "IGNIS methodology v1",
  approvedBy: "human:member3",
  approvedAt: "2026-11-14",
  weights: {
    safetyObjective: 20,
    materialFuel: 20,
    oxygen: 15,
    airflow: 15,
    pressure: 10,
    gravity: 10,
    measurement: 10,
  },
  stateMultipliers: {
    DIRECT: 1,
    RELATED: 0.65,
    BOUNDING: 0.4,
    UNKNOWN: 0,
    NOT_RELEVANT: 0,
  },
};

export const PRODUCTION_METHODOLOGY: MethodologyConfig | null = IGNIS_METHODOLOGY_V1;

export interface MethodologyStatus {
  configured: boolean;
  id: string | null;
  approvedBy: string | null;
}

/** Structural problems only: missing dimensions, negative or non-finite numbers. */
export function findMethodologyProblems(config: MethodologyConfig): string[] {
  const problems: string[] = [];
  for (const dimension of METHODOLOGY_DIMENSIONS) {
    const weight = config.weights[dimension];
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
      problems.push(`weight for ${dimension} must be a finite number of zero or more`);
    }
  }
  for (const state of EVIDENCE_STATES) {
    const multiplier = config.stateMultipliers[state];
    if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier < 0 || multiplier > 1) {
      problems.push(`multiplier for ${state} must be between 0 and 1`);
    }
  }
  if (METHODOLOGY_DIMENSIONS.every((dimension) => config.weights[dimension] === 0)) {
    problems.push("at least one weight must be greater than zero");
  }
  return problems;
}

export function getMethodologyStatus(
  config: MethodologyConfig | null = PRODUCTION_METHODOLOGY,
): MethodologyStatus {
  const configured =
    config !== null && config.approvedBy !== null && findMethodologyProblems(config).length === 0;
  return { configured, id: config?.id ?? null, approvedBy: config?.approvedBy ?? null };
}

/** The approved methodology to score with, or null when none is configured. */
export function activeMethodology(
  config: MethodologyConfig | null = PRODUCTION_METHODOLOGY,
): MethodologyConfig | null {
  return config !== null && getMethodologyStatus(config).configured ? config : null;
}
