import type { ReactNode } from "react";

interface ReadSectionProps {
  id: string;
  title: string;
  /** One or two sentences under the title. */
  lede?: ReactNode;
  children: ReactNode;
}

/**
 * Section of a Read route (methodology, about): an editorial row on the
 * landing page's 12-column grid, title left and prose right, divided by a
 * hairline instead of boxed like an Operate panel.
 */
export function ReadSection({ id, title, lede, children }: ReadSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-36 border-t border-line py-12 first:border-t-0 first:pt-2 lg:grid lg:scroll-mt-28 lg:grid-cols-12 lg:gap-8 lg:py-16"
    >
      <div className="lg:col-span-4">
        <h2
          id={`${id}-title`}
          className="text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none font-medium tracking-[-0.035em] text-balance text-ink"
        >
          {title}
        </h2>
        {lede ? (
          <p className="mt-4 max-w-[22rem] text-[0.9375rem] leading-relaxed text-pretty text-ink-muted">
            {lede}
          </p>
        ) : null}
      </div>
      <div className="mt-8 min-w-0 text-[0.9375rem] leading-relaxed text-ink-muted lg:col-span-8 lg:mt-1">
        {children}
      </div>
    </section>
  );
}

/** Prose list for a ReadSection: hairline-ruled rows, no bullets. */
export function ReadList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item, index) => (
        <li key={index} className="py-3 text-pretty">
          {item}
        </li>
      ))}
    </ul>
  );
}
