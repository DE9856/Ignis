"use client";

import { RotateCcw, Search } from "lucide-react";

import {
  Field,
  INPUT_CLASS,
  NumberInput,
  SegmentedControl,
  ToggleChip,
} from "@/components/shared/form-controls";
import { GRAVITY_LABELS, NOT_REPORTED, SAFETY_LABELS, SAFETY_LETTERS } from "@/components/shared/labels";
import { isHumanReviewed } from "@/lib/domain/provenance";
import { rangeContains } from "@/lib/domain/units";
import {
  GRAVITY_CONDITIONS,
  SAFETY_OBJECTIVES,
  type Investigation,
  type SafetyObjective,
} from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";
import { parseOptionalNumber } from "@/lib/utils/numbers";

/** "all" means every active record; deprecated records only appear when asked for. */
export type ReviewFilter = "all" | "reviewed" | "draft" | "deprecated";

export interface ExplorerFilters {
  query: string;
  objectives: SafetyObjective[];
  /** Matches a record whose material or fuel type equals this value. */
  materialOrFuel: string;
  platform: string;
  hardware: string;
  /** A gravity condition, "not_reported", or "" for any. */
  gravity: string;
  /** A value the record's tested range must include. */
  oxygen: string;
  airflow: string;
  review: ReviewFilter;
  /** Keep records that do not report oxygen or airflow when filtering on them. */
  includeUnreported: boolean;
}

export const EMPTY_FILTERS: ExplorerFilters = {
  query: "",
  objectives: [],
  materialOrFuel: "",
  platform: "",
  hardware: "",
  gravity: "",
  oxygen: "",
  airflow: "",
  review: "all",
  includeUnreported: false,
};

export function isFiltered(filters: ExplorerFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
}

export interface FilterOptions {
  materialsAndFuels: string[];
  platforms: string[];
  hardware: string[];
}

function sortedUnique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => value !== null))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function filterOptions(investigations: Investigation[]): FilterOptions {
  return {
    materialsAndFuels: sortedUnique(investigations.flatMap((i) => [i.material, i.fuelType])),
    platforms: sortedUnique(investigations.map((i) => i.platform)),
    hardware: sortedUnique(investigations.flatMap((i) => i.hardware)),
  };
}

export interface FilterResult {
  visible: Investigation[];
  /** Records hidden only because they do not report a filtered oxygen or airflow value. */
  hiddenUnreported: number;
}

/**
 * Applies the filters. Ranges use three-valued containment from lib/domain/units:
 * a record that does not state a bound is never treated as covering a value.
 */
export function applyFilters(investigations: Investigation[], filters: ExplorerFilters): FilterResult {
  const query = filters.query.trim().toLowerCase();
  const oxygen = parseOptionalNumber(filters.oxygen);
  const airflow = parseOptionalNumber(filters.airflow);
  let hiddenUnreported = 0;

  const visible = investigations.filter((investigation) => {
    if (query) {
      const haystack = [
        investigation.id,
        investigation.title,
        investigation.shortTitle,
        investigation.program,
        ...investigation.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (
      filters.objectives.length > 0 &&
      !filters.objectives.some((o) => investigation.safetyCategories.includes(o))
    ) {
      return false;
    }
    if (
      filters.materialOrFuel &&
      investigation.material !== filters.materialOrFuel &&
      investigation.fuelType !== filters.materialOrFuel
    ) {
      return false;
    }
    if (filters.platform && investigation.platform !== filters.platform) return false;
    if (filters.hardware && !investigation.hardware.includes(filters.hardware)) return false;
    if (filters.gravity) {
      const condition = investigation.gravityCondition ?? "not_reported";
      if (condition !== filters.gravity) return false;
    }
    if (filters.review === "all" && investigation.status === "deprecated") return false;
    if (filters.review === "reviewed" && !isHumanReviewed(investigation)) return false;
    if (filters.review === "draft" && investigation.status !== "draft") return false;
    if (filters.review === "deprecated" && investigation.status !== "deprecated") return false;

    let unreported = false;
    for (const [value, min, max] of [
      [oxygen, investigation.oxygenMin, investigation.oxygenMax],
      [airflow, investigation.airflowMin, investigation.airflowMax],
    ] as const) {
      if (value === null) continue;
      const contains = rangeContains({ min, max }, value);
      if (contains === false) return false;
      if (contains === null) unreported = true;
    }
    if (unreported && !filters.includeUnreported) {
      hiddenUnreported += 1;
      return false;
    }
    return true;
  });

  return { visible, hiddenUnreported };
}

interface ExplorerFilterBarProps {
  filters: ExplorerFilters;
  onChange: (filters: ExplorerFilters) => void;
  options: FilterOptions;
  investigations: Investigation[];
  className?: string;
}

function SelectFilter({
  id,
  label,
  value,
  onChange,
  options,
  anyLabel = "Any",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  anyLabel?: string;
}) {
  return (
    <Field id={id} label={label}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={options.length === 0}
        className={cn(INPUT_CLASS, "pr-8 disabled:cursor-not-allowed disabled:text-ink-faint")}
      >
        <option value="">{options.length === 0 ? "None recorded" : anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Screen 3 filters, in one row above the results they scope. */
export function ExplorerFilterBar({
  filters,
  onChange,
  options,
  investigations,
  className,
}: ExplorerFilterBarProps) {
  const set = <K extends keyof ExplorerFilters>(key: K, value: ExplorerFilters[K]) =>
    onChange({ ...filters, [key]: value });
  const toggleObjective = (objective: SafetyObjective) =>
    set(
      "objectives",
      filters.objectives.includes(objective)
        ? filters.objectives.filter((candidate) => candidate !== objective)
        : [...filters.objectives, objective],
    );
  const objectiveCount = (objective: SafetyObjective) =>
    investigations.filter((investigation) => investigation.safetyCategories.includes(objective)).length;
  const numericFilterOn = filters.oxygen.trim() !== "" || filters.airflow.trim() !== "";

  return (
    <div className={cn("space-y-3 rounded-lg border border-line bg-surface p-4", className)}>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="relative w-full sm:w-64">
          <label htmlFor="explorer-query" className="sr-only">
            Search investigations
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="explorer-query"
            type="search"
            value={filters.query}
            onChange={(event) => set("query", event.target.value)}
            placeholder="Investigation, program or tag"
            autoComplete="off"
            className={cn(INPUT_CLASS, "pl-8")}
          />
        </div>

        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend className="sr-only">Fire-safety role</legend>
          {SAFETY_OBJECTIVES.map((objective) => (
            <ToggleChip
              key={objective}
              pressed={filters.objectives.includes(objective)}
              onClick={() => toggleObjective(objective)}
              count={objectiveCount(objective)}
            >
              <span aria-hidden className="font-mono text-2xs font-semibold text-ink-faint">
                {SAFETY_LETTERS[objective]}
              </span>
              {SAFETY_LABELS[objective]}
            </ToggleChip>
          ))}
        </fieldset>

        <SegmentedControl
          name="explorer-review"
          legend="Review state"
          hideLegend
          options={[
            { value: "all", label: "All active" },
            { value: "reviewed", label: "Human reviewed" },
            { value: "draft", label: "Draft" },
            ...(investigations.some((investigation) => investigation.status === "deprecated")
              ? [{ value: "deprecated" as const, label: "Deprecated" }]
              : []),
          ]}
          value={filters.review}
          onChange={(value) => set("review", value)}
          className="w-full sm:w-auto sm:min-w-80"
        />

        {isFiltered(filters) ? (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs text-ink-muted hover:text-ink"
          >
            <RotateCcw aria-hidden className="size-3.5" />
            Reset filters
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 md:grid-cols-3 xl:grid-cols-6">
        <SelectFilter
          id="explorer-material"
          label="Fuel / material"
          value={filters.materialOrFuel}
          onChange={(value) => set("materialOrFuel", value)}
          options={options.materialsAndFuels.map((value) => ({ value, label: value }))}
        />
        <SelectFilter
          id="explorer-gravity"
          label="Gravity"
          value={filters.gravity}
          onChange={(value) => set("gravity", value)}
          options={[
            ...GRAVITY_CONDITIONS.map((condition) => ({
              value: condition,
              label: GRAVITY_LABELS[condition],
            })),
            { value: "not_reported", label: NOT_REPORTED },
          ]}
        />
        <SelectFilter
          id="explorer-platform"
          label="Platform"
          value={filters.platform}
          onChange={(value) => set("platform", value)}
          options={options.platforms.map((value) => ({ value, label: value }))}
        />
        <SelectFilter
          id="explorer-hardware"
          label="Hardware"
          value={filters.hardware}
          onChange={(value) => set("hardware", value)}
          options={options.hardware.map((value) => ({ value, label: value }))}
        />
        <Field id="explorer-oxygen" label="Oxygen tested" hint="range includes">
          <NumberInput
            id="explorer-oxygen"
            unit="% O₂"
            value={filters.oxygen}
            onChange={(value) => set("oxygen", value)}
          />
        </Field>
        <Field id="explorer-airflow" label="Airflow tested" hint="range includes">
          <NumberInput
            id="explorer-airflow"
            unit="m/s"
            value={filters.airflow}
            onChange={(value) => set("airflow", value)}
          />
        </Field>
      </div>

      {numericFilterOn ? (
        <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-ink-muted hover:text-ink">
          <input
            type="checkbox"
            checked={filters.includeUnreported}
            onChange={(event) => set("includeUnreported", event.target.checked)}
            className="size-3.5 accent-accent"
          />
          Also show records that do not report the filtered condition
        </label>
      ) : null}
    </div>
  );
}
