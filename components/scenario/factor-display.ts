import { gravityLabel } from "@/components/experiments/experiment-fields";
import { asReported, NOT_REPORTED, NOT_SPECIFIED, SAFETY_LABELS } from "@/components/shared/labels";
import type { Investigation } from "@/lib/okf/types";
import type { MissionScenario, ScenarioFactor } from "@/lib/ranking/types";
import { formatNumber, formatRange, UNKNOWN_LABEL } from "@/lib/utils/numbers";

/**
 * What the scenario asked for and what a record states, side by side, as text.
 * Display only: the comparison itself is made in lib/ranking.
 */
export interface FactorValues {
  scenario: string;
  record: string;
  /** True when the value is a measured quantity and should use the mono face. */
  numeric: boolean;
}

function scenarioNumber(value: number | null, unit: string): string {
  const text = formatNumber(value, unit);
  return text === UNKNOWN_LABEL ? NOT_SPECIFIED : text;
}

export function factorValues(
  factor: ScenarioFactor,
  scenario: MissionScenario,
  investigation: Investigation,
): FactorValues {
  switch (factor) {
    case "oxygen":
      return {
        scenario: scenarioNumber(scenario.oxygenPercent, "% O₂"),
        record: asReported(formatRange(investigation.oxygenMin, investigation.oxygenMax, "% O₂")),
        numeric: true,
      };
    case "pressure":
      return {
        scenario: scenarioNumber(scenario.pressureKPa, "kPa"),
        record: asReported(formatRange(investigation.pressureMin, investigation.pressureMax, "kPa")),
        numeric: true,
      };
    case "airflow":
      return {
        scenario: scenarioNumber(scenario.airflowMetersPerSecond, "m/s"),
        record: asReported(formatRange(investigation.airflowMin, investigation.airflowMax, "m/s")),
        numeric: true,
      };
    case "gravity":
      return {
        scenario: scenarioNumber(scenario.gravityG, "g"),
        record: asReported(gravityLabel(investigation)),
        numeric: true,
      };
    case "material":
      return {
        scenario: scenario.material ?? NOT_SPECIFIED,
        record: investigation.material ?? NOT_REPORTED,
        numeric: false,
      };
    case "fuelType":
      return {
        scenario: scenario.fuelType ?? NOT_SPECIFIED,
        record: investigation.fuelType ?? NOT_REPORTED,
        numeric: false,
      };
    case "safetyObjective":
      return {
        scenario: scenario.safetyObjective ? SAFETY_LABELS[scenario.safetyObjective] : NOT_SPECIFIED,
        record:
          investigation.safetyCategories.length > 0
            ? investigation.safetyCategories.map((objective) => SAFETY_LABELS[objective]).join(", ")
            : NOT_REPORTED,
        numeric: false,
      };
  }
}

/** Scenario values only, for summaries and strips. */
export function scenarioFactorText(factor: ScenarioFactor, scenario: MissionScenario): string {
  switch (factor) {
    case "oxygen":
      return scenarioNumber(scenario.oxygenPercent, "% O₂");
    case "pressure":
      return scenarioNumber(scenario.pressureKPa, "kPa");
    case "airflow":
      return scenarioNumber(scenario.airflowMetersPerSecond, "m/s");
    case "gravity":
      return scenarioNumber(scenario.gravityG, "g");
    case "material":
      return scenario.material ?? NOT_SPECIFIED;
    case "fuelType":
      return scenario.fuelType ?? NOT_SPECIFIED;
    case "safetyObjective":
      return scenario.safetyObjective ? SAFETY_LABELS[scenario.safetyObjective] : NOT_SPECIFIED;
  }
}
