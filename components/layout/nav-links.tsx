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

import { NAVIGATION } from "@/lib/navigation";
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

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Primary navigation. Vertical in the sidebar, horizontal under the header on small screens. */
export function NavLinks({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const vertical = orientation === "vertical";

  return (
    <nav aria-label="Primary">
      <ul className={vertical ? "space-y-0.5" : "flex gap-1 overflow-x-auto px-3 py-2"}>
        {NAVIGATION.map((item) => {
          const Icon = ICONS[item.href] ?? Info;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className={vertical ? undefined : "shrink-0"}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-raised font-medium text-ink"
                    : "text-ink-muted hover:bg-raised/60 hover:text-ink",
                )}
              >
                <Icon
                  aria-hidden
                  className={cn("size-4 shrink-0", active ? "text-accent" : "text-ink-faint")}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
