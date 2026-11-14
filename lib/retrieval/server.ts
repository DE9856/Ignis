import { z } from "zod";

import { getQueryEmbedder } from "@/lib/embeddings";
import { SAFETY_OBJECTIVES, GRAVITY_CONDITIONS } from "@/lib/okf/types";

import { RETRIEVAL } from "./config";
import { buildCorpusChunks, defaultKnowledgeRoot } from "./corpus";
import { createHybridRetriever } from "./hybrid";
import { createMemoryStore } from "./memory-store";
import { RETRIEVAL_NOTICES } from "./messages";
import type { EvidenceStore } from "./store";
import { createSupabaseStore, readSupabaseConfig } from "./supabase-store";
import { CHUNK_TYPES, type EvidenceRetriever, type RetrievalQuery, type RetrievalResponse } from "./types";

/**
 * Server-side retrieval. Never import this from a client component.
 *
 * - Supabase configured: hybrid search over the shared pgvector index
 *   (anon key; row-level security returns verified rows only).
 * - Not configured: lexical + metadata search over the verified records in
 *   `knowledge/`, read directly. The app keeps working with no environment
 *   variables, which the team requires.
 */

let supabase: { store: EvidenceStore; retriever: EvidenceRetriever } | null = null;
let local: { at: number; store: EvidenceStore; retriever: EvidenceRetriever } | null = null;
const LOCAL_TTL_MS = 30_000;

function currentBackend(): { store: EvidenceStore; retriever: EvidenceRetriever } {
  const config = readSupabaseConfig("anon");
  if (config) {
    if (!supabase) {
      const store = createSupabaseStore(config);
      supabase = { store, retriever: createHybridRetriever({ store, embedder: getQueryEmbedder() }) };
    }
    return supabase;
  }
  if (!local || Date.now() - local.at > LOCAL_TTL_MS) {
    const corpus = buildCorpusChunks(defaultKnowledgeRoot());
    const store = createMemoryStore(corpus.chunks);
    local = {
      at: Date.now(),
      store,
      retriever: createHybridRetriever({ store, embedder: null, storeNotice: RETRIEVAL_NOTICES.localCorpus }),
    };
  }
  return local;
}

export function getServerRetriever(): EvidenceRetriever {
  return currentBackend().retriever;
}

/**
 * The store behind the retriever: Supabase when configured, otherwise the
 * verified local records. Synthesis reads passages from here by id, so it
 * never relies on text sent by the browser.
 */
export function getServerStore(): EvidenceStore {
  return currentBackend().store;
}

const requestSchema = z.object({
  text: z.string().trim().min(1).max(RETRIEVAL.maxQueryChars),
  limit: z.number().int().min(1).max(RETRIEVAL.maxResults).optional(),
  filters: z
    .object({
      safetyCategories: z.array(z.enum(SAFETY_OBJECTIVES)).optional(),
      fuelType: z.string().max(100).optional(),
      material: z.string().max(100).optional(),
      gravityCondition: z.enum(GRAVITY_CONDITIONS).optional(),
      investigationIds: z.array(z.string().max(100)).max(50).optional(),
      chunkTypes: z.array(z.enum(CHUNK_TYPES)).optional(),
    })
    .optional(),
});

/** Small per-address limit so the public route cannot be used to hammer the database or the model. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const recent = new Map<string, number[]>();

function rateLimited(address: string): boolean {
  const now = Date.now();
  const times = (recent.get(address) ?? []).filter((time) => now - time < WINDOW_MS);
  times.push(now);
  recent.set(address, times);
  if (recent.size > 5_000) recent.clear();
  return times.length > MAX_PER_WINDOW;
}

function json(body: RetrievalResponse | { error: string }, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Handler body for `POST /api/evidence/search`. */
export async function handleSearchRequest(request: Request): Promise<Response> {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(address)) return json({ error: "Too many searches. Wait a minute and try again." }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be JSON." }, 400);
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return json({ error: "Expected { text: string, limit?: number, filters?: object }." }, 400);

  const query: RetrievalQuery = parsed.data;
  try {
    return json(await getServerRetriever().search(query));
  } catch (error) {
    return json({ status: "unavailable", reason: `Evidence search failed: ${(error as Error).message}` });
  }
}
