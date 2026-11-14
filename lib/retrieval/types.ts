import type { GravityCondition, ProvenanceClass, SafetyObjective, SourceReference } from "@/lib/okf/types";

/**
 * Shapes for the retrieval pipeline (handoff H14).
 *
 *   OKF Markdown -> section-aware chunks (verified records only)
 *   -> BAAI/bge-small-en-v1.5 (384-d) -> Supabase pgvector
 *   -> metadata + lexical + vector hybrid retrieval -> retrieved evidence
 *   -> optional grounded synthesis
 *
 * This file is imported by client components. Keep it free of runtime
 * dependencies beyond plain constants.
 */

export const EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5";
export const EMBEDDING_DIMENSIONS = 384;

/** Section types, upper-case as decided in the team workflow (D8). */
export const CHUNK_TYPES = [
  "OBJECTIVE",
  "CONDITIONS",
  "VARIABLES",
  "MEASUREMENT",
  "FINDING",
  "LIMITATION",
  "INTERPRETATION",
] as const;
export type ChunkType = (typeof CHUNK_TYPES)[number];

export type ChunkVerificationStatus = "verified" | "unverified";

/**
 * Record-level facts copied onto every chunk so a retrieved passage always
 * carries its provenance and conditions. Unknown values stay null.
 */
export interface ChunkMetadata {
  shortTitle: string | null;
  program: string | null;
  platform: string | null;
  hardware: string[];
  sensors: string[];
  measurements: string[];
  variables: string[];
  sampleShape: string | null;
  sampleSize: string | null;
  /** Percent O2 by volume. */
  oxygenMin: number | null;
  oxygenMax: number | null;
  /** kPa. */
  pressureMin: number | null;
  pressureMax: number | null;
  /** m/s. */
  airflowMin: number | null;
  airflowMax: number | null;
  /** g. */
  gravityValue: number | null;
  sources: SourceReference[];
  /** `related` links of the record, as `<folder>/<record-id>`. */
  related: string[];
  /** Names a reader might use for this record: title, short title, id, hardware, platform. */
  searchNames: string[];
}

/**
 * A retrievable piece of evidence as the frontend sees it.
 * The embedding vector stays in the database; it is not part of this type.
 */
export interface EvidenceChunk {
  /** Deterministic: `<record-id>.<type-lowercase>.<two-digit-index>`, e.g. `bass-ii.conditions.01`. */
  id: string;
  /** `<folder>/<record-id>`, e.g. `investigations/bass-ii`. */
  conceptId: string | null;
  /** Record id, e.g. `bass-ii`. */
  investigationId: string | null;
  /** Display name of the investigation: short title when set, otherwise title. */
  investigation: string;
  /** Record title. */
  title: string;
  /** Section label, e.g. `Key Findings` or `Key Findings › Flame spread`. */
  section: string;
  chunkType: ChunkType;
  /** Position of the chunk within its record, from 0. */
  chunkIndex: number;
  /** Exactly the text the curator wrote. Shown and cited as is. */
  content: string;

  tags: string[];
  safetyCategories: SafetyObjective[];
  fuelType: string | null;
  material: string | null;
  gravityCondition: GravityCondition | null;

  /** NASA_SOURCE, or TEAM_INTERPRETATION for Fire Safety Relevance. */
  sourceClass: ProvenanceClass;
  sourceUrl: string | null;
  verificationStatus: ChunkVerificationStatus;

  previousChunkId: string | null;
  nextChunkId: string | null;

  /** Model + chunking version that produced the stored embedding. */
  embeddingVersion: string | null;

  metadata: ChunkMetadata;
}

export interface RetrievalFilters {
  safetyCategories?: SafetyObjective[];
  fuelType?: string;
  material?: string;
  gravityCondition?: GravityCondition;
  investigationIds?: string[];
  chunkTypes?: ChunkType[];
}

export interface RetrievalQuery {
  text: string;
  /** Explicit filters exclude. Facets detected in the text only boost. */
  filters?: RetrievalFilters;
  limit?: number;
}

/** Each signal on a 0–1 scale. `null` when the signal was not used for this query. */
export interface ScoreBreakdown {
  /** Cosine similarity of query and chunk embeddings (raw, not rescaled). */
  vector: number | null;
  /** Lexical rank relative to the best lexical match in this result set. */
  lexical: number | null;
  /** Share of detected query facets this chunk matches. */
  metadata: number | null;
  /** Weighted combination used for ranking. */
  fused: number;
}

export type MetadataFacet =
  "investigation" | "section" | "safety" | "gravity" | "material" | "fuel" | "hardware";

export interface MetadataMatch {
  facet: MetadataFacet;
  value: string;
  /** Plain-language reason, shown in the "Why retrieved?" drawer. */
  because: string;
}

export interface RetrievedEvidence {
  chunk: EvidenceChunk;
  /** 1-based position in the final list. */
  rank: number;
  scores: ScoreBreakdown;
  /** Query terms found in this chunk's text or names. */
  matchedTerms: string[];
  matchedMetadata: MetadataMatch[];
  /** Adjacent chunks of the same section when the section was split, in reading order. */
  neighbors: EvidenceChunk[];
}

/**
 * Why a question gets a bounded answer instead of, or as well as, evidence.
 * Wording is fixed in `messages.ts` and reviewed by Member 3.
 */
export const BOUNDARY_KINDS = [
  "PROBABILITY_REQUEST",
  "UNIVERSAL_GUARANTEE",
  "PREDICTION_REQUEST",
  "DESIGN_PRESCRIPTION",
  "FALSE_PREMISE",
  "CORPUS_COVERAGE",
  "VALUE_NOT_REPORTED",
  "INSUFFICIENT_EVIDENCE",
  /** Informational: the question mentions partial gravity and no verified record tested it. */
  "PARTIAL_GRAVITY_BOUND",
] as const;
export type BoundaryKind = (typeof BOUNDARY_KINDS)[number];

export interface BoundaryNotice {
  kind: BoundaryKind;
  /** Text to show as an intentional answer, not an error. */
  message: string;
  /** Deterministic facts behind the message, e.g. which records lack a value. Labelled COMPUTED. */
  details: string[];
}

/** A list question answered from metadata rather than from top-k similarity. */
export interface EvidenceListing {
  facet: MetadataFacet;
  value: string;
  /** Plain-language filter, e.g. "safety category includes detection". */
  description: string;
  /** Every verified investigation that matches, by record id, in result order. */
  investigationIds: string[];
}

/** What the system understood from the question, for the retrieval inspector. */
export interface QueryUnderstanding {
  terms: string[];
  investigations: string[];
  safetyCategories: SafetyObjective[];
  gravity: GravityCondition[];
  materials: string[];
  fuels: string[];
  hardware: string[];
  sectionIntent: ChunkType[];
  conditionFields: ConditionField[];
  enumerative: boolean;
}

export type ConditionField = "oxygen" | "pressure" | "airflow" | "gravity" | "material" | "fuel" | "sample";

/** `hybrid`: vector + lexical + metadata. `lexical_only`: no query embedding was available. */
export type RetrievalMode = "hybrid" | "lexical_only";

export type RetrievalResponse =
  | {
      status: "ok";
      mode: RetrievalMode;
      results: RetrievedEvidence[];
      boundary: BoundaryNotice | null;
      listing: EvidenceListing | null;
      understanding: QueryUnderstanding;
      /** Operational note to show quietly, e.g. why vector search was skipped. */
      notice: string | null;
    }
  | { status: "unavailable"; reason: string };

export interface EvidenceRetriever {
  search(query: RetrievalQuery): Promise<RetrievalResponse>;
}
