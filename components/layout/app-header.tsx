import { BrandLockup } from "./brand-mark";
import { CurrentSection, NavLinks } from "./nav-links";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 supports-[backdrop-filter]:bg-canvas/85 supports-[backdrop-filter]:backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLockup className="lg:hidden" />
          <p className="hidden min-w-0 items-center gap-2 lg:flex">
            <span className="font-mono text-2xs tracking-[0.12em] text-ink-faint uppercase">IGNIS</span>
            <CurrentSection />
          </p>
        </div>
        <p
          title="NASA is the source of scientific evidence. IGNIS is not an official NASA product."
          className="flex shrink-0 items-center gap-2 rounded-md border border-line-strong px-2 py-1 font-mono text-2xs tracking-[0.06em] text-ink-muted uppercase"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Independent prototype
        </p>
      </div>
      <div className="border-t border-line lg:hidden">
        <NavLinks orientation="horizontal" />
      </div>
    </header>
  );
}
