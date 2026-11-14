import type { Metadata } from "next";

import { EvidenceSearch } from "@/components/evidence/evidence-search";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/shared/section";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval";

export const metadata: Metadata = { title: "Evidence Desk" };

export default function EvidencePage() {
  const capabilities = getCapabilities();
  const notices = [
    ...getDegradedNotices(capabilities, "retrieval"),
    ...getDegradedNotices(capabilities, "synthesis"),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Evidence Desk"
        description="Search source passages directly. Every result will carry its NASA citation and review status."
      />
      <div className="space-y-6">
        <DegradedNotice notices={notices} />
        <Section title="Search" description="Verified passages only">
          <EvidenceSearch />
        </Section>
        <Section title="Planned retrieval" description="Not implemented in this scaffold">
          <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1.5 text-[13px]">
            <dt className="text-ink-muted">Chunking</dt>
            <dd>Section-aware, from OKF Markdown</dd>
            <dt className="text-ink-muted">Eligibility</dt>
            <dd>Verified chunks only</dd>
            <dt className="text-ink-muted">Embedding model</dt>
            <dd className="font-mono">
              {EMBEDDING_MODEL} ({EMBEDDING_DIMENSIONS} dimensions)
            </dd>
            <dt className="text-ink-muted">Store</dt>
            <dd>Supabase PostgreSQL with pgvector</dd>
            <dt className="text-ink-muted">Search</dt>
            <dd>Metadata filters, lexical match and vector similarity combined</dd>
            <dt className="text-ink-muted">Synthesis</dt>
            <dd>Optional, grounded in retrieved passages, labelled as generated</dd>
          </dl>
        </Section>
      </div>
    </>
  );
}
