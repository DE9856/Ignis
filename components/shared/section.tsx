import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface SectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding, e.g. for a full-bleed table. */
  flush?: boolean;
}

/** Bordered panel with a title bar. The basic building block of every page. */
export function Section({ title, description, actions, children, className, flush = false }: SectionProps) {
  return (
    <section className={cn("rounded-md border border-line bg-surface", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className={flush ? undefined : "p-4"}>{children}</div>
    </section>
  );
}
