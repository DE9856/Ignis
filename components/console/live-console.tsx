"use client";

import { ArrowUpRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ConditionEnvelopes } from "@/components/charts/condition-envelopes";
import { displayTitle } from "@/components/experiments/experiment-fields";
import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { motionAllowed } from "@/components/motion/gsap";
import { Badge } from "@/components/shared/badge";
import { DIMENSION_LABELS, SAFETY_LABELS } from "@/components/shared/labels";
import { Section } from "@/components/shared/section";
import { canUseForAnalytics } from "@/lib/domain/provenance";
import type { MissionPreset } from "@/lib/integration/missions";
import { analyzeScenario, type ScenarioAnalysis } from "@/lib/integration/scenario";
import { SAFETY_OBJECTIVES, type Investigation, type SafetyObjective } from "@/lib/okf/types";
import type { MethodologyDimension } from "@/lib/ranking/methodology";
import { containsTerm } from "@/lib/ranking/scoring";
import type { MissionScenario } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

import { ConsoleCoverage } from "./console-coverage";
import { ConsoleRanking } from "./console-ranking";
import { FlameChamber, type ChamberValues } from "./flame-chamber";

interface ConsoleValues extends ChamberValues {
  material: string | null;
  objective: SafetyObjective | null;
}
type NumericKey = "oxygen" | "pressure" | "gravity" | "airflow";

const SLIDERS: {
  key: NumericKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  dp: number;
}[] = [
  { key: "oxygen", label: "Oxygen", unit: "%", min: 10, max: 40, step: 0.5, dp: 1 },
  { key: "pressure", label: "Pressure", unit: "kPa", min: 25, max: 320, step: 0.1, dp: 1 },
  { key: "gravity", label: "Gravity", unit: "g", min: 0, max: 1.2, step: 0.005, dp: 3 },
  { key: "airflow", label: "Airflow", unit: "m/s", min: 0, max: 0.6, step: 0.01, dp: 2 },
];
const BOUNDS = Object.fromEntries(SLIDERS.map((slider) => [slider.key, slider]));

/** Cabin materials offered as chips, kept only if a reviewed record names them. */
const MATERIAL_CANDIDATES = ["Nomex", "PMMA", "Kapton", "Teflon", "cotton", "Ultem", "silicone"];

/** Earth sea-level air at 1 g: the tour's starting point. A physical reference, not a preset record. */
const EARTH: Partial<ConsoleValues> = { oxygen: 21, pressure: 101.3, gravity: 1, airflow: 0 };
const START: ConsoleValues = {
  oxygen: 21,
  pressure: 101.3,
  gravity: 0,
  airflow: 0.1,
  material: null,
  objective: "prevention",
};

function toScenario(values: ConsoleValues): MissionScenario {
  return {
    id: "console",
    name: "Live console scenario",
    description: null,
    oxygenPercent: values.oxygen,
    pressureKPa: values.pressure,
    airflowMetersPerSecond: values.airflow,
    gravityG: values.gravity,
    material: values.material,
    fuelType: null,
    safetyObjective: values.objective,
    assumptionNotes: null,
  };
}

/** A preset's atmosphere as console values, when it fits on the sliders. */
function presetValues(preset: MissionPreset): Partial<ConsoleValues> | null {
  const { oxygenPercent: oxygen, pressureKPa: pressure, gravityG: gravity } = preset;
  if (oxygen === null || pressure === null || gravity === null) return null;
  const fits = (key: NumericKey, value: number) => value >= BOUNDS[key].min && value <= BOUNDS[key].max;
  if (!fits("oxygen", oxygen) || !fits("pressure", pressure) || !fits("gravity", gravity)) return null;
  return { oxygen, pressure, gravity, airflow: preset.airflowMetersPerSecond };
}

/**
 * Re-rank at most this often while a control glides, so each reorder can finish
 * its glide before the next starts. The sliders and the flame stay instant.
 */
const RERANK_MS = 600;

/** The latest value, updated at most once per interval, always ending on the final value. */
function useThrottled<T>(value: T, ms: number): T {
  const [shown, setShown] = useState(value);
  const last = useRef(0);
  useEffect(() => {
    const wait = Math.max(0, last.current + ms - performance.now());
    const timer = window.setTimeout(() => {
      last.current = performance.now();
      setShown(value);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return shown;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const round = (value: number, dp: number) => Number(value.toFixed(dp));

function directFor(analysis: ScenarioAnalysis, dimension: MethodologyDimension): string[] {
  return analysis.ranked
    .filter(({ result }) =>
      result.breakdown?.dimensions.some((d) => d.dimension === dimension && d.state === "DIRECT"),
    )
    .map(({ investigation }) => displayTitle(investigation));
}
function countState(analysis: ScenarioAnalysis, dimension: MethodologyDimension, state: string): number {
  return analysis.ranked.filter(({ result }) =>
    result.breakdown?.dimensions.some((d) => d.dimension === dimension && d.state === state),
  ).length;
}
const listNames = (names: string[]) =>
  names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
const readingTime = (text: string) => Math.max(3800, text.split(/\s+/).length * 330 + 1200);

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs transition-colors",
        pressed
          ? "border-accent bg-accent text-accent-ink"
          : "border-line-strong text-ink-muted hover:border-ink-faint/60 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

interface Caption {
  step: string;
  text: string;
  ms: number;
  n: number;
}

/**
 * The live console: move a condition and watch the flame illustration, the
 * ranking, the coverage and the tested ranges respond together. Every number
 * comes from analyzeScenario(), the same code the Scenario Builder runs, over
 * the human-reviewed records only. The guided tour drives the same controls.
 */
export function LiveConsole({
  investigations,
  presets,
}: {
  investigations: Investigation[];
  presets: MissionPreset[];
}) {
  const [values, setValues] = useState<ConsoleValues>(START);
  const deferred = useThrottled(values, RERANK_MS);
  const analysis = useMemo(
    () => analyzeScenario(toScenario(deferred), investigations),
    [deferred, investigations],
  );

  const reviewed = useMemo(
    () => investigations.filter((investigation) => canUseForAnalytics(investigation)),
    [investigations],
  );
  const materials = useMemo(
    () =>
      MATERIAL_CANDIDATES.filter((name) =>
        reviewed.some(
          (investigation) => investigation.material && containsTerm(investigation.material, name),
        ),
      ),
    [reviewed],
  );
  const chips = useMemo(
    () =>
      presets.flatMap((preset) => {
        const atmosphere = presetValues(preset);
        return atmosphere ? [{ preset, atmosphere, label: preset.name.split(",")[0] }] : [];
      }),
    [presets],
  );

  /* ---------------------------------------------------------- tweening */
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  const tween = useRef<{ frame: number; resolve: () => void } | null>(null);

  const cancelTween = useCallback(() => {
    if (!tween.current) return;
    cancelAnimationFrame(tween.current.frame);
    tween.current.resolve();
    tween.current = null;
  }, []);

  const animateTo = useCallback(
    (to: Partial<ConsoleValues>, ms: number) => {
      cancelTween();
      const from = valuesRef.current;
      const numeric = (["oxygen", "pressure", "gravity", "airflow"] as const).filter(
        (key) => key in to && typeof to[key] === "number" && typeof from[key] === "number",
      );
      // Choices and switching airflow on or off apply at once; numbers glide.
      const immediate: Partial<ConsoleValues> = { ...to };
      for (const key of numeric) delete immediate[key];
      setValues((current) => ({ ...current, ...immediate }));
      if (numeric.length === 0 || !motionAllowed()) {
        setValues((current) => ({ ...current, ...to }));
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const start = performance.now();
        const step = (now: number) => {
          const k = Math.min(1, (now - start) / ms);
          const e = ease(k);
          setValues((current) => {
            const next = { ...current };
            for (const key of numeric) {
              const a = from[key] as number;
              const b = to[key] as number;
              next[key] = k >= 1 ? b : a + (b - a) * e;
            }
            return next;
          });
          if (k < 1) tween.current = { frame: requestAnimationFrame(step), resolve };
          else {
            tween.current = null;
            resolve();
          }
        };
        tween.current = { frame: requestAnimationFrame(step), resolve };
      });
    },
    [cancelTween],
  );

  /* -------------------------------------------------------------- tour */
  const [touring, setTouring] = useState(false);
  const [caption, setCaption] = useState<Caption | null>(null);
  const [spot, setSpot] = useState<string[]>([]);
  const token = useRef(0);

  const stopTour = useCallback(() => {
    token.current++;
    cancelTween();
    setTouring(false);
    setCaption(null);
    setSpot([]);
  }, [cancelTween]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stopTour();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelTween();
    };
  }, [stopTour, cancelTween]);

  const runTour = useCallback(async () => {
    const mine = ++token.current;
    const alive = () => {
      if (mine !== token.current) throw new Error("stopped");
    };
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const at = (patch: Partial<ConsoleValues>) =>
      analyzeScenario(toScenario({ ...valuesRef.current, ...patch }), investigations);
    const total = reviewed.length;
    let n = 0;

    const step = async (
      label: string,
      ids: string[],
      patch: Partial<ConsoleValues>,
      text: (analysis: ScenarioAnalysis) => string,
    ) => {
      setSpot(ids);
      const first = ids[0] ? document.getElementById(ids[0]) : null;
      if (first) {
        const rect = first.getBoundingClientRect();
        if (rect.top < 90 || rect.bottom > window.innerHeight - 170)
          first.scrollIntoView({ behavior: motionAllowed() ? "smooth" : "auto", block: "center" });
      }
      const words = text(at(patch));
      await animateTo(patch, 1600);
      alive();
      const ms = readingTime(words);
      setCaption({ step: `${++n} · ${label}`, text: words, ms, n });
      await wait(ms);
      alive();
    };

    const lunar = chips.find(({ preset }) => preset.id === "lunar-surface-habitat")?.atmosphere;
    setTouring(true);
    try {
      await step(
        "The question",
        ["console-chamber"],
        { ...EARTH, material: null, objective: "prevention" },
        () =>
          "On Earth, hot gas rises and stretches a flame upward. Mission planners need to know what happens when that stops.",
      );
      await step(
        "Microgravity",
        ["ctl-gravity", "console-chamber"],
        { gravity: 0 },
        (a) =>
          `Drop to microgravity. ${countState(a, "gravity", "DIRECT")} of the ${total} reviewed NASA investigations ran there, so gravity is direct evidence for them.`,
      );
      await step(
        "Live ranking",
        ["console-ranking"],
        { airflow: 0.1 },
        (a) =>
          `IGNIS re-ranks all ${total} records with its own scoring rules every time a control moves. Right now ${a.ranked[0] ? displayTitle(a.ranked[0].investigation) : "nothing"} leads.`,
      );
      if (lunar) {
        await step("More oxygen", ["ctl-oxygen", "console-ranges"], { oxygen: lunar.oxygen }, (a) => {
          const names = directFor(a, "oxygen");
          return `Raise oxygen to ${lunar.oxygen} %, the lunar-habitat value NASA's Exploration Atmospheres Working Group recommends. ${names.length ? `Only ${listNames(names)} tested that much oxygen.` : "No reviewed investigation tested that much oxygen."}`;
        });
        await step(
          "Lower pressure",
          ["ctl-pressure", "console-ranges"],
          { pressure: lunar.pressure },
          (a) => {
            const names = directFor(a, "pressure");
            return `Lower the pressure to ${lunar.pressure} kPa, the same recommendation. ${names.length ? `${listNames(names)} tested pressures this low.` : "No reviewed investigation tested a pressure this low."}`;
          },
        );
        await step(
          "The Moon",
          ["ctl-gravity", "console-coverage"],
          { gravity: lunar.gravity },
          (a) =>
            `Now lunar gravity, ${lunar.gravity} g. Microgravity results can only bound a Moon scenario, so gravity is bounding for ${countState(a, "gravity", "BOUNDING")} of ${total}, never a match.`,
        );
      }
      const material = materials.includes("Nomex") ? "Nomex" : materials[0];
      if (material) {
        await step("Material", ["ctl-material", "console-ranking"], { material }, (a) => {
          const names = directFor(a, "materialFuel");
          return names.length
            ? `Add a cabin material, ${material}. ${listNames(names)} tested it, and moved up the ranking.`
            : `Add a cabin material, ${material}. No reviewed investigation tested it.`;
        });
      }
      await step("The gap", ["console-coverage"], {}, (a) => {
        const big = a.coverage.find((gap) => gap.state !== "DIRECT");
        return big
          ? `The largest gap is ${DIMENSION_LABELS[big.dimension].toLowerCase()}. IGNIS says so plainly and turns it into a research question, labelled as project-generated.`
          : "Every condition here has direct evidence.";
      });
      await step(
        "Why it matters",
        ["console-ranking", "console-coverage"],
        {},
        () =>
          "An honest map of fire in space: what NASA tested, what it found, and exactly where the evidence runs out. Try any scenario yourself.",
      );
    } catch {
      return;
    }
    if (mine === token.current) stopTour();
  }, [animateTo, chips, investigations, materials, reviewed.length, stopTour]);

  /* ---------------------------------------------------------- controls */
  const setNumber = (key: NumericKey, value: number | null) => {
    stopTour();
    setValues((current) => ({ ...current, [key]: value }));
  };
  const pressedPreset = (atmosphere: Partial<ConsoleValues>) =>
    (["oxygen", "pressure", "gravity", "airflow"] as const).every((key) => {
      const a = values[key];
      const b = atmosphere[key] ?? null;
      return a === null || b === null ? a === b : Math.abs(a - b) < 1e-6;
    });

  const builderQuery = new URLSearchParams(
    Object.entries({
      oxygen: round(values.oxygen, 1),
      pressure: round(values.pressure, 1),
      gravity: round(values.gravity, 3),
      airflow: values.airflow === null ? null : round(values.airflow, 2),
      material: values.material,
      objective: values.objective,
    }).flatMap(([key, value]) => (value === null ? [] : [[key, String(value)]])),
  );

  const lit = (id: string) => spot.includes(id) && "ring-2 ring-accent/70 ring-offset-2 ring-offset-canvas";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-2xs text-ink-muted">
          <span className="rounded-md border border-line px-2 py-1">
            <span aria-hidden className="mr-1.5 inline-block size-1.5 rounded-full bg-reviewed align-[1px]" />
            <b className="font-medium text-ink">{reviewed.length}</b> human-reviewed investigations
          </span>
          <span className="rounded-md border border-line px-2 py-1">
            methodology <b className="font-medium text-ink">{analysis.methodologyId ?? "provisional"}</b>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/scenario?${builderQuery}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
          >
            Open in Scenario Builder
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
          <button
            type="button"
            aria-pressed={touring}
            onClick={() => (touring ? stopTour() : void runTour())}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-medium transition-[filter,background-color]",
              touring
                ? "border border-line-strong bg-raised text-ink"
                : "bg-accent text-accent-ink hover:brightness-110",
            )}
          >
            {touring ? <Pause aria-hidden className="size-3.5" /> : <Play aria-hidden className="size-3.5" />}
            {touring ? "Stop tour" : "Play guided tour"}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Section
          id="console-chamber"
          title="Your scenario"
          meta={<Badge tone="accent">Flame is an illustration</Badge>}
          className={cn("ticks transition-shadow", lit("console-chamber"))}
        >
          <FlameChamber values={values} />
          <div className="mt-4 space-y-3">
            {chips.length > 0 ? (
              <div role="group" aria-label="Mission presets" className="flex flex-wrap gap-1.5">
                {chips.map(({ preset, atmosphere, label }) => (
                  <Chip
                    key={preset.id}
                    pressed={pressedPreset(atmosphere)}
                    onClick={() => {
                      stopTour();
                      void animateTo(atmosphere, 1100);
                    }}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
            ) : null}

            {SLIDERS.map((slider) => {
              const value = values[slider.key];
              const off = value === null;
              return (
                <div
                  key={slider.key}
                  id={`ctl-${slider.key}`}
                  className={cn(
                    "grid grid-cols-[4.5rem_minmax(0,1fr)_5.5rem] items-center gap-3 rounded-md px-2 py-1 transition-shadow",
                    lit(`ctl-${slider.key}`),
                  )}
                >
                  <label htmlFor={`console-${slider.key}`} className="text-sm2 text-ink-muted">
                    {slider.label}
                  </label>
                  <input
                    id={`console-${slider.key}`}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={value ?? slider.min}
                    disabled={off}
                    onPointerDown={stopTour}
                    onChange={(event) => setNumber(slider.key, Number(event.target.value))}
                    className="w-full accent-[var(--color-accent)] disabled:opacity-30"
                  />
                  {slider.key === "airflow" ? (
                    <button
                      type="button"
                      onClick={() => setNumber("airflow", off ? 0.1 : null)}
                      className="text-right font-mono text-sm text-ink tabular-nums underline decoration-line-strong decoration-dotted underline-offset-4 hover:decoration-accent"
                      title={off ? "Include airflow in the scenario" : "Leave airflow out of the scenario"}
                    >
                      {off ? (
                        <span className="text-xs text-ink-faint">not set</span>
                      ) : (
                        value.toFixed(slider.dp)
                      )}
                      {off ? null : <small className="ml-1 text-2xs text-ink-faint">{slider.unit}</small>}
                    </button>
                  ) : (
                    <output
                      htmlFor={`console-${slider.key}`}
                      className="text-right font-mono text-sm text-ink tabular-nums"
                    >
                      {(value ?? 0).toFixed(slider.dp)}
                      <small className="ml-1 text-2xs text-ink-faint">{slider.unit}</small>
                    </output>
                  )}
                </div>
              );
            })}

            <div
              id="ctl-material"
              className={cn(
                "grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-3 rounded-md px-2 py-1",
                lit("ctl-material"),
              )}
            >
              <span className="pt-1 text-sm2 text-ink-muted">Material</span>
              <div role="group" aria-label="Material" className="flex flex-wrap gap-1.5">
                {[null, ...materials].map((material) => (
                  <Chip
                    key={material ?? "any"}
                    pressed={values.material === material}
                    onClick={() => {
                      stopTour();
                      setValues((current) => ({ ...current, material }));
                    }}
                  >
                    {material ?? "Any"}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-3 px-2 py-1">
              <span className="pt-1 text-sm2 text-ink-muted">Safety goal</span>
              <div role="group" aria-label="Safety goal" className="flex flex-wrap gap-1.5">
                {[null, ...SAFETY_OBJECTIVES].map((objective) => (
                  <Chip
                    key={objective ?? "any"}
                    pressed={values.objective === objective}
                    onClick={() => {
                      stopTour();
                      setValues((current) => ({ ...current, objective }));
                    }}
                  >
                    {objective ? SAFETY_LABELS[objective] : "Any"}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="console-ranking"
          title="Which experiments match it"
          description="Re-ranked live by IGNIS methodology v1. Each pip is one condition: brighter means stronger evidence. Open a row for the reasons."
          meta={<ProvenanceBadge value="COMPUTED" />}
          className={cn("transition-shadow", lit("console-ranking"))}
        >
          <ConsoleRanking analysis={analysis} />
        </Section>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Section
          id="console-coverage"
          eyebrow="Coverage, not fire risk"
          title="Where the evidence runs out"
          meta={<ProvenanceBadge value="COMPUTED" />}
          className={cn("transition-shadow", lit("console-coverage"))}
        >
          <ConsoleCoverage analysis={analysis} />
        </Section>
        <Section
          id="console-ranges"
          title="Tested condition ranges"
          description="Each reviewed record's stated range, with your scenario drawn across it. Only stated bounds are drawn."
          meta={<ProvenanceBadge value="NASA_SOURCE" />}
          className={cn("transition-shadow", lit("console-ranges"))}
        >
          <ConditionEnvelopes analysis={analysis} limit={reviewed.length} />
        </Section>
      </div>

      <p className="max-w-[75ch] text-xs leading-relaxed text-ink-faint">
        Ranges, materials and safety categories come from the {reviewed.length} human-reviewed IGNIS records,
        each checked against its cited NASA source by a second team member. Scores and coverage are computed
        in your browser by the same code the Scenario Builder runs. The flame drawing is decorative and is not
        a combustion model.
      </p>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-5 left-1/2 z-40 w-[min(60rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-line-strong bg-surface/95 px-5 py-4 shadow-2xl backdrop-blur transition-[opacity,translate] duration-300",
          caption ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        {caption ? (
          <>
            <div className="flex items-center justify-between gap-3 font-mono text-2xs tracking-[0.14em] text-accent uppercase">
              <span>{caption.step}</span>
              <button
                type="button"
                onClick={stopTour}
                className="rounded-md border border-line-strong px-2 py-0.5 tracking-normal text-ink-muted normal-case hover:text-ink"
              >
                Stop
              </button>
            </div>
            <p className="mt-1.5 text-[clamp(1rem,1.8vw,1.25rem)] leading-snug text-ink">{caption.text}</p>
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-track">
              <span
                key={caption.n}
                className="console-progress block h-full origin-left bg-accent"
                style={{ animationDuration: `${caption.ms}ms` }}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
