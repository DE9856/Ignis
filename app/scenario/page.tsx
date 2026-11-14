import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ScenarioWorkspace } from "@/components/scenario/scenario-workspace";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Scenario Builder" };

export default function ScenarioPage() {
  const { investigations } = loadKnowledgeBase();
  const notices = getDegradedNotices(getCapabilities(investigations), "scoring");

  return (
    <>
      <PageHeader
        eyebrow="Scenario"
        title="Mission Scenario Builder"
        description="Describe a spacecraft or habitat fire-safety scenario, then see which investigations tested comparable conditions and where the evidence runs out."
      />
      <div className="space-y-6">
        <DegradedNotice notices={notices} />
        <ScenarioWorkspace investigations={investigations} />
      </div>
    </>
  );
}
