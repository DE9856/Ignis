import type { EvidenceRetriever, RetrievalQuery, RetrievalResponse } from "@/lib/retrieval/types";
import { TEST_CHUNKS } from "@/tests/fixtures/chunks";

import { assertDevOnly } from "./guard";

/**
 * LocalMockRetriever: word-overlap search over synthetic TEST chunks.
 *
 * It exists so the Evidence Desk can be built and demonstrated before the real
 * retriever is ready. It says nothing about retrieval quality and returns no
 * NASA evidence. Refuses to run in production.
 */
export class LocalMockRetriever implements EvidenceRetriever {
  async search(query: RetrievalQuery): Promise<RetrievalResponse> {
    assertDevOnly("LocalMockRetriever");

    const terms = query.text
      .toLowerCase()
      .split(/\W+/)
      .filter((term) => term.length > 2);
    const filters = query.filters ?? {};

    const results = TEST_CHUNKS.filter((chunk) => {
      if (
        filters.safetyCategories &&
        !filters.safetyCategories.some((c) => chunk.safetyCategories.includes(c))
      ) {
        return false;
      }
      if (filters.investigationIds && !filters.investigationIds.includes(chunk.investigationId ?? ""))
        return false;
      if (filters.gravityCondition && chunk.gravityCondition !== filters.gravityCondition) return false;
      return true;
    })
      .map((chunk) => {
        const haystack = `${chunk.title} ${chunk.section} ${chunk.content}`.toLowerCase();
        const matched = terms.filter((term) => haystack.includes(term)).length;
        const lexicalScore = terms.length === 0 ? 0 : matched / terms.length;
        return { chunk, lexicalScore, vectorScore: null, combinedScore: lexicalScore };
      })
      .filter((result) => result.combinedScore > 0)
      .sort((a, b) => b.combinedScore - a.combinedScore || a.chunk.id.localeCompare(b.chunk.id))
      .slice(0, query.limit ?? 5);

    return { status: "ok", results };
  }
}
