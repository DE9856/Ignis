import { CircleDashed } from "lucide-react";
import type { ReactNode } from "react";

import { AWAITING_EVIDENCE } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  /** Defaults to the standard "Awaiting verified NASA evidence" wording. */
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Shown wherever data is missing. Never replace this with sample numbers. */
export function EmptyState({ title = AWAITING_EVIDENCE, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-line-strong px-6 py-10 text-center",
        className,
      )}
    >
      <CircleDashed aria-hidden className="size-5 text-ink-faint" />
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-md text-xs text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
