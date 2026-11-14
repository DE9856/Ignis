import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  bodyClassName?: string;
}

/**
 * Native <details> with a consistent trigger. Used for every "why" path: score
 * explanations, why-retrieved drawers, full records. Keyboard and screen-reader
 * behaviour come from the browser, and it works without JavaScript.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
  summaryClassName,
  bodyClassName,
}: DisclosureProps) {
  return (
    <details className={cn("group/disclosure", className)} open={defaultOpen}>
      <summary
        className={cn(
          "inline-flex items-center gap-1 rounded-sm text-xs font-medium text-ink-muted transition-colors select-none hover:text-ink",
          summaryClassName,
        )}
      >
        <ChevronRight
          aria-hidden
          className="size-3.5 shrink-0 transition-transform group-open/disclosure:rotate-90"
        />
        {summary}
      </summary>
      <div className={cn("mt-3", bodyClassName)}>{children}</div>
    </details>
  );
}
