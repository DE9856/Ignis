import { createHttpRetriever } from "./http-client";
import type { EvidenceRetriever } from "./types";

/**
 * Public entry point for the UI. Safe in client components: it only exports
 * types, constants and the HTTP retriever. Server code that needs the
 * database or the model imports `lib/retrieval/server` instead.
 */

export * from "./types";
export { NOT_ESTABLISHED, BOUNDARY_MESSAGES } from "./messages";
export { SEARCH_ENDPOINT } from "./http-client";

const retriever = createHttpRetriever();

/** Single entry point for the UI. Calls `POST /api/evidence/search`. */
export function getRetriever(): EvidenceRetriever {
  return retriever;
}
