/**
 * Ingest verified OKF records into Supabase pgvector (Member 5; team workflow H11, H12).
 *
 *   npx tsx scripts/ingest.ts --dry-run              chunk only; no network; writes data/chunks.json
 *   npx tsx scripts/ingest.ts --dry-run --exact-tokens   also count tokens with the model's tokenizer
 *   npx tsx --env-file=.env.local scripts/ingest.ts             chunk, embed, upsert, prune
 *   npx tsx --env-file=.env.local scripts/ingest.ts --verify    compare the index with knowledge/ (exit 1 on drift)
 *   npx tsx --env-file=.env.local scripts/ingest.ts --selftest  insert, read, search and delete one test row
 *
 * A real ingest runs only from a clean `main` (override with --allow-branch for a scratch
 * project), so the index can hold nothing that was not verified and merged.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  createLocalEmbedder,
  LOCAL_EMBEDDING_VERSION,
  loadModelTokenCounter,
  MODEL_MAX_TOKENS,
} from "@/lib/embeddings";
import { embeddingText } from "@/lib/retrieval/chunker";
import { buildCorpusChunks, defaultKnowledgeRoot, type CorpusChunks } from "@/lib/retrieval/corpus";
import { toPgVector, toRecord } from "@/lib/retrieval/rows";
import { readSupabaseConfig } from "@/lib/retrieval/supabase-store";
import { estimateTokens } from "@/lib/retrieval/tokens";
import type { EvidenceChunk } from "@/lib/retrieval/types";

const args = new Set(process.argv.slice(2));
const flag = (name: string) => args.has(`--${name}`);
const TABLE = "evidence_chunks";
const BATCH = 50;

function fail(message: string): never {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

function hashOf(chunk: EvidenceChunk, version: string): string {
  return createHash("sha256")
    .update(`${version}\n${embeddingText(chunk)}`)
    .digest("hex");
}

function git(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function report(corpus: CorpusChunks): void {
  const records = new Set(corpus.chunks.map((chunk) => chunk.investigationId));
  const byType = new Map<string, number>();
  for (const chunk of corpus.chunks) byType.set(chunk.chunkType, (byType.get(chunk.chunkType) ?? 0) + 1);
  const drafts = corpus.issues
    .filter((issue) => issue.kind === "draft-record")
    .map((issue) => issue.recordId);
  const tokens = corpus.chunks.map((chunk) => estimateTokens(embeddingText(chunk)));

  console.log(`Verified records chunked: ${records.size}`);
  console.log(
    `Chunks: ${corpus.chunks.length} (${[...byType].map(([type, count]) => `${type} ${count}`).join(", ") || "none"})`,
  );
  if (tokens.length > 0) {
    console.log(
      `Estimated tokens per chunk: min ${Math.min(...tokens)}, max ${Math.max(...tokens)}, mean ${Math.round(tokens.reduce((a, b) => a + b, 0) / tokens.length)}`,
    );
  }
  console.log(`Drafts skipped (not verified): ${drafts.length === 0 ? "none" : drafts.join(", ")}`);
  if (corpus.load.ignoredFiles.length > 0)
    console.log(`Files ignored: ${corpus.load.ignoredFiles.join(", ")}`);
  for (const issue of corpus.load.issues)
    console.log(`INVALID ${issue.filePath} ${issue.path}: ${issue.message}`);
  for (const issue of corpus.issues.filter((item) => item.kind !== "draft-record")) {
    console.log(`WARNING ${issue.filePath} [${issue.section ?? "-"}]: ${issue.message}`);
  }
}

async function checkExactTokens(chunks: EvidenceChunk[]): Promise<void> {
  console.log("Counting tokens with the model tokenizer...");
  const count = await loadModelTokenCounter();
  const over = chunks
    .map((chunk) => ({ id: chunk.id, tokens: count(embeddingText(chunk)) }))
    .filter((item) => item.tokens > MODEL_MAX_TOKENS);
  if (over.length > 0) {
    fail(
      `These chunks exceed the model's ${MODEL_MAX_TOKENS}-token limit and would be truncated: ${over.map((item) => `${item.id} (${item.tokens})`).join(", ")}. Shorten the section or lower CHUNKING.maxTokens.`,
    );
  }
  console.log(`All chunks fit within ${MODEL_MAX_TOKENS} model tokens.`);
}

function serviceClient(): SupabaseClient {
  const config = readSupabaseConfig("service");
  if (!config) {
    fail(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run with --env-file=.env.local). The service-role key is never committed.",
    );
  }
  return createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
}

interface ExistingRow {
  chunk_id: string;
  content_hash: string;
  embedding_version: string;
  human_verified: boolean;
}

async function existingRows(client: SupabaseClient): Promise<ExistingRow[]> {
  const { data, error } = await client
    .from(TABLE)
    .select("chunk_id,content_hash,embedding_version,human_verified");
  if (error) fail(`Could not read ${TABLE}: ${error.message}. Has Member 1 applied the migration?`);
  return (data ?? []) as ExistingRow[];
}

async function upsert(client: SupabaseClient, rows: object[]): Promise<void> {
  for (let start = 0; start < rows.length; start += BATCH) {
    const { error } = await client
      .from(TABLE)
      .upsert(rows.slice(start, start + BATCH), { onConflict: "chunk_id" });
    if (error) fail(`Upsert failed: ${error.message}`);
  }
}

async function ingest(corpus: CorpusChunks): Promise<void> {
  const branch = git("rev-parse --abbrev-ref HEAD");
  const dirty = git("status --porcelain -- knowledge");
  if (!flag("allow-branch") && (branch !== "main" || dirty !== "")) {
    fail(
      `Ingest from a clean main only (current branch: ${branch || "unknown"}${dirty ? ", knowledge/ has uncommitted changes" : ""}). Run: git switch main && git pull. Use --allow-branch only for a scratch project.`,
    );
  }
  if (corpus.load.issues.length > 0)
    fail("Some knowledge files are invalid (listed above). Fix them before ingesting.");
  if (!flag("skip-token-check")) await checkExactTokens(corpus.chunks);

  const client = serviceClient();
  const version = LOCAL_EMBEDDING_VERSION;
  const existing = new Map((await existingRows(client)).map((row) => [row.chunk_id, row]));

  const changed: EvidenceChunk[] = [];
  const unchanged: EvidenceChunk[] = [];
  for (const chunk of corpus.chunks) {
    const row = existing.get(chunk.id);
    if (row && row.content_hash === hashOf(chunk, version) && row.embedding_version === version)
      unchanged.push(chunk);
    else changed.push(chunk);
  }

  console.log(`Embedding ${changed.length} new or changed chunks (${unchanged.length} unchanged)...`);
  const embedder = createLocalEmbedder();
  const vectors = await embedder.embed(changed.map(embeddingText), "passage");
  const now = new Date().toISOString();
  await upsert(
    client,
    changed.map((chunk, index) => ({
      ...toRecord(chunk, version, hashOf(chunk, version)),
      embedding: toPgVector(vectors[index]),
      updated_at: now,
    })),
  );
  // Unchanged text: refresh metadata but leave the stored vector alone.
  await upsert(
    client,
    unchanged.map((chunk) => ({ ...toRecord(chunk, version, hashOf(chunk, version)), updated_at: now })),
  );

  const current = new Set(corpus.chunks.map((chunk) => chunk.id));
  const stale = [...existing.keys()].filter((id) => !current.has(id));
  for (let start = 0; start < stale.length; start += BATCH) {
    const { error } = await client
      .from(TABLE)
      .delete()
      .in("chunk_id", stale.slice(start, start + BATCH));
    if (error) fail(`Delete failed: ${error.message}`);
  }

  const records = new Set(corpus.chunks.map((chunk) => chunk.investigationId)).size;
  console.log(
    `\nDone. Post in the channel: "Ingested ${records} verified records, ${corpus.chunks.length} chunks (${changed.length} re-embedded, ${stale.length} removed) from main@${git("rev-parse --short HEAD")}, ${version}."`,
  );
}

async function verify(corpus: CorpusChunks): Promise<void> {
  const client = serviceClient();
  const rows = await existingRows(client);
  const expected = new Map(corpus.chunks.map((chunk) => [chunk.id, hashOf(chunk, LOCAL_EMBEDDING_VERSION)]));
  const problems: string[] = [];
  for (const row of rows) {
    if (!row.human_verified) problems.push(`${row.chunk_id}: row is not marked verified`);
    if (!expected.has(row.chunk_id))
      problems.push(`${row.chunk_id}: in the index but not produced by any verified record`);
    else if (expected.get(row.chunk_id) !== row.content_hash)
      problems.push(`${row.chunk_id}: text changed since it was embedded`);
    if (row.embedding_version !== LOCAL_EMBEDDING_VERSION)
      problems.push(`${row.chunk_id}: embedding version ${row.embedding_version}`);
  }
  const indexed = new Set(rows.map((row) => row.chunk_id));
  for (const id of expected.keys())
    if (!indexed.has(id)) problems.push(`${id}: verified chunk missing from the index`);

  if (problems.length > 0) {
    console.log(problems.map((problem) => `DRIFT ${problem}`).join("\n"));
    fail(`${problems.length} differences between the index and knowledge/. Re-run ingestion from main.`);
  }
  console.log(
    `Index matches knowledge/: ${rows.length} chunks, all verified, embedding version ${LOCAL_EMBEDDING_VERSION}.`,
  );
}

async function selftest(): Promise<void> {
  const client = serviceClient();
  const id = "selftest.objective.00";
  const embedder = createLocalEmbedder();
  const [vector] = await embedder.embed(["IGNIS ingestion self-test row"], "passage");
  const row = {
    chunk_id: id,
    concept_id: "investigations/selftest",
    investigation: "SELFTEST",
    investigation_id: "selftest",
    title: "Ingestion self-test (not evidence)",
    section: "Objective",
    chunk_type: "OBJECTIVE",
    chunk_index: 0,
    content: "Temporary row written and deleted by scripts/ingest.ts --selftest.",
    search_names: "selftest",
    source_class: "NASA_SOURCE",
    human_verified: false,
    embedding_version: LOCAL_EMBEDDING_VERSION,
    content_hash: "selftest",
    embedding: toPgVector(vector),
  };
  try {
    const insert = await client.from(TABLE).upsert(row, { onConflict: "chunk_id" });
    if (insert.error) fail(`insert: ${insert.error.message}`);
    const read = await client.from(TABLE).select("chunk_id").eq("chunk_id", id);
    if (read.error || read.data?.length !== 1) fail(`read back: ${read.error?.message ?? "row not found"}`);
    const search = await client.rpc("search_evidence_chunks", {
      query_terms: ["selftest"],
      query_embedding: toPgVector(vector),
      match_count: 5,
    });
    if (search.error) fail(`search_evidence_chunks: ${search.error.message}`);
    console.log("Service role: insert, read and search_evidence_chunks all work.");
    console.log("Note: the row is unverified, so search correctly returns no match for it.");

    const anon = readSupabaseConfig("anon");
    if (anon) {
      const anonClient = createClient(anon.url, anon.key, { auth: { persistSession: false } });
      const leaked = await anonClient.from(TABLE).select("chunk_id").eq("chunk_id", id);
      if ((leaked.data ?? []).length > 0)
        fail("Row-level security is off: the anon key can read an unverified row.");
      console.log("Anon key: cannot read the unverified row (row-level security works).");
    }
  } finally {
    await client.from(TABLE).delete().eq("chunk_id", id);
  }
  console.log("Self-test passed; test row deleted.");
}

async function main(): Promise<void> {
  if (flag("selftest")) return selftest();

  const corpus = buildCorpusChunks(defaultKnowledgeRoot());
  report(corpus);
  if (flag("verify")) return verify(corpus);

  if (flag("dry-run")) {
    if (flag("exact-tokens")) await checkExactTokens(corpus.chunks);
    const out = path.join(process.cwd(), "data", "chunks.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(
      out,
      JSON.stringify(
        corpus.chunks.map((chunk) => ({ ...chunk, embeddingText: embeddingText(chunk) })),
        null,
        2,
      ),
    );
    console.log(`Dry run: wrote ${path.relative(process.cwd(), out)}. Nothing was sent anywhere.`);
    return;
  }
  return ingest(corpus);
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
