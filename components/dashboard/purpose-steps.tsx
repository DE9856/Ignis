const STEPS = [
  { title: "Set the scenario", detail: "Cabin oxygen, pressure, gravity, airflow and safety goal." },
  {
    title: "See the matching evidence",
    detail: "Reviewed NASA investigations ranked, each score explained.",
  },
  { title: "Find where evidence runs out", detail: "Coverage per condition and the largest gap." },
];

/** What IGNIS does, in three steps, so the purpose is clear before any data is read. */
export function PurposeSteps() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
      {STEPS.map((step, index) => (
        <li key={step.title} className="flex gap-3 bg-canvas px-4 py-3">
          <span className="font-mono text-xs text-accent tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="block text-sm2 font-medium text-ink">{step.title}</span>
            <span className="block text-xs text-ink-muted">{step.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
