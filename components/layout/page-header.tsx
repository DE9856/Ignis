import type { CSSProperties, ReactNode } from "react";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Optional row under the description, e.g. a provenance legend. */
  children?: ReactNode;
}

/**
 * Page title in the landing page's display type: large title left, copy right.
 * Enters with the landing sequence (rise and unblur, in reading order); the
 * panels below follow through <ScrollReveal>. Off with reduced motion.
 */
export function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-10 border-b border-line pb-8 lg:mb-12 lg:pb-10">
      {eyebrow ? (
        <p
          style={delay(80)}
          className="seq flex items-center gap-2 font-mono text-2xs tracking-[0.14em] text-ink-faint uppercase"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-4 grid gap-5 lg:grid-cols-12 lg:items-end">
        <h1
          style={delay(140)}
          className="seq text-[clamp(2.25rem,4.6vw,4rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance text-ink lg:col-span-7"
        >
          {title}
        </h1>
        {description || actions ? (
          <div style={delay(240)} className="seq min-w-0 lg:col-span-5 lg:pb-1">
            {description ? (
              <div className="max-w-[34rem] text-[0.9375rem] leading-relaxed text-pretty text-ink-muted">
                {description}
              </div>
            ) : null}
            {actions ? <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
      </div>
      {children ? (
        <div style={delay(320)} className="seq mt-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}
