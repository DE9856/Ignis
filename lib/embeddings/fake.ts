import { EMBEDDING_DIMENSIONS } from "@/lib/retrieval/types";
import { stem, words } from "@/lib/retrieval/text";

import type { Embedder } from "./index";

/**
 * A deterministic stand-in for the real model, for tests and dry runs only.
 *
 * It hashes stemmed words into 384 buckets, so texts that share words get
 * similar vectors. It has no understanding of meaning and must never be used
 * to build the production index: its version string says so, and search
 * refuses to mix it with real vectors.
 */
export const FAKE_EMBEDDING_VERSION = "fake-hash-embedder/test-only";

function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function fakeVector(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  for (const word of words(text)) {
    const term = stem(word);
    const bucket = hash(term) % EMBEDDING_DIMENSIONS;
    vector[bucket] += hash(`${term}#sign`) % 2 === 0 ? 1 : -1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm === 0 ? vector : vector.map((value) => value / norm);
}

export function createFakeEmbedder(): Embedder {
  return {
    version: FAKE_EMBEDDING_VERSION,
    dimensions: EMBEDDING_DIMENSIONS,
    async embed(texts) {
      return texts.map(fakeVector);
    },
  };
}
