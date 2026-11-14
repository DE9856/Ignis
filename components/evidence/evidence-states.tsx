import { BookOpenText, Info, Layers, ListChecks, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { NOT_ESTABLISHED } from "@/lib/retrieval/messages";
import type { BoundaryKind, BoundaryNotice, EvidenceListing } from "@/lib/retrieval/types";
import { SYNTHESIS_SECTION_LABELS, SYNTHESIS_SECTIONS, type SynthesisResponse } from "@/lib/synthesis/types";
import { cn } from "@/lib/utils/cn";

import { ProvenanceBadge } from "./provenance-badge";

/**
 * The deliberate answer when no reviewed passage supports a question. It is a
 * finding, not a failure, so it is styled as a calm, complete response rather
 * than as an error.
 */
export function EvidenceRefusal({
  query,
  details = [],
  className,
}: {
  query: string;
  /** Deterministic facts from the retriever, e.g. "Matching passages were excluded by the selected filters." */
  details?: string[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface", className)}>
      <div className="flex items-start gap-4 px-5 py-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-sunken text-ink-muted">
          <BookOpenText aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
            Insufficient evidence
          </p>
          <p className="text-base font-semibold text-ink">The reviewed evidence does not establish this.</p>
          <p className="text-sm2 leading-relaxed text-ink-muted">
            No human-reviewed passage matched <q className="text-ink">{query}</q>. IGNIS does not fill the gap
            with generated text or typical values; a missing answer is shown as missing.
          </p>
          <BoundaryDetails details={details} />
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

function BoundaryDetails({ details }: { details: string[] }) {
  if (details.length === 0) return null;
  return (
    <ul className="space-y-1 border-l-2 border-computed/40 pl-3 text-xs text-ink-muted">
      {details.map((detail) => (
        <li key={detail}>{detail}</li>
      ))}
    </ul>
  );
}

/** Eyebrow for each boundary kind. The message itself is fixed in `lib/retrieval/messages.ts`. */
const BOUNDARY_LABELS: Record<BoundaryKind, string> = {
  PROBABILITY_REQUEST: "Outside what IGNIS answers",
  UNIVERSAL_GUARANTEE: "Outside what IGNIS answers",
  PREDICTION_REQUEST: "Outside what IGNIS answers",
  DESIGN_PRESCRIPTION: "Outside what IGNIS answers",
  FALSE_PREMISE: "Correction",
  CORPUS_COVERAGE: "Coverage of the reviewed records",
  VALUE_NOT_REPORTED: "Not reported",
  INSUFFICIENT_EVIDENCE: "Answer",
  PARTIAL_GRAVITY_BOUND: "Partial gravity not tested",
};

/**
 * A bounded answer: the question asks for something IGNIS deliberately does
 * not provide (a probability, a guarantee, a prediction, a design choice), or
 * rests on a premise the evidence contradicts. Shown first, as the answer, in
 * the same calm style as the refusal. Any passages below it are context.
 */
export function BoundaryAnswer({ boundary, className }: { boundary: BoundaryNotice; className?: string }) {
  const informational =
    boundary.kind === "VALUE_NOT_REPORTED" ||
    boundary.kind === "CORPUS_COVERAGE" ||
    boundary.kind === "PARTIAL_GRAVITY_BOUND";
  const Icon = informational ? Info : ShieldAlert;
  return (
    <div role="note" className={cn("rounded-lg border border-line bg-surface", className)}>
      <div className="flex items-start gap-4 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong bg-sunken text-ink-muted">
          <Icon aria-hidden className="size-4.5" />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
            {BOUNDARY_LABELS[boundary.kind]}
          </p>
          <p className="text-sm2 leading-relaxed text-ink">{boundary.message}</p>
          <BoundaryDetails details={boundary.details} />
        </div>
      </div>
      {boundary.details.length > 0 ? (
        <p className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-2 text-xs text-ink-faint">
          <ProvenanceBadge value="COMPUTED" />
          Details are read from the reviewed records, not generated.
        </p>
      ) : null}
    </div>
  );
}

/**
 * A list question ("Which investigations…?") answered from record metadata:
 * every verified investigation that matches, not just the top few by score.
 */
export function ListingSummary({
  listing,
  names,
  className,
}: {
  listing: EvidenceListing;
  /** Display names by record id, from the retrieved chunks. Falls back to the id. */
  names: Record<string, string>;
  className?: string;
}) {
  const count = listing.investigationIds.length;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-line bg-sunken/50 px-3 py-2.5 text-xs",
        className,
      )}
    >
      <ListChecks aria-hidden className="mt-0.5 size-4 shrink-0 text-computed" />
      <div className="min-w-0 space-y-1">
        <p className="text-ink">
          Every verified investigation where {listing.description}:{" "}
          <span className="font-medium">
            {count === 0 ? "none" : listing.investigationIds.map((id) => names[id] ?? id).join(", ")}
          </span>{" "}
          <span className="font-mono text-ink-faint">({count})</span>
        </p>
        <p className="flex flex-wrap items-center gap-2 text-ink-faint">
          <ProvenanceBadge value="COMPUTED" />
          Listed from record metadata, one passage each, so no matching record is left out.
        </p>
      </div>
    </div>
  );
}

/** Operational note from the retriever, e.g. that only keyword search ran. Quiet on purpose. */
export function SearchNotice({ notice, className }: { notice: string | null; className?: string }) {
  if (!notice) return null;
  return (
    <p className={cn("flex items-start gap-2 text-xs text-ink-faint", className)}>
      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      <span>{notice}</span>
    </p>
  );
}

function safeLink(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type GroundedSummary = Extract<SynthesisResponse, { status: "ok" }>;

/**
 * Optional grounded synthesis, drawn apart from source evidence: its own
 * dashed border, its own badge, the four sections the brief requires, a
 * citation number on every statement, and a numbered list of the passages it
 * was written from. Statements the grounding check removed are counted, not
 * hidden. Only ever shown after the retrieved evidence itself.
 */
export function GeneratedSummary({ result, className }: { result: GroundedSummary; className?: string }) {
  const numberOf = new Map(result.sources.map((source) => [source.id, source.number]));
  return (
    <section
      aria-label="Generated summary"
      className={cn("rounded-lg border border-dashed border-generated/50 bg-generated/[0.04]", className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-generated/30 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Layers aria-hidden className="size-4 text-generated" />
          Summary of the reviewed evidence
        </p>
        <ProvenanceBadge value="GENERATED_SUMMARY" />
      </header>
      <div className="space-y-4 px-4 py-3">
        {result.insufficient ? (
          <div
            role="note"
            className="flex items-start gap-3 rounded-md border border-line-strong bg-surface px-3 py-3"
          >
            <ShieldAlert aria-hidden className="mt-0.5 size-4.5 shrink-0 text-ink-muted" />
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
                Insufficient evidence
              </p>
              <p className="text-base font-semibold text-ink">{NOT_ESTABLISHED}</p>
              <p className="text-sm text-ink-muted">
                The reviewed knowledge does not contain enough to answer this question. The passages below are
                the closest matches; IGNIS does not fill the gap with generated text or typical values.
              </p>
            </div>
          </div>
        ) : null}
        {result.notes.length > 0 ? (
          <div className="space-y-1">
            <ul className="space-y-1 border-l-2 border-computed/40 pl-3 text-xs text-ink-muted">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="flex items-center gap-2 text-2xs text-ink-faint">
              <ProvenanceBadge value="COMPUTED" />
              Read from the reviewed records, not generated.
            </p>
          </div>
        ) : null}
        {SYNTHESIS_SECTIONS.map((section) => {
          const statements = result.sections[section];
          // The insufficient notice above replaces the answer; other grounded sections still show.
          if (section === "answer" && result.insufficient) return null;
          if (statements.length === 0 && section !== "answer") return null;
          return (
            <div key={section}>
              <p className="mb-1 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
                {SYNTHESIS_SECTION_LABELS[section]}
              </p>
              {section === "answer" && result.answerWithheld ? (
                <p className="text-sm text-ink-muted">
                  The summary&apos;s direct answer did not pass the review check, so it is not shown. The
                  supported findings below still apply; the removed sentence is listed at the end.
                </p>
              ) : null}
              <ul
                className={cn(
                  "space-y-1 leading-relaxed text-ink",
                  section === "answer" ? "text-sm2" : "text-sm",
                  section === "teamInterpretation" && "border-l-2 border-interpretation/50 pl-3",
                )}
              >
                {statements.map((statement) => (
                  <li key={statement.text}>
                    {statement.text}
                    {statement.sources.map((id) => (
                      <sup key={id} className="ml-0.5 font-mono text-2xs text-generated">
                        [{numberOf.get(id)}]
                      </sup>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {result.sources.length > 0 ? (
          <div>
            <p className="mb-1 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
              Written only from these {result.sources.length} passages, listed in full below
            </p>
            <ol className="space-y-0.5 text-xs text-ink-muted">
              {result.sources.map((source) => {
                const link = safeLink(source.sourceUrl);
                return (
                  <li key={source.id} className="flex flex-wrap items-center gap-x-2">
                    <span className="font-mono text-ink-faint">[{source.number}]</span>
                    <span>
                      {source.investigation} / {source.section}
                    </span>
                    <ProvenanceBadge value={source.sourceClass} />
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-line-strong underline-offset-2 hover:text-ink"
                      >
                        source
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}

        {result.removed.length > 0 ? (
          <details className="text-xs text-ink-muted">
            <summary className="cursor-pointer">
              {result.removed.length} generated{" "}
              {result.removed.length === 1 ? "statement was" : "statements were"} removed because the cited
              evidence did not support {result.removed.length === 1 ? "it" : "them"}
            </summary>
            <ul className="mt-1.5 space-y-1 border-l-2 border-line pl-3">
              {result.removed.map((item) => (
                <li key={`${item.section}-${item.text}`}>
                  <span className="text-ink-faint line-through">{item.text}</span>{" "}
                  <span className="text-ink-faint">({item.reason})</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <p className="flex flex-wrap items-center gap-2 text-2xs text-ink-faint">
          <ProvenanceBadge value="COMPUTED" />
          {result.model === null ? (
            "No language model was used: no reviewed passage covers what the question asks about."
          ) : (
            <>
              Every statement was checked: it cites a passage, each number in it appears in that passage
              {result.meaningChecked ? ", and a separate review pass found the passage supports it" : ""}.
              Generated by <span className="font-mono">{result.model}</span>. Review checks reduce mistakes
              but do not remove them; compare statements with the passages below.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
