import Link from "next/link";

import { NavLinks } from "./nav-links";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <span aria-hidden className="size-2.5 rounded-sm bg-accent" />
            <span className="font-mono text-sm font-semibold tracking-[0.2em] text-ink">IGNIS</span>
          </Link>
          <p className="hidden truncate text-xs text-ink-muted sm:block">
            Microgravity combustion evidence for spacecraft fire safety
          </p>
        </div>
        <p className="shrink-0 rounded border border-line-strong px-2 py-1 font-mono text-[11px] text-ink-muted uppercase">
          Prototype
        </p>
      </div>
      <div className="border-t border-line lg:hidden">
        <NavLinks orientation="horizontal" />
      </div>
    </header>
  );
}
