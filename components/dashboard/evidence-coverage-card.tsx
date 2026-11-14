import { EvidenceCoverageChart, type CoverageDatum } from "@/components/charts/evidence-coverage-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Section } from "@/components/shared/section";
import { isVerified } from "@/lib/okf/parser";
import { SAFETY_OBJECTIVES, type Investigation } from "@/lib/okf/types";

const LABELS: Record<(typeof SAFETY_OBJECTIVES)[number], string> = {
  prevention: "Prevention",
  detection: "Detection",
  suppression: "Suppression",
};

export function EvidenceCoverageCard({ investigations }: { investigations: Investigation[] }) {
  const data: CoverageDatum[] = SAFETY_OBJECTIVES.map((objective) => {
    const tagged = investigations.filter((investigation) =>
      investigation.safetyCategories.includes(objective),
    );
    const verified = tagged.filter(isVerified).length;
    return { label: LABELS[objective], verified, unverified: tagged.length - verified };
  });
  const hasData = data.some((datum) => datum.verified + datum.unverified > 0);

  return (
    <Section title="Evidence coverage" description="Investigation records per fire-safety objective">
      {hasData ? (
        <EvidenceCoverageChart data={data} />
      ) : (
        <EmptyState description="Coverage is counted from investigation records in knowledge/investigations once they exist." />
      )}
    </Section>
  );
}
