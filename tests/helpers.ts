import type { Investigation } from "@/lib/okf/types";
import type { MissionScenario } from "@/lib/ranking/types";

/**
 * TEST FIXTURES ONLY. Every value below is synthetic and chosen to exercise
 * code paths. None of it describes a real NASA investigation.
 */

export function makeInvestigation(overrides: Partial<Investigation> = {}): Investigation {
  return {
    id: "fixture",
    title: "Synthetic test fixture",
    shortTitle: null,
    program: null,
    description: null,
    objective: null,
    safetyCategories: [],
    fuelType: null,
    material: null,
    sampleShape: null,
    sampleSize: null,
    oxygenMin: null,
    oxygenMax: null,
    pressureMin: null,
    pressureMax: null,
    airflowMin: null,
    airflowMax: null,
    gravityCondition: null,
    gravityValue: null,
    platform: null,
    hardware: [],
    sensors: [],
    measurements: [],
    variables: [],
    keyFindings: [],
    limitations: [],
    tags: [],
    sources: [],
    related: [],
    generated: null,
    verified: [{ by: "human:test", at: null, scope: null }],
    status: "verified",
    ...overrides,
  };
}

export function makeScenario(overrides: Partial<MissionScenario> = {}): MissionScenario {
  return {
    id: "scenario",
    name: "Synthetic scenario",
    description: null,
    oxygenPercent: null,
    pressureKPa: null,
    airflowMetersPerSecond: null,
    gravityG: null,
    material: null,
    fuelType: null,
    safetyObjective: null,
    assumptionNotes: null,
    ...overrides,
  };
}
