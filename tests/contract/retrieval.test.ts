import { afterEach, describe, expect, it, vi } from "vitest";

import { toEvidenceDisplayModel, rowToEvidenceChunk } from "@/lib/integration/evidence";
import { retrieveEvidence } from "@/lib/integration/retrieval";
import { getRetriever, RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";
import type { EvidenceChunk, RetrievedEvidence } from "@/lib/retrieval/types";

import {
  TEST_CHUNK_ALPHA_INTERPRETATION,
  TEST_CHUNK_ALPHA_OBJECTIVE,
  TEST_CHUNK_BETA_UNVERIFIED,
} from "../fixtures";

afterEach(() => vi.unstubAllEnvs());

/**
 * CONTRACT: retrieval -> evidence UI.
 *
 * Checks the interface, not retrieval quality. Whatever Member 5 puts behind
 * getRetriever(), these shapes must hold for the Evidence Desk to keep working.
 */
const CHUNK_KEYS: (keyof EvidenceChunk)[] = [
  "chunkType",
  "conceptId",
  "content",
  "embeddingVersion",
  "fuelType",
  "gravityCondition",
  "id",
  "investigationId",
  "material",
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

function expectRetrievedShape(result: RetrievedEvidence) {
  expect(Object.keys(result).sort()).toEqual(["chunk", "combinedScore", "lexicalScore", "vectorScore"]);
  expect(Object.keys(result.chunk).sort()).toEqual(CHUNK_KEYS);
  expect(typeof result.combinedScore).toBe("number");
  expect(result.chunk).not.toHaveProperty("embedding");
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
  it("always returns a status and an origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "");
    const response = await retrieveEvidence({ text: "synthetic query" });
    expect(["ok", "unavailable"]).toContain(response.status);
    expect(["live", "dev-mock", "none"]).toContain(response.origin);
    if (!RETRIEVAL_IMPLEMENTED) expect(response).toMatchObject({ status: "unavailable", origin: "none" });
  });

  it("returns no results for a blank query without calling a retriever", async () => {
    expect(await retrieveEvidence({ text: "   " })).toEqual({ status: "ok", results: [], origin: "none" });
  });

  it.runIf(!RETRIEVAL_IMPLEMENTED)(
    "uses the synthetic mock only on explicit opt-in, and labels it",
    async () => {
      vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "1");
      const response = await retrieveEvidence({ text: "synthetic objective TEST_FUEL_A" });
      expect(response.origin).toBe("dev-mock");
      if (response.status !== "ok") throw new Error("mock should answer");
      expect(response.results.length).toBeGreaterThan(0);
      response.results.forEach(expectRetrievedShape);
      expect(response.results.every((result) => result.chunk.title.startsWith("TEST_"))).toBe(true);
    },
  );

  it.runIf(!RETRIEVAL_IMPLEMENTED)(
    "drops unverified chunks unless asked, and never serves the mock in production",
    async () => {
      vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "1");
      const query = { text: "synthetic unverified objective extinguishing" };
      const trusted = await retrieveEvidence(query);
      const all = await retrieveEvidence(query, { includeUnverified: true });
      if (trusted.status !== "ok" || all.status !== "ok") throw new Error("mock should answer");
      expect(trusted.results.every((result) => result.chunk.verificationStatus === "verified")).toBe(true);
      expect(all.results.some((result) => result.chunk.verificationStatus === "unverified")).toBe(true);

      vi.stubEnv("NODE_ENV", "production");
      expect((await retrieveEvidence(query)).origin).not.toBe("dev-mock");
    },
  );
});

describe("contract: EvidenceChunk -> evidence display model", () => {
  it("shows reviewed NASA text as canonical with a safe link", () => {
    const model = toEvidenceDisplayModel(TEST_CHUNK_ALPHA_OBJECTIVE);
    expect(model).toMatchObject({
      id: TEST_CHUNK_ALPHA_OBJECTIVE.id,
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
        chunk: { ...TEST_CHUNK_ALPHA_OBJECTIVE, content: "word ".repeat(200) },
        lexicalScore: 0.5,
        vectorScore: null,
        combinedScore: 0.5,
      },
      100,
    );
    expect(model.scores).toEqual({ lexical: 0.5, vector: null, combined: 0.5 });
    expect(model.excerpt.length).toBeLessThanOrEqual(102);
  });
});

describe("contract: database row -> EvidenceChunk", () => {
  it("maps columns, drops the embedding and degrades unknown values safely", () => {
    const chunk = rowToEvidenceChunk({
      chunk_id: "test-investigation-alpha.conditions.01",
      concept_id: "investigations/test-investigation-alpha",
      investigation: "TEST_INVESTIGATION_ALPHA",
      title: "TEST_INVESTIGATION_ALPHA",
      section: "Experimental Conditions",
      chunk_type: "CONDITIONS",
      content: "Synthetic conditions text.",
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
    });
    expect(Object.keys(chunk).sort()).toEqual(CHUNK_KEYS);
    expect(chunk).toMatchObject({
      id: "test-investigation-alpha.conditions.01",
      investigationId: "test-investigation-alpha",
      chunkType: "conditions",
      safetyCategories: ["prevention"],
      sourceClass: "UNVERIFIED",
      verificationStatus: "verified",
    });
  });
});
