import { z } from "zod";

import { NOT_ESTABLISHED } from "@/lib/retrieval/messages";
import type { EvidenceChunk } from "@/lib/retrieval/types";

import { sourceLabel } from "./prompt";
import {
  SYNTHESIS_SECTIONS,
  type RemovedStatement,
  type SynthesisSection,
  type SynthesisStatement,
} from "./types";

/**
 * The second layer of the boundary (the first is `lib/retrieval/guard.ts`).
 *
 * The model's output is treated as untrusted text. A statement is kept only
 * if every check passes; otherwise it is removed and reported:
 *
 *   1. It cites at least one supplied source, and only supplied sources.
 *   2. Every number in it appears in a source it cites. (In "limitations",
 *      numbers from the question are also allowed, so the summary can say a
 *      condition the user asked about was not tested.)
 *   3. NASA evidence cites only NASA_SOURCE passages; team interpretation
 *      cites only TEAM_INTERPRETATION passages.
 *   4. It does not state a probability, likelihood, guarantee or safety verdict.
 *
 * If no answer survives, the answer is the fixed sentence "The reviewed
 * evidence does not establish this."
 */

const MAX_STATEMENTS_PER_SECTION = 8;
const MAX_STATEMENT_CHARS = 600;

const statementSchema = z.object({
  text: z.string(),
  sources: z.array(z.string()).default([]),
});

const outputSchema = z.object({
  answer: z.array(statementSchema).default([]),
  nasaEvidence: z.array(statementSchema).default([]),
  teamInterpretation: z.array(statementSchema).default([]),
  limitations: z.array(statementSchema).default([]),
  insufficient: z.boolean().default(false),
});

export type ParsedOutput = z.infer<typeof outputSchema>;

/** Pull the JSON object out of a model reply, tolerating code fences or stray prose around it. */
export function parseModelOutput(raw: string): ParsedOutput | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = outputSchema.safeParse(JSON.parse(raw.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Citation markers the model may leave in the text: [S1], (S2, S3), S4. */
const CITATION_MARKER = /\[?\(?\bS\d+\b(?:\s*,\s*S\d+\b)*\)?\]?/g;

/** Numbers as values: "1,000" -> 1000, "0.50" -> 0.5. Hyphen ranges ("10-20") count as two numbers. */
export function numbersIn(text: string): number[] {
  const matches = text.replace(CITATION_MARKER, " ").match(/\d+(?:,\d{3})*(?:\.\d+)?/g) ?? [];
  return matches.map((match) => Number(match.replace(/,/g, ""))).filter((value) => Number.isFinite(value));
}

const VERDICT_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(probability|probabilities|likelihood|odds|chance of|risk level|risk score)\b/i,
    reason: "states a probability or risk level, which IGNIS does not calculate",
  },
  { pattern: /\bguarantee[sd]?\b/i, reason: "states a guarantee the evidence cannot establish" },
  {
    pattern: /\b(?:is|are|would be|will be)\s+(?:completely\s+|totally\s+|entirely\s+)?(?:safe|unsafe)\b/i,
    reason: "gives a safety verdict, which IGNIS does not make",
  },
];

export interface GroundingInput {
  output: ParsedOutput;
  /** Passages in the order they were labelled S1, S2, ... */
  chunks: EvidenceChunk[];
  question: string;
}

export interface GroundingResult {
  sections: Record<SynthesisSection, SynthesisStatement[]>;
  removed: RemovedStatement[];
  insufficient: boolean;
}

function chunkNumbers(chunk: EvidenceChunk): number[] {
  return numbersIn(`${chunk.investigation} ${chunk.title} ${chunk.section} ${chunk.content}`);
}

export function groundOutput({ output, chunks, question }: GroundingInput): GroundingResult {
  const byLabel = new Map(chunks.map((chunk, index) => [sourceLabel(index).toUpperCase(), chunk]));
  const numbersByChunk = new Map(chunks.map((chunk) => [chunk.id, new Set(chunkNumbers(chunk))]));
  const questionNumbers = new Set(numbersIn(question));

  const removed: RemovedStatement[] = [];
  const sections = Object.fromEntries(
    SYNTHESIS_SECTIONS.map((section) => [section, []]),
  ) as unknown as Record<SynthesisSection, SynthesisStatement[]>;

  for (const section of SYNTHESIS_SECTIONS) {
    for (const statement of output[section].slice(0, MAX_STATEMENTS_PER_SECTION)) {
      const text = statement.text
        .replace(CITATION_MARKER, "")
        .replace(/\s+/g, " ")
        .replace(/\s+([.,;:])/g, "$1")
        .trim();
      if (text === "") continue;
      const reject = (reason: string) => removed.push({ section, text, reason });

      // The fixed refusal sentence is the one statement allowed without a source.
      if (text === NOT_ESTABLISHED) {
        if (section === "answer") sections.answer.push({ text, sources: [] });
        continue;
      }
      if (text.length > MAX_STATEMENT_CHARS) {
        reject("is longer than one statement");
        continue;
      }

      const labels = [...new Set(statement.sources.map((label) => label.trim().toUpperCase()))];
      const cited = labels.map((label) => byLabel.get(label));
      if (labels.length === 0) {
        reject("cites no source");
        continue;
      }
      if (cited.some((chunk) => chunk === undefined)) {
        reject("cites a source that was not supplied");
        continue;
      }
      const sources = cited as EvidenceChunk[];

      if (section === "nasaEvidence" && sources.some((chunk) => chunk.sourceClass !== "NASA_SOURCE")) {
        reject("is listed as NASA evidence but cites team interpretation");
        continue;
      }
      if (
        section === "teamInterpretation" &&
        sources.some((chunk) => chunk.sourceClass !== "TEAM_INTERPRETATION")
      ) {
        reject("is listed as team interpretation but cites NASA source text");
        continue;
      }

      const verdict = VERDICT_PATTERNS.find(({ pattern }) => pattern.test(text));
      if (verdict) {
        reject(verdict.reason);
        continue;
      }

      const allowed = new Set(sources.flatMap((chunk) => [...(numbersByChunk.get(chunk.id) ?? [])]));
      if (section === "limitations") questionNumbers.forEach((value) => allowed.add(value));
      const unsupported = numbersIn(text).filter((value) => !allowed.has(value));
      if (unsupported.length > 0) {
        reject(`contains ${unsupported.join(", ")}, which the cited evidence does not contain`);
        continue;
      }

      sections[section].push({ text, sources: sources.map((chunk) => chunk.id) });
    }
  }

  const grounded = sections.answer.filter((statement) => statement.sources.length > 0);
  const insufficient = output.insufficient || grounded.length === 0;
  sections.answer = insufficient ? [{ text: NOT_ESTABLISHED, sources: [] }] : grounded;

  return { sections, removed, insufficient };
}
