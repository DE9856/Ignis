import type { Metadata } from "next";

import { PROVENANCE_INFO, ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/shared/section";
import { PROVENANCE_CLASSES } from "@/lib/okf/types";
import { GRAVITY_TOLERANCE_G } from "@/lib/ranking/relevance";

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
      <div className="space-y-6">
        <Section title="Evidence pipeline" description="From NASA source to screen">
          <ol className="space-y-2.5">
            {PIPELINE.map(([step, text], index) => (
              <li key={step} className="grid grid-cols-[1.5rem_6rem_1fr] gap-3 text-[13px]">
                <span className="font-mono text-ink-faint tabular-nums">{index + 1}</span>
                <span className="font-medium text-ink">{step}</span>
                <span className="text-ink-muted">{text}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          title="Provenance classes"
          description="Every piece of content carries one of these labels"
          flush
        >
          <table className="w-full text-left text-[13px]">
            <tbody className="divide-y divide-line">
              {PROVENANCE_CLASSES.map((value) => (
                <tr key={value}>
                  <th scope="row" className="w-48 px-4 py-2.5 align-top font-normal">
                    <ProvenanceBadge value={value} />
                  </th>
                  <td className="px-4 py-2.5 text-ink-muted">{PROVENANCE_INFO[value].meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Relevance ranking" description="Deterministic, provisional">
            <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-ink-muted">
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

          <Section title="Evidence-gap analysis" description="Deterministic">
            <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-ink-muted">
              <li>Covered: at least one investigation matches the scenario on that factor.</li>
              <li>Unknown: none match, and at least one record does not state the value.</li>
              <li>Gap: every investigation excludes the scenario value.</li>
              <li>No evidence: there are no records to compare.</li>
            </ul>
          </Section>
        </div>

        <Section title="AI-use disclosure">
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-ink-muted">
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

        <Section title="Limitations">
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-ink-muted">
            {LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
