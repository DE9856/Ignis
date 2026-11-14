import type { Metadata } from "next";

import { EvidenceSearch } from "@/components/evidence/evidence-search";
import { PageHeader } from "@/components/layout/page-header";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { Disclosure } from "@/components/shared/disclosure";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval";

export const metadata: Metadata = { title: "Evidence Desk" };

const PIPELINE: [string, string][] = [
  ["Chunking", "Section-aware, from OKF Markdown"],
  ["Eligibility", "Human-reviewed records only"],
  ["Embedding model", `${EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS} dimensions)`],
  ["Store", "Supabase PostgreSQL with pgvector"],
  ["Search", "Metadata filters, lexical match and vector similarity combined"],
  ["Synthesis", "Optional, written only from retrieved passages, labelled as generated"],
];

export default function EvidencePage() {
  const capabilities = getCapabilities();
  const notices = [
    ...getDegradedNotices(capabilities, "retrieval"),
    ...getDegradedNotices(capabilities, "synthesis"),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Evidence search"
        title="Evidence Desk"
        description="Search reviewed source passages directly. Each result carries its investigation, section, evidence class and NASA source, and the evidence always comes before any generated summary."
      />
      <div className="space-y-5">
        <DegradedNotice notices={notices} />
        <EvidenceSearch synthesisAvailable={capabilities.llmEnabled} />
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <Disclosure summary="How retrieval works">
            <dl className="grid gap-x-4 gap-y-1.5 text-sm2 sm:grid-cols-[10rem_1fr]">
              {PIPELINE.map(([term, detail]) => (
                <div key={term} className="contents">
                  <dt className="text-ink-muted">{term}</dt>
                  <dd className={term === "Embedding model" ? "font-mono text-xs text-ink" : "text-ink"}>
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Disclosure>
        </div>
      </div>
    </>
  );
}
