import { cn } from "@/lib/utils/cn";

/**
 * IGNIS mark: concentric rings around a small core, after the near-spherical
 * shape a flame takes without buoyancy. Original artwork; no agency insignia.
 * On first paint the core ignites and the rings expand once (CSS, so there is
 * no flash before hydration). It does not loop.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cn("size-5 shrink-0 overflow-visible", className)}>
      <circle
        className="mark-outer"
        cx="10"
        cy="10"
        r="8.75"
        fill="none"
        stroke="var(--color-line-strong)"
        strokeWidth="1.5"
        strokeDasharray="56"
        strokeDashoffset="0"
      />
      <circle
        className="mark-inner"
        cx="10"
        cy="10"
        r="5.5"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.45"
        strokeWidth="1.25"
      />
      <circle className="mark-core" cx="10" cy="10" r="2.75" fill="var(--color-accent)" />
    </svg>
  );
}
