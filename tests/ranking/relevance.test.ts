import { describe, expect, it } from "vitest";

import { assessInvestigation, rankInvestigations } from "@/lib/ranking/relevance";

import { makeInvestigation, makeScenario } from "../helpers";

const outcomeOf = (result: ReturnType<typeof assessInvestigation>, factor: string) =>
  result.factors.find((assessment) => assessment.factor === factor)?.outcome;

describe("assessInvestigation", () => {
  it("treats a missing investigation value as unknown, never a match", () => {
    const result = assessInvestigation(makeScenario({ oxygenPercent: 15 }), makeInvestigation());
    expect(outcomeOf(result, "oxygen")).toBe("unknown");
    expect(result.score).toBe(0);
  });

  it("matches inside a closed range and mismatches outside it", () => {
    const investigation = makeInvestigation({ oxygenMin: 10, oxygenMax: 20 });
    expect(outcomeOf(assessInvestigation(makeScenario({ oxygenPercent: 15 }), investigation), "oxygen")).toBe(
      "match",
    );
    expect(outcomeOf(assessInvestigation(makeScenario({ oxygenPercent: 25 }), investigation), "oxygen")).toBe(
      "mismatch",
    );
  });

  it("does not claim a match from a half-open range", () => {
    const investigation = makeInvestigation({ oxygenMin: 10 });
    expect(outcomeOf(assessInvestigation(makeScenario({ oxygenPercent: 15 }), investigation), "oxygen")).toBe(
      "unknown",
    );
    expect(outcomeOf(assessInvestigation(makeScenario({ oxygenPercent: 5 }), investigation), "oxygen")).toBe(
      "mismatch",
    );
  });

  it("ignores factors the scenario leaves blank and returns a null score when all are blank", () => {
    const result = assessInvestigation(makeScenario(), makeInvestigation({ oxygenMin: 10, oxygenMax: 20 }));
    expect(result.factors.every((assessment) => assessment.outcome === "not_specified")).toBe(true);
    expect(result.score).toBeNull();
  });

  it("compares text case-insensitively and safety objective by membership", () => {
    const result = assessInvestigation(
      makeScenario({ material: " Alpha ", safetyObjective: "detection" }),
      makeInvestigation({ material: "alpha", safetyCategories: ["suppression"] }),
    );
    expect(outcomeOf(result, "material")).toBe("match");
    expect(outcomeOf(result, "safetyObjective")).toBe("mismatch");
    expect(result.score).toBe(0.5);
  });
});

describe("rankInvestigations", () => {
  const scenario = makeScenario({ oxygenPercent: 15, material: "alpha" });
  const full = makeInvestigation({ id: "full", oxygenMin: 10, oxygenMax: 20, material: "alpha" });
  const partial = makeInvestigation({ id: "partial", oxygenMin: 10, oxygenMax: 20, material: "beta" });
  const tieA = makeInvestigation({ id: "a-tie", oxygenMin: 10, oxygenMax: 20, material: "beta" });
  const draft = makeInvestigation({ id: "draft", status: "draft", verified: [] });

  it("orders by score and breaks ties by id, regardless of input order", () => {
    const expected = ["full", "a-tie", "partial"];
    expect(rankInvestigations(scenario, [partial, tieA, full]).map((r) => r.investigationId)).toEqual(
      expected,
    );
    expect(rankInvestigations(scenario, [full, partial, tieA]).map((r) => r.investigationId)).toEqual(
      expected,
    );
  });

  it("excludes unverified records unless asked", () => {
    expect(rankInvestigations(scenario, [full, draft])).toHaveLength(1);
    expect(rankInvestigations(scenario, [full, draft], { includeUnverified: true })).toHaveLength(2);
  });
});
