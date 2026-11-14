import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { EvidenceCard } from "@/components/evidence/evidence-card";
import {
  BoundaryAnswer,
  EvidenceRefusal,
  GeneratedSummary,
  ListingSummary,
  SearchNotice,
} from "@/components/evidence/evidence-states";
import { ProvenanceLegend } from "@/components/evidence/provenance-legend";
import { GapCoverageBars } from "@/components/gaps/gap-coverage-bars";
import { ResearchQuestionPanel } from "@/components/gaps/research-question";
import { PageHeader } from "@/components/layout/page-header";
import { ScoreBreakdown } from "@/components/scenario/score-explanation";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Section } from "@/components/shared/section";
import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { BOUNDARY_MESSAGES, valueNotReportedMessage } from "@/lib/retrieval/messages";

export const metadata: Metadata = { title: "UI states", robots: { index: false } };

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-accent/50 bg-accent/[0.07] px-3 py-2 text-xs text-accent">
      {children}
    </p>
  );
}

/**
 * Component gallery for development: every Member 4 component in its empty,
 * loading, error and populated states, including the ones built against draft
 * contracts that nothing produces yet. Synthetic TEST data only. Development
 * only: a production build answers 404, and the page is not in the navigation.
 */
export default async function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();

  // Dynamic import keeps synthetic fixtures out of production code paths.
  const fixtures = await import("@/lib/dev/ui-fixtures");
  const breakdown = fixtures.testRelevanceBreakdown();
  const gaps = fixtures.testGapResults();
  const question = fixtures.testResearchQuestion();
  const evidence = fixtures.testRetrievedEvidence();

  return (
    <>
      <PageHeader
        eyebrow="Development"
        title="UI states"
        description="Components in empty, loading, error and populated states. Populated examples use synthetic TEST data and TEST_CONFIG, which is not a methodology."
      />
      <div className="space-y-5">
        <Note>
          Everything populated on this page is synthetic. It is not NASA evidence and not a validated result.
        </Note>

        <Section title="Provenance badges" flush>
          <ProvenanceLegend variant="table" />
        </Section>

        <div className="grid gap-5 xl:grid-cols-2">
          <Section
            title="Score explanation (validated methodology contract)"
            description="RelevanceBreakdown from lib/ranking/types.ts, filled from TEST_CONFIG"
          >
            <ScoreBreakdown breakdown={breakdown} />
          </Section>
          <Section
            title="Mission evidence coverage (GapResult contract)"
            description="Coverage bars, state badges and the largest gap"
          >
            <GapCoverageBars gaps={gaps} />
            <ResearchQuestionPanel question={question} className="mt-4" />
          </Section>
        </div>

        <Section title="Retrieved evidence, then optional summary" description="Evidence cards come first">
          <div className="space-y-3">
            {evidence.map((result, index) => (
              <EvidenceCard key={result.chunk.id} input={result} rank={index + 1} query="smoke oxygen" />
            ))}
            <GeneratedSummary
              result={{
                status: "ok",
                model: "groq:test-model",
                insufficient: false,
                notes: ["TEST note: passages about TEST_INVESTIGATION_BETA were not summarised."],
                sections: {
                  answer: [
                    {
                      text: "TEST answer sentence. A layout check; it summarises nothing real.",
                      sources: [evidence[0].chunk.id],
                    },
                  ],
                  nasaEvidence: [{ text: "TEST NASA evidence sentence.", sources: [evidence[0].chunk.id] }],
                  teamInterpretation: [
                    { text: "TEST team interpretation sentence.", sources: [evidence[1].chunk.id] },
                  ],
                  limitations: [{ text: "TEST limitation sentence.", sources: [evidence[0].chunk.id] }],
                },
                removed: [
                  {
                    section: "answer",
                    text: "TEST removed sentence with 42 units.",
                    reason: "contains 42, which the cited evidence does not contain",
                  },
                ],
                sources: evidence.map((result, index) => ({
                  id: result.chunk.id,
                  number: index + 1,
                  investigation: result.chunk.investigation,
                  section: result.chunk.section,
                  chunkType: result.chunk.chunkType,
                  sourceClass: result.chunk.sourceClass,
                  sourceUrl: result.chunk.sourceUrl,
                })),
              }}
            />
          </div>
        </Section>

        <Section title="Refusal" description="No reviewed passage supports the question">
          <EvidenceRefusal
            query="TEST question with no supporting passage"
            details={["Matching passages were excluded by the selected filters."]}
          />
        </Section>

        <Section title="Bounded answers" description="Wording from lib/retrieval/messages.ts">
          <div className="space-y-3">
            <BoundaryAnswer
              boundary={{
                kind: "PROBABILITY_REQUEST",
                message: BOUNDARY_MESSAGES.PROBABILITY_REQUEST,
                details: [],
              }}
            />
            <BoundaryAnswer
              boundary={{ kind: "FALSE_PREMISE", message: BOUNDARY_MESSAGES.FALSE_PREMISE, details: [] }}
            />
            <BoundaryAnswer
              boundary={{
                kind: "VALUE_NOT_REPORTED",
                message: valueNotReportedMessage("TEST_INVESTIGATION_ALPHA", ["a pressure"]),
                details: ["TEST_INVESTIGATION_ALPHA: pressure not reported."],
              }}
            />
            <ListingSummary
              listing={{
                facet: "safety",
                value: "detection",
                description: "safety category includes detection",
                investigationIds: ["test-investigation-alpha", "test-investigation-beta"],
              }}
              names={{ "test-investigation-alpha": "TEST_INVESTIGATION_ALPHA" }}
            />
            <SearchNotice notice="TEST notice: searched by keywords and record metadata only." />
          </div>
        </Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Empty states">
            <div className="space-y-3">
              <EmptyState description="Default wording for missing evidence." />
              <EmptyState size="compact" description="Compact variant, for inside a panel." />
            </div>
          </Section>
          <Section title="Loading, error and degraded">
            <div className="space-y-3">
              <LoadingState label="Searching reviewed evidence" />
              <ErrorState
                title="The search failed"
                description="Nothing was retrieved. Try again in a moment."
              />
              <DegradedNotice
                notices={[
                  { reason: "noRetrieval", message: DEGRADED_MESSAGES.noRetrieval },
                  { reason: "noSynthesis", message: DEGRADED_MESSAGES.noSynthesis },
                ]}
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
