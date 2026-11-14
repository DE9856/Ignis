"use client";

import { Equal, Minus, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Fragment, Suspense, useMemo, useState, type ReactNode } from "react";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { displayTitle, oneLineObjective } from "@/components/experiments/experiment-fields";
import { ExperimentValue } from "@/components/experiments/experiment-value";
import { EmptyState } from "@/components/shared/empty-state";
import { INPUT_CLASS, ToggleChip } from "@/components/shared/form-controls";
import { GRAVITY_LABELS, NOT_REPORTED } from "@/components/shared/labels";
import { LoadingState } from "@/components/shared/loading-state";
import { SafetyRole } from "@/components/shared/safety-badges";
import { StatusBadge } from "@/components/shared/status-badge";
import { buildComparisonViewModel, type ComparisonRow } from "@/lib/integration/comparison";
import { getEffectiveProvenance, isHumanReviewed } from "@/lib/domain/provenance";
import { GRAVITY_CONDITIONS, type Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

const MAX_SELECTED = 4;
const MIN_SELECTED = 2;

type Sameness = boolean | null | "n/a";

interface RowSpec {
  key: string;
  label: string;
  same: Sameness;
  render: (investigation: Investigation, index: number) => ReactNode;
}

interface GroupSpec {
  label: string;
  rows: RowSpec[];
}

/**
 * Screen 4, investigation comparison: up to four records side by side, grouped
 * rows, a same / differs / cannot-tell marker on every comparable row, shared
 * hardware called out, and findings kept apart from team interpretation.
 */
export function ComparisonTable({ investigations }: { investigations: Investigation[] }) {
  return (
    <Suspense fallback={<LoadingState label="Loading comparison" />}>
      <ComparisonWorkspace investigations={investigations} />
    </Suspense>
  );
}

function initialSelection(param: string | null, investigations: Investigation[]): string[] {
  const known = new Set(investigations.map((investigation) => investigation.id));
  const fromUrl = (param ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => known.has(id));
  if (fromUrl.length > 0) return [...new Set(fromUrl)].slice(0, MAX_SELECTED);
  const reviewedFirst = [...investigations].sort(
    (a, b) => Number(isHumanReviewed(b)) - Number(isHumanReviewed(a)),
  );
  return reviewedFirst.slice(0, MIN_SELECTED).map((investigation) => investigation.id);
}

function ComparisonWorkspace({ investigations }: { investigations: Investigation[] }) {
  const params = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialSelection(params.get("ids"), investigations),
  );
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [query, setQuery] = useState("");

  const updateSelection = (next: string[]) => {
    setSelectedIds(next);
    const { pathname, hash } = window.location;
    const search = next.length > 0 ? `?ids=${next.map(encodeURIComponent).join(",")}` : "";
    window.history.replaceState(null, "", `${pathname}${search}${hash}`);
  };

  const toggle = (id: string) =>
    updateSelection(
      selectedIds.includes(id)
        ? selectedIds.filter((candidate) => candidate !== id)
        : selectedIds.length < MAX_SELECTED
          ? [...selectedIds, id]
          : selectedIds,
    );

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => investigations.find((investigation) => investigation.id === id))
        .filter((investigation): investigation is Investigation => investigation !== undefined),
    [selectedIds, investigations],
  );

  if (investigations.length < MIN_SELECTED) {
    return (
      <EmptyState description="Comparison needs at least two investigation records. They are added as Markdown files in knowledge/investigations." />
    );
  }

  const activeRecords = investigations.filter((investigation) => investigation.status !== "deprecated");
  const filtered = query.trim()
    ? activeRecords.filter((investigation) =>
        `${investigation.title} ${investigation.shortTitle ?? ""} ${investigation.program ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : activeRecords;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            Choose {MIN_SELECTED} to {MAX_SELECTED} investigations.{" "}
            <span className="font-mono text-ink">
              {selected.length}/{MAX_SELECTED}
            </span>{" "}
            selected
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {investigations.length > 8 ? (
              <div className="relative w-56">
                <label htmlFor="compare-query" className="sr-only">
                  Find an investigation
                </label>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-faint"
                />
                <input
                  id="compare-query"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find an investigation"
                  className={cn(INPUT_CLASS, "h-8 pl-8 text-xs")}
                />
              </div>
            ) : null}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted hover:text-ink">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(event) => setOnlyDifferences(event.target.checked)}
                className="size-3.5 accent-accent"
              />
              Hide rows that are the same
            </label>
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {filtered.map((investigation) => {
            const active = selectedIds.includes(investigation.id);
            return (
              <li key={investigation.id}>
                <ToggleChip
                  pressed={active}
                  onClick={() => toggle(investigation.id)}
                  disabled={!active && selectedIds.length >= MAX_SELECTED}
                >
                  {displayTitle(investigation)}
                  {investigation.status !== "stable" ? (
                    <span className="font-mono text-2xs text-ink-faint uppercase">
                      {investigation.status}
                    </span>
                  ) : null}
                </ToggleChip>
              </li>
            );
          })}
        </ul>
      </div>

      {selected.length < MIN_SELECTED ? (
        <EmptyState
          icon={Equal}
          title="Select at least two investigations"
          description="Rows line up conditions, measurements and findings so differences stand out."
        />
      ) : (
        <ComparisonGrid
          investigations={selected}
          onlyDifferences={onlyDifferences}
          onRemove={(id) => toggle(id)}
        />
      )}
    </div>
  );
}

function rowSame(rows: ComparisonRow[], key: string): Sameness {
  return rows.find((row) => row.key === key)?.allSame ?? null;
}

function listOrMissing(values: string[], highlight?: Set<string>) {
  if (values.length === 0) return <ExperimentValue value={NOT_REPORTED} />;
  return (
    <ul className="flex flex-wrap gap-1">
      {values.map((value) => {
        const shared = highlight?.has(value) ?? false;
        return (
          <li
            key={value}
            className={cn(
              "inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-xs leading-tight",
              shared ? "border-accent/50 bg-accent/10 text-ink" : "border-line-strong text-ink-muted",
            )}
          >
            {value}
            {shared ? <span className="font-mono text-[10px] text-accent uppercase">shared</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function buildGroups(investigations: Investigation[]): GroupSpec[] {
  const model = buildComparisonViewModel(investigations);
  function cell(key: string) {
    return function renderCell(_: Investigation, index: number) {
      const row = model.rows.find((candidate) => candidate.key === key);
      const value = (row?.cells[index]?.display ?? NOT_REPORTED).replace("% O2", "% O₂");
      const numeric = key === "oxygen" || key === "pressure" || key === "airflow" || key === "gravityValue";
      const display =
        key === "gravityCondition" && (GRAVITY_CONDITIONS as readonly string[]).includes(value)
          ? GRAVITY_LABELS[value as (typeof GRAVITY_CONDITIONS)[number]]
          : value;
      return <ExperimentValue value={display} numeric={numeric} />;
    };
  }

  const hardwareCounts = new Map<string, number>();
  for (const investigation of investigations) {
    for (const name of new Set(investigation.hardware))
      hardwareCounts.set(name, (hardwareCounts.get(name) ?? 0) + 1);
  }
  const sharedHardware = new Set([...hardwareCounts].filter(([, count]) => count > 1).map(([name]) => name));

  const roles = investigations.map((investigation) => [...investigation.safetyCategories].sort().join(","));
  const rolesSame: Sameness = roles.some((role) => role === "")
    ? null
    : roles.every((role) => role === roles[0]);

  return [
    {
      label: "Purpose",
      rows: [
        {
          key: "objective",
          label: "Objective",
          same: "n/a",
          render: (investigation) => {
            const objective = oneLineObjective(investigation);
            return objective ? (
              <p className="text-sm2 leading-snug text-ink" title={investigation.objective ?? undefined}>
                {objective}
              </p>
            ) : (
              <ExperimentValue value={NOT_REPORTED} />
            );
          },
        },
        {
          key: "safetyCategories",
          label: "Fire-safety role",
          same: rolesSame,
          render: (investigation) => <SafetyRole objectives={investigation.safetyCategories} />,
        },
      ],
    },
    {
      label: "Sample",
      rows: [
        {
          key: "fuelType",
          label: "Fuel type",
          same: rowSame(model.rows, "fuelType"),
          render: cell("fuelType"),
        },
        {
          key: "material",
          label: "Material",
          same: rowSame(model.rows, "material"),
          render: cell("material"),
        },
        {
          key: "sampleShape",
          label: "Sample shape",
          same: rowSame(model.rows, "sampleShape"),
          render: cell("sampleShape"),
        },
        {
          key: "sampleSize",
          label: "Sample size",
          same: rowSame(model.rows, "sampleSize"),
          render: cell("sampleSize"),
        },
      ],
    },
    {
      label: "Environment",
      rows: [
        { key: "oxygen", label: "Oxygen", same: rowSame(model.rows, "oxygen"), render: cell("oxygen") },
        {
          key: "pressure",
          label: "Pressure",
          same: rowSame(model.rows, "pressure"),
          render: cell("pressure"),
        },
        { key: "airflow", label: "Airflow", same: rowSame(model.rows, "airflow"), render: cell("airflow") },
        {
          key: "gravityCondition",
          label: "Gravity",
          same: rowSame(model.rows, "gravityCondition"),
          render: cell("gravityCondition"),
        },
        {
          key: "gravityValue",
          label: "Gravity level",
          same: rowSame(model.rows, "gravityValue"),
          render: cell("gravityValue"),
        },
      ],
    },
    {
      label: "Facility",
      rows: [
        {
          key: "platform",
          label: "Platform",
          same: rowSame(model.rows, "platform"),
          render: cell("platform"),
        },
        {
          key: "hardware",
          label: "Hardware",
          same: rowSame(model.rows, "hardware"),
          render: (investigation) => listOrMissing(investigation.hardware, sharedHardware),
        },
      ],
    },
    {
      label: "What was measured",
      rows: [
        {
          key: "sensors",
          label: "Sensors",
          same: rowSame(model.rows, "sensors"),
          render: (investigation) => listOrMissing(investigation.sensors),
        },
        {
          key: "measurements",
          label: "Measurements",
          same: rowSame(model.rows, "measurements"),
          render: (investigation) => listOrMissing(investigation.measurements),
        },
        {
          key: "variables",
          label: "Variables",
          same: rowSame(model.rows, "variables"),
          render: (investigation) => listOrMissing(investigation.variables),
        },
      ],
    },
    {
      label: "Findings",
      rows: [
        {
          key: "keyFindings",
          label: "Key findings",
          same: "n/a",
          render: (investigation) => (
            <div className="space-y-1.5">
              <ProvenanceBadge
                value={getEffectiveProvenance("NASA_SOURCE", isHumanReviewed(investigation))}
              />
              {investigation.keyFindings.length > 0 ? (
                <ul className="space-y-1 text-xs leading-snug text-ink">
                  {investigation.keyFindings.map((finding) => (
                    <li key={finding} className="flex gap-1.5">
                      <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-faint" />
                      {finding}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <ExperimentValue value={NOT_REPORTED} />
                </p>
              )}
            </div>
          ),
        },
        {
          key: "fireSafetyRelevance",
          label: "Team interpretation",
          same: "n/a",
          render: (investigation) => (
            <div className="space-y-1.5 border-l-2 border-interpretation/60 pl-2.5">
              <ProvenanceBadge value="TEAM_INTERPRETATION" />
              <p
                className={cn(
                  "text-xs leading-snug",
                  investigation.fireSafetyRelevance ? "text-ink-muted" : "text-ink-faint italic",
                )}
              >
                {investigation.fireSafetyRelevance ?? "No team interpretation recorded"}
              </p>
            </div>
          ),
        },
      ],
    },
    {
      label: "Review",
      rows: [
        {
          key: "status",
          label: "Review status",
          same: "n/a",
          render: (investigation) => <StatusBadge status={investigation.status} />,
        },
        {
          key: "sources",
          label: "Sources",
          same: "n/a",
          render: (investigation) =>
            investigation.sources.length > 0 ? (
              <span className="font-mono text-xs text-ink-muted">{investigation.sources.length} cited</span>
            ) : (
              <span className="text-xs text-ink-faint italic">No source cited</span>
            ),
        },
      ],
    },
  ];
}

function SameMarker({ same }: { same: Sameness }) {
  if (same === "n/a") return null;
  if (same === true) {
    return (
      <span
        title="Same for every selected investigation"
        className="inline-flex items-center gap-1 text-2xs text-ink-faint"
      >
        <Equal aria-hidden className="size-3" />
        Same
      </span>
    );
  }
  if (same === false) {
    return (
      <span title="Values differ" className="inline-flex items-center gap-1 text-2xs font-medium text-accent">
        <span aria-hidden className="font-mono">
          ≠
        </span>
        Differs
      </span>
    );
  }
  return (
    <span
      title="At least one record does not report this, so sameness cannot be judged"
      className="inline-flex items-center gap-1 text-2xs text-ink-faint"
    >
      <Minus aria-hidden className="size-3" />
      Can&apos;t tell
    </span>
  );
}

function ComparisonGrid({
  investigations,
  onlyDifferences,
  onRemove,
}: {
  investigations: Investigation[];
  onlyDifferences: boolean;
  onRemove: (id: string) => void;
}) {
  const groups = buildGroups(investigations)
    .map((group) => ({ ...group, rows: group.rows.filter((row) => !onlyDifferences || row.same !== true) }))
    .filter((group) => group.rows.length > 0);

  return (
    <>
      {/* Laptop and up: one aligned table, label column pinned. */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
        <table className="w-full min-w-[44rem] table-fixed border-collapse text-left text-sm2">
          <colgroup>
            <col className="w-44" />
            {investigations.map((investigation) => (
              <col key={investigation.id} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line-strong">
              <th scope="col" className="sticky left-0 z-10 bg-surface px-4 py-3 align-bottom">
                <span className="font-mono text-2xs font-medium tracking-[0.08em] text-ink-faint uppercase">
                  Compare
                </span>
              </th>
              {investigations.map((investigation) => (
                <th key={investigation.id} scope="col" className="border-l border-line px-4 py-3 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={`/explore#${investigation.id}`}
                      className="min-w-0 text-sm leading-snug font-semibold text-ink hover:text-accent"
                    >
                      {displayTitle(investigation)}
                    </a>
                    <button
                      type="button"
                      onClick={() => onRemove(investigation.id)}
                      aria-label={`Remove ${displayTitle(investigation)} from comparison`}
                      className="-mt-0.5 -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-raised hover:text-ink"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-normal text-ink-faint">
                    {investigation.program ?? "Program not reported"}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-sunken/60">
                  <th
                    scope="colgroup"
                    colSpan={investigations.length + 1}
                    className="sticky left-0 px-4 pt-3 pb-1.5 font-mono text-2xs font-medium tracking-[0.1em] text-ink-faint uppercase"
                  >
                    {group.label}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr
                    key={row.key}
                    className={cn("border-t border-line align-top", row.same === false && "bg-accent/[0.03]")}
                  >
                    <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-2.5 font-normal">
                      <span className="block text-ink-muted">{row.label}</span>
                      <SameMarker same={row.same} />
                    </th>
                    {investigations.map((investigation, index) => (
                      <td key={investigation.id} className="border-l border-line px-4 py-2.5 break-words">
                        {row.render(investigation, index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: one block per row, each investigation listed under it. */}
      <div className="space-y-3 md:hidden">
        {groups.map((group) => (
          <section key={group.label} className="rounded-lg border border-line bg-surface">
            <h3 className="border-b border-line px-3 py-2 font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
              {group.label}
            </h3>
            <dl className="divide-y divide-line">
              {group.rows.map((row) => (
                <div key={row.key} className="px-3 py-2.5">
                  <dt className="mb-1.5 flex items-center justify-between gap-2 text-xs text-ink-muted">
                    {row.label}
                    <SameMarker same={row.same} />
                  </dt>
                  {investigations.map((investigation, index) => (
                    <dd
                      key={investigation.id}
                      className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 py-1 text-sm2"
                    >
                      <span className="truncate text-xs font-medium text-ink">
                        {displayTitle(investigation)}
                      </span>
                      <div className="min-w-0">{row.render(investigation, index)}</div>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </>
  );
}
