import type { EvidenceRetriever, RetrievalQuery, RetrievalResponse } from "./types";

/**
 * Browser-side retriever: sends the question to the server route, which holds
 * the database key and the embedding model. Safe to import in client components.
 */

export const SEARCH_ENDPOINT = "/api/evidence/search";

function isRetrievalResponse(value: unknown): value is RetrievalResponse {
  if (typeof value !== "object" || value === null) return false;
  const status = (value as { status?: unknown }).status;
  return status === "ok" || status === "unavailable";
}

export function createHttpRetriever(
  endpoint: string = SEARCH_ENDPOINT,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): EvidenceRetriever {
  return {
    async search(query: RetrievalQuery): Promise<RetrievalResponse> {
      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        const body: unknown = await response.json().catch(() => null);
        if (isRetrievalResponse(body)) return body;
        const message = (body as { error?: unknown } | null)?.error;
        return {
          status: "unavailable",
          reason: typeof message === "string" ? message : `Search service returned HTTP ${response.status}.`,
        };
      } catch {
        return { status: "unavailable", reason: "The search service could not be reached." };
      }
    },
  };
}
