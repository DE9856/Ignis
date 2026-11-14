import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { IssueList } from "@/components/shared/issue-list";
import { Section } from "@/components/shared/section";
import { getCapabilities, type Capabilities } from "@/lib/core/capabilities";
import { findEnvironmentProblems, inspectEnvironment } from "@/lib/core/env";
import { summarizeKnowledge } from "@/lib/integration/knowledge";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import { getMethodologyStatus } from "@/lib/ranking/methodology";
import { RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Dev status", robots: { index: false } };

const CAPABILITY_LABELS: Record<keyof Capabilities, string> = {
  supabaseEnabled: "Supabase configured",
  ingestionEnabled: "Service-role key available",
  retrievalEnabled: "Retrieval available",
  llmEnabled: "LLM synthesis available",
  verifiedKnowledgeAvailable: "Verified knowledge loaded",
  methodologyConfigured: "Methodology configured",
  devMocksEnabled: "Development mocks on",
};

function Flag({ on }: { on: boolean }) {
  return (
    <span className={cn("font-mono uppercase", on ? "text-reviewed" : "text-ink-faint")}>
      {on ? "yes" : "no"}
    </span>
  );
}

/**
 * Developer diagnostics. Development only: a production build answers 404,
 * and the page is not linked from the navigation. Shows states, never values.
 */
export default function DevStatusPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const knowledge = loadKnowledgeBase();
  const summary = summarizeKnowledge(knowledge);
  const capabilities = getCapabilities(knowledge.investigations);
  const methodology = getMethodologyStatus();
  const environment = inspectEnvironment();
  const environmentProblems = findEnvironmentProblems();

  const knowledgeRows: [string, number][] = [
    ["Total concepts", summary.total],
    ["Investigations", summary.investigations],
    ["Hardware concepts", summary.hardware],
    ["Concept pages", summary.concepts],
    ["Mission presets", summary.missions],
    ["Human reviewed", summary.humanReviewed],
    ["Draft", summary.byStatus.draft],
    ["Stable", summary.byStatus.stable],
    ["Deprecated", summary.byStatus.deprecated],
    ["Without sources", summary.withoutSources],
    ["Files with problems", summary.issues],
  ];

  return (
    <>
      <PageHeader
        eyebrow="Development"
        title="Dev status"
        description="What this instance can do right now. Not available in production builds."
      />
      <div className="space-y-6">
        <IssueList issues={knowledge.issues} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Capabilities" description={`NODE_ENV: ${process.env.NODE_ENV ?? "unset"}`}>
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[13px]">
              {(Object.keys(CAPABILITY_LABELS) as (keyof Capabilities)[]).map((key) => (
                <div key={key} className="contents">
                  <dt className="text-ink-muted">{CAPABILITY_LABELS[key]}</dt>
                  <dd>
                    <Flag on={capabilities[key]} />
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Knowledge" description="Counts from knowledge/ on disk">
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[13px]">
              {knowledgeRows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="font-mono text-ink tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </div>

        <Section title="Environment" description="States only. Values are never shown." flush>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] text-ink-muted uppercase">
                <th scope="col" className="px-4 py-2 font-medium">
                  Variable
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Requirement
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  State
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Exposure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {environment.map((item) => (
                <tr key={item.name}>
                  <th scope="row" className="px-4 py-2 font-mono font-normal text-ink">
                    {item.name}
                  </th>
                  <td className="px-4 py-2 text-ink-muted">{item.requirement}</td>
                  <td
                    className={cn(
                      "px-4 py-2 font-mono",
                      item.state === "CONFIGURED" && "text-reviewed",
                      item.state === "INVALID" && "text-danger",
                      item.state === "UNAVAILABLE" && "text-ink-faint",
                    )}
                  >
                    {item.state}
                    {item.problem ? ` (${item.problem})` : ""}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{item.exposure}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {environmentProblems.length > 0 ? (
            <ul className="space-y-1 border-t border-line px-4 py-3 text-xs text-danger">
              {environmentProblems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          ) : null}
        </Section>

        <Section title="Module status" description="Who the application is waiting on">
          <dl className="grid grid-cols-[11rem_1fr] gap-x-4 gap-y-2 text-[13px]">
            <dt className="text-ink-muted">Retrieval</dt>
            <dd>
              {RETRIEVAL_IMPLEMENTED
                ? "Real retriever installed."
                : "Placeholder retriever. Waiting on the retrieval implementation (Member 5)."}
            </dd>
            <dt className="text-ink-muted">Methodology</dt>
            <dd>
              {methodology.configured
                ? `Configured: ${methodology.id}, approved by ${methodology.approvedBy}.`
                : "Not configured. Scoring uses placeholder rules until Member 3's configuration is installed."}
            </dd>
            <dt className="text-ink-muted">Mission presets</dt>
            <dd>{summary.missions > 0 ? `${summary.missions} loaded.` : "None yet (Member 3)."}</dd>
            <dt className="text-ink-muted">Verified evidence</dt>
            <dd>
              {summary.humanReviewed > 0
                ? `${summary.humanReviewed} human-reviewed record(s).`
                : "None yet (Members 2 and 3)."}
            </dd>
            <dt className="text-ink-muted">Health endpoint</dt>
            <dd className="font-mono">/api/health and /api/health?deep=1</dd>
          </dl>
        </Section>
      </div>
    </>
  );
}
