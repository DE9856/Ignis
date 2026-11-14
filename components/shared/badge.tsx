import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  | "nasa"
  | "reviewed"
  | "computed"
  | "interpretation"
  | "generated"
  | "unverified"
  | "danger"
  | "accent"
  | "neutral"
  | "faint";

const TONES: Record<BadgeTone, string> = {
  nasa: "border-nasa/45 bg-nasa/10 text-nasa",
  reviewed: "border-reviewed/45 bg-reviewed/10 text-reviewed",
  computed: "border-computed/45 bg-computed/10 text-computed",
  interpretation: "border-interpretation/45 bg-interpretation/10 text-interpretation",
  generated: "border-generated/50 bg-generated/10 text-generated",
  unverified: "border-dashed border-unverified/50 text-unverified",
  danger: "border-danger/45 bg-danger/10 text-danger",
  accent: "border-accent/50 bg-accent/10 text-accent",
  neutral: "border-line-strong bg-raised/60 text-ink-muted",
  faint: "border-dashed border-line-strong text-ink-faint",
};

interface BadgeProps {
  tone: BadgeTone;
  icon?: LucideIcon;
  /** A custom glyph, e.g. an evidence-strength meter, in place of an icon. */
  glyph?: ReactNode;
  title?: string;
  className?: string;
  children: ReactNode;
}

/**
 * The one badge shape used for provenance, review status and evidence states,
 * so every label on every screen reads as the same system. Always text plus
 * colour plus a shape cue; never colour alone.
 */
export function Badge({ tone, icon: Icon, glyph, title, className, children }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-[3px] border px-1.5 font-mono text-2xs leading-none font-medium tracking-[0.04em] whitespace-nowrap uppercase",
        TONES[tone],
        className,
      )}
    >
      {Icon ? <Icon aria-hidden className="size-3 shrink-0" strokeWidth={2} /> : glyph}
      {children}
    </span>
  );
}
