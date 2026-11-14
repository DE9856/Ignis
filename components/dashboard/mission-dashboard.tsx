"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { LargestGap } from "@/components/gaps/largest-gap";
import { ResearchQuestionPanel } from "@/components/gaps/research-question";
import { ScenarioCoverageSummary } from "@/components/gaps/scenario-coverage-summary";
import { RelevanceList } from "@/components/scenario/relevance-list";
import { draftToQuery, useScenarioDraft } from "@/components/scenario/scenario-draft";
import { useScenarioAnalysis } from "@/components/scenario/use-scenario-analysis";
import { LoadingState } from "@/components/shared/loading-state";
import { Section } from "@/components/shared/section";
import type { CoverageByObjective } from "@/lib/integration/dashboard";
import type { Investigation } from "@/lib/okf/types";
import type { MissionScenario } from "@/lib/ranking/types";

import { ObjectiveCoverage } from "./objective-coverage";
import { ScenarioStrip } from "./scenario-strip";

export interface MissionDashboardProps {
  /** Every loaded investigation. Only human-reviewed ones are ranked. */
  investigations: Investigation[];
  /** Mission presets, already mapped to scenarios by the page. Empty until presets exist. */
  presets: MissionScenario[];
  coverage: CoverageByObjective[];
}

/**
 * Screen 1, the mission dashboard: the scenario at the top, then the most
 * relevant investigations, evidence coverage, the largest gap and the research
 * question, all for the same scenario. Shares its scenario with the Scenario
 * Builder through the URL.
 */
export function MissionDashboard(props: MissionDashboardProps) {
  return (
    <Suspense
      fallback={
        <LoadingState label="Loading scenario" className="rounded-lg border border-line bg-surface" />
      }
    >
      <MissionDashboardContent {...props} />
    </Suspense>
  );
}

function MissionDashboardContent({ investigations, presets, coverage }: MissionDashboardProps) {
  const [draft, setDraft] = useScenarioDraft();
  const { errors, analysis } = useScenarioAnalysis(draft, investigations);
  const query = draftToQuery(draft);
  const builderHref = query ? `/scenario?${query}` : "/scenario";

  return (
    <div className="space-y-5">
      <ScenarioStrip draft={draft} errors={errors} onChange={setDraft} presets={presets} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Section
          className="lg:col-span-2"
          title="Most relevant investigations"
          description="Human-reviewed NASA investigations ranked against this scenario. Open any score to see its basis."
          meta={<ProvenanceBadge value="COMPUTED" />}
          flush
        >
          <RelevanceList analysis={analysis} limit={5} openFirst emptyClassName="m-4" />
          {analysis.hasCriteria && analysis.ranked.length > 5 ? (
            <div className="border-t border-line px-4 py-2.5">
              <Link
                href={builderHref}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:text-accent"
              >
                All {analysis.ranked.length} ranked investigations
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </Section>

        <Section
          title="Mission evidence coverage"
          description="What reviewed evidence covers. Not fire risk."
          meta={<ProvenanceBadge value="COMPUTED" />}
        >
          <ScenarioCoverageSummary analysis={analysis} />
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
              Records by fire-safety objective
            </p>
            <ObjectiveCoverage coverage={coverage} />
          </div>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          title="Largest evidence gap"
          description="The scenario condition reviewed evidence covers least."
          meta={<ProvenanceBadge value="COMPUTED" />}
          actions={
            <Link
              href={`${builderHref}#gaps`}
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
            >
              Gap view
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        >
          <LargestGap analysis={analysis} variant="compact" />
        </Section>
        <Section title="Research question" description="Where further research could close the largest gap.">
          <ResearchQuestionPanel question={null} />
        </Section>
      </div>
    </div>
  );
}
