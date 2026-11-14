"use client";

import { useMemo, useState } from "react";

import { Section } from "@/components/shared/section";
import { SAFETY_OBJECTIVES, type Investigation, type SafetyObjective } from "@/lib/okf/types";
import { analyzeGaps } from "@/lib/ranking/gap-analysis";
import { rankInvestigations } from "@/lib/ranking/relevance";
import type { MissionScenario } from "@/lib/ranking/types";
import { parseOptionalNumber } from "@/lib/utils/numbers";

import { RelevanceResult } from "./relevance-result";
import { EMPTY_SCENARIO_DRAFT, ScenarioForm, type ScenarioDraft } from "./scenario-form";
import { ScenarioSummary } from "./scenario-summary";

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Normalise raw form input. Blank fields become null; nothing is defaulted. */
export function toScenario(draft: ScenarioDraft): MissionScenario {
  const objective = SAFETY_OBJECTIVES.find((candidate) => candidate === draft.safetyObjective);
  return {
    id: "draft",
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

/** Holds scenario state and runs ranking and gap analysis in the browser. */
export function ScenarioWorkspace({ investigations }: { investigations: Investigation[] }) {
  const [draft, setDraft] = useState<ScenarioDraft>(EMPTY_SCENARIO_DRAFT);
  const [includeUnverified, setIncludeUnverified] = useState(false);

  const scenario = useMemo(() => toScenario(draft), [draft]);
  const results = useMemo(
    () => rankInvestigations(scenario, investigations, { includeUnverified }),
    [scenario, investigations, includeUnverified],
  );
  const gaps = useMemo(() => analyzeGaps(results), [results]);
  const hasCriteria = results.some((result) => result.score !== null);

  return (
    <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
      <Section title="Scenario" description="Leave a field blank if it is not part of the scenario">
        <ScenarioForm draft={draft} onChange={setDraft} onReset={() => setDraft(EMPTY_SCENARIO_DRAFT)} />
      </Section>

      <div className="space-y-6">
        <Section title="Scenario summary" description="Values used for ranking">
          <ScenarioSummary scenario={scenario} />
        </Section>

        <Section
          title="Relevant investigations"
          description="Deterministic ranking against verified records"
          actions={
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={includeUnverified}
                onChange={(event) => setIncludeUnverified(event.target.checked)}
                className="accent-accent"
              />
              Include unverified records
            </label>
          }
        >
          <RelevanceResult
            investigations={investigations}
            results={results}
            gaps={gaps}
            hasCriteria={hasCriteria}
          />
        </Section>
      </div>
    </div>
  );
}
