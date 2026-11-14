import { afterEach, describe, expect, it, vi } from "vitest";

import { getCapabilities } from "@/lib/core/capabilities";
import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { buildDashboardViewModel } from "@/lib/integration/dashboard";
import { summarizeKnowledge } from "@/lib/integration/knowledge";
import { analyzeScenario } from "@/lib/integration/scenario";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import { validateKnowledge } from "@/lib/okf/validation";

import {
  FIXTURE_IDS,
  FIXTURE_KNOWLEDGE_ROOT,
  INVALID_FIXTURE_KNOWLEDGE_ROOT,
  TEST_SCENARIO_ALPHA,
} from "../fixtures";

afterEach(() => vi.unstubAllEnvs());

/**
 * End-to-end harness on synthetic data only:
 *
 *   OKF files -> validation -> parser/loader -> Investigation -> scenario
 *   -> relevance -> gap analysis -> dashboard view model
 *
 * It proves the pieces connect before any real NASA content exists.
 */
describe("synthetic pipeline", () => {
  it("runs from Markdown files to a dashboard view model", () => {
    // 1. The files are structurally valid.
    expect(validateKnowledge(FIXTURE_KNOWLEDGE_ROOT).summary.withErrors).toBe(0);

    // 2. They load into typed records.
    const knowledge = loadKnowledgeBase(FIXTURE_KNOWLEDGE_ROOT);
    expect(knowledge.issues).toEqual([]);
    expect(summarizeKnowledge(knowledge)).toEqual({
      total: 7,
      investigations: 4,
      hardware: 1,
      concepts: 1,
      missions: 1,
      humanReviewed: 2,
      byStatus: { draft: 4, stable: 2, deprecated: 1 },
      withSources: 7,
      withoutSources: 0,
      issues: 0,
    });

    // 3. A scenario is ranked against reviewed records only, then gaps are derived.
    const analysis = analyzeScenario(TEST_SCENARIO_ALPHA, knowledge.investigations);
    expect(analysis.ranked.map((entry) => entry.investigation.id)).toEqual([
      FIXTURE_IDS.alpha,
      FIXTURE_IDS.gamma,
    ]);
    expect(analysis.hasCriteria).toBe(true);
    expect(analysis.gaps.length).toBeGreaterThan(0);
    expect(analysis.gaps.find((gap) => gap.factor === "oxygen")?.level).toBe("covered");

    // 4. Everything is assembled into plain data for the dashboard.
    const capabilities = getCapabilities(knowledge.investigations);
    const dashboard = buildDashboardViewModel(knowledge, capabilities, analysis);

    expect(dashboard.isEmpty).toBe(false);
    expect(dashboard.reviewedInvestigations.map((item) => item.id)).toEqual([
      FIXTURE_IDS.alpha,
      FIXTURE_IDS.gamma,
    ]);
    expect(dashboard.coverage).toEqual([
      { objective: "prevention", humanReviewed: 1, notReviewed: 0 },
      { objective: "detection", humanReviewed: 1, notReviewed: 0 },
      { objective: "suppression", humanReviewed: 1, notReviewed: 1 },
    ]);
    expect(dashboard.topInvestigations?.[0]).toMatchObject({ id: FIXTURE_IDS.alpha, rank: 1, score: 1 });
    expect(JSON.parse(JSON.stringify(dashboard))).toEqual(dashboard);
  });

  it("degrades honestly when there is no knowledge and nothing is configured", () => {
    for (const name of [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "OPTIONAL_LLM_API_KEY",
    ]) {
      vi.stubEnv(name, "");
    }
    const knowledge = loadKnowledgeBase("/nonexistent/ignis-knowledge");
    const dashboard = buildDashboardViewModel(knowledge, getCapabilities(knowledge.investigations));

    expect(dashboard.isEmpty).toBe(true);
    expect(dashboard.topInvestigations).toBeNull();
    expect(dashboard.coverage.every((entry) => entry.humanReviewed === 0 && entry.notReviewed === 0)).toBe(
      true,
    );
    expect(dashboard.notices.map((notice) => notice.message)).toEqual(
      expect.arrayContaining([DEGRADED_MESSAGES.noVerifiedKnowledge, DEGRADED_MESSAGES.noRetrieval]),
    );
  });

  it("survives a knowledge base full of broken files", () => {
    const knowledge = loadKnowledgeBase(INVALID_FIXTURE_KNOWLEDGE_ROOT);
    expect(knowledge.issues.length).toBeGreaterThan(0);
    expect(() => analyzeScenario(TEST_SCENARIO_ALPHA, knowledge.investigations)).not.toThrow();
    expect(summarizeKnowledge(knowledge).issues).toBeGreaterThan(0);
  });
});
