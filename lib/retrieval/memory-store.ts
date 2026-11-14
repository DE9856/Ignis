import { cosine } from "@/lib/embeddings";

import type { CandidateRequest, CandidateScore, EvidenceStore } from "./store";
import { termCounts } from "./text";
import type { EvidenceChunk } from "./types";

/**
 * In-memory store: BM25 over chunk text and names, and cosine over vectors
 * when they are supplied. Used by tests (with the fake embedder), by the
 * evaluation runner on a laptop, and by the server when Supabase is not
 * configured.
 *
 * Fields are weighted like the proposed Postgres index: investigation names
 * count three times, the section label one and a half times, the content once.
 */

const FIELD_WEIGHTS = { names: 3, section: 1.5, content: 1 };
const K1 = 1.2;
const B = 0.75;

interface IndexedChunk {
  chunk: EvidenceChunk;
  counts: Map<string, number>;
  length: number;
}

function weightedCounts(chunk: EvidenceChunk): Map<string, number> {
  const out = new Map<string, number>();
  const add = (text: string, weight: number) => {
    for (const [term, count] of termCounts(text)) out.set(term, (out.get(term) ?? 0) + count * weight);
  };
  add(
    [chunk.investigation, chunk.title, ...chunk.metadata.searchNames, ...chunk.tags].join(" "),
    FIELD_WEIGHTS.names,
  );
  add(chunk.section, FIELD_WEIGHTS.section);
  add(chunk.content, FIELD_WEIGHTS.content);
  return out;
}

export function createMemoryStore(
  chunks: EvidenceChunk[],
  options: { vectors?: Map<string, number[]>; embeddingVersion?: string | null } = {},
): EvidenceStore {
  const indexed: IndexedChunk[] = chunks.map((chunk) => {
    const counts = weightedCounts(chunk);
    let length = 0;
    for (const value of counts.values()) length += value;
    return { chunk, counts, length };
  });
  const averageLength = indexed.reduce((sum, item) => sum + item.length, 0) / Math.max(indexed.length, 1);
  const documentFrequency = new Map<string, number>();
  for (const item of indexed) {
    for (const term of item.counts.keys())
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }

  function bm25(item: IndexedChunk, queryTerms: string[]): number {
    let score = 0;
    for (const term of queryTerms) {
      const frequency = item.counts.get(term);
      if (!frequency) continue;
      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (indexed.length - df + 0.5) / (df + 0.5));
      score += (idf * frequency * (K1 + 1)) / (frequency + K1 * (1 - B + (B * item.length) / averageLength));
    }
    return score;
  }

  return {
    kind: "local",
    async loadCatalog() {
      return chunks;
    },
    async scoreCandidates(request: CandidateRequest): Promise<CandidateScore[]> {
      const scores = new Map<string, CandidateScore>();
      const lexical = indexed
        .map((item) => ({ id: item.chunk.id, score: bm25(item, request.terms) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, request.limit);
      for (const item of lexical)
        scores.set(item.id, { chunkId: item.id, vector: null, lexical: item.score });

      if (request.embedding && options.vectors) {
        const vector = indexed
          .flatMap((item) => {
            const stored = options.vectors?.get(item.chunk.id);
            return stored
              ? [{ id: item.chunk.id, score: cosine(request.embedding as number[], stored) }]
              : [];
          })
          .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
          .slice(0, request.limit);
        for (const item of vector) {
          const existing = scores.get(item.id);
          scores.set(item.id, { chunkId: item.id, vector: item.score, lexical: existing?.lexical ?? null });
        }
      }
      return [...scores.values()];
    },
    async indexedEmbeddingVersion() {
      return options.vectors && options.vectors.size > 0 ? (options.embeddingVersion ?? null) : null;
    },
  };
}
