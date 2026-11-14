import { describe, expect, it } from "vitest";

import { analyzeGaps } from "@/lib/ranking/gap-analysis";
import { rankInvestigations } from "@/lib/ranking/relevance";

import { makeInvestigation, makeScenario } from "../helpers";

describe("analyzeGaps", () => {
  it("reports no_evidence for every factor when there is nothing to compare", () => {
    const findings = analyzeGaps([]);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((finding) => finding.level === "no_evidence")).toBe(true);
  });

  it("classifies covered, unknown and gap factors and omits blank ones", () => {
    const scenario = makeScenario({ oxygenPercent: 15, pressureKPa: 50, material: "alpha" });
    const results = rankInvestigations(scenario, [
      makeInvestigation({ id: "one", oxygenMin: 10, oxygenMax: 20, material: "beta" }),
      makeInvestigation({ id: "two", oxygenMin: 30, oxygenMax: 40, material: "gamma" }),
    ]);

    const levels = Object.fromEntries(analyzeGaps(results).map((finding) => [finding.factor, finding.level]));
    expect(levels).toEqual({ oxygen: "covered", pressure: "unknown", material: "gap" });
  });
});
