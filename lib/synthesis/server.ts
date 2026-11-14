import { z } from "zod";

import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { blocksSynthesis, classifyBoundary } from "@/lib/retrieval/guard";
import { analyzeQuery, buildVocabulary } from "@/lib/retrieval/query-analysis";
import type { EvidenceStore } from "@/lib/retrieval/store";
import type { EvidenceChunk } from "@/lib/retrieval/types";

import { createSummaryCache, summaryCacheKey, type SummaryCache } from "./cache";
import { groundOutput, parseModelOutput } from "./grounding";
import { completeChat, LlmError, readLlmConfig, type LlmConfig } from "./groq";
import { buildMessages, PROMPT_VERSION, type ChatMessage } from "./prompt";
import { retryAnswer } from "./retry";
import { scopeToNamedInvestigations, type InvestigationName } from "./scope";
import {
  applyVerdicts,
  buildVerificationMessages,
  parseVerdicts,
  reviewItems,
  type Verdicts,
  VERIFIER_VERSION,
} from "./verify";
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
 * Then the model writes the summary, which goes through `groundOutput` (form:
 * citations, numbers, sections), and a second call reviews every remaining
 * statement against its cited passages (`verify.ts`, meaning). Unsupported
 * statements are removed and listed; if the review fails, nothing is shown.
 * Finished summaries are cached (`cache.ts`), so a repeated question costs no
 * model calls.
 */

export type ChatFunction = (messages: ChatMessage[], config: LlmConfig) => Promise<string>;

export interface SynthesisDeps {
  store: EvidenceStore;
  llm: LlmConfig | null;
  chat?: ChatFunction;
  /** Every investigation record, verified or not, to recognise names in the question. */
  records?: InvestigationName[];
  /** Finished summaries by question and passages. Omit to always call the model. */
  cache?: SummaryCache;
}

function emptySections(): Record<SynthesisSection, SynthesisStatement[]> {
  return { answer: [], nasaEvidence: [], teamInterpretation: [], limitations: [] };
}

export async function synthesize(
  question: string,
  chunkIds: string[],
  { store, llm, chat = completeChat, records = [], cache }: SynthesisDeps,
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

  const scoped = scopeToNamedInvestigations(question, requested, catalog, records);
  const { chunks } = scoped;
  // A partial-gravity question: the notice travels with the summary, and its Limitations must say so.
  const partialGravity = boundary?.kind === "PARTIAL_GRAVITY_BOUND";
  // The partial-gravity notice is shown once, beside the summary, by the search response; not repeated here.
  const notes = scoped.notes;
  const extraRules = partialGravity
    ? [
        // Not asked into Limitations: no passage states it, so the reviewer would rightly reject it.
        // The notice itself is shown as a computed note beside the summary.
        "No evidence block was tested in lunar, Martian or partial gravity (IGNIS shows this separately). Never present microgravity results as partial-gravity results.",
      ]
    : [];
  if (chunks.length === 0) {
    // The question is about investigations none of these passages cover. Nothing to summarise.
    return {
      status: "ok",
      sections: { ...emptySections(), answer: [{ text: NOT_ESTABLISHED, sources: [] }] },
      removed: [],
      insufficient: true,
      answerWithheld: false,
      notes,
      meaningChecked: false,
      model: null,
      sources: [],
    };
  }

  const cacheKey = summaryCacheKey({
    question,
    chunks,
    model: llm.model,
    versions: [PROMPT_VERSION, VERIFIER_VERSION],
  });
  const cached = cache?.get(cacheKey);
  if (cached) return cached;

  let raw: string;
  try {
    raw = await chat(buildMessages(question, chunks, extraRules), llm);
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

  const grounded = groundOutput({ output, chunks, question });

  // Second pass: each remaining statement is judged against the passages it cites.
  const items = reviewItems(grounded.sections);
  let sections = grounded.sections;
  let removed = grounded.removed;
  if (items.length > 0) {
    let verdicts: Verdicts | null;
    try {
      verdicts = parseVerdicts(await chat(buildVerificationMessages(items, chunks), llm));
    } catch {
      verdicts = null;
    }
    // Fail closed: the summary is shown first, so an unchecked summary is not shown at all.
    if (!verdicts) {
      return {
        status: "unavailable",
        reason: "The summary could not be checked against its sources, so it is not shown. Try again.",
      };
    }
    const verified = applyVerdicts(sections, items, verdicts);
    sections = verified.sections;
    removed = [...removed, ...verified.removed];
  }

  const sourced = (list: SynthesisStatement[]) => list.some((statement) => statement.sources.length > 0);
  const findings = sourced(sections.nasaEvidence) || sourced(sections.teamInterpretation);

  // The answer failed review but supported findings survived: one more attempt, built only from them.
  // Not for partial-gravity questions: there a retry pushes the model to apply microgravity results
  // to the Moon or Mars, which IGNIS must not do. The withheld answer and the findings are the honest result.
  if (!output.insufficient && !partialGravity && !sourced(sections.answer) && findings) {
    const verifiedStatements = [...sections.nasaEvidence, ...sections.teamInterpretation].filter(
      (statement) => statement.sources.length > 0,
    );
    const rejected = removed.filter((item) => item.section === "answer");
    const retry = await retryAnswer(question, chunks, verifiedStatements, rejected, chat, llm);
    if (retry) {
      sections = { ...sections, answer: retry.answer };
      removed = [...removed, ...retry.removed.map((item) => ({ ...item, reason: `retry: ${item.reason}` }))];
    }
  }
  const answered = sourced(sections.answer);
  // "Insufficient" only when the model says so or nothing supported survives. If the checks removed
  // the answer sentence but supported findings remain, say the answer was withheld instead.
  const insufficient = output.insufficient || (!answered && !findings);
  const answerWithheld = !insufficient && !answered;
  if (insufficient) sections = { ...sections, answer: [{ text: NOT_ESTABLISHED, sources: [] }] };
  if (answerWithheld) sections = { ...sections, answer: [] };

  const result: SynthesisResponse = {
    status: "ok",
    sections,
    removed,
    insufficient,
    answerWithheld,
    meaningChecked: items.length > 0,
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
  // Only complete, checked summaries are cached; failures above return before this.
  cache?.set(cacheKey, result);
  return result;
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

/** One cache per server process: 500 summaries, 6 hours each. */
const summaryCache = createSummaryCache();

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
        cache: summaryCache,
      }),
    );
  } catch {
    return json({
      status: "unavailable",
      reason: "Summarising failed. The retrieved evidence above is unaffected.",
    });
  }
}
