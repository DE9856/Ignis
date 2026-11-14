import Link from "next/link";

import { NavLinks } from "./nav-links";

export function AppSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-14 items-center border-b border-line px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span aria-hidden className="size-2.5 rounded-sm bg-accent" />
          <span className="font-mono text-sm font-semibold tracking-[0.2em] text-ink">IGNIS</span>
        </Link>
      </div>
      <div className="flex-1 px-2 py-3">
        <NavLinks orientation="vertical" />
      </div>
      <p className="border-t border-line px-4 py-3 text-[11px] leading-snug text-ink-faint">
        Independent hackathon prototype. Not an official NASA product.
      </p>
    </aside>
  );
}
