import {
  CircleDashed,
  FileText,
  Layers,
  MessageSquareText,
  Sigma,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge, type BadgeTone } from "@/components/shared/badge";
import { getProvenanceLabel } from "@/lib/domain/provenance";
import type { ProvenanceClass } from "@/lib/okf/types";

/**
 * The visual provenance system. One badge per class, identical on every screen:
 * label text from lib/domain/provenance.ts, a colour, and an icon, so the class
 * is never carried by colour alone.
 */
export const PROVENANCE_INFO: Record<
  ProvenanceClass,
  { label: string; meaning: string; tone: BadgeTone; icon: LucideIcon }
> = {
  NASA_SOURCE: {
    label: getProvenanceLabel("NASA_SOURCE"),
    meaning: "Directly supported by a cited NASA publication, dataset or web page.",
    tone: "nasa",
    icon: FileText,
  },
  HUMAN_REVIEWED: {
    label: getProvenanceLabel("HUMAN_REVIEWED"),
    meaning: "Entered by a team member and checked against the source by a second person.",
    tone: "reviewed",
    icon: UserCheck,
  },
  COMPUTED: {
    label: getProvenanceLabel("COMPUTED"),
    meaning: "Deterministic ranking, coverage or gap output from reviewed records. No language model.",
    tone: "computed",
    icon: Sigma,
  },
  TEAM_INTERPRETATION: {
    label: getProvenanceLabel("TEAM_INTERPRETATION"),
    meaning: "The team's reading of how the evidence may relate to a mission question. Not a NASA statement.",
    tone: "interpretation",
    icon: MessageSquareText,
  },
  GENERATED_SUMMARY: {
    label: getProvenanceLabel("GENERATED_SUMMARY"),
    meaning: "Optional synthesis written only from already-retrieved evidence. Check it against the sources.",
    tone: "generated",
    icon: Layers,
  },
  UNVERIFIED: {
    label: getProvenanceLabel("UNVERIFIED"),
    meaning: "Not yet reviewed. Excluded from ranking and retrieval by default.",
    tone: "unverified",
    icon: CircleDashed,
  },
};

/** Trust label shown next to every piece of content. Always text, never colour alone. */
export function ProvenanceBadge({ value, className }: { value: ProvenanceClass; className?: string }) {
  const info = PROVENANCE_INFO[value];
  return (
    <Badge tone={info.tone} icon={info.icon} title={info.meaning} className={className}>
      {info.label}
    </Badge>
  );
}
