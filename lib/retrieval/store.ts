import type { EvidenceChunk } from "./types";

/**
 * Where verified chunks live and how raw candidate scores are produced.
 *
 * Two implementations: Supabase (production) and in-memory (tests, evaluation
 * on a laptop, and the fallback when Supabase is not configured). Fusion,
 * metadata scoring and the guard are shared code above this interface, so
 * both behave the same way.
 */

export interface CandidateScore {
  chunkId: string;
  /** Raw cosine similarity, or null when this chunk was not a vector candidate. */
  vector: number | null;
  /** Raw lexical rank (store-specific scale), or null when not a lexical candidate. */
  lexical: number | null;
}

export interface CandidateRequest {
  /** Stemmed terms for in-memory BM25. */
  terms: string[];
  /** Plain [a-z0-9] words for Postgres full-text search. */
  tsTerms: string[];
  embedding: number[] | null;
  limit: number;
}

export interface EvidenceStore {
  readonly kind: "supabase" | "local";
  /** Every verified chunk, without vectors. Small: one row per section of each verified record. */
  loadCatalog(): Promise<EvidenceChunk[]>;
  /** Top candidates from vector and lexical search, merged by chunk id. */
  scoreCandidates(request: CandidateRequest): Promise<CandidateScore[]>;
  /** Embedding version of the stored vectors, or null when none are stored. */
  indexedEmbeddingVersion(): Promise<string | null>;
}
