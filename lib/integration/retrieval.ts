import { areDevMocksEnabled } from "@/lib/core/capabilities";
import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { canUseForRetrieval } from "@/lib/domain/provenance";
import { getRetriever, RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";
import type { RetrievalQuery, RetrievalResponse, RetrievedEvidence } from "@/lib/retrieval/types";

/**
 * The one function the interface calls to search evidence.
 *
 * It adds what every caller would otherwise repeat: input checking, the
 * dev-mock switch, the trust filter, and a guarantee that a failure comes back
 * as an `unavailable` response instead of an exception.
 */

export type RetrievalOrigin = "live" | "dev-mock" | "none";

export type EvidenceRetrievalResult = RetrievalResponse & {
  /** Where the results came from. `dev-mock` results are synthetic. */
  origin: RetrievalOrigin;
};

export interface RetrieveEvidenceOptions {
  /** Review tooling only. Defaults to false: unverified chunks are dropped. */
  includeUnverified?: boolean;
}

function isTrusted(result: RetrievedEvidence, includeUnverified: boolean): boolean {
  return canUseForRetrieval(
    { sourceClass: result.chunk.sourceClass, humanReviewed: result.chunk.verificationStatus === "verified" },
    { includeUnverified },
  );
}

export async function retrieveEvidence(
  query: RetrievalQuery,
  options: RetrieveEvidenceOptions = {},
): Promise<EvidenceRetrievalResult> {
  const text = query.text.trim();
  if (text === "") {
    return { status: "ok", results: [], origin: "none" };
  }

  const useMock = areDevMocksEnabled() && !RETRIEVAL_IMPLEMENTED;

  try {
    let response: RetrievalResponse;
    if (useMock) {
      // Dynamic import keeps the mock and its synthetic data out of production bundles.
      const { LocalMockRetriever } = await import("@/lib/dev/mock-retriever");
      response = await new LocalMockRetriever().search({ ...query, text });
    } else {
      response = await getRetriever().search({ ...query, text });
    }

    const origin: RetrievalOrigin = useMock ? "dev-mock" : RETRIEVAL_IMPLEMENTED ? "live" : "none";
    if (response.status !== "ok") return { ...response, origin };

    // Spread first so optional fields (boundary, listing, notice, mode) reach the interface.
    return {
      ...response,
      status: "ok",
      results: response.results.filter((result) => isTrusted(result, options.includeUnverified === true)),
      origin,
    };
  } catch {
    return { status: "unavailable", reason: DEGRADED_MESSAGES.noRetrieval, origin: "none" };
  }
}
