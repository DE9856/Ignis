import { describe, expect, it } from "vitest";

import { TEST_CONFIG } from "@/lib/dev/test-config";
import {
  findMethodologyProblems,
  getMethodologyStatus,
  PRODUCTION_METHODOLOGY,
  type MethodologyConfig,
} from "@/lib/ranking/methodology";

describe("methodology configuration", () => {
  it("is structurally valid for TEST_CONFIG but never counts as configured", () => {
    expect(findMethodologyProblems(TEST_CONFIG)).toEqual([]);
    expect(getMethodologyStatus(TEST_CONFIG).configured).toBe(false);
  });

  it("counts as configured only with an approver and valid numbers", () => {
    const approved: MethodologyConfig = {
      ...TEST_CONFIG,
      id: "TEST_APPROVED",
      approvedBy: "human:test-reviewer",
    };
    expect(getMethodologyStatus(approved).configured).toBe(true);

    const broken = { ...approved, weights: { ...approved.weights, oxygen: -1 } };
    expect(getMethodologyStatus(broken).configured).toBe(false);
    expect(findMethodologyProblems(broken).join(" ")).toMatch(/oxygen/);
  });

  it("reports the installed production methodology honestly", () => {
    // Null until Member 3's configuration is merged. If it is installed, it must be valid and approved.
    const status = getMethodologyStatus();
    if (PRODUCTION_METHODOLOGY === null) {
      expect(status).toEqual({ configured: false, id: null, approvedBy: null });
    } else {
      expect(findMethodologyProblems(PRODUCTION_METHODOLOGY)).toEqual([]);
      expect(status.configured).toBe(true);
    }
  });
});
