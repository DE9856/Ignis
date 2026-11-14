import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { EMBEDDING_DIMENSIONS } from "@/lib/retrieval/types";
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
  "title",
  "section",
  "chunk_type",
  "content",
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
  "embedding",
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
    for (const column of COLUMNS) expect(sql, column).toMatch(new RegExp(`^\\s+${column}\\s`, "m"));
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

  it("creates schema only: no rows, no embeddings", () => {
    expect(sql).not.toMatch(/\binsert\s+into\b/i);
    expect(sql).not.toMatch(/\bcopy\s+public\./i);
  });
});
