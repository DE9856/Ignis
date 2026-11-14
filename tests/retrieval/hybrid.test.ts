import { describe, expect, it } from "vitest";

import type { Embedder } from "@/lib/embeddings";
import { createFakeEmbedder, FAKE_EMBEDDING_VERSION } from "@/lib/embeddings/fake";
import { chunkDocuments, embeddingText } from "@/lib/retrieval/chunker";
import { createHybridRetriever } from "@/lib/retrieval/hybrid";
import { createMemoryStore } from "@/lib/retrieval/memory-store";
import { RETRIEVAL_NOTICES } from "@/lib/retrieval/messages";
import type { EvidenceChunk, RetrievalResponse } from "@/lib/retrieval/types";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

const chunks = chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks;
const fake = createFakeEmbedder();

async function vectorsFor(items: EvidenceChunk[]): Promise<Map<string, number[]>> {
  const vectors = await fake.embed(items.map(embeddingText), "passage");
  return new Map(items.map((chunk, index) => [chunk.id, vectors[index]]));
}

async function hybrid(options: { embedder?: Embedder | null; version?: string } = {}) {
  const store = createMemoryStore(chunks, {
    vectors: await vectorsFor(chunks),
    embeddingVersion: options.version ?? FAKE_EMBEDDING_VERSION,
  });
  return createHybridRetriever({ store, embedder: options.embedder === undefined ? fake : options.embedder });
}

function ok(response: RetrievalResponse) {
  if (response.status !== "ok") throw new Error(`expected ok, got ${JSON.stringify(response)}`);
  return response;
}

describe("hybrid retrieval", () => {
  it("never returns a draft record", async () => {
    const retriever = await hybrid();
    const response = ok(await retriever.search({ text: "smoke smoke detectors draft record" }));
    expect(response.results.map((result) => result.chunk.investigationId)).not.toContain("synth-draft");
    expect(chunks.some((chunk) => chunk.investigationId === "synth-draft")).toBe(false);
  });

  it("puts the named investigation first and explains why", async () => {
    const response = ok(
      await (await hybrid()).search({ text: "What did ALPHA-1 find about the flame front?" }),
    );
    expect(response.mode).toBe("hybrid");
    const top = response.results[0];
    expect(top.chunk.investigationId).toBe("synth-alpha");
    expect(top.chunk.chunkType).toBe("FINDING");
    expect(top.matchedMetadata.map((match) => match.facet)).toEqual(
      expect.arrayContaining(["investigation", "section"]),
    );
    expect(top.matchedTerms).toEqual(expect.arrayContaining(["flame", "front"]));
    expect(top.scores.vector).not.toBeNull();
    expect(top.scores.fused).toBeGreaterThan(0);
  });

  it("answers list questions from metadata, one chunk per matching investigation", async () => {
    const response = ok(
      await (await hybrid()).search({ text: "Which investigations studied fire suppression?" }),
    );
    expect(response.listing).toMatchObject({
      facet: "safety",
      value: "suppression",
      investigationIds: ["synth-gamma"],
    });
    expect(response.results.map((result) => result.chunk.investigationId)).toEqual(["synth-gamma"]);
  });

  it("returns the evidence-insufficient answer, with no evidence, for an off-topic question", async () => {
    const response = ok(await (await hybrid()).search({ text: "What is the capital of France?" }));
    expect(response.results).toEqual([]);
    expect(response.boundary?.kind).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("refuses a probability but still shows the closest evidence for context", async () => {
    const response = ok(
      await (await hybrid()).search({ text: "What is the probability that testcloth catches fire?" }),
    );
    expect(response.boundary?.kind).toBe("PROBABILITY_REQUEST");
    expect(response.results[0]?.chunk.investigationId).toBe("synth-alpha");
  });

  it("applies explicit filters as exclusions", async () => {
    const text = "flame front and smoke particles";
    const unfiltered = ok(await (await hybrid()).search({ text }));
    expect(unfiltered.results.map((result) => result.chunk.investigationId)).toEqual(
      expect.arrayContaining(["synth-alpha", "synth-beta"]),
    );
    const response = ok(
      await (await hybrid()).search({ text, filters: { safetyCategories: ["detection"] } }),
    );
    expect(response.results.length).toBeGreaterThan(0);
    for (const result of response.results) expect(result.chunk.safetyCategories).toContain("detection");
  });

  it("caps chunks per investigation and team interpretation unless asked for", async () => {
    const response = ok(await (await hybrid()).search({ text: "synthetic fixture" }));
    const counts = new Map<string, number>();
    for (const result of response.results) {
      const id = result.chunk.investigationId as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const count of counts.values()) expect(count).toBeLessThanOrEqual(2);
    expect(
      response.results.filter((result) => result.chunk.chunkType === "INTERPRETATION").length,
    ).toBeLessThanOrEqual(1);
  });

  it("falls back to keywords when the query cannot be embedded, and says so", async () => {
    const broken: Embedder = { ...fake, embed: async () => Promise.reject(new Error("model unavailable")) };
    const response = ok(await (await hybrid({ embedder: broken })).search({ text: "smoke particles" }));
    expect(response.mode).toBe("lexical_only");
    expect(response.notice).toContain(RETRIEVAL_NOTICES.lexicalOnly);
    expect(response.results[0]?.chunk.investigationId).toBe("synth-beta");
  });

  it("refuses to compare vectors from a different embedding version", async () => {
    const response = ok(
      await (await hybrid({ version: "some-other-model" })).search({ text: "smoke particles" }),
    );
    expect(response.mode).toBe("lexical_only");
    expect(response.notice).toContain(RETRIEVAL_NOTICES.staleIndex);
  });

  it("works with keywords and metadata alone when no embedder is configured", async () => {
    const retriever = createHybridRetriever({ store: createMemoryStore(chunks), embedder: null });
    const response = ok(await retriever.search({ text: "mist extinguished droplet flames" }));
    expect(response.mode).toBe("lexical_only");
    expect(response.results[0]?.chunk.investigationId).toBe("synth-gamma");
    expect(response.results[0]?.scores.vector).toBeNull();
  });

  it("is deterministic", async () => {
    const retriever = await hybrid();
    const first = ok(await retriever.search({ text: "flame spread in a draft" }));
    const second = ok(await retriever.search({ text: "flame spread in a draft" }));
    expect(second.results.map((result) => result.chunk.id)).toEqual(
      first.results.map((result) => result.chunk.id),
    );
  });

  it("says the index is empty rather than failing", async () => {
    const retriever = createHybridRetriever({ store: createMemoryStore([]), embedder: null });
    const response = ok(await retriever.search({ text: "anything" }));
    expect(response.results).toEqual([]);
    expect(response.notice).toContain(RETRIEVAL_NOTICES.emptyIndex);
    expect(response.boundary?.kind).toBe("INSUFFICIENT_EVIDENCE");

    const probability = ok(await retriever.search({ text: "What is the probability of a fire?" }));
    expect(probability.boundary?.kind).toBe("PROBABILITY_REQUEST");
  });

  it("returns neighbouring pieces of a split section", async () => {
    const bullets = Array.from(
      { length: 40 },
      (_, index) => `- SYNTHETIC finding ${index + 1} about crawling glow on testcloth.`,
    );
    const split = chunkDocuments([
      syntheticDocument({
        id: "synth-split",
        title: "Synthetic Split",
        body: `# Key Findings\n\n${bullets.join("\n")}`,
      }),
    ]).chunks;
    const retriever = createHybridRetriever({ store: createMemoryStore(split), embedder: null });
    const response = ok(await retriever.search({ text: "finding 1 about crawling glow", limit: 1 }));
    expect(split.length).toBeGreaterThan(1);
    expect(response.results[0].neighbors.length).toBeGreaterThan(0);
    for (const neighbor of response.results[0].neighbors) expect(neighbor.section).toBe("Key Findings");
  });
});
