import type { MetadataFacet } from "./types";

/**
 * Retrieval tuning constants, in one place so a change is a one-line diff.
 *
 * These are engineering heuristics chosen to make retrieval work on a small
 * corpus. They are not scientific parameters and carry no meaning about fire
 * safety. Changes are made from the evaluation set in `tests/retrieval/`,
 * never to move a favoured investigation up the list.
 */

/** Bump when chunk boundaries or chunk text change, so stale vectors can be found. */
export const CHUNKER_VERSION = "chunker-v1";

export const CHUNKING = {
  /** Aim for chunks around this size, counting the embedded header. */
  targetTokens: 350,
  /**
   * Hard ceiling. BAAI/bge-small-en-v1.5 reads at most 512 tokens and silently
   * ignores the rest, so the ceiling sits below that with room for the
   * [CLS]/[SEP] tokens and estimation error.
   */
  maxTokens: 480,
  /** A section with less text than this is reported as empty. */
  minContentChars: 1,
} as const;

export const RETRIEVAL = {
  /** Starting point from the Member 5 brief. Re-weighted over the signals actually available. */
  weights: { vector: 0.4, lexical: 0.3, metadata: 0.3 },
  /** Candidates fetched from each signal before fusion. */
  candidatesPerSignal: 10,
  /** Default number of evidence chunks returned. */
  defaultResults: 6,
  maxResults: 12,
  /** Chunks from one investigation, unless the question names it. */
  maxPerInvestigation: 2,
  /** Team-interpretation chunks, unless the question asks for relevance or implications. */
  maxInterpretation: 1,
  /** Cosine similarity mapped to 0 and 1 for fusion. bge similarities sit in a narrow band. */
  vectorScale: { low: 0.35, high: 0.85 },
  /**
   * Raw cosine at or above which a chunk counts as supported by meaning alone,
   * with no shared term or metadata match. To be calibrated on the negative
   * queries in the evaluation set.
   */
  vectorSupportFloor: 0.72,
  /**
   * A term found in more than this share of chunks ("fire", "flame") does not
   * on its own count as support for an answer.
   */
  commonTermShare: 0.5,
  /**
   * Share of the question's distinctive terms a chunk must contain to count as
   * supported by keywords alone (rounded up, at least one). One rare word in
   * common is not support.
   */
  minDistinctiveShare: 1 / 3,
  /**
   * Raw cosine at or above which one distinctive term in common is enough
   * support. Calibrated on the dev split (2026-11-14, 13 records): the dev
   * negative questions reach at most 0.51, and every answerable dev question's
   * best expected chunk scores at least 0.65.
   */
  vectorWithKeywordFloor: 0.58,
  maxQueryChars: 500,
} as const;

/** How much each detected query facet contributes to the metadata score. */
export const FACET_WEIGHTS: Record<MetadataFacet, number> = {
  investigation: 1,
  section: 0.5,
  safety: 0.6,
  gravity: 0.6,
  material: 0.6,
  fuel: 0.4,
  hardware: 0.6,
};
