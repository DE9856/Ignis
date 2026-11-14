"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { DISCLAIMER } from "@/lib/navigation";

import { BrandMark } from "./brand-mark";
import { SiteHeader } from "./site-header";

/** Routes that draw their own sections and footer edge to edge. */
const FULL_BLEED = new Set(["/"]);

/**
 * The page frame for every route: field grid, window guide lines and the
 * floating header. The landing page brings its own footer; every other route
 * gets a centred content column and the compact footer.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fullBleed = FULL_BLEED.has(pathname);

  return (
    <div className="relative flex min-h-screen flex-col field-grid">
      {/* Frame and guide lines, fixed to the window. Decorative, never in the way. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-4 z-0 hidden border border-line/50 lg:block"
      >
        <span className="absolute inset-y-0 left-[16.666%] w-px bg-line/35" />
        {fullBleed ? <span className="absolute inset-y-0 left-1/2 w-px bg-line/35" /> : null}
      </div>
      <SiteHeader />

      {fullBleed ? (
        <main id="main" className="flex-1">
          {children}
        </main>
      ) : (
        <>
          <main
            id="main"
            className="relative z-10 mx-auto w-full max-w-[84rem] flex-1 px-4 pt-36 pb-16 sm:px-6 sm:pt-40 lg:px-8 lg:pt-32 lg:pb-24"
          >
            {children}
          </main>
          <footer className="relative z-10 border-t border-line bg-sunken">
            <div className="mx-auto flex max-w-[84rem] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
              <p className="flex items-center gap-2.5">
                <BrandMark />
                <span className="font-mono text-sm font-semibold tracking-[0.24em] text-ink">IGNIS</span>
              </p>
              <p className="max-w-[44rem] text-xs leading-relaxed text-ink-faint">{DISCLAIMER}</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
