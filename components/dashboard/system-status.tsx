import { Section } from "@/components/shared/section";
import type { SupabaseStatus } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

interface Row {
  label: string;
  ready: boolean;
  detail: string;
}

/** Development-facing status: what is wired up and what is still a placeholder. */
export function SystemStatus({ supabase, issueCount }: { supabase: SupabaseStatus; issueCount: number }) {
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
      label: "Supabase",
      ready: supabase.publicConfigured,
      detail: supabase.publicConfigured
        ? "Public URL and anon key are set."
        : "Not configured. The app runs on local knowledge files. Copy .env.example to .env.local to connect.",
    },
    {
      label: "Vector ingestion",
      ready: supabase.serviceRoleConfigured,
      detail: supabase.serviceRoleConfigured
        ? "Service-role key is set for ingestion scripts."
        : "SUPABASE_SERVICE_ROLE_KEY is not set. Only needed for ingestion scripts.",
    },
    {
      label: "Evidence retrieval",
      ready: false,
      detail: "Interfaces only. Not implemented in this scaffold.",
    },
    { label: "LLM synthesis", ready: false, detail: "Optional and off. Not implemented in this scaffold." },
  ];

  return (
    <Section title="System status" description="For the development team" flush>
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-xs sm:grid-cols-[9rem_6.5rem_1fr]"
          >
            <span className="font-medium text-ink">{row.label}</span>
            <span className={cn("font-mono uppercase", row.ready ? "text-reviewed" : "text-ink-faint")}>
              {row.ready ? "Ready" : "Not ready"}
            </span>
            <span className="col-span-2 text-ink-muted sm:col-span-1">{row.detail}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
