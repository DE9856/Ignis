import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Optional row under the description, e.g. a provenance legend. */
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-2xs tracking-[0.14em] text-ink-faint uppercase">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1.5 text-[1.625rem] leading-tight font-semibold tracking-tight text-balance text-ink">
            {title}
          </h1>
          {description ? (
            <div className="mt-2 max-w-3xl text-sm2 leading-relaxed text-pretty text-ink-muted">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
