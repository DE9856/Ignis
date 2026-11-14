import { areDevMocksEnabled } from "@/lib/core/capabilities";
import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { canUseForRetrieval } from "@/lib/domain/provenance";
import { getRetriever, RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";
import type {
  EvidenceRetriever,
  QueryUnderstanding,
  RetrievalQuery,
  RetrievalResponse,
  RetrievedEvidence,
} from "@/lib/retrieval/types";

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

/** What a blank question "understood": nothing. */
export const EMPTY_UNDERSTANDING: QueryUnderstanding = {
  terms: [],
  investigations: [],
  safetyCategories: [],
  gravity: [],
  materials: [],
  fuels: [],
  hardware: [],
  sectionIntent: [],
  conditionFields: [],
  enumerative: false,
};

function isTrusted(result: RetrievedEvidence, includeUnverified: boolean): boolean {
  return canUseForRetrieval(
    { sourceClass: result.chunk.sourceClass, humanReviewed: result.chunk.verificationStatus === "verified" },
    { includeUnverified },
  );
}

/**
 * On the server, search directly: the HTTP retriever posts to a relative URL,
 * which only resolves in a browser. The dynamic import keeps the database
 * client, the model and `node:fs` out of client bundles.
 */
async function liveRetriever(): Promise<EvidenceRetriever> {
  if (typeof window !== "undefined") return getRetriever();
  const { getServerRetriever } = await import("@/lib/retrieval/server");
  return getServerRetriever();
}

export async function retrieveEvidence(
  query: RetrievalQuery,
  options: RetrieveEvidenceOptions = {},
): Promise<EvidenceRetrievalResult> {
  const text = query.text.trim();
  if (text === "") {
    return {
      status: "ok",
      mode: "lexical_only",
      results: [],
      boundary: null,
      listing: null,
      understanding: EMPTY_UNDERSTANDING,
      notice: null,
      origin: "none",
    };
  }

  const useMock = areDevMocksEnabled() && !RETRIEVAL_IMPLEMENTED;

  try {
    let response: RetrievalResponse;
    if (useMock) {
      // Dynamic import keeps the mock and its synthetic data out of production bundles.
      const { LocalMockRetriever } = await import("@/lib/dev/mock-retriever");
      response = await new LocalMockRetriever().search({ ...query, text });
    } else {
      response = await (await liveRetriever()).search({ ...query, text });
    }

    const origin: RetrievalOrigin = useMock ? "dev-mock" : RETRIEVAL_IMPLEMENTED ? "live" : "none";
    if (response.status !== "ok") return { ...response, origin };

    const results = response.results
      .filter((result) => isTrusted(result, options.includeUnverified === true))
      .map((result, index) => ({ ...result, rank: index + 1 }));
    return { ...response, results, origin };
  } catch {
    return { status: "unavailable", reason: DEGRADED_MESSAGES.noRetrieval, origin: "none" };
  }
}
