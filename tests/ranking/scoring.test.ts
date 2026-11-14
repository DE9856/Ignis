import { describe, expect, it } from "vitest";

import { IGNIS_METHODOLOGY_V1, METHODOLOGY_DIMENSIONS } from "@/lib/ranking/methodology";
import { analyzeCoverage, generateResearchQuestions, scoreInvestigation } from "@/lib/ranking/scoring";
import { RESEARCH_QUESTION_LABEL } from "@/lib/ranking/types";

import { makeInvestigation, makeScenario } from "../helpers";

/**
 * Pins the rules of IGNIS methodology v1 (docs/methodology.md).
 * Synthetic records only; none of these values describe a real investigation.
 */
const config = IGNIS_METHODOLOGY_V1;

const stateOf = (breakdown: ReturnType<typeof scoreInvestigation>, dimension: string) =>
  breakdown.dimensions.find((entry) => entry.dimension === dimension)?.state;

describe("methodology v1 configuration", () => {
  it("uses the approved weights, which sum to 100", () => {
    expect(config.weights).toEqual({
      safetyObjective: 20,
      materialFuel: 20,
      oxygen: 15,
      airflow: 15,
      pressure: 10,
      gravity: 10,
      measurement: 10,
    });
    expect(METHODOLOGY_DIMENSIONS.reduce((sum, dimension) => sum + config.weights[dimension], 0)).toBe(100);
  });

  it("uses the approved evidence-state multipliers; unknown never earns credit", () => {
    expect(config.stateMultipliers).toEqual({
      DIRECT: 1,
      RELATED: 0.65,
      BOUNDING: 0.4,
      UNKNOWN: 0,
      NOT_RELEVANT: 0,
    });
  });
});

describe("gravity rule", () => {
  const microgravity = makeInvestigation({ gravityCondition: "microgravity", gravityValue: null });

  it("is DIRECT for microgravity evidence and a microgravity scenario", () => {
    expect(stateOf(scoreInvestigation(makeScenario({ gravityG: 0 }), microgravity, config), "gravity")).toBe(
      "DIRECT",
    );
  });

  it("never makes microgravity evidence DIRECT for the Moon or Mars, at most BOUNDING", () => {
    for (const gravityG of [0.166, 0.38]) {
      expect(stateOf(scoreInvestigation(makeScenario({ gravityG }), microgravity, config), "gravity")).toBe(
        "BOUNDING",
      );
    }
  });

  it("is DIRECT for partial-gravity evidence at the same level", () => {
    const lunar = makeInvestigation({ gravityCondition: "partial_gravity", gravityValue: 0.17 });
    expect(stateOf(scoreInvestigation(makeScenario({ gravityG: 0.166 }), lunar, config), "gravity")).toBe(
      "DIRECT",
    );
  });

  it("is UNKNOWN when the record states no gravity at all", () => {
    expect(
      stateOf(scoreInvestigation(makeScenario({ gravityG: 0 }), makeInvestigation(), config), "gravity"),
    ).toBe("UNKNOWN");
  });
});

describe("range rule (oxygen, pressure, airflow)", () => {
  const record = makeInvestigation({ oxygenMin: 17, oxygenMax: 21 });
  const oxygenState = (oxygenPercent: number) =>
    stateOf(scoreInvestigation(makeScenario({ oxygenPercent }), record, config), "oxygen");

  it("is DIRECT inside the tested range, including its bounds", () => {
    expect(oxygenState(17)).toBe("DIRECT");
    expect(oxygenState(19)).toBe("DIRECT");
    expect(oxygenState(21)).toBe("DIRECT");
  });

  it("is RELATED within 20% of the nearest bound and NOT_RELEVANT beyond it", () => {
    expect(oxygenState(25)).toBe("RELATED"); // 4 above 21, limit 4.2
    expect(oxygenState(26)).toBe("NOT_RELEVANT");
    expect(oxygenState(14)).toBe("RELATED"); // 3 below 17, limit 3.4
    expect(oxygenState(13)).toBe("NOT_RELEVANT");
  });

  it("is UNKNOWN when either bound is missing", () => {
    const halfOpen = makeInvestigation({ oxygenMin: 17 });
    expect(stateOf(scoreInvestigation(makeScenario({ oxygenPercent: 19 }), halfOpen, config), "oxygen")).toBe(
      "UNKNOWN",
    );
  });
});

describe("material, safety goal and measurement", () => {
  it("is DIRECT when the named material was tested, RELATED for the same fuel class only", () => {
    const record = makeInvestigation({ material: "Cotton fabric; Nomex", fuelType: "solid" });
    const direct = scoreInvestigation(makeScenario({ material: "nomex", fuelType: "solid" }), record, config);
    const related = scoreInvestigation(makeScenario({ material: "PMMA", fuelType: "solid" }), record, config);
    const other = scoreInvestigation(makeScenario({ material: "PMMA", fuelType: "liquid" }), record, config);
    expect(stateOf(direct, "materialFuel")).toBe("DIRECT");
    expect(stateOf(related, "materialFuel")).toBe("RELATED");
    expect(stateOf(other, "materialFuel")).toBe("NOT_RELEVANT");
  });

  it("judges measurements against the safety goal's keyword list", () => {
    const record = makeInvestigation({
      safetyCategories: ["detection"],
      measurements: ["Smoke particle number concentration"],
    });
    const detection = scoreInvestigation(makeScenario({ safetyObjective: "detection" }), record, config);
    const suppression = scoreInvestigation(makeScenario({ safetyObjective: "suppression" }), record, config);
    expect(stateOf(detection, "measurement")).toBe("DIRECT");
    expect(stateOf(suppression, "measurement")).toBe("RELATED");
    expect(stateOf(suppression, "safetyObjective")).toBe("NOT_RELEVANT");
  });
});

describe("relevance and direct-condition coverage", () => {
  it("normalises over specified dimensions and keeps the two outputs separate", () => {
    // oxygen DIRECT (15), gravity BOUNDING (0.4 x 10 = 4), pressure UNKNOWN (0 of 10).
    const breakdown = scoreInvestigation(
      makeScenario({ oxygenPercent: 19, gravityG: 0.38, pressureKPa: 100 }),
      makeInvestigation({ oxygenMin: 17, oxygenMax: 21, gravityCondition: "microgravity" }),
      config,
    );
    expect(breakdown.dimensions.map((entry) => entry.dimension)).toEqual(["oxygen", "pressure", "gravity"]);
    expect(breakdown.relevanceScore).toBe(54.3); // 100 x 19 / 35
    expect(breakdown.directCoverage).toBe(42.9); // 100 x 15 / 35
  });

  it("returns null for both outputs when the scenario specifies nothing", () => {
    const breakdown = scoreInvestigation(
      makeScenario(),
      makeInvestigation({ oxygenMin: 1, oxygenMax: 2 }),
      config,
    );
    expect(breakdown.relevanceScore).toBeNull();
    expect(breakdown.directCoverage).toBeNull();
    expect(breakdown.dimensions).toEqual([]);
  });
});

describe("research coverage gaps", () => {
  const scenario = makeScenario({ oxygenPercent: 19, gravityG: 0.38, pressureKPa: 100 });
  const breakdowns = [
    scoreInvestigation(
      scenario,
      makeInvestigation({ id: "b", oxygenMin: 17, oxygenMax: 21, gravityCondition: "microgravity" }),
      config,
    ),
    scoreInvestigation(
      scenario,
      makeInvestigation({ id: "a", oxygenMin: 18, oxygenMax: 22, gravityCondition: "microgravity" }),
      config,
    ),
  ];
  const gaps = analyzeCoverage(scenario, breakdowns, config);

  it("applies Gap Priority = Importance Weight x (1 - Coverage), highest first", () => {
    expect(gaps).toEqual([
      { dimension: "pressure", state: "MISSING", coverage: 0, priority: 10, supportingInvestigationIds: [] },
      {
        dimension: "gravity",
        state: "BOUNDING",
        coverage: 0.4,
        priority: 6,
        supportingInvestigationIds: ["a", "b"],
      },
      {
        dimension: "oxygen",
        state: "DIRECT",
        coverage: 1,
        priority: 0,
        supportingInvestigationIds: ["a", "b"],
      },
    ]);
  });

  it("reports every specified dimension as MISSING when there is no evidence", () => {
    const empty = analyzeCoverage(scenario, [], config);
    expect(empty.every((gap) => gap.state === "MISSING" && gap.coverage === 0)).toBe(true);
  });

  it("writes labelled, deterministic questions only for dimensions that are not DIRECT", () => {
    const questions = generateResearchQuestions(scenario, gaps);
    expect(questions.map((question) => question.basedOn)).toEqual(["pressure", "gravity"]);
    expect(questions.every((question) => question.label === RESEARCH_QUESTION_LABEL)).toBe(true);
    expect(questions[0].text).toBe(
      "How do flame spread and extinction behave at 100 kPa? The reviewed evidence does not establish this.",
    );
    expect(generateResearchQuestions(scenario, gaps)).toEqual(questions);
  });
});
