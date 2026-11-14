"use client";

import {
  Columns3,
  FileSearch,
  Info,
  LayoutDashboard,
  ScrollText,
  SlidersHorizontal,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { NAVIGATION, type NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/explore": Telescope,
  "/scenario": SlidersHorizontal,
  "/compare": Columns3,
  "/evidence": FileSearch,
  "/methodology": ScrollText,
  "/about": Info,
};

/** Sidebar groups. Any route not listed here falls into the last group. */
const GROUPS: { label: string; hrefs: string[] }[] = [
  { label: "Mission", hrefs: ["/", "/scenario"] },
  { label: "Evidence", hrefs: ["/explore", "/compare", "/evidence"] },
  { label: "Reference", hrefs: ["/methodology", "/about"] },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function groupItems(): { label: string; items: NavigationItem[] }[] {
  const listed = new Set(GROUPS.flatMap((group) => group.hrefs));
  return GROUPS.map((group, index) => ({
    label: group.label,
    items: NAVIGATION.filter(
      (item) => group.hrefs.includes(item.href) || (index === GROUPS.length - 1 && !listed.has(item.href)),
    ).sort((a, b) => group.hrefs.indexOf(a.href) - group.hrefs.indexOf(b.href)),
  }));
}

/** Primary navigation. Grouped and vertical in the sidebar, one scrolling row on small screens. */
export function NavLinks({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const rowRef = useRef<HTMLUListElement>(null);

  // On small screens the nav is one scrolling row: keep the current page in view.
  useEffect(() => {
    rowRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  if (orientation === "horizontal") {
    return (
      <nav aria-label="Primary">
        <ul className="flex [scrollbar-width:none] gap-1 overflow-x-auto px-3 py-2">
          {NAVIGATION.map((item) => {
            const Icon = ICONS[item.href] ?? Info;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-md px-2.5 text-sm2 transition-colors",
                    active ? "bg-raised font-medium text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon aria-hidden className={cn("size-3.5", active ? "text-accent" : "text-ink-faint")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Primary" className="space-y-5">
      {groupItems().map((group) => (
        <div key={group.label}>
          <p className="px-2.5 pb-1.5 font-mono text-2xs tracking-[0.12em] text-ink-faint uppercase">
            {group.label}
          </p>
          <ul className="space-y-px">
            {group.items.map((item) => {
              const Icon = ICONS[item.href] ?? Info;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm2 transition-colors",
                      active
                        ? "bg-raised font-medium text-ink before:absolute before:inset-y-1.5 before:-left-2 before:w-0.5 before:rounded-full before:bg-accent"
                        : "text-ink-muted hover:bg-raised/50 hover:text-ink",
                    )}
                  >
                    <Icon
                      aria-hidden
                      className={cn("size-4 shrink-0", active ? "text-accent" : "text-ink-faint")}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** The current page's navigation label, for the header breadcrumb. */
export function CurrentSection() {
  const pathname = usePathname();
  const item = NAVIGATION.find((candidate) => isActive(pathname, candidate.href));
  if (!item) return null;
  return (
    <>
      <span aria-hidden className="text-ink-faint">
        /
      </span>
      <span className="truncate text-sm2 text-ink">{item.label}</span>
    </>
  );
}
