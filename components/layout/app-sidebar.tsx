import { BrandLockup } from "./brand-mark";
import { NavLinks } from "./nav-links";

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-canvas lg:flex">
      <div className="flex h-14 items-center border-b border-line px-4">
        <BrandLockup withTagline />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <NavLinks orientation="vertical" />
      </div>
      <div className="border-t border-line px-4 py-3.5">
        <p className="text-2xs leading-relaxed text-ink-faint">
          Evidence from NASA combustion research. IGNIS is an independent hackathon prototype, not an official
          NASA product.
        </p>
      </div>
    </aside>
  );
}
