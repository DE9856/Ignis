import { afterEach, describe, expect, it, vi } from "vitest";

import { rowToEvidenceChunk } from "@/lib/integration/evidence";
import { retrieveEvidence } from "@/lib/integration/retrieval";
import type { RetrievalResponse } from "@/lib/retrieval/types";

import { TEST_CHUNK_ALPHA_OBJECTIVE } from "../fixtures";

/**
 * CONTRACT: optional retrieval fields (handoff H14).
 *
 * A retriever may add a bounded answer, a list answer and why-retrieved
 * details. They are optional, and they must reach the interface through
 * retrieveEvidence() unchanged.
 */

const RESPONSE: RetrievalResponse = {
  status: "ok",
  mode: "lexical_only",
  results: [
    {
      chunk: TEST_CHUNK_ALPHA_OBJECTIVE,
      lexicalScore: 1,
      vectorScore: null,
      combinedScore: 0.6,
      rank: 1,
      metadataScore: 0.5,
      matchedTerms: ["synthetic"],
      matchedMetadata: [{ facet: "safety", value: "prevention", because: "Synthetic reason." }],
      neighbors: [],
    },
  ],
  boundary: { kind: "PROBABILITY_REQUEST", message: "Synthetic boundary message.", details: [] },
  listing: null,
  notice: "Synthetic notice.",
};

vi.mock("@/lib/retrieval", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/retrieval")>();
  return { ...actual, getRetriever: () => ({ search: async () => RESPONSE }) };
});

afterEach(() => vi.unstubAllEnvs());

describe("contract: optional retrieval fields", () => {
  it("pass through retrieveEvidence() with the trust filter still applied", async () => {
    vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "");
    const response = await retrieveEvidence({ text: "synthetic query" });
    expect(response).toMatchObject({
      status: "ok",
      mode: "lexical_only",
      boundary: { kind: "PROBABILITY_REQUEST" },
      notice: "Synthetic notice.",
    });
    if (response.status !== "ok") throw new Error("expected ok");
    expect(response.results[0]).toMatchObject({ rank: 1, metadataScore: 0.5, matchedTerms: ["synthetic"] });
  });

  it("maps the VARIABLES section to its own chunk type", () => {
    const chunk = rowToEvidenceChunk({
      chunk_id: "test-investigation-alpha.variables.01",
      concept_id: "investigations/test-investigation-alpha",
      investigation: "TEST_INVESTIGATION_ALPHA",
      title: "TEST_INVESTIGATION_ALPHA",
      section: "Variables",
      chunk_type: "VARIABLES",
      content: "Synthetic variables text.",
      source_class: "NASA_SOURCE",
      source_url: null,
      safety_category: [],
      fuel_type: null,
      material: null,
      gravity_condition: null,
      tags: [],
      human_verified: true,
      previous_chunk_id: null,
      next_chunk_id: null,
      embedding_version: "test-embedding/test-chunker",
    });
    expect(chunk.chunkType).toBe("variables");
  });
});
