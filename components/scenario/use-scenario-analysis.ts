"use client";

import { useMemo } from "react";

import { analyzeScenario, type ScenarioAnalysis } from "@/lib/integration/scenario";
import type { Investigation } from "@/lib/okf/types";

import {
  findFieldErrors,
  toComparableScenario,
  type FieldErrors,
  type ScenarioDraft,
} from "./scenario-draft";

export interface ScenarioAnalysisState {
  errors: FieldErrors;
  analysis: ScenarioAnalysis;
}

/**
 * Runs the deterministic analysis in lib/integration/scenario.ts for the
 * current draft. Invalid fields are reported and left out of the comparison,
 * so one typo does not blank the whole result. No scoring happens here.
 */
export function useScenarioAnalysis(
  draft: ScenarioDraft,
  investigations: Investigation[],
  includeUnverified = false,
): ScenarioAnalysisState {
  return useMemo(() => {
    const errors = findFieldErrors(draft);
    const scenario = toComparableScenario(draft, errors);
    return { errors, analysis: analyzeScenario(scenario, investigations, { includeUnverified }) };
  }, [draft, investigations, includeUnverified]);
}

/** Distinct, sorted values a field takes across records, for input suggestions. */
export function distinctValues(investigations: Investigation[], key: "material" | "fuelType"): string[] {
  return [
    ...new Set(
      investigations
        .map((investigation) => investigation[key])
        .filter((value): value is string => value !== null),
    ),
  ].sort((a, b) => a.localeCompare(b));
}
