import type { ProvenanceClass } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

export const PROVENANCE_INFO: Record<ProvenanceClass, { label: string; meaning: string; className: string }> =
  {
    NASA_SOURCE: {
      label: "NASA source",
      meaning: "Taken directly from a cited NASA publication, dataset or web page.",
      className: "border-nasa/60 text-nasa",
    },
    HUMAN_REVIEWED: {
      label: "Human reviewed",
      meaning: "Entered by a team member and checked against the source by a second person.",
      className: "border-reviewed/60 text-reviewed",
    },
    COMPUTED: {
      label: "Computed",
      meaning: "Produced by deterministic code from reviewed data, e.g. a relevance score.",
      className: "border-computed/60 text-computed",
    },
    TEAM_INTERPRETATION: {
      label: "Team interpretation",
      meaning: "The team's own reading of the evidence. Not a NASA statement.",
      className: "border-interpretation/60 text-interpretation",
    },
    GENERATED_SUMMARY: {
      label: "Generated summary",
      meaning: "Written by a language model from retrieved evidence. Check it against the sources.",
      className: "border-generated/60 text-generated",
    },
    UNVERIFIED: {
      label: "Unverified",
      meaning: "Not yet reviewed. Excluded from ranking and retrieval by default.",
      className: "border-line-strong text-unverified border-dashed",
    },
  };

/** Trust label shown next to every piece of evidence. Always text, never colour alone. */
export function ProvenanceBadge({ value, className }: { value: ProvenanceClass; className?: string }) {
  const info = PROVENANCE_INFO[value];
  return (
    <span
      title={info.meaning}
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] leading-none whitespace-nowrap uppercase",
        info.className,
        className,
      )}
    >
      {info.label}
    </span>
  );
}
