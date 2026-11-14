import { isVerified } from "@/lib/okf/parser";
import type { KnowledgeBase } from "@/lib/okf/loader";
import { AWAITING_EVIDENCE } from "@/lib/navigation";

interface Stat {
  label: string;
  count: number;
  note: string;
}

/** Record counts for the knowledge base. Counts come from files on disk, nothing else. */
export function MissionOverview({ knowledge }: { knowledge: KnowledgeBase }) {
  const stats: Stat[] = [
    {
      label: "Verified investigations",
      count: knowledge.investigations.filter(isVerified).length,
      note: "Reviewed against NASA sources",
    },
    { label: "Investigation records", count: knowledge.investigations.length, note: "All review states" },
    { label: "Hardware records", count: knowledge.hardware.length, note: "Facilities and rigs" },
    { label: "Concept records", count: knowledge.concepts.length, note: "Combustion and fire-safety terms" },
    { label: "Mission records", count: knowledge.missions.length, note: "Reference scenarios" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col bg-surface px-4 py-3 first:col-span-2 md:first:col-span-1"
        >
          <dt className="text-xs text-ink-muted">{stat.label}</dt>
          <dd className="mt-1 font-mono text-2xl font-medium text-ink tabular-nums">
            {stat.count > 0 ? stat.count : <span className="text-ink-faint">&mdash;</span>}
          </dd>
          <dd className="mt-1 text-[11px] leading-snug text-ink-faint">
            {stat.count > 0 ? stat.note : AWAITING_EVIDENCE}
          </dd>
        </div>
      ))}
    </dl>
  );
}
