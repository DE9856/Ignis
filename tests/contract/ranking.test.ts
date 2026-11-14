import { describe, expect, it } from "vitest";

import { analyzeScenario, findScenarioProblems, selectRelevanceInputs } from "@/lib/integration/scenario";
import { isIgnisError } from "@/lib/core/errors";
import { SCENARIO_FACTORS } from "@/lib/ranking/types";

import {
  FIXTURE_IDS,
  loadFixtureKnowledge,
  TEST_SCENARIO_ALPHA,
  TEST_SCENARIO_BETA,
  TEST_SCENARIO_EMPTY,
} from "../fixtures";

/**
 * CONTRACT: Investigation[] + MissionScenario -> relevance engine -> gap engine.
 *
 * Pins the shape and the trust rules. The numeric rules are placeholders until
 * Member 3's methodology lands, so scores are checked only where any sound
 * method must agree (a full match, an empty scenario).
 */
describe("contract: Investigation -> ranking", () => {
  const { investigations } = loadFixtureKnowledge();

  it("ranks only human-reviewed, non-deprecated records by default", () => {
    expect(
      selectRelevanceInputs(investigations)
        .map((i) => i.id)
        .sort(),
    ).toEqual([FIXTURE_IDS.alpha, FIXTURE_IDS.gamma]);
    expect(selectRelevanceInputs(investigations, { includeUnverified: true }).map((i) => i.id)).not.toContain(
      FIXTURE_IDS.delta,
    );
  });

  it("returns one result per considered investigation, with every factor assessed", () => {
    const analysis = analyzeScenario(TEST_SCENARIO_ALPHA, investigations);
    expect(analysis.consideredCount).toBe(2);
    expect(analysis.ranked.map((entry) => entry.rank)).toEqual([1, 2]);

    for (const { result, investigation } of analysis.ranked) {
      expect(result.investigationId).toBe(investigation.id);
      expect(result.factors.map((factor) => factor.factor)).toEqual([...SCENARIO_FACTORS]);
      expect(result.matched + result.mismatched + result.unknown).toBeLessThanOrEqual(
        SCENARIO_FACTORS.length,
      );
      expect(result.score === null || (result.score >= 0 && result.score <= 1)).toBe(true);
    }
  });

  it("puts the fully matching record first and is reproducible", () => {
    const first = analyzeScenario(TEST_SCENARIO_ALPHA, investigations);
    const second = analyzeScenario(TEST_SCENARIO_ALPHA, [...investigations].reverse());
    expect(first.ranked[0].investigation.id).toBe(FIXTURE_IDS.alpha);
    expect(first.ranked[0].result.score).toBe(1);
    expect(second.ranked.map((entry) => entry.investigation.id)).toEqual(
      first.ranked.map((entry) => entry.investigation.id),
    );
  });

  it("never credits an unknown value as a match", () => {
    const analysis = analyzeScenario(TEST_SCENARIO_ALPHA, investigations, { includeUnverified: true });
    const beta = analysis.ranked.find((entry) => entry.investigation.id === FIXTURE_IDS.beta);
    const outcome = (factor: string) =>
      beta?.result.factors.find((entry) => entry.factor === factor)?.outcome;
    expect(outcome("oxygen")).toBe("unknown");
    expect(outcome("pressure")).toBe("unknown");
    expect(outcome("material")).toBe("unknown");
  });

  it("reports gaps only for factors the scenario specifies", () => {
    const analysis = analyzeScenario(TEST_SCENARIO_BETA, investigations);
    expect(analysis.gaps.map((gap) => gap.factor).sort()).toEqual(["oxygen", "safetyObjective"]);
    for (const gap of analysis.gaps) {
      expect(gap.matched + gap.mismatched + gap.unknown).toBe(analysis.consideredCount);
    }
  });

  it("handles an empty scenario and an empty knowledge base without throwing", () => {
    const empty = analyzeScenario(TEST_SCENARIO_EMPTY, investigations);
    expect(empty.hasCriteria).toBe(false);
    expect(empty.ranked.every((entry) => entry.result.score === null)).toBe(true);

    const nothing = analyzeScenario(TEST_SCENARIO_ALPHA, []);
    expect(nothing.ranked).toEqual([]);
    expect(nothing.gaps.every((gap) => gap.level === "no_evidence")).toBe(true);
  });

  it("says whether a validated methodology produced the scores", () => {
    expect(typeof analyzeScenario(TEST_SCENARIO_ALPHA, investigations).methodologyConfigured).toBe("boolean");
  });

  it("attaches the methodology breakdown, coverage gaps and labelled research questions", () => {
    const analysis = analyzeScenario(TEST_SCENARIO_ALPHA, investigations);
    expect(analysis.methodologyId).toBe("ignis-methodology-v1");
    for (const { result } of analysis.ranked) {
      expect(result.breakdown?.investigationId).toBe(result.investigationId);
      expect(result.score).toBe((result.breakdown?.relevanceScore ?? 0) / 100);
    }
    expect(analysis.coverage.length).toBeGreaterThan(0);
    for (const gap of analysis.coverage) {
      expect(gap.priority).not.toBeNull();
      expect(["DIRECT", "BOUNDING", "INDIRECT", "MISSING"]).toContain(gap.state);
    }
    for (const question of analysis.researchQuestions) {
      expect(question.label).toBe("PROJECT-GENERATED RESEARCH QUESTION");
    }
  });

  it("rejects physically impossible scenario values with a typed error", () => {
    expect(findScenarioProblems({ ...TEST_SCENARIO_ALPHA, oxygenPercent: 140 })).toHaveLength(1);
    expect(findScenarioProblems(TEST_SCENARIO_ALPHA)).toEqual([]);
    try {
      analyzeScenario({ ...TEST_SCENARIO_ALPHA, pressureKPa: -5 }, investigations);
      throw new Error("expected INVALID_SCENARIO");
    } catch (error) {
      expect(isIgnisError(error) && error.code).toBe("INVALID_SCENARIO");
    }
  });
});
