import type { EvidenceRetriever } from "./types";

export * from "./types";

export const RETRIEVAL_NOT_IMPLEMENTED =
  "Evidence retrieval is not implemented yet. Chunking, embedding and hybrid search are planned on feat/search-rag.";

/** Placeholder retriever. It never returns evidence, so it cannot invent any. */
const unavailableRetriever: EvidenceRetriever = {
  async search() {
    return { status: "unavailable", reason: RETRIEVAL_NOT_IMPLEMENTED };
  },
};

/** Single entry point for the UI. Swap the implementation here when it exists. */
export function getRetriever(): EvidenceRetriever {
  return unavailableRetriever;
}
