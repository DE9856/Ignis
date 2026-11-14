import { Disclosure } from "@/components/shared/disclosure";
import type { SupabaseStatus } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

interface Row {
  label: string;
  ready: boolean;
  detail: string;
}

interface SystemStatusProps {
  supabase: SupabaseStatus;
  issueCount: number;
  retrievalReady?: boolean;
  synthesisReady?: boolean;
  methodologyReady?: boolean;
}

/** Development-facing status: what is wired up and what is still a placeholder. Collapsed by default. */
export function SystemStatus({
  supabase,
  issueCount,
  retrievalReady = false,
  synthesisReady = false,
  methodologyReady = false,
}: SystemStatusProps) {
  const rows: Row[] = [
    {
      label: "Knowledge files",
      ready: issueCount === 0,
      detail:
        issueCount === 0
          ? "Read from knowledge/ on disk. No validation problems."
          : `${issueCount} validation problem${issueCount === 1 ? "" : "s"}. See the Evidence Explorer.`,
    },
    {
      label: "Scoring methodology",
      ready: methodologyReady,
      detail: methodologyReady
        ? "Validated methodology installed."
        : "Placeholder rules: equal weights, match, mismatch or unknown.",
    },
    {
      label: "Supabase",
      ready: supabase.publicConfigured,
      detail: supabase.publicConfigured
        ? "Public URL and anon key are set."
        : "Not configured. The app runs on local knowledge files.",
    },
    {
      label: "Vector ingestion",
      ready: supabase.serviceRoleConfigured,
      detail: supabase.serviceRoleConfigured
        ? "Service-role key is set for ingestion scripts."
        : "Service-role key not set. Only needed for ingestion scripts.",
    },
    {
      label: "Evidence retrieval",
      ready: retrievalReady,
      detail: retrievalReady
        ? "Hybrid retrieval: meaning, keywords and record metadata."
        : "Keyword and metadata search over the verified records. Meaning-based search needs Supabase.",
    },
    {
      label: "Generated synthesis",
      ready: synthesisReady,
      detail: synthesisReady
        ? "Automatic summary above the evidence, written only from retrieved passages and checked against them."
        : "Optional and off. Set OPTIONAL_LLM_API_KEY to enable it.",
    },
  ];
  const readyCount = rows.filter((row) => row.ready).length;

  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <Disclosure
        summary={
          <span>
            System status <span className="font-normal text-ink-faint">· for the development team · </span>
            <span className="font-mono text-ink-faint">
              {readyCount}/{rows.length} ready
            </span>
          </span>
        }
      >
        <ul className="divide-y divide-line rounded-md border border-line">
          {rows.map((row) => (
            <li
              key={row.label}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 px-3 py-2 text-xs sm:grid-cols-[10rem_6rem_1fr]"
            >
              <span className="font-medium text-ink">{row.label}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-mono text-2xs uppercase",
                  row.ready ? "text-reviewed" : "text-ink-faint",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    row.ready ? "bg-reviewed" : "border border-ink-faint",
                  )}
                />
                {row.ready ? "Ready" : "Not ready"}
              </span>
              <span className="col-span-2 text-ink-muted sm:col-span-1">{row.detail}</span>
            </li>
          ))}
        </ul>
      </Disclosure>
    </div>
  );
}
