import { describe, expect, it } from "vitest";

import {
  canUseForAnalytics,
  canUseForRetrieval,
  getEffectiveProvenance,
  getProvenanceLabel,
  getSectionProvenance,
  getVerificationTier,
  isCanonicalEvidence,
  isEvidenceSection,
  isHumanReviewed,
} from "@/lib/domain/provenance";
import { PROVENANCE_CLASSES } from "@/lib/okf/types";

const reviewer = [{ by: "human:test-reviewer", at: null, note: null }];
const reviewed = { status: "stable" as const, verified: reviewer };
const draft = { status: "draft" as const, verified: [] };
const draftWithEntry = { status: "draft" as const, verified: reviewer };
const deprecated = { status: "deprecated" as const, verified: reviewer };

describe("verification tier", () => {
  it("needs both a stable status and a reviewer entry", () => {
    expect(getVerificationTier(reviewed)).toBe("HUMAN_REVIEWED");
    expect(getVerificationTier(draft)).toBe("UNVERIFIED");
    expect(getVerificationTier(draftWithEntry)).toBe("UNVERIFIED");
    expect(getVerificationTier(deprecated)).toBe("DEPRECATED");
    expect(isHumanReviewed(reviewed)).toBe(true);
  });
});

describe("canonical evidence", () => {
  it("is reviewed NASA-sourced content and nothing else", () => {
    expect(isCanonicalEvidence("NASA_SOURCE", true)).toBe(true);
    expect(isCanonicalEvidence("NASA_SOURCE", false)).toBe(false);
    expect(isCanonicalEvidence("TEAM_INTERPRETATION", true)).toBe(false);
    expect(isCanonicalEvidence("GENERATED_SUMMARY", true)).toBe(false);
    expect(isCanonicalEvidence("COMPUTED", true)).toBe(false);
    expect(isCanonicalEvidence("UNVERIFIED", true)).toBe(false);
  });
});

describe("analytics and retrieval eligibility", () => {
  it("uses unverified records only on explicit opt-in, and deprecated ones never", () => {
    expect(canUseForAnalytics(reviewed)).toBe(true);
    expect(canUseForAnalytics(draft)).toBe(false);
    expect(canUseForAnalytics(draft, { includeUnverified: true })).toBe(true);
    expect(canUseForAnalytics(deprecated, { includeUnverified: true })).toBe(false);
  });

  it("never retrieves generated or computed text", () => {
    for (const sourceClass of ["GENERATED_SUMMARY", "COMPUTED"] as const) {
      expect(canUseForRetrieval({ sourceClass, humanReviewed: true }, { includeUnverified: true })).toBe(
        false,
      );
    }
  });

  it("retrieves reviewed NASA evidence and reviewed interpretation, not unreviewed content", () => {
    expect(canUseForRetrieval({ sourceClass: "NASA_SOURCE", humanReviewed: true })).toBe(true);
    expect(canUseForRetrieval({ sourceClass: "TEAM_INTERPRETATION", humanReviewed: true })).toBe(true);
    expect(canUseForRetrieval({ sourceClass: "NASA_SOURCE", humanReviewed: false })).toBe(false);
    expect(
      canUseForRetrieval({ sourceClass: "NASA_SOURCE", humanReviewed: false }, { includeUnverified: true }),
    ).toBe(true);
  });
});

describe("labels and sections", () => {
  it("has a label for every provenance class", () => {
    for (const value of PROVENANCE_CLASSES) expect(getProvenanceLabel(value).length).toBeGreaterThan(0);
  });

  it("classifies the interpretation section and excludes source notes from evidence", () => {
    expect(getSectionProvenance("fire-safety-relevance")).toBe("TEAM_INTERPRETATION");
    expect(getSectionProvenance("key-findings")).toBe("NASA_SOURCE");
    expect(isEvidenceSection("source-notes")).toBe(false);
    expect(isEvidenceSection("objective")).toBe(true);
  });

  it("never shows unreviewed NASA text with a NASA badge", () => {
    expect(getEffectiveProvenance("NASA_SOURCE", false)).toBe("UNVERIFIED");
    expect(getEffectiveProvenance("NASA_SOURCE", true)).toBe("NASA_SOURCE");
    expect(getEffectiveProvenance("TEAM_INTERPRETATION", false)).toBe("TEAM_INTERPRETATION");
  });
});
