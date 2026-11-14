"use client";

import { Layers, Search, ServerOff } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Enter } from "@/components/motion/enter";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { INPUT_CLASS, ToggleChip } from "@/components/shared/form-controls";
import { GRAVITY_LABELS, SAFETY_LABELS } from "@/components/shared/labels";
import { LoadingState } from "@/components/shared/loading-state";
import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { retrieveEvidence, type EvidenceRetrievalResult } from "@/lib/integration/retrieval";
import {
  GRAVITY_CONDITIONS,
  SAFETY_OBJECTIVES,
  type GravityCondition,
  type SafetyObjective,
} from "@/lib/okf/types";
import type { RetrievalFilters } from "@/lib/retrieval/types";
import { cn } from "@/lib/utils/cn";

import { EvidenceCard } from "./evidence-card";
import { EvidenceRefusal } from "./evidence-states";
import { ProvenanceBadge } from "./provenance-badge";

const RESULT_LIMIT = 8;

/** Example questions. Phrasings only: they assert nothing about what the records contain. */
const EXAMPLES = [
  "How was smoke detection studied?",
  "Which experiments measured flame spread over solid materials?",
  "What happens to flames under low-speed airflow?",
];

type SearchState =
  | { kind: "idle" }
  | { kind: "pending"; query: string }
  | { kind: "done"; query: string; filters: RetrievalFilters; response: EvidenceRetrievalResult }
  | { kind: "error"; query: string };

/**
 * Screen 6, evidence search. Retrieved passages come first and are useful on
 * their own; generating a summary is a separate, optional step that is only
 * offered after the evidence, and only when synthesis is available.
 */
export function EvidenceSearch({ synthesisAvailable = false }: { synthesisAvailable?: boolean }) {
  const [text, setText] = useState("");
  const [objectives, setObjectives] = useState<SafetyObjective[]>([]);
  const [gravity, setGravity] = useState<GravityCondition | "">("");
  const [state, setState] = useState<SearchState>({ kind: "idle" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function run(query: string) {
    const trimmed = query.trim();
    if (trimmed === "") return;
    const filters: RetrievalFilters = {
      ...(objectives.length > 0 ? { safetyCategories: objectives } : {}),
      ...(gravity ? { gravityCondition: gravity } : {}),
    };
    setState({ kind: "pending", query: trimmed });
    setSelectedIds([]);
    try {
      const response = await retrieveEvidence({ text: trimmed, filters, limit: RESULT_LIMIT });
      setState({ kind: "done", query: trimmed, filters, response });
    } catch {
      setState({ kind: "error", query: trimmed });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(text);
  }

  const toggleObjective = (objective: SafetyObjective) =>
    setObjectives((current) =>
      current.includes(objective)
        ? current.filter((candidate) => candidate !== objective)
        : [...current, objective],
    );

  const toggleSelected = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id],
    );

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-line bg-surface p-4"
        role="search"
      >
        <label htmlFor="evidence-query" className="block text-xs font-medium text-ink">
          Ask a question of the reviewed evidence
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            />
            <input
              id="evidence-query"
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="A material, a condition, a measurement, or a question"
              autoComplete="off"
              className={cn(INPUT_CLASS, "h-10 pl-9 text-sm")}
            />
          </div>
          <button
            type="submit"
            disabled={text.trim() === "" || state.kind === "pending"}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search aria-hidden className="size-4" />
            Search evidence
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
          <fieldset className="flex flex-wrap items-center gap-1.5">
            <legend className="sr-only">Fire-safety role</legend>
            {SAFETY_OBJECTIVES.map((objective) => (
              <ToggleChip
                key={objective}
                pressed={objectives.includes(objective)}
                onClick={() => toggleObjective(objective)}
              >
                {SAFETY_LABELS[objective]}
              </ToggleChip>
            ))}
          </fieldset>
          <div className="flex items-center gap-2">
            <label htmlFor="evidence-gravity" className="text-xs text-ink-muted">
              Gravity
            </label>
            <select
              id="evidence-gravity"
              value={gravity}
              onChange={(event) => setGravity(event.target.value as GravityCondition | "")}
              className={cn(INPUT_CLASS, "h-7 w-auto py-0 pr-7 text-xs")}
            >
              <option value="">Any</option>
              {GRAVITY_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {GRAVITY_LABELS[condition]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {state.kind === "idle" ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 text-xs text-ink-faint">Try</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setText(example);
                  void run(example);
                }}
                className="rounded-md border border-dashed border-line-strong px-2 py-1 text-xs text-ink-muted transition-colors hover:border-ink-faint/60 hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        ) : null}
      </form>

      <SearchResults
        state={state}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        synthesisAvailable={synthesisAvailable}
      />
    </div>
  );
}

function SearchResults({
  state,
  selectedIds,
  onToggleSelected,
  synthesisAvailable,
}: {
  state: SearchState;
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
  synthesisAvailable: boolean;
}) {
  if (state.kind === "idle") {
    return (
      <EmptyState
        icon={Search}
        title="Retrieved evidence appears here"
        description="Each passage shows its investigation, section, evidence class, review state and NASA source, with a drawer explaining why it was retrieved."
      />
    );
  }
  if (state.kind === "pending") return <LoadingState label="Searching reviewed evidence" />;
  if (state.kind === "error") {
    return (
      <ErrorState title="The search failed" description="Nothing was retrieved. Try again in a moment." />
    );
  }

  const { response, query, filters } = state;

  if (response.status === "unavailable") {
    return (
      <EmptyState
        icon={ServerOff}
        title="Evidence search is not available yet"
        description={
          <>
            {response.reason}
            <span className="mt-1 block">{DEGRADED_MESSAGES.noRetrieval}</span>
          </>
        }
      />
    );
  }

  if (response.results.length === 0) {
    return (
      <Enter key={query}>
        <EvidenceRefusal query={query} />
      </Enter>
    );
  }

  return (
    <section aria-labelledby="retrieved-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="retrieved-title" className="text-sm font-semibold text-ink">
          Retrieved evidence{" "}
          <span className="font-mono font-normal text-ink-faint">{response.results.length}</span>
        </h2>
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <ProvenanceBadge value="COMPUTED" />
          Ordered by retrieval score, best first
        </p>
      </div>

      {response.origin === "dev-mock" ? (
        <p
          role="note"
          className="rounded-md border border-accent/50 bg-accent/[0.07] px-3 py-2 text-xs text-accent"
        >
          {DEGRADED_MESSAGES.devMocks}
        </p>
      ) : null}

      <Enter key={`${query}|${response.results.length}`} selector=":scope > ol > li">
        <ol className="space-y-3">
          {response.results.map((result, index) => {
            const checked = selectedIds.includes(result.chunk.id);
            return (
              <li key={result.chunk.id}>
                <EvidenceCard
                  input={result}
                  rank={index + 1}
                  query={query}
                  filters={filters}
                  action={
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-ink-muted hover:text-ink">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleSelected(result.chunk.id)}
                        className="size-3.5 accent-accent"
                      />
                      Use in summary
                    </label>
                  }
                />
              </li>
            );
          })}
        </ol>
      </Enter>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-line-strong px-4 py-3">
        <div className="min-w-0 text-xs text-ink-muted">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-ink">Optional:</span> summarise the passages you selected.
            <ProvenanceBadge value="GENERATED_SUMMARY" />
          </p>
          <p className="mt-1 text-ink-faint">
            {synthesisAvailable
              ? "The summary is written only from the selected passages and cites each one."
              : DEGRADED_MESSAGES.noSynthesis}
          </p>
        </div>
        <button
          type="button"
          disabled={!synthesisAvailable || selectedIds.length === 0}
          title={synthesisAvailable ? undefined : DEGRADED_MESSAGES.noSynthesis}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-generated/50 px-3 text-xs font-medium text-ink transition-colors hover:bg-generated/10 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Layers aria-hidden className="size-3.5" />
          Summarise selected evidence
          <span className="font-mono text-ink-faint">{selectedIds.length}</span>
        </button>
      </div>
    </section>
  );
}
