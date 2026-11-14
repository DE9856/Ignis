import { EvidenceSource } from "@/components/evidence/evidence-source";
import { EmptyState } from "@/components/shared/empty-state";
import { Section } from "@/components/shared/section";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Investigation } from "@/lib/okf/types";

import { conditionFields } from "./experiment-fields";
import { ExperimentValue } from "./experiment-value";

function BulletBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-faint italic">Not yet recorded</p>
      )}
    </div>
  );
}

/** Full record for one investigation: conditions, findings, limitations, sources, review trail. */
export function ExperimentDetail({ investigation }: { investigation: Investigation }) {
  return (
    <div id={investigation.id} className="scroll-mt-20">
      <Section
        title={investigation.title}
        description={investigation.program ?? "Program unknown"}
        actions={<StatusBadge status={investigation.status} />}
      >
        <div className="space-y-5">
          {investigation.description ? <p className="text-sm text-ink">{investigation.description}</p> : null}

          <div>
            <h3 className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Objective</h3>
            <p className="mt-2 text-sm whitespace-pre-line">
              {investigation.objective ?? <span className="text-ink-faint italic">Not yet recorded</span>}
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">
              Experimental conditions
            </h3>
            <dl className="mt-2 grid gap-x-8 gap-y-1.5 text-[13px] sm:grid-cols-2">
              {conditionFields(investigation).map((field) => (
                <div key={field.label} className="flex justify-between gap-4 border-b border-line py-1">
                  <dt className="shrink-0 text-ink-muted">{field.label}</dt>
                  <dd className="text-right">
                    <ExperimentValue value={field.value} numeric={field.numeric} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <BulletBlock title="Key findings" items={investigation.keyFindings} />
            <BulletBlock title="Limitations" items={investigation.limitations} />
          </div>

          <div>
            <h3 className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Sources</h3>
            {investigation.sources.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {investigation.sources.map((source) => (
                  <li key={source.id}>
                    <EvidenceSource source={source} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-2 py-6"
                title="No source cited"
                description="A record cannot be verified without one."
              />
            )}
          </div>

          <p className="border-t border-line pt-3 font-mono text-[11px] text-ink-faint">
            id {investigation.id}
            {investigation.generated ? ` · written by ${investigation.generated.by}` : ""}
            {investigation.verified.length > 0
              ? ` · verified by ${investigation.verified.map((record) => record.by).join(", ")}`
              : " · not yet verified"}
          </p>
        </div>
      </Section>
    </div>
  );
}
