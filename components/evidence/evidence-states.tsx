import { BookOpenText, Layers } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { ProvenanceBadge } from "./provenance-badge";

/**
 * The deliberate answer when no reviewed passage supports a question. It is a
 * finding, not a failure, so it is styled as a calm, complete response rather
 * than as an error.
 */
export function EvidenceRefusal({ query, className }: { query: string; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface", className)}>
      <div className="flex items-start gap-4 px-5 py-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-sunken text-ink-muted">
          <BookOpenText aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">Answer</p>
          <p className="text-base font-semibold text-ink">The reviewed evidence does not establish this.</p>
          <p className="text-sm2 leading-relaxed text-ink-muted">
            No human-reviewed passage matched <q className="text-ink">{query}</q>. IGNIS does not fill the gap
            with generated text or typical values; a missing answer is shown as missing.
          </p>
          <ul className="space-y-1 pt-1 text-xs text-ink-muted">
            <li>
              Try the words records use: a material, a measured quantity, a section name such as findings.
            </li>
            <li>
              Browse every record in the{" "}
              <Link
                href="/explore"
                className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
              >
                Evidence Explorer
              </Link>
              .
            </li>
            <li>
              If this is a scenario question, the{" "}
              <Link
                href="/scenario#gaps"
                className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
              >
                gap view
              </Link>{" "}
              shows which conditions reviewed evidence does not cover.
            </li>
          </ul>
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-2.5 text-xs text-ink-faint">
        <ProvenanceBadge value="COMPUTED" />
        Retrieval searched reviewed passages only. Drafts and generated text are never searched.
      </p>
    </div>
  );
}

export interface SummaryCitation {
  id: string;
  heading: string;
  section: string;
  sourceUrl: string | null;
}

/**
 * Optional grounded synthesis, drawn apart from source evidence: its own
 * border, its own badge, and a numbered list of the passages it was written
 * from. Only ever shown after the retrieved evidence itself.
 */
export function GeneratedSummary({
  text,
  citations,
  className,
}: {
  text: string;
  citations: SummaryCitation[];
  className?: string;
}) {
  return (
    <section
      aria-label="Generated summary"
      className={cn("rounded-lg border border-dashed border-generated/50 bg-generated/[0.04]", className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-generated/30 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Layers aria-hidden className="size-4 text-generated" />
          Summary of the selected evidence
        </p>
        <ProvenanceBadge value="GENERATED_SUMMARY" />
      </header>
      <div className="space-y-3 px-4 py-3">
        <p className="text-sm2 leading-relaxed whitespace-pre-line text-ink">{text}</p>
        <div>
          <p className="mb-1 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
            Written only from these {citations.length} passages
          </p>
          <ol className="space-y-0.5 text-xs text-ink-muted">
            {citations.map((citation, index) => (
              <li key={citation.id} className="flex gap-2">
                <span className="font-mono text-ink-faint">[{index + 1}]</span>
                <span>
                  {citation.heading} / {citation.section}
                  {citation.sourceUrl ? (
                    <>
                      {" · "}
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-line-strong underline-offset-2 hover:text-ink"
                      >
                        source
                      </a>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-2xs text-ink-faint">
          Generated text. Check every statement against the cited passages above.
        </p>
      </div>
    </section>
  );
}
