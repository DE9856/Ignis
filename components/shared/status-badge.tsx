import type { DocumentStatus } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES: Record<DocumentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-line-strong text-ink-muted" },
  in_review: { label: "In review", className: "border-generated/60 text-generated" },
  verified: { label: "Verified", className: "border-reviewed/60 text-reviewed" },
  deprecated: { label: "Deprecated", className: "border-danger/60 text-danger" },
};

/** Review status of a knowledge record. */
export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] leading-none whitespace-nowrap uppercase",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
