import type { EvidenceChunk } from "@/lib/retrieval/types";

import { EvidenceSource } from "./evidence-source";

/** One retrieved passage with its source and trust label. */
export function EvidenceCard({ chunk }: { chunk: EvidenceChunk }) {
  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{chunk.title}</h3>
        <span className="font-mono text-[11px] text-ink-faint uppercase">{chunk.section}</span>
      </header>
      <p className="mt-2 text-sm whitespace-pre-line text-ink-muted">{chunk.content}</p>
      <footer className="mt-3 border-t border-line pt-3">
        <EvidenceSource
          source={{
            id: chunk.id,
            resource: chunk.sourceUrl ?? "Source not recorded",
            title: null,
            sourceClass: chunk.verificationStatus === "verified" ? chunk.sourceClass : "UNVERIFIED",
            accessed: null,
          }}
        />
      </footer>
    </article>
  );
}
