/**
 * Hand-written types for the Supabase schema in supabase/migrations/.
 * Keep the two in step: a column change is a `contract:` pull request that
 * touches the migration, this file and docs/retrieval-contract.md together.
 */

/** One row of `evidence_chunks`. Snake_case, as stored. */
export type EvidenceChunkRow = {
  /** Deterministic id, e.g. `bass-ii.conditions.01`. */
  chunk_id: string;
  /** Parent record as `<folder>/<record-id>`. */
  concept_id: string;
  /** Display name of the parent investigation or record. */
  investigation: string;
  title: string;
  section: string;
  /** OBJECTIVE | CONDITIONS | VARIABLES | MEASUREMENT | FINDING | LIMITATION | INTERPRETATION */
  chunk_type: string;
  content: string;
  /** NASA_SOURCE | TEAM_INTERPRETATION */
  source_class: string;
  source_url: string | null;
  safety_category: string[];
  fuel_type: string | null;
  material: string | null;
  gravity_condition: string | null;
  tags: string[];
  human_verified: boolean;
  previous_chunk_id: string | null;
  next_chunk_id: string | null;
  /** Model and chunker version, e.g. `bge-small-en-v1.5/chunker-v1`. */
  embedding_version: string;
  /** vector(384). Written by ingestion; never selected for the frontend. */
  embedding: number[] | null;
  /** Free-form ingestion provenance. Never scientific values. */
  metadata: Record<string, unknown>;
  /** Generated full-text column. Read-only. */
  fts: unknown;
};

export type EvidenceChunkInsert = Omit<EvidenceChunkRow, "fts" | "metadata"> & {
  metadata?: Record<string, unknown>;
};

export type Database = {
  public: {
    Tables: {
      evidence_chunks: {
        Row: EvidenceChunkRow;
        Insert: EvidenceChunkInsert;
        Update: Partial<EvidenceChunkInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ignis_vector_available: { Args: Record<string, never>; Returns: boolean };
      ignis_embedding_dimension: { Args: Record<string, never>; Returns: number | null };
      match_evidence_chunks: {
        Args: { query_embedding: number[]; match_count?: number };
        Returns: { chunk_id: string; similarity: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const EVIDENCE_CHUNKS_TABLE = "evidence_chunks";
