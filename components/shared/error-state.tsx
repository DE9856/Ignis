import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Something broke. Reserved for real failures; missing data uses EmptyState instead. */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("rounded-md border border-danger/45 bg-danger/[0.06] px-4 py-3.5", className)}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{title}</p>
          {description ? <div className="mt-1 text-xs break-words text-ink-muted">{description}</div> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
