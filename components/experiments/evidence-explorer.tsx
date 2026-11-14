"use client";

import { ArrowRight, FunnelX, LayoutGrid, Rows3, X } from "lucide-react";
import Link from "next/link";
import { Fragment, useMemo, useState, useSyncExternalStore } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { pluralize } from "@/components/shared/labels";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { ExperimentCard } from "./experiment-card";
import { ExperimentDetail } from "./experiment-detail";
import { displayTitle } from "./experiment-fields";
import { ExperimentTable } from "./experiment-table";
import {
  applyFilters,
  EMPTY_FILTERS,
  ExplorerFilterBar,
  filterOptions,
  type ExplorerFilters,
} from "./explorer-filters";

const MAX_COMPARE = 4;

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHash(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

/** Selection lives in the URL hash, so /explore#record-id deep-links to a record. */
function setHash(id: string | null) {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", id ? `#${encodeURIComponent(id)}` : `${pathname}${search}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/**
 * Screen 3, the Evidence Explorer: filters above, scannable cards (or a dense
 * table) on the left, and the selected record in full beside them. No modal:
 * the record opens in place and its URL can be shared.
 */
export function EvidenceExplorer({ investigations }: { investigations: Investigation[] }) {
  const [filters, setFilters] = useState<ExplorerFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const hash = useSyncExternalStore(subscribeToHash, readHash, () => "");

  const options = useMemo(() => filterOptions(investigations), [investigations]);
  const { visible, hiddenUnreported } = useMemo(
    () => applyFilters(investigations, filters),
    [investigations, filters],
  );
  const selected = investigations.find((investigation) => investigation.id === hash) ?? null;

  if (investigations.length === 0) {
    return (
      <EmptyState description="Investigation records are Markdown files in knowledge/investigations. They appear here, with their review status, as soon as they are added." />
    );
  }

  const toggleCompare = (id: string) =>
    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : current.length < MAX_COMPARE
          ? [...current, id]
          : current,
    );

  const compareFooter = (investigation: Investigation) => {
    const checked = compareIds.includes(investigation.id);
    const disabled = !checked && compareIds.length >= MAX_COMPARE;
    return (
      <label
        className={cn(
          "inline-flex items-center gap-1.5 text-ink-muted",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-ink",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => toggleCompare(investigation.id)}
          className="size-3.5 accent-accent"
        />
        Compare
        <span className="sr-only">{displayTitle(investigation)}</span>
      </label>
    );
  };

  const detailPanel = selected ? (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">Full record</p>
        <button
          type="button"
          onClick={() => setHash(null)}
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-ink-muted hover:bg-raised hover:text-ink"
        >
          <X aria-hidden className="size-3.5" />
          Close
        </button>
      </div>
      <ExperimentDetail investigation={selected} />
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <ExplorerFilterBar
        filters={filters}
        onChange={setFilters}
        options={options}
        investigations={investigations}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-xs text-ink-muted">
          Showing <span className="font-mono text-ink">{visible.length}</span> of{" "}
          {pluralize(investigations.length, "investigation")}
          {hiddenUnreported > 0 ? (
            <>
              {" "}
              · {hiddenUnreported} hidden because {hiddenUnreported === 1 ? "it does" : "they do"} not report
              the filtered condition{" "}
              <button
                type="button"
                onClick={() => setFilters({ ...filters, includeUnreported: true })}
                className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
              >
                Show them
              </button>
            </>
          ) : null}
        </p>
        <div className="flex items-center gap-2">
          {compareIds.length > 0 ? (
            <Link
              href={`/compare?ids=${compareIds.map(encodeURIComponent).join(",")}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-accent/60 bg-accent/10 px-3 text-xs font-medium text-ink hover:bg-accent/15"
            >
              Compare {compareIds.length} selected
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          ) : null}
          <div
            role="group"
            aria-label="Layout"
            className="inline-flex rounded-md border border-line-strong p-0.5"
          >
            {(
              [
                ["cards", "Cards", LayoutGrid],
                ["table", "Table", Rows3],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2 text-xs transition-colors",
                  view === value ? "bg-raised text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={FunnelX}
          title="No investigations match these filters"
          description="Loosen a filter, or include records that do not report the filtered condition."
          action={
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="h-8 rounded-md border border-line-strong px-3 text-xs text-ink hover:border-ink-faint/60"
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <div
          className={cn(
            "grid items-start gap-5",
            selected && "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
          )}
        >
          {view === "table" ? (
            <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
              <ExperimentTable
                investigations={visible}
                selectedId={selected?.id ?? null}
                onSelect={setHash}
              />
              {detailPanel ? <div className="border-t border-line p-3 lg:hidden">{detailPanel}</div> : null}
            </div>
          ) : (
            <div
              className={cn(
                "grid min-w-0 gap-3",
                selected ? "sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {visible.map((investigation) => (
                <Fragment key={investigation.id}>
                  <ExperimentCard
                    investigation={investigation}
                    selected={investigation.id === selected?.id}
                    onSelect={() => setHash(investigation.id === selected?.id ? null : investigation.id)}
                    footer={compareFooter(investigation)}
                  />
                  {investigation.id === selected?.id ? (
                    <div className="col-span-full lg:hidden">{detailPanel}</div>
                  ) : null}
                </Fragment>
              ))}
            </div>
          )}

          {detailPanel ? (
            <div className="hidden min-w-0 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
              {detailPanel}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
