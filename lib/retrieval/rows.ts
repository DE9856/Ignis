import { GRAVITY_CONDITIONS, PROVENANCE_CLASSES, SAFETY_OBJECTIVES } from "@/lib/okf/types";
import type { GravityCondition, ProvenanceClass, SafetyObjective } from "@/lib/okf/types";

import { CHUNK_TYPES, type ChunkMetadata, type ChunkType, type EvidenceChunk } from "./types";

/**
 * Database row for one chunk, as proposed in `scripts/sql/evidence_chunks.proposal.sql`.
 * snake_case columns; the vector and the full-text column are never selected for the app.
 *
 * Member 1 owns the migration and `lib/supabase/types.ts`. This type mirrors
 * the proposal so the retrieval code compiles before the migration exists.
 */
export interface EvidenceChunkRecord {
  chunk_id: string;
  concept_id: string;
  investigation: string;
  investigation_id: string;
  title: string;
  section: string;
  chunk_type: ChunkType;
  chunk_index: number;
  content: string;
  search_names: string;
  source_class: ProvenanceClass;
  source_url: string | null;
  safety_category: SafetyObjective[];
  fuel_type: string | null;
  material: string | null;
  gravity_condition: GravityCondition | null;
  tags: string[];
  human_verified: boolean;
  previous_chunk_id: string | null;
  next_chunk_id: string | null;
  embedding_version: string;
  content_hash: string;
  metadata: ChunkMetadata;
}

/** Columns the app reads. Excludes `embedding` and `fts`. */
export const CHUNK_COLUMNS = [
  "chunk_id",
  "concept_id",
  "investigation",
  "investigation_id",
  "title",
  "section",
  "chunk_type",
  "chunk_index",
  "content",
  "search_names",
  "source_class",
  "source_url",
  "safety_category",
  "fuel_type",
  "material",
  "gravity_condition",
  "tags",
  "human_verified",
  "previous_chunk_id",
  "next_chunk_id",
  "embedding_version",
  "content_hash",
  "metadata",
].join(",");

export function toRecord(
  chunk: EvidenceChunk,
  embeddingVersion: string,
  contentHash: string,
): EvidenceChunkRecord {
  return {
    chunk_id: chunk.id,
    concept_id: chunk.conceptId ?? "",
    investigation: chunk.investigation,
    investigation_id: chunk.investigationId ?? "",
    title: chunk.title,
    section: chunk.section,
    chunk_type: chunk.chunkType,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    search_names: [chunk.investigation, chunk.title, ...chunk.metadata.searchNames, ...chunk.tags].join(" "),
    source_class: chunk.sourceClass,
    source_url: chunk.sourceUrl,
    safety_category: chunk.safetyCategories,
    fuel_type: chunk.fuelType,
    material: chunk.material,
    gravity_condition: chunk.gravityCondition,
    tags: chunk.tags,
    human_verified: chunk.verificationStatus === "verified",
    previous_chunk_id: chunk.previousChunkId,
    next_chunk_id: chunk.nextChunkId,
    embedding_version: embeddingVersion,
    content_hash: contentHash,
    metadata: chunk.metadata,
  };
}

function oneOf<T extends string>(values: readonly T[], value: unknown, fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

/** Map a row back to the shape the UI uses. Unknown enum values are made safe, never trusted. */
export function fromRecord(row: EvidenceChunkRecord): EvidenceChunk {
  const metadata = (row.metadata ?? {}) as Partial<ChunkMetadata>;
  return {
    id: row.chunk_id,
    conceptId: row.concept_id || null,
    investigationId: row.investigation_id || null,
    investigation: row.investigation,
    title: row.title,
    section: row.section,
    chunkType: oneOf(CHUNK_TYPES, row.chunk_type, "OBJECTIVE"),
    chunkIndex: row.chunk_index,
    content: row.content,
    tags: row.tags ?? [],
    safetyCategories: (row.safety_category ?? []).filter((value): value is SafetyObjective =>
      (SAFETY_OBJECTIVES as readonly string[]).includes(value),
    ),
    fuelType: row.fuel_type,
    material: row.material,
    gravityCondition: (GRAVITY_CONDITIONS as readonly string[]).includes(row.gravity_condition ?? "")
      ? row.gravity_condition
      : null,
    sourceClass: oneOf(PROVENANCE_CLASSES, row.source_class, "UNVERIFIED"),
    sourceUrl: row.source_url,
    verificationStatus: row.human_verified ? "verified" : "unverified",
    previousChunkId: row.previous_chunk_id,
    nextChunkId: row.next_chunk_id,
    embeddingVersion: row.embedding_version,
    metadata: {
      shortTitle: metadata.shortTitle ?? null,
      program: metadata.program ?? null,
      platform: metadata.platform ?? null,
      hardware: metadata.hardware ?? [],
      sensors: metadata.sensors ?? [],
      measurements: metadata.measurements ?? [],
      variables: metadata.variables ?? [],
      sampleShape: metadata.sampleShape ?? null,
      sampleSize: metadata.sampleSize ?? null,
      oxygenMin: metadata.oxygenMin ?? null,
      oxygenMax: metadata.oxygenMax ?? null,
      pressureMin: metadata.pressureMin ?? null,
      pressureMax: metadata.pressureMax ?? null,
      airflowMin: metadata.airflowMin ?? null,
      airflowMax: metadata.airflowMax ?? null,
      gravityValue: metadata.gravityValue ?? null,
      sources: metadata.sources ?? [],
      related: metadata.related ?? [],
      searchNames: metadata.searchNames ?? [],
    },
  };
}

/** pgvector text form, e.g. `[0.1,0.2,...]`. */
export function toPgVector(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
