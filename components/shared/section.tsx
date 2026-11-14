import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface SectionProps {
  title: string;
  description?: ReactNode;
  /** Small mono label above the title, e.g. a screen number or category. */
  eyebrow?: string;
  /** Right-hand header slot for a provenance badge or a count. */
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Remove body padding, e.g. for a full-bleed table. */
  flush?: boolean;
  id?: string;
}

/** Bordered panel with a title bar. The basic building block of every page. */
export function Section({
  title,
  description,
  eyebrow,
  meta,
  actions,
  children,
  className,
  bodyClassName,
  flush = false,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "min-w-0 scroll-mt-36 rounded-lg border border-line bg-surface lg:scroll-mt-28",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">{eyebrow}</p>
          ) : null}
          <h2 className="text-[0.9375rem] font-medium tracking-[-0.01em] text-ink">{title}</h2>
          {description ? (
            <div className="mt-0.5 text-xs text-pretty text-ink-muted">{description}</div>
          ) : null}
        </div>
        {meta || actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {meta}
            {actions}
          </div>
        ) : null}
      </header>
      <div className={cn(flush ? undefined : "p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
