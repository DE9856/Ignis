/**
 * Small, dependency-free text helpers shared by query analysis, the in-memory
 * lexical index and match explanations. The same normalisation runs on both
 * sides of every comparison, so a query term and a chunk term either match
 * the same way everywhere or not at all.
 */

/**
 * Function words that carry no meaning for search. Deliberately short.
 * Experiment acronyms such as SAME, FLEX or BASS must never appear here:
 * Postgres drops "same" as an English stop word, and so would we.
 */
const STOP_WORDS = new Set(
  (
    "a an and are as at be been being but by can could did do does doing for from had has have how i if in into " +
    "is it its me my of on or our over so such than that the their them then there these they this those through " +
    "to under up was we were what when where which while who whom why will with would you your about any all each " +
    "other some more most also very just only own too both few nor not out off again further once here between " +
    "during before after above below tell show give find list please know get"
  ).split(/\s+/),
);

/** Lower-case, strip accents, keep letters, digits and inner hyphens. */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[₀-₉]/g, (digit) => String(digit.charCodeAt(0) - 0x2080))
    .toLowerCase();
}

/** Words of a text, lower-cased. Hyphenated names are kept whole and also split: `bass-ii` -> bass-ii, bass, ii. */
export function words(text: string): string[] {
  const out: string[] = [];
  for (const match of normalize(text).matchAll(/[a-z0-9]+(?:[-.][a-z0-9]+)*/g)) {
    const word = match[0];
    out.push(word);
    if (word.includes("-")) out.push(...word.split("-").filter(Boolean));
  }
  return out;
}

/**
 * A light, predictable stemmer: plurals and common verb endings only.
 * Enough to match "detector"/"detectors" and "studied"/"study" without the
 * surprises of a full Porter stemmer on technical terms.
 */
export function stem(word: string): string {
  if (/[0-9]/.test(word) || word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ied") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("sses")) return word.slice(0, -2);
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("es") && /(?:ch|sh|x|ss|z)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us") && !word.endsWith("is")) {
    return word.slice(0, -1);
  }
  return word;
}

/** Search terms of a text: words minus stop words, stemmed, in first-seen order, no duplicates. */
export function terms(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const word of words(text)) {
    if (STOP_WORDS.has(word)) continue;
    const term = stem(word);
    if (term.length === 0 || seen.has(term)) continue;
    seen.add(term);
    out.push(term);
  }
  return out;
}

/** Stemmed term counts for a text, for BM25 and match explanations. */
export function termCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words(text)) {
    if (STOP_WORDS.has(word)) continue;
    const term = stem(word);
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }
  return counts;
}

/**
 * Terms safe to pass to Postgres `to_tsquery`: plain [a-z0-9] runs only,
 * so no user input can inject tsquery operators.
 */
export function tsqueryTerms(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const word of words(text)) {
    if (STOP_WORDS.has(word)) continue;
    for (const part of word.split(/[-.]/)) {
      if (!/^[a-z0-9]+$/.test(part) || seen.has(part)) continue;
      seen.add(part);
      out.push(part);
    }
  }
  return out.slice(0, 32);
}

/** Whether `phrase` occurs in `text` as whole words, ignoring case and punctuation. */
export function containsPhrase(text: string, phrase: string): boolean {
  const target = words(phrase).filter((word) => !word.includes("-") || phrase.includes("-"));
  if (target.length === 0) return false;
  const haystack = ` ${words(text).join(" ")} `;
  return haystack.includes(` ${target.join(" ")} `);
}

/** Split text into sentences. Keeps decimal numbers and common abbreviations intact. */
export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(“"'])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}
