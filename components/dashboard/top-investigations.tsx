import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Section } from "@/components/shared/section";
import { StatusBadge } from "@/components/shared/status-badge";
import { isVerified } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";

const LIMIT = 5;

/** Verified investigations, in stable id order. Scenario-specific ranking lives on /scenario. */
export function TopInvestigations({ investigations }: { investigations: Investigation[] }) {
  const verified = investigations.filter(isVerified).slice(0, LIMIT);

  return (
    <Section
      title="Verified investigations"
      description="Records that have passed human review"
      actions={
        <Link href="/explore" className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
          Open explorer
        </Link>
      }
    >
      {verified.length === 0 ? (
        <EmptyState description="Investigations appear here after a reviewer marks them verified." />
      ) : (
        <ul className="-my-2 divide-y divide-line">
          {verified.map((investigation) => (
            <li key={investigation.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <Link
                  href={`/explore#${investigation.id}`}
                  className="block truncate text-sm font-medium text-ink hover:text-accent"
                >
                  {investigation.shortTitle ?? investigation.title}
                </Link>
                <p className="truncate text-xs text-ink-faint">
                  {investigation.program ?? "Program unknown"}
                </p>
              </div>
              <StatusBadge status={investigation.status} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
