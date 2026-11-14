import { z } from "zod";

import { BOUNDARY_KINDS, CHUNK_TYPES, type EvidenceChunk, type RetrievalResponse } from "./types";

/**
 * Retrieval evaluation (Member 5 brief, Part F): Top-1/3/5 hit rate and MRR,
 * reported beside what random ranking would score, plus section-level hits,
 * list recall and the pass rate on questions that have no answer.
 *
 * Why the chance baseline: with only a handful of investigations, five
 * results spread over three or more of them hit an expected one by luck
 * fairly often, so a bare Top-5 number would overstate quality.
 */

const evalCaseSchema = z.object({
  id: z.string(),
  split: z.enum(["dev", "holdout"]),
  category: z.string(),
  kind: z.enum(["specific", "enumerative", "negative"]),
  query: z.string().min(1),
  expected: z.array(z.string()),
  expectedSections: z.array(z.enum(CHUNK_TYPES)).optional(),
  labelSource: z.string().optional(),
  /** A notice the answer must carry, e.g. PARTIAL_GRAVITY_BOUND for a lunar question. */
  expectedBoundary: z.enum(BOUNDARY_KINDS).optional(),
});
export type EvalCase = z.infer<typeof evalCaseSchema>;

export const evalSetSchema = z.object({ cases: z.array(evalCaseSchema).min(1) }).passthrough();

export function parseEvalSet(json: unknown): EvalCase[] {
  const cases = evalSetSchema.parse(json).cases;
  const ids = new Set<string>();
  for (const item of cases) {
    if (ids.has(item.id)) throw new Error(`Duplicate evaluation id ${item.id}`);
    ids.add(item.id);
    if (item.kind === "negative" && item.expected.length > 0)
      throw new Error(`${item.id}: a negative query has no expected records`);
  }
  return cases;
}

export const K_VALUES = [1, 3, 5] as const;

/** Probability that k chunks drawn at random from n include at least one of m relevant ones. */
export function chanceHitAtK(n: number, m: number, k: number): number {
  if (m <= 0 || n <= 0) return 0;
  if (k >= n || m > n - k) return 1;
  let missAll = 1;
  for (let index = 0; index < k; index += 1) missAll *= (n - m - index) / (n - index);
  return 1 - missAll;
}

export interface CaseOutcome {
  id: string;
  split: EvalCase["split"];
  category: string;
  kind: EvalCase["kind"];
  query: string;
  scorable: boolean;
  /** Why the case is not scorable yet, e.g. labels missing. */
  skipReason: string | null;
  /** Investigation of each returned chunk, in rank order. */
  ranked: string[];
  hit: Record<(typeof K_VALUES)[number], boolean>;
  chance: Record<(typeof K_VALUES)[number], number>;
  reciprocalRank: number;
  sectionHitAt3: boolean | null;
  recall: number | null;
  negativePass: boolean | null;
  /** Whether the expected notice was shown; null when none is expected. */
  boundaryOk: boolean | null;
  /** Returned investigations not in the expected list, for manual review of false positives. */
  unexpected: string[];
}

export function scoreCase(
  item: EvalCase,
  response: RetrievalResponse,
  catalog: EvidenceChunk[],
): CaseOutcome {
  const results = response.status === "ok" ? response.results : [];
  const ranked = results.map((result) => result.chunk.investigationId ?? result.chunk.id);
  const known = new Set(catalog.map((chunk) => chunk.investigationId));
  const base: CaseOutcome = {
    id: item.id,
    split: item.split,
    category: item.category,
    kind: item.kind,
    query: item.query,
    scorable: true,
    skipReason: null,
    ranked,
    hit: { 1: false, 3: false, 5: false },
    chance: { 1: 0, 3: 0, 5: 0 },
    reciprocalRank: 0,
    sectionHitAt3: null,
    recall: null,
    negativePass: null,
    boundaryOk:
      item.expectedBoundary === undefined
        ? null
        : response.status === "ok" && response.boundary?.kind === item.expectedBoundary,
    unexpected: [],
  };

  if (item.kind === "negative") {
    const pass =
      response.status === "ok" && results.length === 0 && response.boundary?.kind === "INSUFFICIENT_EVIDENCE";
    return { ...base, negativePass: pass };
  }
  if (item.expected.length === 0) return { ...base, scorable: false, skipReason: "no labels yet" };
  const missing = item.expected.filter((id) => !known.has(id));
  if (missing.length > 0) {
    return { ...base, scorable: false, skipReason: `not verified in this corpus: ${missing.join(", ")}` };
  }

  const expected = new Set(item.expected);
  const firstHit = ranked.findIndex((id) => expected.has(id));
  const relevantChunks = catalog.filter((chunk) => expected.has(chunk.investigationId ?? "")).length;
  const hit = { 1: false, 3: false, 5: false };
  const chance = { 1: 0, 3: 0, 5: 0 };
  for (const k of K_VALUES) {
    hit[k] = firstHit !== -1 && firstHit < k;
    chance[k] = chanceHitAtK(catalog.length, relevantChunks, k);
  }
  const sections = item.expectedSections;
  const sectionHitAt3 = sections
    ? results
        .slice(0, 3)
        .some(
          (result) =>
            expected.has(result.chunk.investigationId ?? "") && sections.includes(result.chunk.chunkType),
        )
    : null;
  const found = new Set(ranked.filter((id) => expected.has(id)));

  return {
    ...base,
    hit,
    chance,
    reciprocalRank: firstHit === -1 ? 0 : 1 / (firstHit + 1),
    sectionHitAt3,
    recall: item.kind === "enumerative" ? found.size / expected.size : null,
    unexpected: [...new Set(ranked.filter((id) => !expected.has(id)))],
  };
}

export interface MetricSummary {
  label: string;
  scored: number;
  notScorable: number;
  hit: Record<(typeof K_VALUES)[number], number | null>;
  chance: Record<(typeof K_VALUES)[number], number | null>;
  mrr: number | null;
  sectionHitAt3: number | null;
  sectionCases: number;
  recall: number | null;
  recallCases: number;
  negativePass: number | null;
  negativeCases: number;
}

function mean(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarize(label: string, outcomes: CaseOutcome[]): MetricSummary {
  const scored = outcomes.filter((outcome) => outcome.scorable && outcome.kind !== "negative");
  const sections = scored.filter((outcome) => outcome.sectionHitAt3 !== null);
  const lists = scored.filter((outcome) => outcome.recall !== null);
  const negatives = outcomes.filter((outcome) => outcome.kind === "negative");
  const metric = (pick: (outcome: CaseOutcome) => number) => mean(scored.map(pick));
  return {
    label,
    scored: scored.length,
    notScorable: outcomes.filter((outcome) => !outcome.scorable).length,
    hit: {
      1: metric((outcome) => Number(outcome.hit[1])),
      3: metric((outcome) => Number(outcome.hit[3])),
      5: metric((outcome) => Number(outcome.hit[5])),
    },
    chance: {
      1: metric((outcome) => outcome.chance[1]),
      3: metric((outcome) => outcome.chance[3]),
      5: metric((outcome) => outcome.chance[5]),
    },
    mrr: metric((outcome) => outcome.reciprocalRank),
    sectionHitAt3: mean(sections.map((outcome) => Number(outcome.sectionHitAt3))),
    sectionCases: sections.length,
    recall: mean(lists.map((outcome) => outcome.recall as number)),
    recallCases: lists.length,
    negativePass: mean(negatives.map((outcome) => Number(outcome.negativePass))),
    negativeCases: negatives.length,
  };
}

const pct = (value: number | null) => (value === null ? "n/a" : `${Math.round(value * 100)}%`);

export function renderReport(input: {
  summaries: MetricSummary[];
  outcomes: CaseOutcome[];
  meta: Record<string, string>;
}): string {
  const lines: string[] = [
    "# Retrieval evaluation",
    "",
    "Generated by `scripts/evaluate.ts`. Do not edit by hand; re-run the script.",
    "",
    ...Object.entries(input.meta).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "Hit@k: an expected investigation is among the first k evidence chunks. Chance: the same rate if chunks were ranked at random.",
    "",
    "| Set | Scored | Hit@1 (chance) | Hit@3 (chance) | Hit@5 (chance) | MRR | Section hit@3 | List recall | Negatives passed | Not scorable |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const summary of input.summaries) {
    lines.push(
      `| ${summary.label} | ${summary.scored} | ${pct(summary.hit[1])} (${pct(summary.chance[1])}) | ${pct(summary.hit[3])} (${pct(summary.chance[3])}) | ${pct(summary.hit[5])} (${pct(summary.chance[5])}) | ${summary.mrr === null ? "n/a" : summary.mrr.toFixed(2)} | ${pct(summary.sectionHitAt3)} of ${summary.sectionCases} | ${pct(summary.recall)} of ${summary.recallCases} | ${pct(summary.negativePass)} of ${summary.negativeCases} | ${summary.notScorable} |`,
    );
  }
  const noticeCases = input.outcomes.filter((outcome) => outcome.boundaryOk !== null);
  if (noticeCases.length > 0) {
    const shown = noticeCases.filter((outcome) => outcome.boundaryOk).length;
    lines.push("", `Expected notices shown: ${shown} of ${noticeCases.length}.`);
  }
  lines.push(
    "",
    "## Per question",
    "",
    "| Id | Split | Kind | Query | Result | Top investigations | Unexpected |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const outcome of input.outcomes) {
    const result = !outcome.scorable
      ? `not scored: ${outcome.skipReason}`
      : outcome.kind === "negative"
        ? outcome.negativePass
          ? "pass"
          : "FAIL"
        : outcome.hit[5]
          ? `hit at ${Math.round(1 / outcome.reciprocalRank)}`
          : "MISS";
    const notice =
      outcome.boundaryOk === null ? "" : outcome.boundaryOk ? "; notice shown" : "; NOTICE MISSING";
    lines.push(
      `| ${outcome.id} | ${outcome.split} | ${outcome.kind} | ${outcome.query.replace(/\|/g, "/")} | ${result}${notice} | ${[...new Set(outcome.ranked)].slice(0, 5).join(", ") || "none"} | ${outcome.unexpected.join(", ") || "-"} |`,
    );
  }
  lines.push(
    "",
    "## Reading these numbers",
    "",
    "- The set is small, so one question moves a rate by several points. Treat differences under about 10 points as noise.",
    "- Weights are tuned on `dev` only. `holdout` is scored once weights are fixed.",
    "- False positives in the Unexpected column are reviewed by hand; see docs/retrieval.md.",
    "",
  );
  return lines.join("\n");
}
