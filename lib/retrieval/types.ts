import type { GravityCondition, ProvenanceClass, SafetyObjective } from "@/lib/okf/types";

/**
 * Interfaces for the future retrieval pipeline. Nothing here is implemented.
 *
 *   OKF Markdown -> section-aware chunking -> verified chunks only
 *   -> BAAI/bge-small-en-v1.5 (384-d) -> Supabase pgvector
 *   -> metadata + lexical + vector hybrid retrieval -> retrieved evidence
 *   -> optional grounded synthesis
 */

export const EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5";
export const EMBEDDING_DIMENSIONS = 384;

export type ChunkType =
  "objective" | "conditions" | "measurements" | "findings" | "safety_relevance" | "limitations" | "other";

export type ChunkVerificationStatus = "verified" | "unverified";

/**
 * A retrievable piece of evidence as the frontend sees it.
 * The embedding vector stays in the database; it is not part of this type.
 */
export interface EvidenceChunk {
  id: string;
  conceptId: string | null;
  investigationId: string | null;
  title: string;
  section: string;
  chunkType: ChunkType;
  content: string;

  tags: string[];
  safetyCategories: SafetyObjective[];
  fuelType: string | null;
  material: string | null;
  gravityCondition: GravityCondition | null;

  sourceClass: ProvenanceClass;
  sourceUrl: string | null;
  verificationStatus: ChunkVerificationStatus;

  previousChunkId: string | null;
  nextChunkId: string | null;

  /** Model + chunking version that produced the stored embedding. */
  embeddingVersion: string | null;
}

export interface RetrievalFilters {
  safetyCategories?: SafetyObjective[];
  fuelType?: string;
  material?: string;
  gravityCondition?: GravityCondition;
  investigationIds?: string[];
}

export interface RetrievalQuery {
  text: string;
  filters?: RetrievalFilters;
  limit?: number;
}

export interface RetrievedEvidence {
  chunk: EvidenceChunk;
  /** Component scores, null when that signal was not used. */
  lexicalScore: number | null;
  vectorScore: number | null;
  combinedScore: number;
}

export type RetrievalResponse =
  { status: "ok"; results: RetrievedEvidence[] } | { status: "unavailable"; reason: string };

export interface EvidenceRetriever {
  search(query: RetrievalQuery): Promise<RetrievalResponse>;
}

/** Turns one OKF document into ordered chunks. Implemented in `scripts/` later. */
export interface ChunkingStrategy<TDocument> {
  version: string;
  chunk(document: TDocument): EvidenceChunk[];
}
