import { ExternalLink } from "lucide-react";

import type { SourceReference } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { ProvenanceBadge } from "./provenance-badge";

function httpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** One cited source with its trust label. Only http(s) locators become links. */
export function EvidenceSource({ source, className }: { source: SourceReference; className?: string }) {
  const url = httpUrl(source.resource);
  const label = source.title ?? source.resource;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs", className)}>
      <ProvenanceBadge value={source.sourceClass} />
      {url ? (
        <a
          href={url.toString()}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-w-0 items-center gap-1.5 text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
        >
          <span className="break-words">{label}</span>
          {source.title ? (
            <span className="font-mono text-2xs text-ink-faint no-underline">{url.hostname}</span>
          ) : null}
          <ExternalLink aria-hidden className="size-3 shrink-0" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <span className="break-all text-ink">{label}</span>
      )}
      {source.accessed ? (
        <span className="font-mono text-2xs text-ink-faint">checked {source.accessed}</span>
      ) : null}
    </div>
  );
}
