"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { findScenarioProblems } from "@/lib/integration/scenario";
import { SAFETY_OBJECTIVES, type SafetyObjective } from "@/lib/okf/types";
import type { MissionScenario } from "@/lib/ranking/types";
import { parseOptionalNumber } from "@/lib/utils/numbers";

/** Raw form values. Everything is a string until `toScenario` normalises it. */
export interface ScenarioDraft {
  presetId: string;
  name: string;
  description: string;
  oxygenPercent: string;
  pressureKPa: string;
  airflowMetersPerSecond: string;
  gravityG: string;
  material: string;
  fuelType: string;
  safetyObjective: string;
  assumptionNotes: string;
}

/** Deliberately blank: the form never suggests cabin conditions the user did not enter. */
export const EMPTY_SCENARIO_DRAFT: ScenarioDraft = {
  presetId: "",
  name: "",
  description: "",
  oxygenPercent: "",
  pressureKPa: "",
  airflowMetersPerSecond: "",
  gravityG: "",
  material: "",
  fuelType: "",
  safetyObjective: "",
  assumptionNotes: "",
};

export type NumericDraftKey = "oxygenPercent" | "pressureKPa" | "airflowMetersPerSecond" | "gravityG";

export const NUMERIC_FIELDS: { key: NumericDraftKey; label: string; unit: string; hint: string }[] = [
  { key: "oxygenPercent", label: "Oxygen", unit: "% O₂", hint: "percent by volume" },
  { key: "pressureKPa", label: "Pressure", unit: "kPa", hint: "absolute, kPa" },
  { key: "gravityG", label: "Gravity", unit: "g", hint: "1 g = Earth surface" },
  { key: "airflowMetersPerSecond", label: "Airflow", unit: "m/s", hint: "forced flow speed" },
];

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Normalise raw form input. Blank fields become null; nothing is defaulted. */
export function toScenario(draft: ScenarioDraft): MissionScenario {
  const objective = SAFETY_OBJECTIVES.find((candidate) => candidate === draft.safetyObjective);
  return {
    id: draft.presetId || "draft",
    name: draft.name.trim(),
    description: optionalText(draft.description),
    oxygenPercent: parseOptionalNumber(draft.oxygenPercent),
    pressureKPa: parseOptionalNumber(draft.pressureKPa),
    airflowMetersPerSecond: parseOptionalNumber(draft.airflowMetersPerSecond),
    gravityG: parseOptionalNumber(draft.gravityG),
    material: optionalText(draft.material),
    fuelType: optionalText(draft.fuelType),
    safetyObjective: (objective ?? null) as SafetyObjective | null,
    assumptionNotes: optionalText(draft.assumptionNotes),
  };
}

/** A preset (or any scenario) as editable form values. */
export function scenarioToDraft(scenario: MissionScenario): ScenarioDraft {
  const text = (value: number | null) => (value === null ? "" : String(value));
  return {
    presetId: scenario.id,
    name: scenario.name,
    description: scenario.description ?? "",
    oxygenPercent: text(scenario.oxygenPercent),
    pressureKPa: text(scenario.pressureKPa),
    airflowMetersPerSecond: text(scenario.airflowMetersPerSecond),
    gravityG: text(scenario.gravityG),
    material: scenario.material ?? "",
    fuelType: scenario.fuelType ?? "",
    safetyObjective: scenario.safetyObjective ?? "",
    assumptionNotes: scenario.assumptionNotes ?? "",
  };
}

export type FieldErrors = Partial<Record<NumericDraftKey, string>>;

const PROBLEM_PREFIX: Record<NumericDraftKey, string> = {
  oxygenPercent: "Oxygen",
  pressureKPa: "Pressure",
  airflowMetersPerSecond: "Airflow",
  gravityG: "Gravity",
};

/**
 * Per-field problems. Text that is not a number is reported rather than being
 * silently read as blank; physical limits come from findScenarioProblems().
 */
export function findFieldErrors(draft: ScenarioDraft): FieldErrors {
  const errors: FieldErrors = {};
  const problems = findScenarioProblems(toScenario(draft));
  for (const { key } of NUMERIC_FIELDS) {
    if (draft[key].trim() !== "" && parseOptionalNumber(draft[key]) === null) {
      errors[key] = "Enter a number, or leave blank";
      continue;
    }
    const problem = problems.find((entry) => entry.startsWith(PROBLEM_PREFIX[key]));
    if (problem) errors[key] = problem;
  }
  return errors;
}

/** The scenario with any invalid value left out, so the remaining factors still compare. */
export function toComparableScenario(draft: ScenarioDraft, errors: FieldErrors): MissionScenario {
  const scenario = toScenario(draft);
  if (errors.oxygenPercent) scenario.oxygenPercent = null;
  if (errors.pressureKPa) scenario.pressureKPa = null;
  if (errors.airflowMetersPerSecond) scenario.airflowMetersPerSecond = null;
  if (errors.gravityG) scenario.gravityG = null;
  return scenario;
}

export function countSpecified(draft: ScenarioDraft): number {
  return [
    draft.oxygenPercent,
    draft.pressureKPa,
    draft.airflowMetersPerSecond,
    draft.gravityG,
    draft.material,
    draft.fuelType,
    draft.safetyObjective,
  ].filter((value) => value.trim() !== "").length;
}

/* --------------------------- URL round trip ---------------------------- */

/** Query keys. Short and readable, so a scenario URL can be shared in a demo. */
const PARAMS: [keyof ScenarioDraft, string][] = [
  ["presetId", "preset"],
  ["name", "name"],
  ["oxygenPercent", "oxygen"],
  ["pressureKPa", "pressure"],
  ["gravityG", "gravity"],
  ["airflowMetersPerSecond", "airflow"],
  ["material", "material"],
  ["fuelType", "fuel"],
  ["safetyObjective", "objective"],
];

export function draftToQuery(draft: ScenarioDraft): string {
  const params = new URLSearchParams();
  for (const [key, param] of PARAMS) {
    const value = draft[key].trim();
    if (value !== "") params.set(param, value);
  }
  return params.toString();
}

export function draftFromParams(params: { get(name: string): string | null }): ScenarioDraft {
  const draft = { ...EMPTY_SCENARIO_DRAFT };
  for (const [key, param] of PARAMS) {
    const value = params.get(param);
    if (value !== null) draft[key] = value.slice(0, 200);
  }
  return draft;
}

/**
 * Scenario form state mirrored into the URL, so the dashboard, the builder and
 * a shared link all show the same scenario. Must render inside <Suspense>.
 */
export function useScenarioDraft(): [ScenarioDraft, (next: ScenarioDraft) => void] {
  const params = useSearchParams();
  const [draft, setDraftState] = useState<ScenarioDraft>(() => draftFromParams(params));

  const setDraft = useCallback((next: ScenarioDraft) => {
    setDraftState(next);
    const query = draftToQuery(next);
    const { pathname, hash } = window.location;
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}${hash}`);
  }, []);

  return [draft, setDraft];
}
