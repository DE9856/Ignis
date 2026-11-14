import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval/types";
import { EVIDENCE_CHUNKS_TABLE, type EvidenceChunkRow } from "@/lib/supabase/types";

/**
 * CONTRACT: migration SQL <-> TypeScript row type <-> embedding dimension.
 * A cheap guard against the three drifting apart. It reads the SQL as text; it
 * does not run it.
 */
const COLUMNS = [
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
  "embedding",
  "metadata",
  "fts",
] as const satisfies readonly (keyof EvidenceChunkRow)[];

// Fails to compile if the row type gains a column this list does not have.
const _exhaustive: Exclude<keyof EvidenceChunkRow, (typeof COLUMNS)[number]> extends never ? true : false =
  true;
void _exhaustive;

describe("contract: Supabase migration", () => {
  const directory = path.join(process.cwd(), "supabase", "migrations");
  const sql = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => fs.readFileSync(path.join(directory, name), "utf8"))
    .join("\n");

  it("creates the table the code expects, with every column in the row type", () => {
    expect(sql).toContain(`create table if not exists public.${EVIDENCE_CHUNKS_TABLE}`);
    // A column is declared in the create table (0001) or added by a later migration.
    for (const column of COLUMNS)
      expect(sql, column).toMatch(new RegExp(`^\\s+(add column if not exists\\s+)?${column}\\s`, "m"));
  });

  it("sizes the vector column to the embedding model", () => {
    expect(EMBEDDING_DIMENSIONS).toBe(384);
    expect(sql).toContain(`embedding         vector(${EMBEDDING_DIMENSIONS})`);
    expect(sql).toContain(`query_embedding vector(${EMBEDDING_DIMENSIONS})`);
  });

  it("enables row-level security and exposes only verified chunks", () => {
    expect(sql).toMatch(/enable row level security/);
    expect(sql).toMatch(/for select\s+using \(human_verified\)/);
  });

  it("enables pgvector and indexes the filter columns, without a premature vector index", () => {
    expect(sql).toMatch(/create extension if not exists vector/);
    for (const column of ["concept_id", "investigation", "human_verified", "source_class", "chunk_type"]) {
      expect(sql, column).toMatch(new RegExp(`on public\\.evidence_chunks \\(${column}\\)`));
    }
    expect(sql).not.toMatch(/^create index[^;]*(hnsw|ivfflat)/im);
  });

  it("gives the browser roles no write access", () => {
    expect(sql).toMatch(
      /revoke insert, update, delete, truncate on public\.evidence_chunks from anon, authenticated/,
    );
    expect(sql).not.toMatch(/for\s+(insert|update|delete|all)\b/i);
  });

  it("defines the hybrid search function the Supabase store calls, readable by the browser roles", () => {
    expect(sql).toContain("create or replace function public.search_evidence_chunks(");
    expect(sql).toMatch(
      /grant execute on function public\.search_evidence_chunks\([^)]*\) to anon, authenticated/,
    );
    expect(sql).not.toMatch(/security definer/i);
  });

  it("keeps the dimension health helper and the embedding contract in step", () => {
    expect(sql).toContain("ignis_embedding_dimension");
    expect(EMBEDDING_MODEL).toBe("BAAI/bge-small-en-v1.5");
  });

  it("creates schema only: no rows, no embeddings", () => {
    expect(sql).not.toMatch(/\binsert\s+into\b/i);
    expect(sql).not.toMatch(/\bcopy\s+public\./i);
  });
});
