import type { NextRequest } from "next/server";

import { getCapabilities } from "@/lib/core/capabilities";
import { toUserFacingError } from "@/lib/core/errors";
import { summarizeKnowledge } from "@/lib/integration/knowledge";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import { getMethodologyStatus } from "@/lib/ranking/methodology";
import { checkDatabaseHealth } from "@/lib/supabase/health";

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

    return Response.json({
      status: "ok",
      knowledge: {
        loaded: true,
        concepts: summary.total,
        investigations: summary.investigations,
        verifiedConcepts: summary.humanReviewed,
        filesWithProblems: summary.issues,
      },
      database: {
        configured: capabilities.supabaseEnabled,
        ...(deep ? { check: await checkDatabaseHealth() } : {}),
      },
      retrieval: { configured: capabilities.retrievalEnabled },
      synthesis: { configured: capabilities.llmEnabled },
      methodology: { configured: getMethodologyStatus().configured },
    });
  } catch (error) {
    const { code, message, detail } = toUserFacingError(error);
    return Response.json({ status: "error", code, message, detail }, { status: 500 });
  }
}
