"use client";

import { ArrowDown } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { ConditionEnvelopes } from "@/components/charts/condition-envelopes";
import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { EvidenceGapView } from "@/components/gaps/evidence-gap-view";
import { LargestGap } from "@/components/gaps/largest-gap";
import { ResearchQuestionPanel } from "@/components/gaps/research-question";
import { LoadingState } from "@/components/shared/loading-state";
import { Section } from "@/components/shared/section";
import type { Investigation } from "@/lib/okf/types";
import type { MissionScenario } from "@/lib/ranking/types";

import { RelevanceList } from "./relevance-list";
import { useScenarioDraft } from "./scenario-draft";
import { ScenarioForm } from "./scenario-form";
import { distinctValues, useScenarioAnalysis } from "./use-scenario-analysis";

export { toScenario } from "./scenario-draft";

export interface ScenarioWorkspaceProps {
  investigations: Investigation[];
  presets?: MissionScenario[];
}

/**
 * Screens 2 and 5: the Scenario Builder. The form on the left; on the right the
 * ranked investigations (each score opens its explanation), the evidence gap
 * view and the tested-condition envelopes, all for the same scenario.
 */
export function ScenarioWorkspace(props: ScenarioWorkspaceProps) {
  return (
    <Suspense
      fallback={
        <LoadingState label="Loading scenario" className="rounded-lg border border-line bg-surface" />
      }
    >
      <ScenarioWorkspaceContent {...props} />
    </Suspense>
  );
}

function ScenarioWorkspaceContent({ investigations, presets = [] }: ScenarioWorkspaceProps) {
  const [draft, setDraft] = useScenarioDraft();
  const [includeUnverified, setIncludeUnverified] = useState(false);
  const { errors, analysis } = useScenarioAnalysis(draft, investigations, includeUnverified);

  const materialOptions = useMemo(() => distinctValues(investigations, "material"), [investigations]);
  const fuelOptions = useMemo(() => distinctValues(investigations, "fuelType"), [investigations]);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[23rem_minmax(0,1fr)]">
      <Section
        title="Scenario"
        description="Leave a field blank if it is not part of the scenario. Results update as you type."
        actions={
          <a
            href="#ranking"
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-accent lg:hidden"
          >
            Jump to results
            <ArrowDown aria-hidden className="size-3.5" />
          </a>
        }
        className="ticks lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col"
        bodyClassName="lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-width:thin]"
      >
        <ScenarioForm
          draft={draft}
          errors={errors}
          onChange={setDraft}
          presets={presets}
          materialOptions={materialOptions}
          fuelOptions={fuelOptions}
        />
      </Section>

      <div className="min-w-0 space-y-5">
        <Section
          id="ranking"
          title="Relevant investigations"
          description="Ranked by fixed, provisional rules against reviewed records. Open any score to see its basis."
          meta={<ProvenanceBadge value="COMPUTED" />}
          actions={
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted hover:text-ink">
              <input
                type="checkbox"
                checked={includeUnverified}
                onChange={(event) => setIncludeUnverified(event.target.checked)}
                className="size-3.5 accent-accent"
              />
              Include unverified records
            </label>
          }
          flush
        >
          {includeUnverified ? (
            <p className="flex flex-wrap items-center gap-2 border-b border-line bg-sunken/50 px-4 py-2 text-xs text-ink-muted">
              <ProvenanceBadge value="UNVERIFIED" />
              Draft records are included for review only. Their values have not been checked against the
              source.
            </p>
          ) : null}
          <RelevanceList analysis={analysis} openFirst emptyClassName="m-4" />
        </Section>

        <Section
          id="gaps"
          eyebrow="Evidence coverage, not fire risk"
          title="Evidence gap view"
          description="For each scenario condition: how many reviewed investigations cover it, do not report it, or tested outside it."
          meta={<ProvenanceBadge value="COMPUTED" />}
        >
          <EvidenceGapView analysis={analysis} />
          <div className="mt-5 grid gap-5 border-t border-line pt-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-2.5 font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
                Largest evidence gap
              </h3>
              <LargestGap analysis={analysis} />
            </div>
            <div>
              <h3 className="mb-2.5 font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
                Next research step
              </h3>
              <ResearchQuestionPanel question={null} />
            </div>
          </div>
        </Section>

        <Section
          id="envelopes"
          title="Tested condition envelopes"
          description="Each record's stated range on a shared axis, with the scenario value drawn across it. Only stated bounds are drawn."
        >
          <ConditionEnvelopes analysis={analysis} />
        </Section>
      </div>
    </div>
  );
}
