import { describe, expect, it } from "vitest";

import type { Embedder } from "@/lib/embeddings";
import { EMBEDDING_DIMENSIONS } from "@/lib/retrieval/types";
import { chunkDocuments } from "@/lib/retrieval/chunker";
import { RETRIEVAL } from "@/lib/retrieval/config";
import { buildCorpusChunks, defaultKnowledgeRoot } from "@/lib/retrieval/corpus";
import { createHybridRetriever } from "@/lib/retrieval/hybrid";
import { createMemoryStore } from "@/lib/retrieval/memory-store";
import { analyzeQuery, buildVocabulary, hardwareAliases } from "@/lib/retrieval/query-analysis";
import { words } from "@/lib/retrieval/text";
import type { RetrievalResponse } from "@/lib/retrieval/types";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

/**
 * Regressions found by the first evaluation baseline (2026-11-14). Each test
 * names the evaluation question that exposed the bug.
 */

function ok(response: RetrievalResponse) {
  if (response.status !== "ok") throw new Error(`expected ok, got ${JSON.stringify(response)}`);
  return response;
}

describe("query understanding", () => {
  it("splits closed compounds so 'airflow' and 'air flow' match (q17)", () => {
    expect(words("Airflow stopped")).toEqual(expect.arrayContaining(["airflow", "air", "flow"]));
    expect(words("coflow duct")).toEqual(expect.arrayContaining(["coflow", "co", "flow"]));
  });

  it("matches hardware by name without its acronym, or by the acronym alone (q10)", () => {
    expect(hardwareAliases("Microgravity Science Glovebox (MSG)")).toEqual([
      "Microgravity Science Glovebox (MSG)",
      "Microgravity Science Glovebox",
      "MSG",
    ]);
    const vocabulary = buildVocabulary(chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks);
    vocabulary.hardware.push("Microgravity Science Glovebox (MSG)");
    for (const question of [
      "Which investigations ran in the Microgravity Science Glovebox?",
      "Which experiments used the MSG?",
    ]) {
      const understanding = analyzeQuery(question, vocabulary);
      expect(understanding.hardware, question).toEqual(["Microgravity Science Glovebox (MSG)"]);
      // "Microgravity" inside the hardware name is not a gravity condition.
      expect(understanding.gravity, question).toEqual([]);
    }
  });

  it("reads 'how was X studied/tested' as a question about method (q06, q09)", () => {
    const vocabulary = buildVocabulary([]);
    for (const question of [
      "How was smoke detection studied?",
      "How were suppressants tested on burning fuel?",
    ]) {
      expect(analyzeQuery(question, vocabulary).sectionIntent, question).toEqual(
        expect.arrayContaining(["OBJECTIVE", "CONDITIONS", "MEASUREMENT"]),
      );
    }
    expect(analyzeQuery("What did FLEX find?", vocabulary).sectionIntent).not.toContain("OBJECTIVE");
  });
});

describe("support: one rare word in common is not an answer (n03)", () => {
  const chunks = chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks;
  const unit = (cosine: number) => {
    const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
    vector[0] = cosine;
    vector[1] = Math.sqrt(1 - cosine * cosine);
    return vector;
  };
  const passage = unit(1);

  /** Every passage sits at the same, chosen cosine from the query. */
  function retrieverAt(cosine: number) {
    const embedder: Embedder = {
      version: "test-fixed-cosine",
      dimensions: EMBEDDING_DIMENSIONS,
      async embed(texts, kind) {
        return texts.map(() => (kind === "query" ? unit(cosine) : passage));
      },
    };
    const store = createMemoryStore(chunks, {
      vectors: new Map(chunks.map((chunk) => [chunk.id, passage])),
      embeddingVersion: embedder.version,
    });
    return createHybridRetriever({ store, embedder });
  }

  // Four distinctive terms; only "crawled" occurs in the corpus (synth-alpha's finding).
  const question = "crawled zebra quokka marmot";

  it("needs a share of the distinctive terms, or closeness in meaning", async () => {
    expect(RETRIEVAL.vectorWithKeywordFloor).toBeLessThan(RETRIEVAL.vectorSupportFloor);
    const close = ok(await retrieverAt(0.65).search({ text: question }));
    expect(close.results.map((result) => result.chunk.investigationId)).toContain("synth-alpha");

    const far = ok(await retrieverAt(0.45).search({ text: question }));
    expect(far.results).toEqual([]);
    expect(far.boundary?.kind).toBe("INSUFFICIENT_EVIDENCE");
  });
});

describe("the verified knowledge base (lexical search)", () => {
  const corpus = buildCorpusChunks(defaultKnowledgeRoot());
  const retriever = createHybridRetriever({ store: createMemoryStore(corpus.chunks), embedder: null });
  const msg = corpus.load.documents
    .filter((document) => document.trusted && document.metadata.hardware.some((h) => h.includes("(MSG)")))
    .map((document) => document.recordId)
    .sort();

  it("answers an off-topic question with insufficient evidence (n03)", async () => {
    const response = ok(await retriever.search({ text: "Which football team won the cup last year?" }));
    expect(response.results).toEqual([]);
    expect(response.boundary?.kind).toBe("INSUFFICIENT_EVIDENCE");
  });

  it.runIf(msg.length > 0)("lists exactly the investigations that used the MSG (q10)", async () => {
    const response = ok(
      await retriever.search({ text: "Which investigations ran in the Microgravity Science Glovebox?" }),
    );
    expect(response.listing?.facet).toBe("hardware");
    expect([...(response.listing?.investigationIds ?? [])].sort()).toEqual(msg);
  });
});
