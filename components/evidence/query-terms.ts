/**
 * Query terms for display: which words of the question appear in a passage.
 * Presentation only. It is not the retriever's scoring and is labelled as such.
 */

const STOPWORDS = new Set([
  "about",
  "and",
  "are",
  "can",
  "did",
  "does",
  "for",
  "from",
  "has",
  "have",
  "how",
  "into",
  "its",
  "the",
  "that",
  "their",
  "then",
  "there",
  "this",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
]);

export function queryTerms(query: string): string[] {
  return [
    ...new Set(
      query
        .toLowerCase()
        .split(/[^\p{L}\p{N}-]+/u)
        .filter((term) => term.length > 2 && !STOPWORDS.has(term)),
    ),
  ];
}

export function termsFoundIn(terms: string[], text: string): string[] {
  const haystack = text.toLowerCase();
  return terms.filter((term) => haystack.includes(term));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split text into plain and matched parts, for <mark> highlighting. */
export function highlightParts(text: string, terms: string[]): { text: string; match: boolean }[] {
  if (terms.length === 0) return [{ text, match: false }];
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return text
    .split(pattern)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, match: terms.includes(part.toLowerCase()) }));
}
