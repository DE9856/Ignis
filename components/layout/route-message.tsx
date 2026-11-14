import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Full-page message for a missing route or a failed render, in the landing
 * page's closing-section style: a large headline with its actions beside it.
 */
export function RouteMessage({
  code,
  title,
  description,
  actions,
  tone = "neutral",
}: {
  /** Small mono label above the headline, e.g. "404". */
  code: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "danger";
}) {
  return (
    <section
      role={tone === "danger" ? "alert" : undefined}
      className="rounded-lg border border-line bg-sunken ticks px-6 py-16 sm:px-10 lg:px-12 lg:py-24"
    >
      <p
        style={delay(80)}
        className="seq flex items-center gap-2 font-mono text-2xs tracking-[0.14em] text-ink-faint uppercase"
      >
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", tone === "danger" ? "bg-danger" : "bg-accent")}
        />
        {code}
      </p>
      <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end">
        <h1
          style={delay(140)}
          className="seq text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance text-ink lg:col-span-7"
        >
          {title}
        </h1>
        <div style={delay(240)} className="seq min-w-0 lg:col-span-5 lg:pb-1.5">
          {description ? (
            <div className="max-w-[34rem] text-[0.9375rem] leading-relaxed break-words text-ink-muted">
              {description}
            </div>
          ) : null}
          {actions ? <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** The landing page's two link styles, for use in RouteMessage actions. */
export const PRIMARY_ACTION =
  "inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-[0.8125rem] font-medium text-accent-ink transition-[filter] hover:brightness-110";
export const SECONDARY_ACTION =
  "inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-accent";
