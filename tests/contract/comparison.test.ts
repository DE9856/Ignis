import { describe, expect, it } from "vitest";

import { buildComparisonViewModel } from "@/lib/integration/comparison";
import { UNKNOWN_LABEL } from "@/lib/utils/numbers";

import { FIXTURE_IDS, loadFixtureKnowledge } from "../fixtures";

/** CONTRACT: Investigation[] -> comparison view model. */
describe("contract: Investigation -> comparison", () => {
  const { investigations } = loadFixtureKnowledge();
  const pick = (...ids: string[]) => ids.map((id) => investigations.find((i) => i.id === id)!);
  const model = buildComparisonViewModel(pick(FIXTURE_IDS.alpha, FIXTURE_IDS.gamma, FIXTURE_IDS.beta));
  const row = (key: string) => model.rows.find((entry) => entry.key === key)!;

  it("has one column per investigation and one cell per column in every row", () => {
    expect(model.columns.map((column) => column.id)).toEqual([
      FIXTURE_IDS.alpha,
      FIXTURE_IDS.gamma,
      FIXTURE_IDS.beta,
    ]);
    for (const entry of model.rows) expect(entry.cells).toHaveLength(3);
  });

  it("keeps units on ranges and shows a single value once", () => {
    expect(row("oxygen").cells.map((cell) => cell.display)).toEqual([
      "10 – 20 % O2",
      "30 % O2",
      UNKNOWN_LABEL,
    ]);
    expect(row("pressure").cells[1].display).toBe("≥ 100 kPa");
  });

  it("marks unknown cells and refuses to call a row 'same' when any value is unknown", () => {
    expect(row("oxygen").cells[2].isUnknown).toBe(true);
    expect(row("oxygen").allSame).toBeNull();
  });

  it("detects same and different among fully known rows", () => {
    const known = buildComparisonViewModel(pick(FIXTURE_IDS.alpha, FIXTURE_IDS.gamma));
    const knownRow = (key: string) => known.rows.find((entry) => entry.key === key)!;
    expect(knownRow("fuelType").allSame).toBe(true);
    expect(knownRow("material").allSame).toBe(false);
    expect(knownRow("hardware").allSame).toBe(true);
  });

  it("works for zero and one investigation", () => {
    expect(buildComparisonViewModel([]).rows.every((entry) => entry.cells.length === 0)).toBe(true);
    expect(
      buildComparisonViewModel(pick(FIXTURE_IDS.alpha)).rows.every((entry) => entry.allSame === null),
    ).toBe(true);
  });
});
