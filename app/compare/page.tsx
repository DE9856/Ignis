import type { Metadata } from "next";

import { ComparisonTable } from "@/components/compare/comparison-table";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/shared/section";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  const { investigations } = loadKnowledgeBase();

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="Investigation Comparison"
        description="Put investigations side by side to see how their fuels, atmospheres, flow and gravity conditions differ."
      />
      <Section title="Comparison" description="Experimental conditions by investigation">
        <ComparisonTable investigations={investigations} />
      </Section>
    </>
  );
}
