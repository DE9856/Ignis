import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function ErrorState({ title = "Something went wrong", description, action }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-md border border-danger/50 bg-danger/5 px-4 py-4">
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          {description ? <p className="mt-1 text-xs break-words text-ink-muted">{description}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
