import type { EvidenceRetriever, RetrievalQuery, RetrievalResponse } from "@/lib/retrieval/types";
import { TEST_CHUNKS } from "@/tests/fixtures/chunks";

import { assertDevOnly } from "./guard";

/**
 * LocalMockRetriever: word-overlap search over synthetic TEST chunks.
 *
 * It exists so the Evidence Desk can be built and demonstrated without a
 * database. It says nothing about retrieval quality and returns no NASA
 * evidence. Refuses to run in production.
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
        const matchedTerms = terms.filter((term) => haystack.includes(term));
        const lexical = terms.length === 0 ? 0 : matchedTerms.length / terms.length;
        return { chunk, matchedTerms, lexical };
      })
      .filter((result) => result.lexical > 0)
      .sort((a, b) => b.lexical - a.lexical || a.chunk.id.localeCompare(b.chunk.id))
      .slice(0, query.limit ?? 5)
      .map(({ chunk, matchedTerms, lexical }, index) => ({
        chunk,
        rank: index + 1,
        scores: { vector: null, lexical, metadata: null, fused: lexical },
        matchedTerms,
        matchedMetadata: [],
        neighbors: [],
      }));

    return {
      status: "ok",
      mode: "lexical_only",
      results,
      boundary: null,
      listing: null,
      understanding: {
        terms,
        investigations: [],
        safetyCategories: [],
        gravity: [],
        materials: [],
        fuels: [],
        hardware: [],
        sectionIntent: [],
        conditionFields: [],
        enumerative: false,
      },
      notice: "Synthetic test data from the dev mock. Not NASA evidence.",
    };
  }
}
