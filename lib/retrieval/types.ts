import type { GravityCondition, ProvenanceClass, SafetyObjective } from "@/lib/okf/types";

/**
 * Interfaces for the retrieval pipeline (docs/retrieval-contract.md).
 *
 *   OKF Markdown -> section-aware chunking -> verified chunks only
 *   -> BAAI/bge-small-en-v1.5 (384-d) -> Supabase pgvector
 *   -> metadata + lexical + vector hybrid retrieval -> retrieved evidence
 *   -> optional grounded synthesis
 *
 * Fields marked optional were added for the "Why retrieved?" view and for
 * bounded answers (handoff H14). Every field that existed before is unchanged,
 * so a retriever that never sets them still satisfies the contract.
 */

export const EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5";
export const EMBEDDING_DIMENSIONS = 384;

export type ChunkType =
  | "objective"
  | "conditions"
  | "variables"
  | "measurements"
  | "findings"
  | "safety_relevance"
  | "limitations"
  | "other";

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
  /** Restrict to these section types. */
  chunkTypes?: ChunkType[];
}

export interface RetrievalQuery {
  text: string;
  /** Explicit filters exclude. Facets the retriever detects in the text only boost. */
  filters?: RetrievalFilters;
  limit?: number;
}

/** A query facet a retrieved chunk matched, for the "Why retrieved?" view. */
export type MetadataFacet =
  "investigation" | "section" | "safety" | "gravity" | "material" | "fuel" | "hardware";

export interface MetadataMatch {
  facet: MetadataFacet;
  value: string;
  /** Plain-language reason, e.g. "Record safety category includes detection." */
  because: string;
}

export interface RetrievedEvidence {
  chunk: EvidenceChunk;
  /** Component scores, null when that signal was not used. */
  lexicalScore: number | null;
  vectorScore: number | null;
  combinedScore: number;

  /** 1-based position in the final list. */
  rank?: number;
  /** Share of the facets detected in the question that this chunk matches, 0–1. */
  metadataScore?: number | null;
  /** Question terms found in this chunk's text or names. */
  matchedTerms?: string[];
  matchedMetadata?: MetadataMatch[];
  /** Adjacent pieces of the same section when it was split, in reading order. */
  neighbors?: EvidenceChunk[];
}

/**
 * Why a question gets a bounded answer instead of, or as well as, evidence.
 * Show `message` as an intentional answer, not an error.
 */
export type BoundaryKind =
  | "PROBABILITY_REQUEST"
  | "UNIVERSAL_GUARANTEE"
  | "PREDICTION_REQUEST"
  | "DESIGN_PRESCRIPTION"
  | "FALSE_PREMISE"
  | "CORPUS_COVERAGE"
  | "VALUE_NOT_REPORTED"
  | "INSUFFICIENT_EVIDENCE";

export interface BoundaryNotice {
  kind: BoundaryKind;
  message: string;
  /** Deterministic facts behind the message. Label as computed by IGNIS. */
  details: string[];
}

/** A list question ("Which investigations studied…") answered from record metadata. */
export interface EvidenceListing {
  facet: MetadataFacet;
  value: string;
  /** Plain-language filter, e.g. "safety category includes detection". */
  description: string;
  /** Every verified investigation that matches, by record id, in result order. */
  investigationIds: string[];
}

export type ConditionField = "oxygen" | "pressure" | "airflow" | "gravity" | "material" | "fuel" | "sample";

/** What the retriever understood from the question, for the "Why retrieved?" view. */
export interface QueryUnderstanding {
  terms: string[];
  investigations: string[];
  safetyCategories: SafetyObjective[];
  gravity: GravityCondition[];
  materials: string[];
  fuels: string[];
  hardware: string[];
  sectionTypes: ChunkType[];
  conditionFields: ConditionField[];
  enumerative: boolean;
}

/** `hybrid`: vector + lexical + metadata. `lexical_only`: no query embedding was available. */
export type RetrievalMode = "hybrid" | "lexical_only";

export type RetrievalResponse =
  | {
      status: "ok";
      results: RetrievedEvidence[];
      mode?: RetrievalMode;
      /** Present when the question is out of bounds or the evidence does not support an answer. */
      boundary?: BoundaryNotice | null;
      listing?: EvidenceListing | null;
      understanding?: QueryUnderstanding;
      /** Operational note to show quietly, e.g. why vector search was skipped. */
      notice?: string | null;
    }
  | { status: "unavailable"; reason: string };

export interface EvidenceRetriever {
  search(query: RetrievalQuery): Promise<RetrievalResponse>;
}

/** Turns one OKF document into ordered chunks. Implemented in `scripts/` later. */
export interface ChunkingStrategy<TDocument> {
  version: string;
  chunk(document: TDocument): EvidenceChunk[];
}
