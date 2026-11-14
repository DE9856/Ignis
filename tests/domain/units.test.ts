import { describe, expect, it } from "vitest";

import {
  compareNullableNumbers,
  describeRange,
  equalWithin,
  fromKPa,
  kPaToPsi,
  psiToKPa,
  rangeContains,
  rangesOverlap,
  sameText,
  toG,
  toKPa,
  toMetersPerSecond,
  toOxygenPercent,
} from "@/lib/domain/units";

describe("pressure", () => {
  it("converts between psi and kPa and back", () => {
    expect(psiToKPa(1)).toBeCloseTo(6.894757, 5);
    expect(kPaToPsi(psiToKPa(14.7))).toBeCloseTo(14.7, 10);
    expect(toKPa(1, "atm")).toBe(101.325);
    expect(toKPa(760, "mmHg")).toBeCloseTo(101.325, 10);
    expect(fromKPa(100, "bar")).toBe(1);
  });

  it("returns null for missing, non-finite or negative input, never zero", () => {
    expect(toKPa(null, "psi")).toBeNull();
    expect(toKPa(Number.NaN, "psi")).toBeNull();
    expect(toKPa(-1, "psi")).toBeNull();
  });
});

describe("oxygen, airflow, gravity", () => {
  it("normalises oxygen to percent and rejects impossible values", () => {
    expect(toOxygenPercent(0.21, "fraction")).toBeCloseTo(21, 10);
    expect(toOxygenPercent(21, "percent")).toBe(21);
    expect(toOxygenPercent(120, "percent")).toBeNull();
    expect(toOxygenPercent(null, "percent")).toBeNull();
  });

  it("normalises airflow to m/s", () => {
    expect(toMetersPerSecond(30, "cm/s")).toBeCloseTo(0.3, 10);
    expect(toMetersPerSecond(60, "ft/min")).toBeCloseTo(0.3048, 10);
    expect(toMetersPerSecond(-1, "m/s")).toBeNull();
  });

  it("normalises gravity to g", () => {
    expect(toG(9.80665, "m/s2")).toBe(1);
    expect(toG(0, "g")).toBe(0);
    expect(toG(null, "g")).toBeNull();
  });
});

describe("ranges", () => {
  it("describes what a range actually states", () => {
    expect(describeRange({ min: 1, max: 2 })).toBe("closed");
    expect(describeRange({ min: 1, max: null })).toBe("lower-bound-only");
    expect(describeRange({ min: null, max: 2 })).toBe("upper-bound-only");
    expect(describeRange({ min: null, max: null })).toBe("unknown");
  });

  it("answers containment as true, false or unknown", () => {
    expect(rangeContains({ min: 10, max: 20 }, 15)).toBe(true);
    expect(rangeContains({ min: 10, max: 20 }, 25)).toBe(false);
    expect(rangeContains({ min: 10, max: null }, 15)).toBeNull();
    expect(rangeContains({ min: 10, max: null }, 5)).toBe(false);
    expect(rangeContains({ min: 10, max: 20 }, null)).toBeNull();
  });

  it("answers overlap the same way", () => {
    expect(rangesOverlap({ min: 10, max: 20 }, { min: 15, max: 30 })).toBe(true);
    expect(rangesOverlap({ min: 10, max: 20 }, { min: 21, max: 30 })).toBe(false);
    expect(rangesOverlap({ min: 10, max: null }, { min: 15, max: 30 })).toBeNull();
    expect(rangesOverlap({ min: 40, max: null }, { min: 15, max: 30 })).toBe(false);
  });
});

describe("comparison helpers", () => {
  it("sorts unknown values last in both directions", () => {
    expect([3, null, 1].sort((a, b) => compareNullableNumbers(a, b))).toEqual([1, 3, null]);
    expect([3, null, 1].sort((a, b) => compareNullableNumbers(a, b, "desc"))).toEqual([3, 1, null]);
  });

  it("needs an explicit tolerance and returns null for unknowns", () => {
    expect(equalWithin(1, 1.005, 0.01)).toBe(true);
    expect(equalWithin(1, 1.05, 0.01)).toBe(false);
    expect(equalWithin(null, 1, 0.01)).toBeNull();
    expect(sameText(" Alpha ", "alpha")).toBe(true);
    expect(sameText(null, "alpha")).toBeNull();
  });
});
