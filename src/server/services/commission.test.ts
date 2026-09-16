import { describe, it, expect } from "vitest";
import { resolveCommissionAmount, round2 } from "./commission";

describe("resolveCommissionAmount precedence", () => {
  const noOverrides = { commissionOverride: null, fixedCommission: null };

  it("uses the global percent when nothing else is set", () => {
    expect(resolveCommissionAmount(noOverrides, 1000, null, 10)).toBe(100);
  });

  it("uses an active tier rule over the global percent", () => {
    const tierRule = { isActive: true, commissionPercent: 20 };
    expect(resolveCommissionAmount(noOverrides, 1000, tierRule, 10)).toBe(200);
  });

  it("ignores an inactive tier rule and falls back to global percent", () => {
    const tierRule = { isActive: false, commissionPercent: 20 };
    expect(resolveCommissionAmount(noOverrides, 1000, tierRule, 10)).toBe(100);
  });

  it("uses a percentage override over a tier rule", () => {
    const affiliate = { commissionOverride: 5, fixedCommission: null };
    const tierRule = { isActive: true, commissionPercent: 20 };
    expect(resolveCommissionAmount(affiliate, 1000, tierRule, 10)).toBe(50);
  });

  it("uses a fixed amount over everything else", () => {
    const affiliate = { commissionOverride: 5, fixedCommission: 42 };
    const tierRule = { isActive: true, commissionPercent: 20 };
    expect(resolveCommissionAmount(affiliate, 1000, tierRule, 10)).toBe(42);
  });

  // Regression test: an admin explicitly setting a 0% override or a 0
  // fixed commission must be honored exactly, not treated as "unset" and
  // fallen through to the next precedence level — `0` is falsy in JS, so
  // this only passes if the implementation uses `!= null`, not `||`/truthy
  // checks.
  it("honors an explicit 0 percentage override instead of falling through", () => {
    const affiliate = { commissionOverride: 0, fixedCommission: null };
    const tierRule = { isActive: true, commissionPercent: 20 };
    expect(resolveCommissionAmount(affiliate, 1000, tierRule, 10)).toBe(0);
  });

  it("honors an explicit 0 fixed commission instead of falling through", () => {
    const affiliate = { commissionOverride: 5, fixedCommission: 0 };
    expect(resolveCommissionAmount(affiliate, 1000, null, 10)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const affiliate = { commissionOverride: 33.333, fixedCommission: null };
    expect(resolveCommissionAmount(affiliate, 100, null, 10)).toBe(33.33);
  });
});

describe("round2", () => {
  it("rounds half up to 2 decimals", () => {
    expect(round2(1.005)).toBeCloseTo(1, 2);
    expect(round2(10.126)).toBe(10.13);
    expect(round2(10.124)).toBe(10.12);
  });
});
