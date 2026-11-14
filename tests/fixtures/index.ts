import path from "node:path";

import { loadKnowledgeBase, type KnowledgeBase } from "@/lib/okf/loader";
import type { MissionScenario } from "@/lib/ranking/types";

export * from "./chunks";

/**
 * Shared synthetic fixtures. See README.md in this folder.
 * Nothing here describes a real NASA investigation.
 */

export const FIXTURE_KNOWLEDGE_ROOT = path.join(process.cwd(), "tests", "fixtures", "knowledge");
export const INVALID_FIXTURE_KNOWLEDGE_ROOT = path.join(
  process.cwd(),
  "tests",
  "fixtures",
  "knowledge-invalid",
);

export function loadFixtureKnowledge(): KnowledgeBase {
  return loadKnowledgeBase(FIXTURE_KNOWLEDGE_ROOT);
}

export const FIXTURE_IDS = {
  alpha: "test-investigation-alpha",
  beta: "test-investigation-beta",
  gamma: "test-investigation-gamma",
  delta: "test-investigation-delta",
} as const;

/** Matches ALPHA on every factor it specifies. */
export const TEST_SCENARIO_ALPHA: MissionScenario = {
  id: "test-scenario-alpha",
  name: "TEST_SCENARIO_ALPHA",
  description: "Synthetic scenario for tests.",
  oxygenPercent: 15,
  pressureKPa: 75,
  airflowMetersPerSecond: 0.3,
  gravityG: 0,
  material: "TEST_MATERIAL_A",
  fuelType: "TEST_FUEL_A",
  safetyObjective: "prevention",
  assumptionNotes: "Synthetic assumptions.",
};

/** Specifies only two factors; everything else is left blank. */
export const TEST_SCENARIO_BETA: MissionScenario = {
  id: "test-scenario-beta",
  name: "TEST_SCENARIO_BETA",
  description: null,
  oxygenPercent: 30,
  pressureKPa: null,
  airflowMetersPerSecond: null,
  gravityG: null,
  material: null,
  fuelType: null,
  safetyObjective: "suppression",
  assumptionNotes: null,
};

/** Specifies nothing. Used to check the "empty scenario" path. */
export const TEST_SCENARIO_EMPTY: MissionScenario = {
  id: "test-scenario-empty",
  name: "TEST_SCENARIO_EMPTY",
  description: null,
  oxygenPercent: null,
  pressureKPa: null,
  airflowMetersPerSecond: null,
  gravityG: null,
  material: null,
  fuelType: null,
  safetyObjective: null,
  assumptionNotes: null,
};
