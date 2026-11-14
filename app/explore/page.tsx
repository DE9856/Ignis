import type { Metadata } from "next";

import { ExperimentDetail } from "@/components/experiments/experiment-detail";
import { ExperimentTable } from "@/components/experiments/experiment-table";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { IssueList } from "@/components/shared/issue-list";
import { Section } from "@/components/shared/section";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Evidence Explorer" };

export default function ExplorePage() {
  const { investigations, issues } = loadKnowledgeBase();

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="NASA Evidence Explorer"
        description="Every investigation record in the knowledge base, with its test conditions and review status. Unknown values are shown as unknown."
      />
      <div className="space-y-6">
        <IssueList issues={issues} />
        <Section
          title="Investigations"
          description={`${investigations.length} record${investigations.length === 1 ? "" : "s"}`}
          flush={investigations.length > 0}
        >
          {investigations.length > 0 ? (
            <ExperimentTable investigations={investigations} />
          ) : (
            <EmptyState description="Investigation records are Markdown files in knowledge/investigations. See knowledge/README.md for the format." />
          )}
        </Section>
        {investigations.map((investigation) => (
          <ExperimentDetail key={investigation.id} investigation={investigation} />
        ))}
      </div>
    </>
  );
}
