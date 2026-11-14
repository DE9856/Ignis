"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { OBJECTIVE_OPTIONS_SHORT, PresetSelect } from "@/components/scenario/scenario-form";
import {
  countSpecified,
  draftToQuery,
  EMPTY_SCENARIO_DRAFT,
  NUMERIC_FIELDS,
  type FieldErrors,
  type ScenarioDraft,
} from "@/components/scenario/scenario-draft";
import { Field, NumberInput, SegmentedControl } from "@/components/shared/form-controls";
import type { MissionScenario } from "@/lib/ranking/types";

interface ScenarioStripProps {
  draft: ScenarioDraft;
  errors: FieldErrors;
  onChange: (draft: ScenarioDraft) => void;
  presets: MissionScenario[];
}

/**
 * The scenario, edited in place at the top of the dashboard: preset, the four
 * cabin conditions and the safety goal. Material, fuel and notes live in the
 * Scenario Builder, which opens with the same values.
 */
export function ScenarioStrip({ draft, errors, onChange, presets }: ScenarioStripProps) {
  const set = (key: keyof ScenarioDraft) => (value: string) =>
    onChange({ ...draft, [key]: value, presetId: "" });
  const specified = countSpecified(draft);
  const query = draftToQuery(draft);

  return (
    <section
      aria-labelledby="scenario-strip-title"
      className="rounded-lg border border-line bg-surface ticks"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 id="scenario-strip-title" className="text-sm font-medium text-ink">
            Scenario
          </h2>
          <p className="truncate text-xs text-ink-muted">
            {draft.name ? <span className="text-ink">{draft.name}</span> : "Custom scenario"}
            <span className="text-ink-faint"> · {specified} of 7 conditions set</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {specified > 0 ? (
            <button
              type="button"
              onClick={() => onChange(EMPTY_SCENARIO_DRAFT)}
              className="text-xs text-ink-muted underline decoration-line-strong underline-offset-2 hover:text-ink"
            >
              Clear
            </button>
          ) : null}
          <Link
            href={query ? `/scenario?${query}` : "/scenario"}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:text-accent"
          >
            Material, fuel and full analysis
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))_minmax(0,1.5fr)]"
      >
        <PresetSelect
          presets={presets}
          value={draft.presetId}
          current={draft}
          onSelect={onChange}
          className="col-span-2 sm:col-span-3 lg:col-span-1"
        />
        {NUMERIC_FIELDS.map((field) => (
          <Field key={field.key} id={`strip-${field.key}`} label={field.label} error={errors[field.key]}>
            <NumberInput
              id={`strip-${field.key}`}
              unit={field.unit}
              value={draft[field.key]}
              invalid={Boolean(errors[field.key])}
              onChange={set(field.key)}
            />
          </Field>
        ))}
        <SegmentedControl
          name="strip-objective"
          legend="Safety goal"
          options={OBJECTIVE_OPTIONS_SHORT}
          value={draft.safetyObjective}
          onChange={(value) => set("safetyObjective")(value)}
          className="col-span-2 sm:col-span-1"
        />
      </form>
    </section>
  );
}
