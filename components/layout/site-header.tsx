"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { NAVIGATION as LINKS } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

import { BrandMark } from "./brand-mark";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Floating bar shared by every route, landing page included. */
export function SiteHeader() {
  const pathname = usePathname();
  const rowRef = useRef<HTMLUListElement>(null);

  // On small screens the links are one scrolling row: keep the current page in view.
  useEffect(() => {
    rowRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <header className="seq fixed inset-x-3 top-3 z-40 sm:inset-x-6 sm:top-5">
      <nav aria-label="Primary">
        <div className="mx-auto flex h-14 max-w-[84rem] items-center gap-3 rounded-lg border border-line bg-canvas/80 px-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.6)] backdrop-blur-md sm:px-4">
          <Link href="/" aria-label="IGNIS home" className="flex items-center gap-2.5 rounded-sm">
            <BrandMark />
            <span className="font-mono text-sm leading-none font-semibold tracking-[0.24em] text-ink">
              IGNIS
            </span>
          </Link>

          <ul className="ml-4 hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                      active ? "bg-raised text-ink" : "text-ink-muted hover:bg-raised hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p
            title="NASA is the source of scientific evidence. IGNIS is not an official NASA product."
            className="ml-auto hidden items-center gap-2 text-xs text-ink-faint 2xl:flex"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Independent prototype, not a NASA product
          </p>

          {pathname === "/scenario" ? null : (
            <Link
              href="/scenario"
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-[0.8125rem] font-medium text-accent-ink transition-[filter] hover:brightness-110 2xl:ml-3"
            >
              Build a scenario
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
        <ul
          ref={rowRef}
          className="mx-auto mt-2 flex max-w-[84rem] [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-lg border border-line bg-canvas/80 [mask-image:linear-gradient(90deg,#000_85%,transparent)] px-2 py-1.5 backdrop-blur-md lg:hidden"
        >
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                    active ? "bg-raised text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
