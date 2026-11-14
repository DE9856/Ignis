import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { fromRecord, toPgVector, CHUNK_COLUMNS, type EvidenceChunkRecord } from "./rows";
import type { CandidateRequest, CandidateScore, EvidenceStore } from "./store";
import type { EvidenceChunk } from "./types";

/**
 * Supabase pgvector store. Server only.
 *
 * Reads use the anon key: row-level security only exposes verified rows, so
 * a draft can never be returned even if it were inserted by mistake.
 *
 * The catalog of verified chunks (no vectors) is cached briefly. The corpus is
 * a few hundred chunks at most, so holding it lets fusion, list questions and
 * neighbour expansion run without extra round trips. Each search makes one
 * RPC call, `search_evidence_chunks`, for vector and lexical candidates.
 */

const CATALOG_TTL_MS = 60_000;

export interface SupabaseStoreConfig {
  url: string;
  key: string;
}

interface SearchRow {
  chunk_id: string;
  similarity: number | null;
  lexical_rank: number | null;
}

export function createSupabaseStore(config: SupabaseStoreConfig): EvidenceStore {
  const client: SupabaseClient = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let cache: { at: number; chunks: EvidenceChunk[] } | null = null;

  async function loadCatalog(): Promise<EvidenceChunk[]> {
    if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.chunks;
    const { data, error } = await client
      .from("evidence_chunks")
      .select(CHUNK_COLUMNS)
      .eq("human_verified", true)
      .order("chunk_id");
    if (error) throw new Error(error.message);
    const chunks = ((data ?? []) as unknown as EvidenceChunkRecord[]).map(fromRecord);
    cache = { at: Date.now(), chunks };
    return chunks;
  }

  return {
    kind: "supabase",
    loadCatalog,
    async scoreCandidates(request: CandidateRequest): Promise<CandidateScore[]> {
      const { data, error } = await client.rpc("search_evidence_chunks", {
        query_terms: request.tsTerms,
        query_embedding: request.embedding ? toPgVector(request.embedding) : null,
        match_count: request.limit,
      });
      if (error) throw new Error(error.message);
      return ((data ?? []) as SearchRow[]).map((row) => ({
        chunkId: row.chunk_id,
        vector: row.similarity,
        lexical: row.lexical_rank,
      }));
    },
    async indexedEmbeddingVersion() {
      const versions = new Set((await loadCatalog()).map((chunk) => chunk.embeddingVersion).filter(Boolean));
      if (versions.size === 1) return [...versions][0] as string;
      return null;
    },
  };
}

export function readSupabaseConfig(kind: "anon" | "service"): SupabaseStoreConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    kind === "anon"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      : process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}
