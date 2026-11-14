/**
 * Fixed wording for bounded answers. Shown as intentional answers, not errors.
 *
 * Status: draft by Member 5, pending Member 3's review (handoff H13).
 * Change wording here only; tests check the key phrase, not the full text.
 */

/** The phrase from the Member 5 brief. Every refusal contains it. */
export const NOT_ESTABLISHED = "The reviewed evidence does not establish this.";

export const BOUNDARY_MESSAGES = {
  PROBABILITY_REQUEST: `IGNIS does not calculate the probability of a fire or a mission risk level. ${NOT_ESTABLISHED} The closest reviewed evidence is listed for context only.`,
  UNIVERSAL_GUARANTEE: `${NOT_ESTABLISHED} The reviewed investigations report results for the conditions they tested; none establishes a universal guarantee or threshold.`,
  PREDICTION_REQUEST: `IGNIS does not predict or extrapolate results to conditions that were not tested. ${NOT_ESTABLISHED} Evidence that may bound the question is listed below.`,
  DESIGN_PRESCRIPTION: `IGNIS does not make design, material or equipment recommendations. ${NOT_ESTABLISHED} Related reviewed evidence is listed for engineers to assess.`,
  FALSE_PREMISE:
    "Microgravity is not the same as lunar or Martian gravity. IGNIS treats microgravity evidence as a bound for partial-gravity questions, never as a direct match.",
  INSUFFICIENT_EVIDENCE: `${NOT_ESTABLISHED} No verified passage in the IGNIS corpus supports an answer to this question.`,
} as const;

export function coverageMessage(condition: string, matches: string[]): string {
  return matches.length === 0
    ? `No reviewed investigation in the IGNIS corpus reports testing at ${condition}. ${NOT_ESTABLISHED} Microgravity and 1 g evidence can only bound this condition.`
    : `Reviewed investigations that report testing at ${condition}: ${matches.join(", ")}. Check each record's conditions before relying on it.`;
}

export function valueNotReportedMessage(investigation: string, fields: string[]): string {
  return `The reviewed record for ${investigation} does not report ${joinList(fields)}. IGNIS leaves unreported values blank rather than estimating them.`;
}

export const CONDITION_LABELS = {
  oxygen: "an oxygen concentration",
  pressure: "a pressure",
  airflow: "an airflow speed",
  gravity: "a gravity level",
  material: "the material",
  fuel: "the fuel type",
  sample: "the sample geometry or size",
} as const;

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

export const RETRIEVAL_NOTICES = {
  lexicalOnly:
    "Searched by keywords and record metadata only; meaning-based (vector) search was not available for this query.",
  staleIndex:
    "The search index was built with a different embedding version, so meaning-based search was skipped until it is rebuilt.",
  emptyIndex: "No verified evidence has been indexed yet.",
  localCorpus:
    "Searching the verified records in this deployment directly; the shared Supabase index is not configured.",
} as const;
