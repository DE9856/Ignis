import { Download } from "lucide-react";

import { EXPORT_PATHS } from "@/lib/integration/export";

const LINK =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong px-3 text-xs font-medium text-ink-muted transition-colors hover:border-ink-faint/60 hover:text-ink";

/** Download the reviewed condition ranges for modelling. Null values stay empty. */
export function ExportLinks() {
  return (
    <>
      <a href={EXPORT_PATHS.csv} download className={LINK}>
        <Download aria-hidden className="size-3.5" />
        Conditions CSV
      </a>
      <a href={EXPORT_PATHS.json} className={LINK}>
        <Download aria-hidden className="size-3.5" />
        JSON
      </a>
      <p className="w-full text-xs text-ink-faint">
        Reviewed records only, with units and sources. A blank cell means the sources do not state it.
      </p>
    </>
  );
}
