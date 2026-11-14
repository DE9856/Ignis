import type { EvidenceChunk } from "@/lib/retrieval/types";

/**
 * Hand-written placeholder for the Supabase schema.
 * Replace with `supabase gen types typescript` output once the schema exists.
 */

/** Database row for a chunk: snake_case columns, plus the pgvector column. */
export type EvidenceChunkRow = {
  id: string;
  concept_id: string | null;
  investigation_id: string | null;
  title: string;
  section: string;
  chunk_type: EvidenceChunk["chunkType"];
  content: string;
  tags: string[];
  safety_categories: EvidenceChunk["safetyCategories"];
  fuel_type: string | null;
  material: string | null;
  gravity_condition: EvidenceChunk["gravityCondition"];
  source_class: EvidenceChunk["sourceClass"];
  source_url: string | null;
  verification_status: EvidenceChunk["verificationStatus"];
  previous_chunk_id: string | null;
  next_chunk_id: string | null;
  embedding_version: string | null;
  /** vector(384). Server-side ingestion only; never selected for the frontend. */
  embedding: number[] | null;
};

export type Database = {
  public: {
    Tables: {
      evidence_chunks: {
        Row: EvidenceChunkRow;
        Insert: EvidenceChunkRow;
        Update: Partial<EvidenceChunkRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
