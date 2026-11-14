import type { MissionScenario } from "@/lib/ranking/types";
import { formatNumber, UNKNOWN_LABEL } from "@/lib/utils/numbers";

const NOT_SPECIFIED = "Not specified";

function show(value: string): string {
  return value === UNKNOWN_LABEL ? NOT_SPECIFIED : value;
}

/** The scenario as the ranking code sees it, after normalisation. */
export function ScenarioSummary({ scenario }: { scenario: MissionScenario }) {
  const rows: [string, string][] = [
    ["Name", scenario.name || NOT_SPECIFIED],
    ["Oxygen", show(formatNumber(scenario.oxygenPercent, "% O2"))],
    ["Pressure", show(formatNumber(scenario.pressureKPa, "kPa"))],
    ["Airflow", show(formatNumber(scenario.airflowMetersPerSecond, "m/s"))],
    ["Gravity", show(formatNumber(scenario.gravityG, "g"))],
    ["Material", scenario.material ?? NOT_SPECIFIED],
    ["Fuel type", scenario.fuelType ?? NOT_SPECIFIED],
    ["Safety objective", scenario.safetyObjective ?? NOT_SPECIFIED],
    ["Assumptions", scenario.assumptionNotes ?? NOT_SPECIFIED],
  ];

  return (
    <dl className="grid grid-cols-[8.5rem_1fr] gap-x-3 gap-y-1.5 text-[13px]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-muted">{label}</dt>
          <dd className={value === NOT_SPECIFIED ? "text-ink-faint italic" : "break-words text-ink"}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
