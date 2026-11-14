import { SCENARIO_FACTORS, type CoverageLevel, type GapFinding, type RelevanceResult } from "./types";

/**
 * Deterministic evidence-gap analysis.
 *
 * For each factor the scenario specifies, report whether the ranked
 * investigations cover it. Factors the scenario left blank are omitted.
 */
export function analyzeGaps(results: RelevanceResult[]): GapFinding[] {
  const findings: GapFinding[] = [];

  for (const factor of SCENARIO_FACTORS) {
    const outcomes = results.map(
      (result) =>
        result.factors.find((assessment) => assessment.factor === factor)?.outcome ?? "not_specified",
    );
    if (outcomes.length > 0 && outcomes.every((outcome) => outcome === "not_specified")) continue;

    const matched = outcomes.filter((outcome) => outcome === "match").length;
    const mismatched = outcomes.filter((outcome) => outcome === "mismatch").length;
    const unknown = outcomes.filter((outcome) => outcome === "unknown").length;

    let level: CoverageLevel = "gap";
    if (outcomes.length === 0) level = "no_evidence";
    else if (matched > 0) level = "covered";
    else if (unknown > 0) level = "unknown";

    findings.push({ factor, level, matched, mismatched, unknown });
  }

  return findings;
}
