import { KnowledgeStatus } from "@/components/dashboard/knowledge-status";
import { MissionDashboard } from "@/components/dashboard/mission-dashboard";
import { PurposeSteps } from "@/components/dashboard/purpose-steps";
import { SystemStatus } from "@/components/dashboard/system-status";
import { PageHeader } from "@/components/layout/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { buildDashboardViewModel } from "@/lib/integration/dashboard";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import type { MissionScenario } from "@/lib/ranking/types";
import { getSupabaseStatus } from "@/lib/supabase/server";

/**
 * Mission presets from knowledge/missions, as scenarios. Empty until the
 * Mission field names are agreed (team workflow, open decision 4); map the
 * documents here then. Never fill a preset value that a record does not state.
 */
const MISSION_PRESETS: MissionScenario[] = [];

export default function DashboardPage() {
  const knowledge = loadKnowledgeBase();
  const capabilities = getCapabilities(knowledge.investigations);
  const dashboard = buildDashboardViewModel(knowledge, capabilities);

  return (
    <>
      <PageHeader
        eyebrow="Mission dashboard"
        title="Space fire evidence for your mission"
        description="Describe a spacecraft or habitat fire scenario. IGNIS shows which NASA combustion investigations tested comparable conditions, and where reviewed evidence runs out."
      >
        <PurposeSteps />
      </PageHeader>
      <ScrollReveal>
        <DegradedNotice notices={getDegradedNotices(capabilities, "scoring")} />
        <MissionDashboard
          investigations={knowledge.investigations}
          presets={MISSION_PRESETS}
          coverage={dashboard.coverage}
        />
        <KnowledgeStatus summary={dashboard.summary} />
        <SystemStatus
          supabase={getSupabaseStatus()}
          issueCount={knowledge.issues.length}
          retrievalReady={capabilities.retrievalEnabled}
          synthesisReady={capabilities.llmEnabled}
          methodologyReady={capabilities.methodologyConfigured}
        />
      </ScrollReveal>
    </>
  );
}
