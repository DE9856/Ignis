import Link from "next/link";

import { cn } from "@/lib/utils/cn";

/**
 * IGNIS mark: concentric rings around a small core, after the near-spherical
 * shape a flame takes without buoyancy. Original artwork; no agency insignia.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cn("size-5 shrink-0", className)}>
      <circle cx="10" cy="10" r="8.75" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" />
      <circle
        cx="10"
        cy="10"
        r="5.5"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.45"
        strokeWidth="1.25"
      />
      <circle cx="10" cy="10" r="2.75" fill="var(--color-accent)" />
    </svg>
  );
}

export function BrandLockup({
  withTagline = false,
  className,
}: {
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="IGNIS dashboard"
      className={cn("group flex items-center gap-2.5 rounded-sm", className)}
    >
      <BrandMark />
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-sm leading-none font-semibold tracking-[0.24em] text-ink">IGNIS</span>
        {withTagline ? (
          <span className="mt-1 truncate text-2xs leading-none text-ink-faint">
            Space fire evidence intelligence
          </span>
        ) : null}
      </span>
    </Link>
  );
}
