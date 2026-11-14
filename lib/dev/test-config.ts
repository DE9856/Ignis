import type { MethodologyConfig } from "@/lib/ranking/methodology";

/**
 * TEST_CONFIG is NOT a methodology. The numbers are arbitrary round values so
 * that tests have something to compute with. It has no approver, so
 * `getMethodologyStatus(TEST_CONFIG).configured` is false by design.
 */
export const TEST_CONFIG: MethodologyConfig = {
  id: "TEST_CONFIG",
  label: "TEST_CONFIG (synthetic, not a validated methodology)",
  approvedBy: null,
  approvedAt: null,
  weights: {
    safetyObjective: 1,
    materialFuel: 1,
    oxygen: 1,
    airflow: 1,
    pressure: 1,
    gravity: 1,
    measurement: 1,
  },
  stateMultipliers: {
    DIRECT: 1,
    RELATED: 0.5,
    BOUNDING: 0.25,
    UNKNOWN: 0,
    NOT_RELEVANT: 0,
  },
};
