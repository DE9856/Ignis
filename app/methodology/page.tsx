import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { ProvenanceLegend } from "@/components/evidence/provenance-legend";
import { CoverageLevelBadge } from "@/components/gaps/coverage-level";
import { PageHeader } from "@/components/layout/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { EvidenceStateBadge, FactorOutcomeBadge, GapStateBadge } from "@/components/scenario/evidence-state";
import { ReadList, ReadSection } from "@/components/shared/read-section";
import { EVIDENCE_STATES } from "@/lib/ranking/methodology";
import { GRAVITY_TOLERANCE_G } from "@/lib/ranking/relevance";
import { GAP_COVERAGE_STATES } from "@/lib/ranking/types";
import { EMBEDDING_MODEL } from "@/lib/retrieval";

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
  [
    "Retrieve",
    `Verified records are split by section, embedded with ${EMBEDDING_MODEL} and searched by meaning, keywords and stated conditions together. Drafts are never indexed.`,
  ],
  [
    "Answer",
    "Optional. A language model writes a short answer from the retrieved passages only. Each claim is checked against them, and an answer that fails the check is withheld.",
  ],
];

const LIMITATIONS = [
  "IGNIS is a hackathon prototype. It is not a design tool and must not be used for flight safety decisions.",
  "Coverage is limited to the investigations the team has curated. Absence from IGNIS says nothing about whether NASA studied a topic.",
  "A match means recorded test conditions overlap the scenario. It does not mean the findings transfer to that scenario.",
  "Relevance weights and tolerances are provisional and have not been reviewed by a combustion specialist.",
  "Records are transcribed by hand. Verification reduces transcription errors but does not eliminate them.",
];

function Vocabulary({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4">
      <dt className="mb-2.5 text-sm2 text-ink">{label}</dt>
      <dd className="flex flex-wrap gap-1.5">{children}</dd>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title="How evidence enters IGNIS"
        description="How a NASA source becomes a record, how it is labelled, what is computed, where AI is used, and what the tool cannot tell you."
      />
      <ScrollReveal className="space-y-0">
        <ReadSection
          id="pipeline"
          title="From NASA source to screen"
          lede="Seven steps. Nothing reaches the ranking or the search without the third."
        >
          <ol className="divide-y divide-line border-y border-line">
            {PIPELINE.map(([step, text], index) => (
              <li key={step} className="grid gap-x-4 gap-y-1 py-3.5 sm:grid-cols-[2rem_6rem_1fr]">
                <span className="font-mono text-sm2 text-ink-faint tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-ink">{step}</span>
                <span className="text-pretty">{text}</span>
              </li>
            ))}
          </ol>
        </ReadSection>

        <ReadSection
          id="provenance"
          title="Provenance classes"
          lede="Every piece of content carries one of these labels, so you can always tell NASA's words from ours."
        >
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <ProvenanceLegend variant="table" />
          </div>
        </ReadSection>

        <ReadSection
          id="vocabulary"
          title="Evidence states"
          lede="The labels used for computed outputs. Definitions and weights come from the validated methodology."
        >
          <dl className="divide-y divide-line border-y border-line">
            <Vocabulary label="Relevance per dimension (validated methodology)">
              {EVIDENCE_STATES.map((state) => (
                <EvidenceStateBadge key={state} state={state} />
              ))}
            </Vocabulary>
            <Vocabulary label="Evidence coverage per dimension (validated methodology)">
              {GAP_COVERAGE_STATES.map((state) => (
                <GapStateBadge key={state} state={state} />
              ))}
            </Vocabulary>
            <Vocabulary label="Factor outcome (provisional rules, in use now)">
              <FactorOutcomeBadge outcome="match" />
              <FactorOutcomeBadge outcome="mismatch" />
              <FactorOutcomeBadge outcome="unknown" />
              <FactorOutcomeBadge outcome="not_specified" />
            </Vocabulary>
            <Vocabulary label="Scenario coverage (provisional rules, in use now)">
              <CoverageLevelBadge level="covered" />
              <CoverageLevelBadge level="unknown" />
              <CoverageLevelBadge level="gap" />
              <CoverageLevelBadge level="no_evidence" />
            </Vocabulary>
          </dl>
          <p className="mt-4 text-sm2 text-ink-faint">
            Bars show evidence strength in one hue: more filled bars, stronger evidence. Coverage is always
            evidence coverage of test conditions, never fire risk or probability.
          </p>
        </ReadSection>

        <ReadSection
          id="relevance"
          title="Relevance ranking"
          lede="Deterministic and provisional. No language model is involved."
        >
          <ReadList
            items={[
              "Each factor the scenario specifies is compared with the investigation record.",
              "The outcome is match, mismatch or unknown. A missing value is unknown, never a match.",
              "Score is matches divided by factors compared, with equal weights.",
              <>
                Gravity levels within <span className="font-mono text-ink">{GRAVITY_TOLERANCE_G} g</span>{" "}
                count as equal.
              </>,
              "Ties are broken by fewer mismatches, then by record id, so the order is reproducible.",
              "Only verified records are ranked unless the user opts in to unverified ones.",
            ]}
          />
        </ReadSection>

        <ReadSection
          id="gaps"
          title="Evidence-gap analysis"
          lede="Deterministic. A gap is a result, not a failure."
        >
          <ReadList
            items={[
              <>
                <span className="text-ink">Covered:</span> at least one investigation matches the scenario on
                that factor.
              </>,
              <>
                <span className="text-ink">Unknown:</span> none match, and at least one record does not state
                the value.
              </>,
              <>
                <span className="text-ink">Gap:</span> every investigation excludes the scenario value.
              </>,
              <>
                <span className="text-ink">No evidence:</span> there are no records to compare.
              </>,
            ]}
          />
        </ReadSection>

        <ReadSection
          id="ai-use"
          title="AI-use disclosure"
          lede="Where a model is used, what it may do, and what it may never do."
        >
          <ReadList
            items={[
              "The initial code scaffold was generated with an AI coding assistant and reviewed by the team.",
              "Scientific records are curated and verified by people. AI output is never a source.",
              "Ranking and gap analysis use no language model.",
              "Embeddings are used to find passages, never to produce claims.",
              <>
                The optional answer on the Evidence Desk is written only from retrieved passages, shown with
                its sources and labelled <ProvenanceBadge value="GENERATED_SUMMARY" />. A claim the passages
                do not support is not shown.
              </>,
            ]}
          />
        </ReadSection>

        <ReadSection id="limitations" title="Limitations" lede="What IGNIS cannot tell you.">
          <ReadList items={LIMITATIONS} />
        </ReadSection>
      </ScrollReveal>
    </>
  );
}
