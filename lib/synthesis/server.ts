import { z } from "zod";

import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { blocksSynthesis, classifyBoundary } from "@/lib/retrieval/guard";
import { analyzeQuery, buildVocabulary } from "@/lib/retrieval/query-analysis";
import type { EvidenceStore } from "@/lib/retrieval/store";
import type { EvidenceChunk } from "@/lib/retrieval/types";

import { groundOutput, parseModelOutput } from "./grounding";
import { completeChat, LlmError, readLlmConfig, type LlmConfig } from "./groq";
import { buildMessages, type ChatMessage } from "./prompt";
import { scopeToNamedInvestigations, type InvestigationName } from "./scope";
import {
  SYNTHESIS_LIMITS,
  type SynthesisResponse,
  type SynthesisSection,
  type SynthesisStatement,
} from "./types";
import { NOT_ESTABLISHED } from "@/lib/retrieval/messages";
import { loadKnowledgeBase } from "@/lib/okf/loader";

/**
 * Server side of grounded synthesis. Never import this from a client component.
 *
 * Order of checks, each of which can end the request before the model is called:
 *   1. An LLM key is configured.
 *   2. The request is well formed and names at most a handful of passages.
 *   3. Every passage id is a verified chunk in the server's own catalog.
 *      Text sent by the browser is never used.
 *   4. The question passes the same boundary guard as search. Questions
 *      asking for probabilities, guarantees, predictions or design choices
 *      are refused here, even when the API is called directly.
 *   5. If the question names investigations, only their passages are
 *      summarised (`scope.ts`). If none of them has a passage, the answer is
 *      "insufficient" without calling the model.
 * Then the model is called once, and its output goes through `groundOutput`.
 */

export type ChatFunction = (messages: ChatMessage[], config: LlmConfig) => Promise<string>;

export interface SynthesisDeps {
  store: EvidenceStore;
  llm: LlmConfig | null;
  chat?: ChatFunction;
  /** Every investigation record, verified or not, to recognise names in the question. */
  records?: InvestigationName[];
}

function emptySections(): Record<SynthesisSection, SynthesisStatement[]> {
  return { answer: [], nasaEvidence: [], teamInterpretation: [], limitations: [] };
}

export async function synthesize(
  question: string,
  chunkIds: string[],
  { store, llm, chat = completeChat, records = [] }: SynthesisDeps,
): Promise<SynthesisResponse> {
  if (!llm) return { status: "unavailable", reason: DEGRADED_MESSAGES.noSynthesis };

  const catalog = await store.loadCatalog();
  const byId = new Map(catalog.map((chunk) => [chunk.id, chunk]));
  const ids = [...new Set(chunkIds)];
  const requested = ids
    .map((id) => byId.get(id))
    .filter((chunk): chunk is EvidenceChunk => chunk !== undefined);
  if (requested.length !== ids.length) {
    return {
      status: "unavailable",
      reason: "Some selected passages are no longer in the verified index. Search again and reselect them.",
    };
  }
  if (requested.some((chunk) => chunk.verificationStatus !== "verified")) {
    return { status: "unavailable", reason: "Only verified passages can be summarised." };
  }

  const boundary = classifyBoundary(question, analyzeQuery(question, buildVocabulary(catalog)), catalog);
  if (boundary && blocksSynthesis(boundary)) return { status: "refused", boundary };

  const { chunks, notes } = scopeToNamedInvestigations(question, requested, catalog, records);
  if (chunks.length === 0) {
    // The question is about investigations none of these passages cover. Nothing to summarise.
    return {
      status: "ok",
      sections: { ...emptySections(), answer: [{ text: NOT_ESTABLISHED, sources: [] }] },
      removed: [],
      insufficient: true,
      notes,
      model: null,
      sources: [],
    };
  }

  let raw: string;
  try {
    raw = await chat(buildMessages(question, chunks), llm);
  } catch (error) {
    return {
      status: "unavailable",
      reason: error instanceof LlmError ? error.message : "The language model request failed.",
    };
  }

  const output = parseModelOutput(raw);
  if (!output) {
    return {
      status: "unavailable",
      reason: "The language model's answer was not in the expected format. Try again.",
    };
  }

  const { sections, removed, insufficient } = groundOutput({ output, chunks, question });
  return {
    status: "ok",
    sections,
    removed,
    insufficient,
    notes,
    model: `groq:${llm.model}`,
    sources: chunks.map((chunk, index) => ({
      id: chunk.id,
      number: index + 1,
      investigation: chunk.investigation,
      section: chunk.section,
      chunkType: chunk.chunkType,
      sourceClass: chunk.sourceClass,
      sourceUrl: chunk.sourceUrl,
    })),
  };
}

const requestSchema = z.object({
  question: z.string().trim().min(1).max(SYNTHESIS_LIMITS.maxQuestionChars),
  chunkIds: z.array(z.string().min(1).max(200)).min(1).max(SYNTHESIS_LIMITS.maxSources),
});

/** Each call costs an LLM request, so the per-address limit is tighter than search's. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const recent = new Map<string, number[]>();

function rateLimited(address: string): boolean {
  const now = Date.now();
  const times = (recent.get(address) ?? []).filter((time) => now - time < WINDOW_MS);
  times.push(now);
  recent.set(address, times);
  if (recent.size > 5_000) recent.clear();
  return times.length > MAX_PER_WINDOW;
}

let names: { at: number; records: InvestigationName[] } | null = null;
const NAMES_TTL_MS = 60_000;

/** Every investigation record in `knowledge/`, drafts included, for name recognition only. */
function investigationNames(): InvestigationName[] {
  if (!names || Date.now() - names.at > NAMES_TTL_MS) {
    const records = loadKnowledgeBase().investigations.map(({ id, title, shortTitle }) => ({
      id,
      title,
      shortTitle,
    }));
    names = { at: Date.now(), records };
  }
  return names.records;
}

function json(body: SynthesisResponse | { error: string }, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Handler body for `POST /api/evidence/synthesize`. */
export async function handleSynthesisRequest(
  request: Request,
  getStore: () => EvidenceStore,
): Promise<Response> {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(address)) return json({ error: "Too many summaries. Wait a minute and try again." }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be JSON." }, 400);
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: `Expected { question: string, chunkIds: string[] } with 1 to ${SYNTHESIS_LIMITS.maxSources} ids.`,
      },
      400,
    );
  }

  try {
    return json(
      await synthesize(parsed.data.question, parsed.data.chunkIds, {
        store: getStore(),
        llm: readLlmConfig(),
        records: investigationNames(),
      }),
    );
  } catch {
    return json({
      status: "unavailable",
      reason: "Summarising failed. The retrieved evidence above is unaffected.",
    });
  }
}
