import { EvidenceCoverageCard } from "@/components/dashboard/evidence-coverage-card";
import { MissionOverview } from "@/components/dashboard/mission-overview";
import { SystemStatus } from "@/components/dashboard/system-status";
import { TopInvestigations } from "@/components/dashboard/top-investigations";
import { PageHeader } from "@/components/layout/page-header";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import { getSupabaseStatus } from "@/lib/supabase/server";

export default function DashboardPage() {
  const knowledge = loadKnowledgeBase();

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Fire-safety evidence base"
        description="What NASA microgravity combustion research is recorded here, how much of it has been reviewed, and where to go next."
      />
      <div className="space-y-6">
        <MissionOverview knowledge={knowledge} />
        <div className="grid gap-6 lg:grid-cols-2">
          <EvidenceCoverageCard investigations={knowledge.investigations} />
          <TopInvestigations investigations={knowledge.investigations} />
        </div>
        <SystemStatus supabase={getSupabaseStatus()} issueCount={knowledge.issues.length} />
      </div>
    </>
  );
}
