import { describe, expect, it } from "vitest";

import { chunkDocuments } from "@/lib/retrieval/chunker";
import { parseEvalSet, scoreCase } from "@/lib/retrieval/evaluation";
import { blocksSynthesis, classifyBoundary } from "@/lib/retrieval/guard";
import { createMemoryStore } from "@/lib/retrieval/memory-store";
import { BOUNDARY_MESSAGES } from "@/lib/retrieval/messages";
import { analyzeQuery, buildVocabulary } from "@/lib/retrieval/query-analysis";
import type { EvidenceChunk, RetrievalResponse } from "@/lib/retrieval/types";
import { synthesize, type ChatFunction } from "@/lib/synthesis/server";
import { VERIFIER_PROMPT } from "@/lib/synthesis/verify";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

/**
 * Reviewed 2026-11-14 (human:member2 acting for Member 3): any question that
 * mentions lunar, Martian or partial gravity gets an informational notice
 * when no verified record was tested there. The evidence and its summary are
 * still shown; "was it tested?" questions keep the blocking coverage answer.
 */

const microgravityOnly = chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks.filter(
  (chunk) => chunk.gravityCondition !== "partial_gravity",
);
const notice = (question: string, catalog: EvidenceChunk[] = microgravityOnly) =>
  classifyBoundary(question, analyzeQuery(question, buildVocabulary(catalog)), catalog);

describe("partial-gravity notice", () => {
  it("is shown for any lunar or Martian question, and does not block a summary", () => {
    for (const question of [
      "Why does flame spread matter for lunar habitat design?",
      "What happens to flames on Mars?",
      "How would a fire behave in partial gravity?",
    ]) {
      const result = notice(question);
      expect(result?.kind, question).toBe("PARTIAL_GRAVITY_BOUND");
      expect(result?.message).toBe(BOUNDARY_MESSAGES.PARTIAL_GRAVITY_BOUND);
      expect(blocksSynthesis(result)).toBe(false);
    }
  });

  it("is not shown when a verified record was tested in partial gravity", () => {
    const lunar = {
      ...microgravityOnly[0],
      id: "lunar.objective.01",
      gravityCondition: "partial_gravity" as const,
    };
    expect(
      notice("Why does flame spread matter for lunar habitat design?", [...microgravityOnly, lunar]),
    ).toBeNull();
  });

  it("leaves 'was it tested?' questions with the blocking coverage answer", () => {
    const result = notice("Has NASA tested flame spread on the Moon?");
    expect(result?.kind).toBe("CORPUS_COVERAGE");
    expect(blocksSynthesis(result)).toBe(true);
  });

  it("is not shown for questions that do not mention partial gravity", () => {
    expect(notice("How does airflow affect flame spread over solid materials?")).toBeNull();
  });
});

describe("summary for a partial-gravity question", () => {
  const chunk = microgravityOnly[0];
  const store = createMemoryStore(microgravityOnly);
  const llm = { apiKey: "test-key", model: "test-model" };

  it("is allowed, carries the notice, and tells the writer to state the limit", async () => {
    let system = "";
    const chat: ChatFunction = async (messages) => {
      if (messages[0].content === VERIFIER_PROMPT) {
        return JSON.stringify({ verdicts: [{ id: "T1", verdict: "supported", reason: "" }] });
      }
      system = messages[0].content;
      return JSON.stringify({ answer: [{ text: "SYNTHETIC FIXTURE answer.", sources: ["S1"] }] });
    };
    const response = await synthesize("Why does flame spread matter for lunar habitat design?", [chunk.id], {
      store,
      llm,
      chat,
    });
    expect(response.status).toBe("ok");
    if (response.status !== "ok") return;
    expect(response.notes[0]).toBe(BOUNDARY_MESSAGES.PARTIAL_GRAVITY_BOUND);
    expect(system).toMatch(/No evidence block was tested in lunar, Martian or partial gravity/);
  });
});

describe("evaluation: expected notice", () => {
  const [item] = parseEvalSet({
    cases: [
      {
        id: "t1",
        split: "dev",
        category: "interpretation",
        kind: "specific",
        query: "Why does flame spread matter for lunar habitat design?",
        expected: [microgravityOnly[0].investigationId],
        expectedBoundary: "PARTIAL_GRAVITY_BOUND",
      },
    ],
  });
  const response = (kind: "PARTIAL_GRAVITY_BOUND" | null): RetrievalResponse => ({
    status: "ok",
    mode: "lexical_only",
    results: [],
    boundary: kind ? { kind, message: "", details: [] } : null,
    listing: null,
    understanding: analyzeQuery("", buildVocabulary([])),
    notice: null,
  });

  it("scores whether the expected notice was shown", () => {
    expect(scoreCase(item, response("PARTIAL_GRAVITY_BOUND"), microgravityOnly).boundaryOk).toBe(true);
    expect(scoreCase(item, response(null), microgravityOnly).boundaryOk).toBe(false);
  });
});
