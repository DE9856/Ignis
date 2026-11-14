import type { Metadata } from "next";

import { ComparisonTable } from "@/components/compare/comparison-table";
import { PageHeader } from "@/components/layout/page-header";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  const { investigations } = loadKnowledgeBase();

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="Investigations side by side"
        description="Up to four investigations side by side: purpose, sample, environment, facility, what was measured and what was found. Rows that differ are marked; a value that is not reported cannot be called the same."
      />
      <ComparisonTable investigations={investigations} />
    </>
  );
}
