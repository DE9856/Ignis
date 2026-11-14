import { StatusBadge } from "@/components/shared/status-badge";
import type { Investigation } from "@/lib/okf/types";
import { formatRange, UNKNOWN_LABEL } from "@/lib/utils/numbers";

import { gravityLabel } from "./experiment-fields";
import { ExperimentValue } from "./experiment-value";

const COLUMNS = [
  "Investigation",
  "Program",
  "Fuel",
  "Material",
  "Oxygen",
  "Pressure",
  "Airflow",
  "Gravity",
  "Status",
];

/** Dense overview table. Each title links to the detail block on the same page. */
export function ExperimentTable({ investigations }: { investigations: Investigation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-line">
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-2 text-[11px] font-medium tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {investigations.map((investigation) => (
            <tr key={investigation.id} className="hover:bg-raised/50">
              <th scope="row" className="px-4 py-2 font-medium">
                <a href={`#${investigation.id}`} className="text-ink hover:text-accent">
                  {investigation.shortTitle ?? investigation.title}
                </a>
              </th>
              <td className="px-4 py-2">
                <ExperimentValue value={investigation.program ?? UNKNOWN_LABEL} />
              </td>
              <td className="px-4 py-2">
                <ExperimentValue value={investigation.fuelType ?? UNKNOWN_LABEL} />
              </td>
              <td className="px-4 py-2">
                <ExperimentValue value={investigation.material ?? UNKNOWN_LABEL} />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <ExperimentValue
                  numeric
                  value={formatRange(investigation.oxygenMin, investigation.oxygenMax, "%")}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <ExperimentValue
                  numeric
                  value={formatRange(investigation.pressureMin, investigation.pressureMax, "kPa")}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <ExperimentValue
                  numeric
                  value={formatRange(investigation.airflowMin, investigation.airflowMax, "m/s")}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <ExperimentValue value={gravityLabel(investigation)} />
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={investigation.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
