import type { Metadata } from "next";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { ProvenanceLegend } from "@/components/evidence/provenance-legend";
import { CoverageLevelBadge } from "@/components/gaps/coverage-level";
import { PageHeader } from "@/components/layout/page-header";
import { EvidenceStateBadge, FactorOutcomeBadge, GapStateBadge } from "@/components/scenario/evidence-state";
import { Section } from "@/components/shared/section";
import { EVIDENCE_STATES } from "@/lib/ranking/methodology";
import { GRAVITY_TOLERANCE_G } from "@/lib/ranking/relevance";
import { GAP_COVERAGE_STATES } from "@/lib/ranking/types";

export const metadata: Metadata = { title: "Methodology" };

const PIPELINE = [
  [
    "Curate",
    "A team member reads a NASA source and writes an OKF record: YAML metadata plus Markdown sections.",
  ],
  ["Cite", "Every record lists its sources. A record without a source cannot be verified."],
  ["Review", "A second person checks the record against the source and adds a verification entry."],
  [
    "Validate",
    "The schema rejects malformed records. Rejected files are listed in the app, not silently dropped.",
  ],
  ["Compute", "Ranking and gap analysis run as fixed rules over verified records."],
  ["Retrieve", "Planned: verified sections are chunked, embedded and searched. Not built yet."],
];

const LIMITATIONS = [
  "IGNIS is a one-day hackathon prototype. It is not a design tool and must not be used for flight safety decisions.",
  "Coverage is limited to the investigations the team has curated. Absence from IGNIS says nothing about whether NASA studied a topic.",
  "A match means recorded test conditions overlap the scenario. It does not mean the findings transfer to that scenario.",
  "Relevance weights and tolerances are provisional and have not been reviewed by a combustion specialist.",
  "Records are transcribed by hand. Verification reduces transcription errors but does not eliminate them.",
];

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title="Methodology and provenance"
        description="How evidence enters IGNIS, how it is labelled, what is computed, where AI is used, and what the tool cannot tell you."
      />
      <div className="space-y-5">
        <Section id="pipeline" title="Evidence pipeline" description="From NASA source to screen">
          <ol className="space-y-2.5">
            {PIPELINE.map(([step, text], index) => (
              <li key={step} className="grid grid-cols-[1.5rem_5.5rem_1fr] gap-3 text-sm2">
                <span className="font-mono text-ink-faint tabular-nums">{index + 1}</span>
                <span className="font-medium text-ink">{step}</span>
                <span className="text-ink-muted">{text}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="provenance"
          title="Provenance classes"
          description="Every piece of content carries one of these labels"
          flush
        >
          <ProvenanceLegend variant="table" />
        </Section>

        <Section
          id="vocabulary"
          title="Evidence states"
          description="The labels used for computed outputs. Definitions and weights come from the validated methodology."
        >
          <dl className="grid gap-x-8 gap-y-4 text-sm2 md:grid-cols-2">
            <div>
              <dt className="mb-2 text-xs text-ink-muted">Relevance per dimension (validated methodology)</dt>
              <dd className="flex flex-wrap gap-1.5">
                {EVIDENCE_STATES.map((state) => (
                  <EvidenceStateBadge key={state} state={state} />
                ))}
              </dd>
            </div>
            <div>
              <dt className="mb-2 text-xs text-ink-muted">
                Evidence coverage per dimension (validated methodology)
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {GAP_COVERAGE_STATES.map((state) => (
                  <GapStateBadge key={state} state={state} />
                ))}
              </dd>
            </div>
            <div>
              <dt className="mb-2 text-xs text-ink-muted">Factor outcome (provisional rules, in use now)</dt>
              <dd className="flex flex-wrap gap-1.5">
                <FactorOutcomeBadge outcome="match" />
                <FactorOutcomeBadge outcome="mismatch" />
                <FactorOutcomeBadge outcome="unknown" />
                <FactorOutcomeBadge outcome="not_specified" />
              </dd>
            </div>
            <div>
              <dt className="mb-2 text-xs text-ink-muted">
                Scenario coverage (provisional rules, in use now)
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                <CoverageLevelBadge level="covered" />
                <CoverageLevelBadge level="unknown" />
                <CoverageLevelBadge level="gap" />
                <CoverageLevelBadge level="no_evidence" />
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-faint">
            Bars show evidence strength in one hue: more filled bars, stronger evidence. Coverage is always
            evidence coverage of test conditions, never fire risk or probability.
          </p>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section id="relevance" title="Relevance ranking" description="Deterministic, provisional">
            <ul className="list-disc space-y-1.5 pl-5 text-sm2 text-ink-muted">
              <li>Each factor the scenario specifies is compared with the investigation record.</li>
              <li>The outcome is match, mismatch or unknown. A missing value is unknown, never a match.</li>
              <li>Score is matches divided by factors compared, with equal weights.</li>
              <li>
                Gravity levels within <span className="font-mono text-ink">{GRAVITY_TOLERANCE_G} g</span>{" "}
                count as equal.
              </li>
              <li>Ties are broken by fewer mismatches, then by record id, so the order is reproducible.</li>
              <li>Only verified records are ranked unless the user opts in to unverified ones.</li>
            </ul>
          </Section>

          <Section id="gaps" title="Evidence-gap analysis" description="Deterministic">
            <ul className="list-disc space-y-1.5 pl-5 text-sm2 text-ink-muted">
              <li>Covered: at least one investigation matches the scenario on that factor.</li>
              <li>Unknown: none match, and at least one record does not state the value.</li>
              <li>Gap: every investigation excludes the scenario value.</li>
              <li>No evidence: there are no records to compare.</li>
            </ul>
          </Section>
        </div>

        <Section id="ai-use" title="AI-use disclosure">
          <ul className="list-disc space-y-1.5 pl-5 text-sm2 text-ink-muted">
            <li>
              The initial code scaffold was generated with an AI coding assistant and reviewed by the team.
            </li>
            <li>Scientific records are curated and verified by people. AI output is never a source.</li>
            <li>Ranking and gap analysis use no language model.</li>
            <li>
              Any future generated text will be built only from retrieved passages, shown with its sources,
              and labelled <ProvenanceBadge value="GENERATED_SUMMARY" />.
            </li>
            <li>Embeddings, when added, are used to find passages, not to produce claims.</li>
          </ul>
        </Section>

        <Section id="limitations" title="Limitations">
          <ul className="list-disc space-y-1.5 pl-5 text-sm2 text-ink-muted">
            {LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
