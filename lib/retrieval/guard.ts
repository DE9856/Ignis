import {
  BOUNDARY_MESSAGES,
  CONDITION_LABELS,
  coverageMessage,
  NOT_ESTABLISHED,
  valueNotReportedMessage,
} from "./messages";
import { normalize } from "./text";
import type { BoundaryNotice, ConditionField, EvidenceChunk, QueryUnderstanding } from "./types";

/**
 * Deterministic boundary checks (Member 5 brief, Part G).
 *
 * These run before retrieval and before any language model, so the safe
 * behaviour holds even when no LLM key is configured. Pattern matching cannot
 * catch every paraphrase; it is the first layer. The synthesis step adds a
 * second one by rejecting any number that is not in the cited evidence.
 *
 * Order matters: the first matching class wins.
 */

const PATTERNS = {
  FALSE_PREMISE:
    /\bmicro-?gravity\s+(?:is|equals|=|means|is the same as|is equivalent to|is like)\s+(?:lunar|moon|mars|martian|partial)\b|\b(?:lunar|moon|mars|martian|partial)(?:\s+gravity)?\s+(?:is|equals|=|is the same as|is equivalent to)\s+micro-?gravity\b/,
  PROBABILITY_REQUEST:
    /\b(?:probabilit\w*|likelihood|how likely|likely (?:is|are) (?:it|a|the)|chances?\s+(?:of|that)|odds|risk (?:score|level|percentage|of (?:a )?fire)|what(?:'s| is) the risk|percent(?:age)? (?:chance|risk)|how (?:risky|dangerous) is)\b/,
  PREDICTION_REQUEST:
    /\b(?:predict\w*|forecast\w*|extrapolat\w*|estimate\w*|calculate\w*|simulate\w*|model the|what (?:will|would) (?:happen|be)|how (?:fast|quickly|far) (?:will|would)|projected)\b/,
  UNIVERSAL_GUARANTEE:
    /\b(?:guarantee\w*|certain(?:ly)? (?:to|that|will)|definitely|always (?:ignite|burn|safe|extinguish)|never (?:ignite|burn|catch)|completely safe|100 ?% safe|safe (?:level|limit|threshold)|fire-?proof|cannot burn)\b/,
  DESIGN_PRESCRIPTION:
    /\b(?:should (?:nasa|we|i|they|the crew|astronauts?|engineers?|designers?) (?:use|choose|pick|select|install|adopt|switch to|build)|(?:which|what) (?:exact )?(?:material|suppressant|extinguisher|detector|sensor|fabric|design)s? should|recommend\w*|best (?:material|suppressant|extinguisher|detector|choice|option)|what should (?:nasa|we) (?:use|do))\b/,
  CORPUS_COVERAGE:
    /\b(?:directly test\w*|(?:has|have|did) (?:any|a|nasa)\b.*\b(?:test\w*|stud(?:y|ied)|run|ran|measured)|was (?:it|this|that|any \w+) (?:tested|studied)|(?:which|what|any) (?:nasa )?(?:investigations?|experiments?|studies|tests?) (?:directly )?(?:tested|studied|ran|were run|were done|were performed|took place))\b/,
} as const;

function lowered(text: string): string {
  return normalize(text).replace(/\s+/g, " ");
}

const GRAVITY_LABEL = "lunar or Martian (partial) gravity";

/** Answer "has anything been tested at partial gravity?" from record metadata. */
function partialGravityCoverage(catalog: EvidenceChunk[]): BoundaryNotice {
  const byRecord = new Map<string, EvidenceChunk>();
  for (const chunk of catalog) {
    if (chunk.gravityCondition === "partial_gravity" && chunk.investigationId)
      byRecord.set(chunk.investigationId, chunk);
  }
  const matches = [...byRecord.values()].map((chunk) =>
    chunk.metadata.gravityValue === null
      ? chunk.investigation
      : `${chunk.investigation} (${chunk.metadata.gravityValue} g)`,
  );
  const variable = new Set(
    catalog.filter((chunk) => chunk.gravityCondition === "variable").map((chunk) => chunk.investigation),
  );
  const details = [
    `Verified investigations with gravity condition "partial_gravity": ${matches.length === 0 ? "none" : matches.join(", ")}.`,
  ];
  if (variable.size > 0) {
    details.push(`Recorded as "variable" gravity, check the record: ${[...variable].join(", ")}.`);
  }
  return { kind: "CORPUS_COVERAGE", message: coverageMessage(GRAVITY_LABEL, matches), details };
}

function fieldReported(chunk: EvidenceChunk, field: ConditionField): boolean {
  const { metadata } = chunk;
  switch (field) {
    case "oxygen":
      return metadata.oxygenMin !== null || metadata.oxygenMax !== null;
    case "pressure":
      return metadata.pressureMin !== null || metadata.pressureMax !== null;
    case "airflow":
      return metadata.airflowMin !== null || metadata.airflowMax !== null;
    case "gravity":
      return chunk.gravityCondition !== null || metadata.gravityValue !== null;
    case "material":
      return chunk.material !== null;
    case "fuel":
      return chunk.fuelType !== null;
    case "sample":
      return metadata.sampleShape !== null || metadata.sampleSize !== null;
  }
}

/** When a named investigation is asked about a condition its record leaves null, say so plainly. */
function valueNotReported(
  understanding: QueryUnderstanding,
  catalog: EvidenceChunk[],
): BoundaryNotice | null {
  if (understanding.investigations.length === 0 || understanding.conditionFields.length === 0) return null;
  const details: string[] = [];
  const messages: string[] = [];
  for (const id of understanding.investigations) {
    const chunk = catalog.find((candidate) => candidate.investigationId === id);
    if (!chunk) continue;
    const missing = understanding.conditionFields.filter((field) => !fieldReported(chunk, field));
    if (missing.length === 0) continue;
    const labels = missing.map((field) => CONDITION_LABELS[field]);
    messages.push(valueNotReportedMessage(chunk.investigation, labels));
    details.push(`${chunk.investigation}: not reported in the verified record: ${missing.join(", ")}.`);
  }
  return messages.length === 0 ? null : { kind: "VALUE_NOT_REPORTED", message: messages.join(" "), details };
}

/** Acronyms that are not investigation names. */
const COMMON_ACRONYMS = new Set([
  "NASA",
  "ISS",
  "ESA",
  "JAXA",
  "CSA",
  "PSI",
  "CO2",
  "O2",
  "LED",
  "UV",
  "IR",
  "USA",
  "AI",
  "LLM",
  "SI",
  "FAQ",
  "PDF",
  "URL",
]);

/**
 * A capitalised experiment-style name ("QUASAR-9") that appears nowhere in the
 * verified corpus. Without this, the question would quietly get evidence
 * about other investigations, which reads as if it were about the named one.
 */
function unknownName(
  text: string,
  understanding: QueryUnderstanding,
  catalog: EvidenceChunk[],
): BoundaryNotice | null {
  if (understanding.investigations.length > 0) return null;
  const candidates = [...text.matchAll(/(?<![A-Za-z0-9-])[A-Z][A-Z0-9]{2,}(?:-[A-Z0-9]+)*(?![A-Za-z0-9])/g)]
    .map((match) => match[0])
    .filter((name) => !COMMON_ACRONYMS.has(name));
  if (candidates.length === 0) return null;
  const corpusText = normalize(
    catalog
      .map((chunk) =>
        [chunk.content, chunk.investigation, chunk.title, ...chunk.metadata.searchNames].join(" "),
      )
      .join(" "),
  );
  const missing = candidates.filter((name) => !corpusText.includes(normalize(name)));
  if (missing.length === 0) return null;
  return {
    kind: "INSUFFICIENT_EVIDENCE",
    message: `The IGNIS corpus has no reviewed record that mentions ${missing.join(", ")}. ${NOT_ESTABLISHED} Any evidence listed is about other investigations.`,
    details: missing.map((name) => `"${name}" does not appear in any verified record.`),
  };
}

export function classifyBoundary(
  text: string,
  understanding: QueryUnderstanding,
  catalog: EvidenceChunk[],
): BoundaryNotice | null {
  const query = lowered(text);
  const fixed = (kind: keyof typeof BOUNDARY_MESSAGES): BoundaryNotice => ({
    kind,
    message: BOUNDARY_MESSAGES[kind],
    details: [],
  });

  if (PATTERNS.FALSE_PREMISE.test(query)) return fixed("FALSE_PREMISE");
  if (PATTERNS.PROBABILITY_REQUEST.test(query)) return fixed("PROBABILITY_REQUEST");
  if (PATTERNS.PREDICTION_REQUEST.test(query)) return fixed("PREDICTION_REQUEST");
  if (PATTERNS.UNIVERSAL_GUARANTEE.test(query)) return fixed("UNIVERSAL_GUARANTEE");
  if (PATTERNS.DESIGN_PRESCRIPTION.test(query)) return fixed("DESIGN_PRESCRIPTION");
  if (PATTERNS.CORPUS_COVERAGE.test(query) && understanding.gravity.includes("partial_gravity")) {
    return partialGravityCoverage(catalog);
  }
  return valueNotReported(understanding, catalog) ?? unknownName(text, understanding, catalog);
}

/** Kinds that must never be passed to a language model for an answer. */
export function blocksSynthesis(notice: BoundaryNotice | null): boolean {
  return notice !== null && notice.kind !== "VALUE_NOT_REPORTED";
}
