import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ScenarioWorkspace } from "@/components/scenario/scenario-workspace";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { toMissionPresets } from "@/lib/integration/missions";
import { loadKnowledgeBase } from "@/lib/okf/loader";

export const metadata: Metadata = { title: "Scenario" };

export default function ScenarioPage() {
  const { investigations, missions } = loadKnowledgeBase();
  const capabilities = getCapabilities(investigations);
  const notices = getDegradedNotices(capabilities, "scoring");

  return (
    <>
      <PageHeader
        eyebrow="Scenario"
        title="Mission scenario analysis"
        description="Describe a spacecraft or habitat fire-safety scenario. See which reviewed investigations tested comparable conditions, why each scores as it does, and where the evidence runs out."
      />
      <ScrollReveal>
        <DegradedNotice notices={notices} />
        <ScenarioWorkspace
          investigations={investigations}
          presets={toMissionPresets(missions)}
          synthesisAvailable={capabilities.llmEnabled}
        />
      </ScrollReveal>
    </>
  );
}
