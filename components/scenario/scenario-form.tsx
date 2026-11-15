"use client";

import { RotateCcw } from "lucide-react";
import { useId } from "react";

import { Field, INPUT_CLASS, NumberInput, SegmentedControl } from "@/components/shared/form-controls";
import { SAFETY_LABELS, SAFETY_LETTERS } from "@/components/shared/labels";
import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { VALUE_BASIS_LABELS, type MissionPreset } from "@/lib/integration/missions";
import type { MissionValueKey } from "@/lib/okf/schema";
import { SAFETY_OBJECTIVES } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import {
  EMPTY_SCENARIO_DRAFT,
  NUMERIC_FIELDS,
  scenarioToDraft,
  type FieldErrors,
  type ScenarioDraft,
} from "./scenario-draft";

export type { ScenarioDraft } from "./scenario-draft";
export { EMPTY_SCENARIO_DRAFT } from "./scenario-draft";

export const OBJECTIVE_OPTIONS = [
  { value: "", label: "Any objective", short: "Any" },
  ...SAFETY_OBJECTIVES.map((objective) => ({
    value: objective,
    label: SAFETY_LABELS[objective],
    short: SAFETY_LABELS[objective],
  })),
];

export const OBJECTIVE_OPTIONS_SHORT = [
  { value: "", label: "Any objective", short: "Any" },
  ...SAFETY_OBJECTIVES.map((objective) => ({
    value: objective,
    label: SAFETY_LABELS[objective],
    short: SAFETY_LETTERS[objective],
  })),
];

interface PresetSelectProps {
  presets: MissionPreset[];
  value: string;
  onSelect: (draft: ScenarioDraft) => void;
  current: ScenarioDraft;
  className?: string;
}

/** Mission presets (knowledge/missions). Selecting one fills the form; every field stays editable. */
export function PresetSelect({ presets, value, onSelect, current, className }: PresetSelectProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink">
        Mission preset
      </label>
      <select
        id={id}
        className={cn(INPUT_CLASS, "pr-8 disabled:cursor-not-allowed disabled:text-ink-faint")}
        value={presets.some((preset) => preset.id === value) ? value : ""}
        disabled={presets.length === 0}
        onChange={(event) => {
          const preset = presets.find((candidate) => candidate.id === event.target.value);
          onSelect(preset ? scenarioToDraft(preset) : { ...current, presetId: "" });
        }}
      >
        <option value="">{presets.length === 0 ? "None yet" : "Custom scenario"}</option>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name || preset.id}
          </option>
        ))}
      </select>
    </div>
  );
}

const BASIS_ROWS: { key: MissionValueKey; label: string; unit: string }[] = [
  { key: "oxygenPercent", label: "Oxygen", unit: "%" },
  { key: "pressureKPa", label: "Pressure", unit: " kPa" },
  { key: "gravityG", label: "Gravity", unit: " g" },
  { key: "airflowMetersPerSecond", label: "Airflow", unit: " m/s" },
  { key: "material", label: "Material", unit: "" },
  { key: "fuelType", label: "Fuel", unit: "" },
  { key: "safetyObjective", label: "Objective", unit: "" },
];

/**
 * Where a loaded preset's values come from, shown while the preset is untouched.
 * A preset is a scenario input, not evidence: its review state is shown too.
 */
export function PresetBasis({ preset }: { preset: MissionPreset }) {
  const rows = BASIS_ROWS.filter(({ key }) => preset[key] !== null);
  return (
    <div className="rounded-md border border-line bg-sunken/60 px-3 py-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-ink">Where these values come from</p>
        {preset.humanReviewed ? (
          <ProvenanceBadge value="HUMAN_REVIEWED" />
        ) : (
          <ProvenanceBadge value="UNVERIFIED" />
        )}
      </div>
      {rows.length > 0 ? (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          {rows.map(({ key, label, unit }) => {
            const basis = preset.valueBasis[key];
            return (
              <div key={key} className="contents">
                <dt className="text-ink-muted">
                  {label} <span className="font-mono text-ink tabular-nums">{`${preset[key]}${unit}`}</span>
                </dt>
                <dd className={basis === "prototype_assumption" ? "text-ink-muted italic" : "text-ink"}>
                  {basis ? VALUE_BASIS_LABELS[basis] : "Basis not recorded"}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}
      {preset.sources.length > 0 ? (
        <ul className="mt-2 space-y-0.5 border-t border-line pt-2">
          {preset.sources.map((source) => (
            <li key={source.id} className="truncate">
              <a
                href={source.resource}
                target="_blank"
                rel="noreferrer"
                className="text-ink-muted underline decoration-line-strong underline-offset-2 hover:text-ink"
              >
                {source.title ?? source.id}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {!preset.humanReviewed ? (
        <p className="mt-2 text-ink-faint">
          Preset not yet checked by a second reviewer. Editing any condition makes it a custom scenario.
        </p>
      ) : null}
    </div>
  );
}

interface ScenarioFormProps {
  draft: ScenarioDraft;
  errors: FieldErrors;
  onChange: (draft: ScenarioDraft) => void;
  presets?: MissionPreset[];
  /** Materials and fuels that reviewed records actually state, offered as suggestions. */
  materialOptions?: string[];
  fuelOptions?: string[];
}

/** The full scenario form for the Scenario Builder. */
export function ScenarioForm({
  draft,
  errors,
  onChange,
  presets = [],
  materialOptions = [],
  fuelOptions = [],
}: ScenarioFormProps) {
  const set = (key: keyof ScenarioDraft) => (value: string) =>
    onChange({
      ...draft,
      [key]: value,
      presetId: key === "name" || key === "description" || key === "assumptionNotes" ? draft.presetId : "",
    });
  const selectedPreset = presets.find((preset) => preset.id === draft.presetId) ?? null;

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-3">
        <PresetSelect presets={presets} value={draft.presetId} current={draft} onSelect={onChange} />
        {selectedPreset ? <PresetBasis preset={selectedPreset} /> : null}
        <Field id="scenario-name" label="Scenario name">
          <input
            id="scenario-name"
            className={INPUT_CLASS}
            value={draft.name}
            autoComplete="off"
            onChange={(event) => set("name")(event.target.value)}
          />
        </Field>
        <Field id="scenario-description" label="Description" hint="optional">
          <textarea
            id="scenario-description"
            rows={2}
            className={cn(INPUT_CLASS, "h-auto resize-y py-2")}
            value={draft.description}
            onChange={(event) => set("description")(event.target.value)}
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
          Cabin environment
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {NUMERIC_FIELDS.map((field) => (
            <Field
              key={field.key}
              id={`scenario-${field.key}`}
              label={field.label}
              hint={field.hint}
              error={errors[field.key]}
            >
              <NumberInput
                id={`scenario-${field.key}`}
                unit={field.unit}
                value={draft[field.key]}
                invalid={Boolean(errors[field.key])}
                onChange={set(field.key)}
              />
            </Field>
          ))}
        </div>
        <p className="text-xs text-ink-faint">Units are fixed. Convert psia or atm to kPa before entering.</p>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
          Fire scenario
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <Field id="scenario-material" label="Material">
            <input
              id="scenario-material"
              list="scenario-material-options"
              autoComplete="off"
              className={INPUT_CLASS}
              value={draft.material}
              onChange={(event) => set("material")(event.target.value)}
            />
            <datalist id="scenario-material-options">
              {materialOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
          <Field id="scenario-fuel" label="Fuel type">
            <input
              id="scenario-fuel"
              list="scenario-fuel-options"
              autoComplete="off"
              className={INPUT_CLASS}
              value={draft.fuelType}
              onChange={(event) => set("fuelType")(event.target.value)}
            />
            <datalist id="scenario-fuel-options">
              {fuelOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
        </div>
        <p className="text-xs text-ink-faint">
          Material and fuel are matched by exact name. Suggestions list what reviewed records state.
        </p>
        <SegmentedControl
          name="scenario-objective"
          legend="Safety objective"
          options={OBJECTIVE_OPTIONS}
          value={draft.safetyObjective}
          onChange={(value) => set("safetyObjective")(value)}
        />
      </fieldset>

      <Field id="scenario-assumptions" label="Assumption notes" hint="what you assumed, and why">
        <textarea
          id="scenario-assumptions"
          rows={3}
          className={cn(INPUT_CLASS, "h-auto resize-y py-2")}
          value={draft.assumptionNotes}
          onChange={(event) => set("assumptionNotes")(event.target.value)}
        />
      </Field>

      <button
        type="button"
        onClick={() => onChange(EMPTY_SCENARIO_DRAFT)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong px-3 text-xs text-ink-muted transition-colors hover:border-ink-faint/60 hover:text-ink"
      >
        <RotateCcw aria-hidden className="size-3.5" />
        Clear scenario
      </button>
    </form>
  );
}
