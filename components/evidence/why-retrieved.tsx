import { Disclosure } from "@/components/shared/disclosure";
import { GRAVITY_LABELS, SAFETY_LABELS } from "@/components/shared/labels";
import type { RetrievalFilters, RetrievedEvidence } from "@/lib/retrieval/types";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/numbers";

import { queryTerms, termsFoundIn } from "./query-terms";

function ScoreRow({ label, value, note }: { label: string; value: number | null; note: string }) {
  const inUnitRange = value !== null && value >= 0 && value <= 1;
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.25rem] items-center gap-3 text-xs">
      <dt className="text-ink-muted" title={note}>
        {label}
      </dt>
      <dd className="contents">
        <span aria-hidden className="relative h-1.5 overflow-hidden rounded-full bg-track">
          {inUnitRange ? (
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-evidence-direct transition-[width] duration-500 ease-out"
              style={{ width: `${value * 100}%` }}
            />
          ) : null}
        </span>
        <span
          className={cn(
            "text-right font-mono whitespace-nowrap tabular-nums",
            value === null ? "text-ink-faint" : "text-ink",
          )}
        >
          {value === null ? "not used" : formatNumber(value)}
        </span>
      </dd>
    </div>
  );
}

function Tag({ children, matched = false }: { children: string; matched?: boolean }) {
  return (
    <li
      className={cn(
        "rounded-[3px] border px-1.5 py-0.5 font-mono text-2xs",
        matched ? "border-computed/50 bg-computed/10 text-computed" : "border-line-strong text-ink-muted",
      )}
    >
      {children}
    </li>
  );
}

/**
 * "Why retrieved?" drawer: query terms found in the passage, the metadata that
 * matched the active filters, and the retriever's own score components.
 */
export function WhyRetrieved({
  result,
  query,
  filters,
}: {
  result: RetrievedEvidence;
  query: string;
  filters: RetrievalFilters;
}) {
  const { chunk } = result;
  const terms = queryTerms(query);
  const found = termsFoundIn(terms, `${chunk.title} ${chunk.section} ${chunk.content}`);
  const missing = terms.filter((term) => !found.includes(term));

  const metadata: { label: string; value: string; matched: boolean }[] = [
    ...chunk.safetyCategories.map((objective) => ({
      label: "role",
      value: SAFETY_LABELS[objective],
      matched: filters.safetyCategories?.includes(objective) ?? false,
    })),
    ...(chunk.gravityCondition
      ? [
          {
            label: "gravity",
            value: GRAVITY_LABELS[chunk.gravityCondition],
            matched: filters.gravityCondition === chunk.gravityCondition,
          },
        ]
      : []),
    ...(chunk.material
      ? [{ label: "material", value: chunk.material, matched: filters.material === chunk.material }]
      : []),
    ...(chunk.fuelType
      ? [{ label: "fuel", value: chunk.fuelType, matched: filters.fuelType === chunk.fuelType }]
      : []),
    ...chunk.tags.map((tag) => ({ label: "tag", value: tag, matched: false })),
  ];

  return (
    <Disclosure summary="Why retrieved?" bodyClassName="pt-2.5">
      <div className="grid gap-4 rounded-md border border-line bg-sunken/50 p-3 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
              Query terms in passage
            </p>
            {terms.length === 0 ? (
              <p className="text-xs text-ink-faint italic">No searchable terms in the question.</p>
            ) : (
              <ul className="flex flex-wrap gap-1">
                {found.map((term) => (
                  <Tag key={term} matched>
                    {term}
                  </Tag>
                ))}
                {missing.map((term) => (
                  <li
                    key={term}
                    className="rounded-[3px] border border-dashed border-line px-1.5 py-0.5 font-mono text-2xs text-ink-faint line-through"
                  >
                    {term}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-1.5 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
              Chunk metadata
            </p>
            {metadata.length === 0 ? (
              <p className="text-xs text-ink-faint italic">No metadata recorded on this chunk.</p>
            ) : (
              <ul className="flex flex-wrap gap-1">
                {metadata.map((entry) => (
                  <Tag key={`${entry.label}-${entry.value}`} matched={entry.matched}>
                    {`${entry.label}: ${entry.value}`}
                  </Tag>
                ))}
              </ul>
            )}
            <p className="mt-1.5 text-2xs text-ink-faint">Highlighted entries matched an active filter.</p>
          </div>
        </div>
        <div>
          <p className="mb-1.5 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">
            Retrieval score components
          </p>
          <dl className="space-y-2">
            <ScoreRow
              label="Lexical"
              value={result.scores.lexical}
              note="Keyword match over the passage text"
            />
            <ScoreRow
              label="Vector"
              value={result.scores.vector}
              note="Embedding similarity to the question"
            />
            <ScoreRow
              label="Metadata"
              value={result.scores.metadata}
              note="Share of the question's investigations, roles, gravity, materials and hardware this passage matches"
            />
            <ScoreRow label="Combined" value={result.scores.fused} note="Fused score used for ordering" />
          </dl>
          <p className="mt-3 font-mono text-2xs leading-relaxed break-all text-ink-faint">
            chunk {chunk.id}
            {chunk.embeddingVersion ? ` · ${chunk.embeddingVersion}` : ""}
          </p>
          <p className="mt-1 text-2xs text-ink-faint">
            Scores order results. They are not confidence, probability or a measure of fire safety.
          </p>
        </div>
      </div>
    </Disclosure>
  );
}
