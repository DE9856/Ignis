import { Archive, CircleDashed, UserCheck } from "lucide-react";

import type { DocumentStatus } from "@/lib/okf/types";

import { Badge, type BadgeTone } from "./badge";

const STATUS_STYLES: Record<
  DocumentStatus,
  { label: string; tone: BadgeTone; icon: typeof UserCheck; meaning: string }
> = {
  draft: {
    label: "Draft",
    tone: "unverified",
    icon: CircleDashed,
    meaning: "Not yet checked against the source by a second person. Excluded from ranking and retrieval.",
  },
  stable: {
    label: "Human reviewed",
    tone: "reviewed",
    icon: UserCheck,
    meaning: "Checked against the cited NASA source by someone other than the author.",
  },
  deprecated: {
    label: "Deprecated",
    tone: "danger",
    icon: Archive,
    meaning: "Kept for history. Excluded everywhere.",
  },
};

/** Review status of a knowledge record. */
export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
  const style = STATUS_STYLES[status];
  return (
    <Badge tone={style.tone} icon={style.icon} title={style.meaning} className={className}>
      {style.label}
    </Badge>
  );
}
