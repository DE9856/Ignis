import type { Metadata } from "next";

import { LiveConsole } from "@/components/console/live-console";
import { PageHeader } from "@/components/layout/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { toMissionPresets } from "@/lib/integration/missions";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Live console" };

export default function ConsolePage() {
  const { investigations, missions } = loadKnowledgeBase();
  const notices = getDegradedNotices(getCapabilities(investigations), "scoring");

  return (
    <>
      <PageHeader
        eyebrow="Live console"
        title="Move a condition, watch the evidence"
        description="Change gravity, oxygen, pressure or airflow and see the reviewed NASA investigations re-rank, the coverage shift and the tested ranges light up, together. Or press play for a guided tour."
      />
      <ScrollReveal>
        <DegradedNotice notices={notices} />
        <LiveConsole investigations={investigations} presets={toMissionPresets(missions)} />
      </ScrollReveal>
    </>
  );
}
