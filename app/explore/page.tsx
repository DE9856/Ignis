import type { Metadata } from "next";

import { EvidenceExplorer } from "@/components/experiments/evidence-explorer";
import { RelationshipView } from "@/components/experiments/relationship-view";
import { PageHeader } from "@/components/layout/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { IssueList } from "@/components/shared/issue-list";
import { Section } from "@/components/shared/section";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Investigations" };

export default function ExplorePage() {
  const { investigations, hardware, issues } = loadKnowledgeBase();

  return (
    <>
      <PageHeader
        eyebrow="Investigations"
        title="NASA combustion investigations"
        description="Every NASA combustion investigation record in IGNIS, with its test conditions, fire-safety role and review status. A condition the source does not state reads Not reported."
      />
      <ScrollReveal>
        <IssueList issues={issues} />
        <EvidenceExplorer investigations={investigations} />
        <Section
          id="relationships"
          title="Knowledge relationships"
          description="Investigation, the hardware it names, the facility that hardware sits in, and its fire-safety role. Only links stated in the records are shown."
        >
          <RelationshipView investigations={investigations} hardware={hardware} />
        </Section>
      </ScrollReveal>
    </>
  );
}
