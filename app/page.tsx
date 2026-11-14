import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { KnowledgeStatus } from "@/components/dashboard/knowledge-status";
import { MissionDashboard } from "@/components/dashboard/mission-dashboard";
import { SystemStatus } from "@/components/dashboard/system-status";
import { Families } from "@/components/landing/families";
import { Hero } from "@/components/landing/hero";
import { Journey, type JourneyStep } from "@/components/landing/journey";
import { OxygenProbe } from "@/components/landing/oxygen-probe";
import { Rise } from "@/components/landing/rise";
import { BrandMark } from "@/components/layout/brand-mark";
import { DegradedNotice } from "@/components/shared/degraded-notice";
import { SAFETY_LABELS } from "@/components/shared/labels";
import { getCapabilities } from "@/lib/core/capabilities";
import { getDegradedNotices } from "@/lib/core/degraded";
import { buildDashboardViewModel } from "@/lib/integration/dashboard";
import { buildLandingViewModel, type LandingViewModel } from "@/lib/integration/landing";
import { DISCLAIMER } from "@/lib/navigation";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import type { SafetyObjective } from "@/lib/okf/types";
import type { MissionScenario } from "@/lib/ranking/types";
import { RETRIEVAL } from "@/lib/retrieval/config";
import { getSupabaseStatus } from "@/lib/supabase/server";

/**
 * Mission presets from knowledge/missions, as scenarios. Empty until the
 * Mission field names are agreed (team workflow, open decision 4); map the
 * documents here then. Never fill a preset value that a record does not state.
 */
const MISSION_PRESETS: MissionScenario[] = [];

/** What each safety objective asks. Category descriptions, not findings. */
const OBJECTIVE_QUESTIONS: Record<SafetyObjective, string> = {
  prevention: "Will it ignite, and how fast does the flame spread?",
  detection: "Is there smoke a detector can see, in time?",
  suppression: "What puts it out, and where does a flame stop burning?",
};

const H2 =
  "text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance text-ink";

function SectionIntro({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div className="mb-10 grid gap-5 lg:mb-12 lg:grid-cols-12 lg:items-end">
      <h2 id={id} className={`${H2} lg:col-span-7`}>
        {title}
      </h2>
      <p className="max-w-[34rem] text-[0.9375rem] leading-relaxed text-ink-muted lg:col-span-5 lg:pb-1.5">
        {children}
      </p>
    </div>
  );
}

function LedgerEntry({
  value,
  label,
  note,
  children,
}: {
  value: ReactNode;
  label: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="py-8 sm:px-6 sm:first:pl-0 sm:last:pr-0 lg:py-10">
      <p className="text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-medium tracking-tight text-ink tabular-nums">
        {value}
      </p>
      <div aria-hidden className="mt-4 max-w-[16rem]">
        {children}
      </div>
      <p className="mt-4 text-[0.8125rem] font-medium text-ink">{label}</p>
      <p className="mt-1 text-[0.875rem] text-ink-muted">{note}</p>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-line bg-sunken px-4 py-3 font-mono text-xs leading-relaxed text-ink-muted">
      {children}
    </pre>
  );
}

function journeySteps(data: LandingViewModel): JourneyStep[] {
  const sample = data.sample;
  const yamlValue = (value: number | string | null) => (value === null ? "null" : String(value));
  const weights = RETRIEVAL.weights;

  return [
    {
      id: "source",
      title: "Source",
      heading: "Only NASA counts as evidence.",
      body: "Records are transcribed from NASA Physical Sciences Informatics entries, NASA project pages and NASA technical reports. Blogs, search snippets and AI answers are never cited.",
      detail: (
        <ul className="divide-y divide-line rounded-md border border-line bg-sunken font-mono text-xs">
          {data.sourceHosts.map((source) => (
            <li key={source.host} className="flex justify-between gap-4 px-4 py-2">
              <span className="text-ink">{source.host}</span>
              <span className="text-ink-faint tabular-nums">
                {source.count} {source.count === 1 ? "source" : "sources"}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "record",
      title: "Record",
      heading: "One file per investigation. Unknown stays unknown.",
      body: "Each investigation becomes a Markdown record with structured conditions and cited sections. A value the sources don't state is written as null and shown as Unknown, never estimated.",
      detail: sample ? (
        <Code>
          <span className="text-ink-faint"># knowledge/investigations/{sample.id}.md</span>
          {"\n"}
          {sample.fields.map((field) => (
            <span key={field.key}>
              <span className="text-ink">{field.key}</span>:{" "}
              <span className={field.value === null ? "text-ink-faint" : "text-computed"}>
                {yamlValue(field.value)}
              </span>
              {field.value === null ? (
                <span className="text-ink-faint">{"  "}# not stated in the sources</span>
              ) : null}
              {"\n"}
            </span>
          ))}
        </Code>
      ) : null,
    },
    {
      id: "verify",
      title: "Verify",
      heading: "A second person signs it off.",
      body: "Someone other than the author reads the record against its sources and adds a verified entry. The validator rejects a record verified by its own author, and any later change sends it back to draft.",
      detail: sample?.verifiedBy ? (
        <Code>
          <span className="text-ink">status</span>: <span className="text-reviewed">stable</span>
          {"\n"}
          <span className="text-ink">verified</span>:{"\n"}
          {"  - "}
          <span className="text-ink">by</span>: <span className="text-reviewed">{sample.verifiedBy}</span>
          {"\n"}
          {"    "}
          <span className="text-ink">at</span>:{" "}
          <span className="text-computed">{sample.verifiedAt ?? "null"}</span>
        </Code>
      ) : null,
    },
    {
      id: "search",
      title: "Search",
      heading: "Only signed-off records can be found.",
      body: "Reviewed records are split by section and searched by meaning, keywords and structured conditions together. A question the records can't support gets no answer rather than the nearest guess.",
      detail: (
        <dl className="grid grid-cols-3 divide-x divide-line rounded-md border border-line bg-sunken text-center">
          {(
            [
              ["Meaning", weights.vector],
              ["Keywords", weights.lexical],
              ["Conditions", weights.metadata],
            ] as const
          ).map(([term, weight]) => (
            <div key={term} className="px-2 py-3">
              <dt className="text-2xs text-ink-faint">{term}</dt>
              <dd className="mt-1 font-mono text-lg text-ink tabular-nums">{weight}</dd>
            </div>
          ))}
        </dl>
      ),
    },
  ];
}

export default function LandingPage() {
  const knowledge = loadKnowledgeBase();
  const capabilities = getCapabilities(knowledge.investigations);
  const dashboard = buildDashboardViewModel(knowledge, capabilities);
  const data = buildLandingViewModel(knowledge);

  return (
    <div className="relative">
      <Hero data={data} />

      {/* Ledger: three computed counts, each with its own evidence mark. */}
      <section
        aria-label="The evidence base in numbers"
        className="relative z-10 border-y border-line bg-surface"
      >
        <Rise className="mx-auto grid max-w-[84rem] divide-y divide-line px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <LedgerEntry
            value={data.sources}
            label="NASA sources cited"
            note="Every value traces to one of them."
          >
            <div className="flex h-1.5 gap-px overflow-hidden rounded-sm">
              {data.sourceHosts.map((source, index) => (
                <span
                  key={source.host}
                  title={`${source.host}: ${source.count}`}
                  className="h-full"
                  style={{
                    flexGrow: source.count,
                    background: `color-mix(in oklch, var(--color-nasa) ${100 - index * 22}%, var(--color-track))`,
                  }}
                />
              ))}
            </div>
          </LedgerEntry>
          <LedgerEntry
            value={`${data.reviewed}/${data.investigations}`}
            label="Records signed off"
            note="Checked against the sources by someone who didn't write them."
          >
            <div className="flex h-3 gap-1">
              {Array.from({ length: data.investigations }, (_, index) => (
                <span
                  key={index}
                  className={index < data.reviewed ? "w-px flex-1 bg-reviewed" : "w-px flex-1 hatch"}
                />
              ))}
            </div>
          </LedgerEntry>
          <LedgerEntry
            value={data.findings}
            label="Key findings transcribed"
            note="Each one in the record's own cited section."
          >
            <div className="flex h-1.5 gap-px overflow-hidden rounded-sm">
              {data.findingsByRecord.map((record) => (
                <span
                  key={record.id}
                  title={`${record.label}: ${record.count}`}
                  className="h-full bg-computed/70"
                  style={{ flexGrow: Math.max(record.count, 0.5) }}
                />
              ))}
            </div>
          </LedgerEntry>
        </Rise>
      </section>

      <div className="relative z-10 mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="probe-title" className="py-16 sm:py-24 lg:py-32">
          <SectionIntro id="probe-title" title="See where the evidence runs out.">
            Each bar is the oxygen range an investigation actually tested, taken from its record. Move the
            level and watch which ones still apply. The hatched rows are just as important: their sources
            never state an oxygen level.
          </SectionIntro>
          <OxygenProbe rows={data.oxygenRows} />
        </section>

        <section aria-labelledby="journey-title" className="py-16 sm:py-24 lg:py-32">
          <SectionIntro id="journey-title" title="Checked by someone who didn't write it.">
            IGNIS is a transcription of NASA research, not a source of its own. These four steps are the
            difference between a cited record and a confident guess.
          </SectionIntro>
          <Journey steps={journeySteps(data)} />
        </section>

        <section aria-labelledby="objectives-title" className="py-16 sm:py-24 lg:py-32">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="flex flex-col rounded-lg border border-line bg-sunken ticks p-6 lg:p-7">
              <h2
                id="objectives-title"
                className="text-[clamp(2rem,3vw,2.75rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance text-ink"
              >
                Prevent. Detect. Suppress.
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
                Each reviewed record is tagged with the safety objectives its sources address, so a scenario
                can ask the right question.
              </p>
              {data.untagged.length > 0 ? (
                <p className="mt-auto pt-6 text-xs leading-relaxed text-ink-faint">
                  Not tagged with an objective: {data.untagged.map((item) => item.label).join(", ")}.
                </p>
              ) : null}
            </div>

            {data.byObjective.map(({ objective, investigations }) => (
              <div
                key={objective}
                className="flex flex-col rounded-lg border border-line bg-surface ticks p-6 lg:p-7"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-medium tracking-[-0.01em] text-ink">
                    {SAFETY_LABELS[objective]}
                  </h3>
                  <p className="text-3xl leading-none font-medium tracking-tight text-ink tabular-nums">
                    {investigations.length}
                  </p>
                </div>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
                  {OBJECTIVE_QUESTIONS[objective]}
                </p>
                <ul className="mt-6 flex flex-wrap gap-1.5 pt-2 lg:mt-auto">
                  {investigations.length > 0 ? (
                    investigations.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/explore#${item.id}`}
                          className="inline-flex rounded-sm border border-line-strong px-2 py-1 font-mono text-2xs text-ink-muted transition-colors hover:border-reviewed/60 hover:text-ink"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-sm hatch px-2 py-1 text-xs text-ink-muted">
                      No reviewed record yet
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="families-title" className="py-16 sm:py-24 lg:py-32">
          <SectionIntro
            id="families-title"
            title={`${data.reviewed} investigations, ${data.families.length} families.`}
          >
            Flames spreading over fabric, droplets burning as spheres, smoke drifting toward a detector. Hover
            a family to read what it set out to study, from its record.
          </SectionIntro>
          <Families families={data.families} />
        </section>

        <section aria-labelledby="dashboard-title" className="py-16 sm:py-24 lg:py-32">
          <SectionIntro id="dashboard-title" title="The evidence base, as it stands.">
            Live from the records and the running system. Drafts, gaps and disabled features are shown, not
            hidden.
          </SectionIntro>
          <div className="space-y-5">
            <DegradedNotice notices={getDegradedNotices(capabilities, "scoring")} />
            <MissionDashboard
              investigations={knowledge.investigations}
              presets={MISSION_PRESETS}
              coverage={dashboard.coverage}
            />
            <KnowledgeStatus summary={dashboard.summary} />
            <SystemStatus
              supabase={getSupabaseStatus()}
              issueCount={knowledge.issues.length}
              retrievalReady={capabilities.retrievalEnabled}
              synthesisReady={capabilities.llmEnabled}
              methodologyReady={capabilities.methodologyConfigured}
            />
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-line bg-sunken">
        <div className="mx-auto max-w-[84rem] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className={`${H2} lg:col-span-7`}>Bring your scenario.</h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:col-span-5 lg:justify-end">
              <Link
                href="/scenario"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-[0.8125rem] font-medium text-accent-ink transition-[filter] hover:brightness-110"
              >
                Build a scenario
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-accent"
              >
                Read the methodology
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
          <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-start sm:justify-between">
            <p className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-mono text-sm font-semibold tracking-[0.24em] text-ink">IGNIS</span>
            </p>
            <p className="max-w-[44rem] text-xs leading-relaxed text-ink-faint">{DISCLAIMER}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
