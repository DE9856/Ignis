"use client";

import { SAFETY_OBJECTIVES } from "@/lib/okf/types";

/** Raw form values. Everything is a string until `toScenario` normalises it. */
export interface ScenarioDraft {
  name: string;
  description: string;
  oxygenPercent: string;
  pressureKPa: string;
  airflowMetersPerSecond: string;
  gravityG: string;
  material: string;
  fuelType: string;
  safetyObjective: string;
  assumptionNotes: string;
}

/** Deliberately blank: the form never suggests cabin conditions the user did not enter. */
export const EMPTY_SCENARIO_DRAFT: ScenarioDraft = {
  name: "",
  description: "",
  oxygenPercent: "",
  pressureKPa: "",
  airflowMetersPerSecond: "",
  gravityG: "",
  material: "",
  fuelType: "",
  safetyObjective: "",
  assumptionNotes: "",
};

interface ScenarioFormProps {
  draft: ScenarioDraft;
  onChange: (draft: ScenarioDraft) => void;
  onReset: () => void;
}

const INPUT_CLASS =
  "border-line-strong bg-canvas text-ink placeholder:text-ink-faint h-9 w-full rounded border px-2.5 text-sm";

const NUMERIC_FIELDS: { key: keyof ScenarioDraft; label: string; unit: string }[] = [
  { key: "oxygenPercent", label: "Oxygen", unit: "% by volume" },
  { key: "pressureKPa", label: "Pressure", unit: "kPa" },
  { key: "airflowMetersPerSecond", label: "Airflow", unit: "m/s" },
  { key: "gravityG", label: "Gravity", unit: "g" },
];

export function ScenarioForm({ draft, onChange, onReset }: ScenarioFormProps) {
  const set = (key: keyof ScenarioDraft) => (value: string) => onChange({ ...draft, [key]: value });

  return (
    <form className="space-y-4" onSubmit={(event) => event.preventDefault()} onReset={onReset}>
      <Field id="scenario-name" label="Scenario name">
        <input
          id="scenario-name"
          className={INPUT_CLASS}
          value={draft.name}
          onChange={(event) => set("name")(event.target.value)}
        />
      </Field>

      <Field id="scenario-description" label="Description">
        <textarea
          id="scenario-description"
          rows={2}
          className={`${INPUT_CLASS} h-auto py-2`}
          value={draft.description}
          onChange={(event) => set("description")(event.target.value)}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-[11px] font-medium tracking-wide text-ink-muted uppercase">
          Cabin environment
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {NUMERIC_FIELDS.map((field) => (
            <Field key={field.key} id={`scenario-${field.key}`} label={field.label} hint={field.unit}>
              <input
                id={`scenario-${field.key}`}
                inputMode="decimal"
                className={`${INPUT_CLASS} font-mono`}
                value={draft[field.key]}
                onChange={(event) => set(field.key)(event.target.value)}
              />
            </Field>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field id="scenario-material" label="Material">
          <input
            id="scenario-material"
            className={INPUT_CLASS}
            value={draft.material}
            onChange={(event) => set("material")(event.target.value)}
          />
        </Field>
        <Field id="scenario-fuel" label="Fuel type">
          <input
            id="scenario-fuel"
            className={INPUT_CLASS}
            value={draft.fuelType}
            onChange={(event) => set("fuelType")(event.target.value)}
          />
        </Field>
      </div>

      <Field id="scenario-objective" label="Safety objective">
        <select
          id="scenario-objective"
          className={INPUT_CLASS}
          value={draft.safetyObjective}
          onChange={(event) => set("safetyObjective")(event.target.value)}
        >
          <option value="">Not specified</option>
          {SAFETY_OBJECTIVES.map((objective) => (
            <option key={objective} value={objective}>
              {objective.charAt(0).toUpperCase() + objective.slice(1)}
            </option>
          ))}
        </select>
      </Field>

      <Field id="scenario-assumptions" label="Assumption notes" hint="State what you assumed and why">
        <textarea
          id="scenario-assumptions"
          rows={3}
          className={`${INPUT_CLASS} h-auto py-2`}
          value={draft.assumptionNotes}
          onChange={(event) => set("assumptionNotes")(event.target.value)}
        />
      </Field>

      <button
        type="reset"
        className="h-8 rounded border border-line-strong px-3 text-xs text-ink-muted hover:text-ink"
      >
        Clear scenario
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-ink">{label}</span>
        {hint ? <span className="text-ink-faint">{hint}</span> : null}
      </label>
      {children}
    </div>
  );
}
