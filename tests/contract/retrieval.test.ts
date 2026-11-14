import { afterEach, describe, expect, it, vi } from "vitest";

import { LocalMockRetriever } from "@/lib/dev/mock-retriever";
import { toEvidenceDisplayModel, rowToEvidenceChunk } from "@/lib/integration/evidence";
import { EMPTY_UNDERSTANDING, retrieveEvidence } from "@/lib/integration/retrieval";
import { getRetriever, RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";
import type { EvidenceChunk, RetrievalResponse, RetrievedEvidence } from "@/lib/retrieval/types";

import {
  TEST_CHUNK_ALPHA_INTERPRETATION,
  TEST_CHUNK_ALPHA_OBJECTIVE,
  TEST_CHUNK_BETA_UNVERIFIED,
} from "../fixtures";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock("@/lib/retrieval/server");
  vi.resetModules();
});

/**
 * CONTRACT: retrieval -> evidence UI.
 *
 * Checks the interface, not retrieval quality (that is `scripts/evaluate.ts`).
 * Whatever sits behind getRetriever(), these shapes must hold for the
 * Evidence Desk to keep working.
 */
const CHUNK_KEYS: (keyof EvidenceChunk)[] = [
  "chunkIndex",
  "chunkType",
  "conceptId",
  "content",
  "embeddingVersion",
  "fuelType",
  "gravityCondition",
  "id",
  "investigation",
  "investigationId",
  "material",
  "metadata",
  "nextChunkId",
  "previousChunkId",
  "safetyCategories",
  "section",
  "sourceClass",
  "sourceUrl",
  "tags",
  "title",
  "verificationStatus",
];

const RESULT_KEYS: (keyof RetrievedEvidence)[] = [
  "chunk",
  "matchedMetadata",
  "matchedTerms",
  "neighbors",
  "rank",
  "scores",
];

function expectRetrievedShape(result: RetrievedEvidence) {
  expect(Object.keys(result).sort()).toEqual(RESULT_KEYS);
  expect(Object.keys(result.chunk).sort()).toEqual(CHUNK_KEYS);
  expect(typeof result.scores.fused).toBe("number");
  expect(result.rank).toBeGreaterThanOrEqual(1);
  expect(result.chunk).not.toHaveProperty("embedding");
}

function retrieved(chunk: EvidenceChunk, rank: number): RetrievedEvidence {
  return {
    chunk,
    rank,
    scores: { vector: null, lexical: 0.5, metadata: null, fused: 0.5 },
    matchedTerms: [],
    matchedMetadata: [],
    neighbors: [],
  };
}

/** Replace the server retriever with a fixed answer. Returns a fresh retrieveEvidence. */
async function withServerRetriever(response: RetrievalResponse) {
  vi.resetModules();
  vi.doMock("@/lib/retrieval/server", () => ({
    getServerRetriever: () => ({ search: async () => response }),
  }));
  return (await import("@/lib/integration/retrieval")).retrieveEvidence;
}

describe("contract: getRetriever()", () => {
  it("resolves to ok-with-results or unavailable-with-reason, and never rejects", async () => {
    const response = await getRetriever().search({ text: "synthetic query" });
    if (response.status === "ok") {
      expect(Array.isArray(response.results)).toBe(true);
      response.results.forEach(expectRetrievedShape);
    } else {
      expect(response.status).toBe("unavailable");
      expect(response.reason.length).toBeGreaterThan(0);
    }
  });
});

describe("contract: retrieveEvidence()", () => {
  it("is wired to the real retriever", () => {
    expect(RETRIEVAL_IMPLEMENTED).toBe(true);
  });

  it("returns a complete empty answer for a blank query without calling a retriever", async () => {
    expect(await retrieveEvidence({ text: "   " })).toEqual({
      status: "ok",
      mode: "lexical_only",
      results: [],
      boundary: null,
      listing: null,
      understanding: EMPTY_UNDERSTANDING,
      notice: null,
      origin: "none",
    });
  });

  it("searches the verified local records on the server when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "");
    const response = await retrieveEvidence({ text: "BASS flame spread" });
    expect(response.origin).toBe("live");
    if (response.status !== "ok") throw new Error(`expected ok, got: ${response.reason}`);
    expect(response.mode).toBe("lexical_only");
    expect(response.results.length).toBeGreaterThan(0);
    response.results.forEach(expectRetrievedShape);
    expect(response.results.every((result) => result.chunk.verificationStatus === "verified")).toBe(true);
  });

  it("drops unverified chunks unless asked, and re-numbers ranks", async () => {
    const search = await withServerRetriever({
      status: "ok",
      mode: "hybrid",
      results: [retrieved(TEST_CHUNK_BETA_UNVERIFIED, 1), retrieved(TEST_CHUNK_ALPHA_OBJECTIVE, 2)],
      boundary: null,
      listing: null,
      understanding: EMPTY_UNDERSTANDING,
      notice: null,
    });
    const trusted = await search({ text: "synthetic" });
    const all = await search({ text: "synthetic" }, { includeUnverified: true });
    if (trusted.status !== "ok" || all.status !== "ok") throw new Error("stub should answer");

    expect(trusted.results.map((result) => [result.chunk.id, result.rank])).toEqual([
      [TEST_CHUNK_ALPHA_OBJECTIVE.id, 1],
    ]);
    expect(trusted.mode).toBe("hybrid");
    expect(all.results.some((result) => result.chunk.verificationStatus === "unverified")).toBe(true);
  });

  it("turns a retriever failure into an unavailable answer instead of throwing", async () => {
    vi.resetModules();
    vi.doMock("@/lib/retrieval/server", () => ({
      getServerRetriever: () => ({
        search: async () => {
          throw new Error("boom");
        },
      }),
    }));
    const { retrieveEvidence: search } = await import("@/lib/integration/retrieval");
    expect(await search({ text: "anything" })).toMatchObject({ status: "unavailable", origin: "none" });
  });
});

describe("contract: LocalMockRetriever", () => {
  it("answers in the full response shape with synthetic TEST data only", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const response = await new LocalMockRetriever().search({ text: "synthetic objective TEST_FUEL_A" });
    if (response.status !== "ok") throw new Error("mock should answer");
    expect(response.results.length).toBeGreaterThan(0);
    response.results.forEach(expectRetrievedShape);
    expect(response.results.every((result) => result.chunk.title.startsWith("TEST_"))).toBe(true);
    expect(response.notice).toMatch(/synthetic/i);
  });

  it("refuses to run in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(new LocalMockRetriever().search({ text: "synthetic" })).rejects.toThrow();
  });
});

describe("contract: EvidenceChunk -> evidence display model", () => {
  it("shows reviewed NASA text as canonical with a safe link", () => {
    const model = toEvidenceDisplayModel(TEST_CHUNK_ALPHA_OBJECTIVE);
    expect(model).toMatchObject({
      id: TEST_CHUNK_ALPHA_OBJECTIVE.id,
      investigation: "TEST_INVESTIGATION_ALPHA",
      provenance: "NASA_SOURCE",
      isCanonical: true,
      isInterpretation: false,
      humanReviewed: true,
      sourceUrl: "https://test.invalid/alpha",
      scores: null,
    });
  });

  it("keeps team interpretation distinct and never canonical", () => {
    expect(toEvidenceDisplayModel(TEST_CHUNK_ALPHA_INTERPRETATION)).toMatchObject({
      provenance: "TEAM_INTERPRETATION",
      isCanonical: false,
      isInterpretation: true,
    });
  });

  it("downgrades unreviewed chunks and drops unsafe links", () => {
    expect(toEvidenceDisplayModel(TEST_CHUNK_BETA_UNVERIFIED)).toMatchObject({
      provenance: "UNVERIFIED",
      isCanonical: false,
    });
    const unsafe = toEvidenceDisplayModel({
      ...TEST_CHUNK_ALPHA_OBJECTIVE,
      sourceUrl: "javascript:alert(1)",
    });
    expect(unsafe.sourceUrl).toBeNull();
  });

  it("carries score components for the why-retrieved view and trims long text", () => {
    const model = toEvidenceDisplayModel(
      {
        ...retrieved({ ...TEST_CHUNK_ALPHA_OBJECTIVE, content: "word ".repeat(200) }, 1),
        scores: { vector: 0.8, lexical: 0.5, metadata: 1, fused: 0.77 },
      },
      100,
    );
    expect(model.scores).toEqual({ lexical: 0.5, vector: 0.8, metadata: 1, combined: 0.77 });
    expect(model.excerpt.length).toBeLessThanOrEqual(102);
  });
});

describe("contract: database row -> EvidenceChunk", () => {
  it("maps columns, drops the embedding and degrades unknown values safely", () => {
    const chunk = rowToEvidenceChunk({
      chunk_id: "test-investigation-alpha.conditions.01",
      concept_id: "investigations/test-investigation-alpha",
      investigation: "TEST_INVESTIGATION_ALPHA",
      investigation_id: "test-investigation-alpha",
      title: "TEST_INVESTIGATION_ALPHA",
      section: "Experimental Conditions",
      chunk_type: "CONDITIONS",
      chunk_index: 1,
      content: "Synthetic conditions text.",
      search_names: "TEST_INVESTIGATION_ALPHA",
      source_class: "SOMETHING_NEW",
      source_url: "https://test.invalid/alpha",
      safety_category: ["prevention", "not-a-category"],
      fuel_type: "TEST_FUEL_A",
      material: null,
      gravity_condition: "microgravity",
      tags: ["synthetic"],
      human_verified: true,
      previous_chunk_id: null,
      next_chunk_id: null,
      embedding_version: "test-embedding/test-chunker",
      content_hash: "test-hash",
      metadata: {},
    });
    expect(Object.keys(chunk).sort()).toEqual(CHUNK_KEYS);
    expect(chunk).toMatchObject({
      id: "test-investigation-alpha.conditions.01",
      investigationId: "test-investigation-alpha",
      chunkType: "CONDITIONS",
      chunkIndex: 1,
      safetyCategories: ["prevention"],
      sourceClass: "UNVERIFIED",
      verificationStatus: "verified",
    });
    expect(chunk.metadata.oxygenMin).toBeNull();
  });
});
