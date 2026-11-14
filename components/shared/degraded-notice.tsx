import { Info } from "lucide-react";

import type { DegradedNotice as Notice } from "@/lib/core/degraded";

/**
 * States plainly that part of the application is not available yet.
 * Informational, not an error: styled quieter than ErrorState on purpose.
 */
export function DegradedNotice({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;
  return (
    <div role="status" className="rounded-md border border-line-strong bg-raised/40 px-4 py-3">
      <ul className="space-y-1.5">
        {notices.map((notice) => (
          <li key={notice.reason} className="flex items-start gap-2.5 text-xs text-ink-muted">
            <Info aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
            <span>{notice.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
