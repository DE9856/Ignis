import { ExternalLink } from "lucide-react";

import type { SourceReference } from "@/lib/okf/types";

import { ProvenanceBadge } from "./provenance-badge";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** One cited source with its trust label. */
export function EvidenceSource({ source }: { source: SourceReference }) {
  const label = source.title ?? source.resource;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <ProvenanceBadge value={source.sourceClass} />
      {isHttpUrl(source.resource) ? (
        <a
          href={source.resource}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-w-0 items-center gap-1 text-ink underline underline-offset-2 hover:text-accent"
        >
          <span className="break-all">{label}</span>
          <ExternalLink aria-hidden className="size-3 shrink-0" />
        </a>
      ) : (
        <span className="break-all text-ink">{label}</span>
      )}
      {source.accessed ? <span className="font-mono text-ink-faint">checked {source.accessed}</span> : null}
    </div>
  );
}
