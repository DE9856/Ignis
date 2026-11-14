import { CircleDashed, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AWAITING_EVIDENCE } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  /** Defaults to the standard "Awaiting verified NASA evidence" wording. */
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  /** `compact` sits inside a panel row; `default` fills a panel body. */
  size?: "default" | "compact";
  className?: string;
}

/**
 * Shown wherever data is missing. Missing is a real state in IGNIS, so it is
 * drawn deliberately, not left blank. Never replace this with sample numbers.
 */
export function EmptyState({
  title = AWAITING_EVIDENCE,
  description,
  action,
  icon: Icon = CircleDashed,
  size = "default",
  className,
}: EmptyStateProps) {
  if (size === "compact") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-md border border-dashed border-line-strong bg-sunken/40 px-3.5 py-3",
          className,
        )}
      >
        <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-faint" />
        <div className="min-w-0">
          <p className="text-sm2 font-medium text-ink">{title}</p>
          {description ? <div className="mt-0.5 text-xs text-ink-muted">{description}</div> : null}
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-line-strong bg-sunken/40 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-full border border-line-strong bg-surface text-ink-faint">
        <Icon aria-hidden className="size-4" />
      </span>
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
      {description ? (
        <div className="mt-1 max-w-md text-xs text-pretty text-ink-muted">{description}</div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
