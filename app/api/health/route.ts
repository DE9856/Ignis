import type { NextRequest } from "next/server";

import { getCapabilities } from "@/lib/core/capabilities";
import { toUserFacingError } from "@/lib/core/errors";
import { summarizeKnowledge } from "@/lib/integration/knowledge";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import { checkDatabaseHealth } from "@/lib/supabase/health";

const NO_STORE = { headers: { "Cache-Control": "no-store" } };

/**
 * GET /api/health          configuration and knowledge counts
 * GET /api/health?deep=1   also contacts the database
 *
 * For deployment debugging. Returns booleans and counts only: no keys, no
 * URLs, no file contents.
 */
export async function GET(request: NextRequest) {
  const deep = request.nextUrl.searchParams.get("deep") === "1";

  try {
    const knowledge = loadKnowledgeBase();
    const summary = summarizeKnowledge(knowledge);
    const capabilities = getCapabilities(knowledge.investigations);

    return Response.json(
      {
        status: "ok",
        knowledge: {
          loaded: true,
          concepts: summary.total,
          investigations: summary.investigations,
          verifiedConcepts: summary.humanReviewed,
          filesWithProblems: summary.issues,
        },
        database: {
          configured: capabilities.supabaseConfigured,
          ...(deep ? { check: await checkDatabaseHealth() } : {}),
        },
        retrieval: {
          implemented: capabilities.retrievalImplemented,
          configured: capabilities.retrievalEnabled,
        },
        synthesis: { configured: capabilities.llmEnabled },
        llm: { configured: capabilities.llmConfigured },
        methodology: { configured: capabilities.methodologyConfigured },
      },
      NO_STORE,
    );
  } catch (error) {
    const { code, message, detail } = toUserFacingError(error);
    return Response.json(
      { status: "error", code, message, detail },
      { status: 500, headers: NO_STORE.headers },
    );
  }
}
