import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { chunkDocuments } from "@/lib/retrieval/chunker";
import { chanceHitAtK, parseEvalSet, renderReport, scoreCase, summarize } from "@/lib/retrieval/evaluation";
import { handleSearchRequest } from "@/lib/retrieval/server";
import type { RetrievalResponse, RetrievedEvidence } from "@/lib/retrieval/types";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

const catalog = chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks;

function responseWith(ids: string[]): RetrievalResponse {
  const results: RetrievedEvidence[] = ids.map((id, index) => ({
    chunk: catalog.find((chunk) => chunk.investigationId === id) ?? catalog[0],
    rank: index + 1,
    scores: { vector: null, lexical: 1, metadata: null, fused: 1 },
    matchedTerms: [],
    matchedMetadata: [],
    neighbors: [],
  }));
  return {
    status: "ok",
    mode: "lexical_only",
    results,
    boundary: null,
    listing: null,
    notice: null,
    understanding: {
      terms: [],
      investigations: [],
      safetyCategories: [],
      gravity: [],
      materials: [],
      fuels: [],
      hardware: [],
      sectionIntent: [],
      conditionFields: [],
      enumerative: false,
    },
  };
}

describe("evaluation metrics", () => {
  it("computes the chance of a random hit exactly", () => {
    expect(chanceHitAtK(10, 1, 1)).toBeCloseTo(0.1);
    expect(chanceHitAtK(10, 2, 3)).toBeCloseTo(1 - (8 / 10) * (7 / 9) * (6 / 8));
    expect(chanceHitAtK(5, 1, 5)).toBe(1);
    expect(chanceHitAtK(5, 0, 3)).toBe(0);
  });

  it("scores hits, reciprocal rank and list recall", () => {
    const outcome = scoreCase(
      {
        id: "t",
        split: "dev",
        category: "x",
        kind: "enumerative",
        query: "q",
        expected: ["synth-beta", "synth-gamma"],
      },
      responseWith(["synth-alpha", "synth-beta"]),
      catalog,
    );
    expect(outcome.hit).toEqual({ 1: false, 3: true, 5: true });
    expect(outcome.reciprocalRank).toBe(0.5);
    expect(outcome.recall).toBe(0.5);
    expect(outcome.unexpected).toEqual(["synth-alpha"]);
    expect(outcome.chance[1]).toBeGreaterThan(0);
  });

  it("does not score cases without labels or with records that are not verified", () => {
    const unlabeled = scoreCase(
      { id: "a", split: "dev", category: "x", kind: "specific", query: "q", expected: [] },
      responseWith([]),
      catalog,
    );
    expect(unlabeled.scorable).toBe(false);
    const missing = scoreCase(
      { id: "b", split: "dev", category: "x", kind: "specific", query: "q", expected: ["synth-draft"] },
      responseWith([]),
      catalog,
    );
    expect(missing.skipReason).toMatch(/synth-draft/);
  });

  it("passes a negative case only on the evidence-insufficient answer with no evidence", () => {
    const negative = {
      id: "n",
      split: "dev" as const,
      category: "neg",
      kind: "negative" as const,
      query: "q",
      expected: [],
    };
    const insufficient = {
      ...responseWith([]),
      boundary: { kind: "INSUFFICIENT_EVIDENCE" as const, message: "", details: [] },
    };
    expect(scoreCase(negative, insufficient, catalog).negativePass).toBe(true);
    expect(scoreCase(negative, responseWith(["synth-alpha"]), catalog).negativePass).toBe(false);
  });

  it("summarises and renders a report", () => {
    const outcome = scoreCase(
      { id: "t", split: "dev", category: "x", kind: "specific", query: "q", expected: ["synth-alpha"] },
      responseWith(["synth-alpha"]),
      catalog,
    );
    const summary = summarize("all", [outcome]);
    expect(summary.hit[1]).toBe(1);
    expect(renderReport({ summaries: [summary], outcomes: [outcome], meta: { Date: "x" } })).toContain(
      "| all | 1 | 100%",
    );
  });

  it("accepts the committed evaluation set", () => {
    const json = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "tests/retrieval/eval-set.json"), "utf8"),
    );
    const cases = parseEvalSet(json);
    expect(cases.length).toBeGreaterThanOrEqual(20);
    expect(cases.some((item) => item.kind === "negative")).toBe(true);
    expect(cases.some((item) => item.split === "holdout")).toBe(true);
  });
});

describe("POST /api/evidence/search handler", () => {
  const post = (body: unknown) =>
    handleSearchRequest(
      new Request("http://localhost/api/evidence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": `test-${Math.random()}` },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );

  it("rejects malformed requests with a readable error", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ text: "" })).status).toBe(400);
    expect((await post({ text: "x", filters: { safetyCategories: ["arson"] } })).status).toBe(400);
  });

  it("answers from the local corpus when Supabase is not configured", async () => {
    const saved = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      const response = await post({ text: "smoke detection" });
      expect(response.status).toBe(200);
      const body = (await response.json()) as RetrievalResponse;
      expect(body.status).toBe("ok");
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    } finally {
      if (saved !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = saved;
    }
  });
});
