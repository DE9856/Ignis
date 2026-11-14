import { CircleDashed } from "lucide-react";

import type { DegradedNotice as Notice } from "@/lib/core/degraded";
import { cn } from "@/lib/utils/cn";

/**
 * States plainly that part of the application is not available yet.
 * Informational, not an error: styled quieter than ErrorState on purpose.
 * Wording comes from lib/core/degraded.ts so every screen says the same thing.
 */
export function DegradedNotice({ notices, className }: { notices: Notice[]; className?: string }) {
  const unique = notices.filter(
    (notice, index) => notices.findIndex((candidate) => candidate.reason === notice.reason) === index,
  );
  if (unique.length === 0) return null;
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-2 rounded-md border border-line bg-surface px-4 py-2.5 sm:flex-row sm:items-start sm:gap-4",
        className,
      )}
    >
      <p className="shrink-0 pt-px font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
        Not available yet
      </p>
      <ul className="min-w-0 space-y-1">
        {unique.map((notice) => (
          <li
            key={notice.reason}
            className={cn(
              "flex items-start gap-2 text-xs",
              notice.reason === "devMocks" ? "text-accent" : "text-ink-muted",
            )}
          >
            <CircleDashed aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
            <span>{notice.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
