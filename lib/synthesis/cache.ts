import { createHash } from "node:crypto";

import type { EvidenceChunk } from "@/lib/retrieval/types";

import type { SynthesisResponse } from "./types";

/**
 * In-memory cache of finished summaries. Server only.
 *
 * Every search asks for a summary, and each summary costs two LLM calls (write
 * and review). Repeated questions, which are common in demos, should cost
 * nothing and never hit the provider's rate limit.
 *
 * The key covers everything that could change the answer: the question
 * (case and spacing normalised), the id and exact text of every passage
 * summarised, the model, and the prompt and reviewer versions. Editing and
 * re-ingesting a record, or changing a prompt, therefore never reuses an old
 * summary. Only complete, checked summaries are stored; failures are not.
 *
 * Per server process: on serverless hosting each instance keeps its own cache.
 */

type Grounded = Extract<SynthesisResponse, { status: "ok" }>;

export interface SummaryCacheKeyParts {
  question: string;
  chunks: EvidenceChunk[];
  model: string;
  versions: string[];
}

export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\s?.!]+$/, "")
    .trim();
}

export function summaryCacheKey({ question, chunks, model, versions }: SummaryCacheKeyParts): string {
  const passages = [...chunks]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((chunk) => [chunk.id, chunk.content]);
  return createHash("sha256")
    .update(JSON.stringify([versions, model, normalizeQuestion(question), passages]))
    .digest("hex");
}

export interface SummaryCache {
  get(key: string): Grounded | null;
  set(key: string, value: Grounded): void;
  readonly size: number;
}

export interface SummaryCacheOptions {
  maxEntries?: number;
  ttlMs?: number;
  now?: () => number;
}

export function createSummaryCache({
  maxEntries = 500,
  ttlMs = 6 * 60 * 60 * 1000,
  now = Date.now,
}: SummaryCacheOptions = {}): SummaryCache {
  // Map keeps insertion order; re-inserting on read makes it least-recently-used first.
  const entries = new Map<string, { at: number; value: Grounded }>();
  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (now() - entry.at > ttlMs) {
        entries.delete(key);
        return null;
      }
      entries.delete(key);
      entries.set(key, entry);
      return entry.value;
    },
    set(key, value) {
      entries.delete(key);
      entries.set(key, { at: now(), value });
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },
    get size() {
      return entries.size;
    },
  };
}
