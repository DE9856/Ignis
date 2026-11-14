import { ExternalLink, FileText } from "lucide-react";
import type { ReactNode } from "react";

import { SafetyRole } from "@/components/shared/safety-badges";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { displayTitle, keyConditions, oneLineObjective } from "./experiment-fields";
import { ExperimentValue } from "./experiment-value";

/** The record's primary NASA source as a safe http(s) link, or null. */
export function primarySourceUrl(investigation: Investigation): string | null {
  const candidates = [investigation.resource, ...investigation.sources.map((source) => source.resource)];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
    } catch {
      // not a URL; keep looking
    }
  }
  return null;
}

interface ExperimentCardProps {
  investigation: Investigation;
  selected?: boolean;
  /** Makes the whole card a button that opens the full record. */
  onSelect?: () => void;
  /** Extra controls in the footer, e.g. "add to comparison". */
  footer?: ReactNode;
  className?: string;
}

/**
 * Screen 3 card: name, one-line objective, fire-safety role, key conditions,
 * review badge and source access. Scannable without opening anything; a missing
 * condition reads "Not reported", never blank.
 */
export function ExperimentCard({
  investigation,
  selected = false,
  onSelect,
  footer,
  className,
}: ExperimentCardProps) {
  const objective = oneLineObjective(investigation);
  const sourceUrl = primarySourceUrl(investigation);

  return (
    <article
      id={investigation.id}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group relative flex scroll-mt-24 flex-col rounded-lg border bg-surface transition-colors",
        selected ? "border-accent/60 ring-1 ring-accent/30" : "border-line hover:border-line-strong",
        className,
      )}
    >
      <div className="flex-1 px-4 pt-3.5 pb-3">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm leading-snug font-semibold text-ink">
              {onSelect ? (
                <button
                  type="button"
                  onClick={onSelect}
                  className="text-left after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:text-accent focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
                >
                  {displayTitle(investigation)}
                </button>
              ) : (
                displayTitle(investigation)
              )}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-faint">
              {[investigation.program, investigation.platform].filter(Boolean).join(" · ") ||
                "Program not reported"}
            </p>
          </div>
          <StatusBadge status={investigation.status} />
        </header>

        <p
          className={cn(
            "mt-2 line-clamp-2 text-sm2 leading-snug",
            objective ? "text-ink-muted" : "text-ink-faint italic",
          )}
        >
          {objective ?? "Objective not reported"}
        </p>

        <div className="mt-3">
          <SafetyRole objectives={investigation.safetyCategories} />
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-line pt-3 text-xs">
          {keyConditions(investigation).map((field) => (
            <div key={field.key} className="min-w-0">
              <dt className="text-2xs text-ink-faint">{field.label}</dt>
              <dd className="truncate" title={field.value}>
                <ExperimentValue value={field.value} numeric={field.numeric} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="relative z-10 flex items-center justify-between gap-3 border-t border-line px-4 py-2 text-xs">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-ink-muted hover:text-nasa"
          >
            <FileText aria-hidden className="size-3.5 text-nasa" />
            Source
            <span className="max-w-40 truncate font-mono text-2xs text-ink-faint">
              {new URL(sourceUrl).hostname}
            </span>
            <ExternalLink aria-hidden className="size-3 shrink-0" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-ink-faint italic">No source cited</span>
        )}
        {footer}
      </footer>
    </article>
  );
}
