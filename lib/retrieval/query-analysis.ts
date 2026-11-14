import type { GravityCondition, SafetyObjective } from "@/lib/okf/types";

import { normalize, terms, words } from "./text";
import type { ChunkType, ConditionField, EvidenceChunk, QueryUnderstanding } from "./types";

/**
 * Rule-based reading of a question: which investigations, safety roles,
 * gravity levels, materials, sections and conditions it is about.
 *
 * No language model is involved. Investigation names, materials, fuels and
 * hardware come from the verified corpus itself, so adding a record needs no
 * code change. The keyword lists for safety roles follow Member 3's category
 * definitions and are pending Member 3's review.
 */

export interface CorpusVocabulary {
  investigations: { id: string; display: string; names: string[] }[];
  materials: string[];
  fuels: string[];
  hardware: string[];
  /** Chunks containing each stemmed term, for "is this term too common to count as support". */
  documentFrequency: Map<string, number>;
  chunkCount: number;
}

/**
 * Experiment acronyms that are also ordinary English words. They count as a
 * mention only when written in capitals ("SAME") or next to a word that marks
 * an experiment name ("same experiment", "SAME-R"); otherwise "burns the
 * same" would point at the SAME investigation.
 */
const AMBIGUOUS_NAMES = new Set([
  "same",
  "flex",
  "bass",
  "spice",
  "slice",
  "acme",
  "cool",
  "fire",
  "flame",
  "light",
]);
const NAME_CONTEXT =
  /^(?:experiment|investigation|project|study|studies|hardware|insert|payload|test|tests|series|campaign)\b/;

function canonical(text: string): string {
  return normalize(text)
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Span {
  start: number;
  end: number;
}

/** Where `name` occurs in `query` as whole words, with case rules for ambiguous acronyms. */
function nameSpans(query: string, name: string): Span[] {
  const target = canonical(name);
  if (target.length < 2) return [];
  const haystack = canonical(query);
  const spans: Span[] = [];
  const pattern = new RegExp(
    `(?<![a-z0-9])${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`,
    "g",
  );
  for (const match of haystack.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + target.length;
    if (AMBIGUOUS_NAMES.has(target)) {
      // Capitals required whatever spelling the record uses, so the lower-case record id cannot bypass it.
      const written = new RegExp(`(?<![A-Za-z0-9])${target.toUpperCase()}(?![a-z])`);
      const after = haystack.slice(end).trim();
      if (!written.test(query) && !NAME_CONTEXT.test(after)) continue;
    }
    spans.push({ start, end });
  }
  return spans;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function buildVocabulary(chunks: EvidenceChunk[]): CorpusVocabulary {
  const byInvestigation = new Map<string, { id: string; display: string; names: Set<string> }>();
  const materials = new Set<string>();
  const fuels = new Set<string>();
  const hardware = new Set<string>();
  const documentFrequency = new Map<string, number>();

  for (const chunk of chunks) {
    const id = chunk.investigationId ?? chunk.id;
    const entry = byInvestigation.get(id) ?? { id, display: chunk.investigation, names: new Set<string>() };
    for (const name of [chunk.investigation, chunk.title, id, ...chunk.metadata.searchNames]) {
      if (name && !chunk.metadata.hardware.includes(name) && name !== chunk.metadata.platform)
        entry.names.add(name);
    }
    byInvestigation.set(id, entry);
    if (chunk.material) materials.add(chunk.material);
    if (chunk.fuelType) fuels.add(chunk.fuelType);
    for (const item of [...chunk.metadata.hardware, chunk.metadata.platform]) if (item) hardware.add(item);

    const chunkTerms = new Set(
      terms(
        `${chunk.content} ${chunk.section} ${chunk.investigation} ${chunk.title} ${chunk.tags.join(" ")}`,
      ),
    );
    for (const term of chunkTerms) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }

  return {
    investigations: [...byInvestigation.values()].map((entry) => ({
      id: entry.id,
      display: entry.display,
      names: [...entry.names],
    })),
    materials: [...materials],
    fuels: [...fuels],
    hardware: [...hardware],
    documentFrequency,
    chunkCount: chunks.length,
  };
}

/** Investigations named in the question. A longer name wins over a name inside it ("SAME-R" over "SAME"). */
function detectInvestigations(query: string, vocabulary: CorpusVocabulary): string[] {
  const hits: { id: string; span: Span }[] = [];
  for (const investigation of vocabulary.investigations) {
    for (const name of investigation.names) {
      for (const span of nameSpans(query, name)) hits.push({ id: investigation.id, span });
    }
  }
  const kept = hits.filter(
    (hit) =>
      !hits.some(
        (other) =>
          other !== hit &&
          other.span.start <= hit.span.start &&
          other.span.end >= hit.span.end &&
          other.span.end - other.span.start > hit.span.end - hit.span.start,
      ),
  );
  return unique(kept.map((hit) => hit.id));
}

function detectPhrases(query: string, phrases: string[]): string[] {
  return phrases.filter((phrase) => nameSpans(query, phrase).length > 0);
}

const SAFETY_PATTERNS: Record<SafetyObjective, RegExp> = {
  prevention:
    /\b(prevent\w*|ignit\w*|flammab\w*|flame spread\w*|spread\w* (?:of |over )?flame\w*|burn\w*|combustib\w*|fire hazard\w*|material selection)\b/,
  detection: /\b(detect\w*|smoke\w*|aerosol\w*|particulate\w*|particle\w*|alarm\w*|early warning)\b/,
  suppression:
    /\b(suppress\w*|extinguish\w*|extinction\w*|put(?:ting)? out|quench\w*|fire ?fight\w*|water mist|inert\w*)\b/,
};

const GRAVITY_PATTERNS: [GravityCondition, RegExp][] = [
  [
    "partial_gravity",
    /\b(lunar|moon|mars|martian|partial[ -]?g(?:ravity)?|reduced gravity|0?\.16 ?g|0?\.38 ?g)\b/,
  ],
  [
    "microgravity",
    /\b(micro-?gravity|weightless\w*|zero[ -]?g(?:ravity)?|in orbit|orbital|space station|iss)\b/,
  ],
  [
    "normal_gravity",
    /\b(1 ?g|normal gravity|earth gravity|on earth|ground[ -]based|ground test\w*|terrestrial)\b/,
  ],
];

const SECTION_PATTERNS: [ChunkType, RegExp][] = [
  ["OBJECTIVE", /\b(objective\w*|goal\w*|aim\w*|purpose|trying to (?:learn|find|study)|why (?:was|did))\b/],
  [
    "CONDITIONS",
    /\b(condition\w*|oxygen|o2|pressure\w*|airflow|air flow|flow speed|flow velocity|ventilation|atmosphere|sample (?:size|geometry|shape))\b/,
  ],
  ["VARIABLES", /\b(variable\w*|varied|parameter\w*|independent|dependent)\b/],
  [
    "MEASUREMENT",
    /\b(measur\w*|sensor\w*|instrument\w*|camera\w*|diagnostic\w*|recorded|data (?:collected|captured))\b/,
  ],
  ["FINDING", /\b(find\w*|found|result\w*|learn\w*|discover\w*|show(?:ed|n)?|conclu\w*|outcome\w*)\b/],
  [
    "LIMITATION",
    /\b(limitation\w*|caveat\w*|uncertain\w*|unknown\w*|missing|gap\w*|not tested|weakness\w*)\b/,
  ],
  [
    "INTERPRETATION",
    /\b(relevan\w*|implication\w*|mean for|matter for|habitat\w*|crew|mission\w*|spacecraft design)\b/,
  ],
];

const CONDITION_PATTERNS: [ConditionField, RegExp][] = [
  ["oxygen", /\b(oxygen|o2)\b/],
  ["pressure", /\b(pressure\w*|kpa|psi|atm)\b/],
  ["airflow", /\b(airflow|air flow|flow (?:speed|velocity|rate)|ventilation|forced flow)\b/],
  ["gravity", /\b(gravity level|g[ -]level|what gravity|which gravity)\b/],
  ["material", /\b(what material|which material|material (?:was|were|did))\b/],
  ["fuel", /\b(what fuel|which fuel|fuel (?:type|was|were))\b/],
  ["sample", /\b(sample (?:size|geometry|shape|dimension\w*)|thickness|how (?:big|large|thick))\b/],
];

const ENUMERATIVE =
  /^\s*(?:which|what)\s+(?:nasa\s+)?(?:investigations?|experiments?|studies|tests?|projects?)\b|\blist\b|\bhow many\b|\ball (?:the )?(?:investigations|experiments|studies)\b|\bany (?:investigations|experiments|studies)\b/;

export function analyzeQuery(text: string, vocabulary: CorpusVocabulary): QueryUnderstanding {
  const lower = canonical(text);
  const spaced = ` ${words(text).join(" ")} `;
  const match = (pattern: RegExp) => pattern.test(lower) || pattern.test(spaced);

  return {
    terms: terms(text),
    investigations: detectInvestigations(text, vocabulary),
    safetyCategories: (Object.keys(SAFETY_PATTERNS) as SafetyObjective[]).filter((key) =>
      match(SAFETY_PATTERNS[key]),
    ),
    gravity: GRAVITY_PATTERNS.filter(([, pattern]) => match(pattern)).map(([condition]) => condition),
    materials: detectPhrases(text, vocabulary.materials),
    fuels: detectPhrases(text, vocabulary.fuels),
    hardware: detectPhrases(text, vocabulary.hardware),
    sectionIntent: SECTION_PATTERNS.filter(([, pattern]) => match(pattern)).map(([type]) => type),
    conditionFields: CONDITION_PATTERNS.filter(([, pattern]) => match(pattern)).map(([field]) => field),
    enumerative: ENUMERATIVE.test(lower),
  };
}

/** Whether a stemmed term appears in so many chunks that it says nothing on its own. */
export function isCommonTerm(term: string, vocabulary: CorpusVocabulary, share: number): boolean {
  if (vocabulary.chunkCount === 0) return false;
  return (vocabulary.documentFrequency.get(term) ?? 0) / vocabulary.chunkCount > share;
}
