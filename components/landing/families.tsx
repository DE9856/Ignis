import Link from "next/link";

import type { LandingFamily } from "@/lib/integration/landing";

import { FamilyMotif } from "./family-motif";

/**
 * Experiment families. On wide screens the hovered or focused family grows to
 * take most of the row; on small screens every family is shown in full.
 */
export function Families({ families }: { families: LandingFamily[] }) {
  return (
    <ul className="flex flex-col gap-2 lg:h-[26rem] lg:flex-row">
      {families.map((family) => (
        <li
          key={family.id}
          className="group ease-panel relative min-w-0 overflow-hidden rounded-lg border border-line bg-surface ticks focus-within:border-line-strong hover:border-line-strong lg:flex-1 lg:focus-within:grow-[4] lg:hover:grow-[4]"
        >
          <Link
            href={`/explore#${family.members[0].id}`}
            className="flex h-full flex-col p-4 outline-offset-[-2px] lg:p-5"
          >
            <div className="h-28 shrink-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100 lg:h-40">
              <FamilyMotif motif={family.motif} id={family.id} />
            </div>
            <div className="mt-auto min-w-0">
              <p className="text-xl font-medium tracking-[-0.02em] text-ink">{family.name}</p>
              <p className="mt-1 truncate font-mono text-2xs text-ink-faint">
                {family.members.map((member) => member.label).join(" · ")}
              </p>
              {family.description ? (
                <p className="mt-3 line-clamp-4 max-w-[30rem] text-[0.875rem] leading-relaxed text-ink-muted transition-opacity duration-500 lg:line-clamp-3 lg:w-[30rem] lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                  {family.description}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
