import { describe, it, expect } from "vitest";
import { pickShippingPrice, type ShippingRuleLike } from "./shipping";

describe("pickShippingPrice", () => {
  it("returns 0 (free) when no rules are configured", () => {
    expect(pickShippingPrice([], 100, "Israel")).toBe(0);
  });

  it("applies an unscoped flat rate to any country/subtotal", () => {
    const rules: ShippingRuleLike[] = [{ country: null, minOrderValue: null, price: 25 }];
    expect(pickShippingPrice(rules, 50, "Israel")).toBe(25);
    expect(pickShippingPrice(rules, 5000, "USA")).toBe(25);
  });

  // Regression test for the exact bug fixed this session: a FREE/FLAT_RATE
  // rule scoped to one country must NOT apply to a different country, even
  // though its `type` field isn't BY_COUNTRY.
  it("does not apply a country-scoped rule to a different country", () => {
    const rules: ShippingRuleLike[] = [
      { country: "USA", minOrderValue: null, price: 0 }, // "free shipping" rule, but only for USA
      { country: null, minOrderValue: null, price: 25 }, // generic flat rate
    ];
    expect(pickShippingPrice(rules, 100, "Israel")).toBe(25);
    expect(pickShippingPrice(rules, 100, "USA")).toBe(0);
  });

  it("does not apply a minOrderValue-scoped rule below the threshold", () => {
    const rules: ShippingRuleLike[] = [
      { country: null, minOrderValue: 200, price: 0 }, // free over 200
      { country: null, minOrderValue: null, price: 25 },
    ];
    expect(pickShippingPrice(rules, 100, "Israel")).toBe(25);
    expect(pickShippingPrice(rules, 200, "Israel")).toBe(0); // inclusive threshold
    expect(pickShippingPrice(rules, 300, "Israel")).toBe(0);
  });

  it("picks the cheapest applicable rule when several match", () => {
    const rules: ShippingRuleLike[] = [
      { country: "Israel", minOrderValue: null, price: 20 },
      { country: null, minOrderValue: null, price: 35 },
    ];
    expect(pickShippingPrice(rules, 100, "Israel")).toBe(20);
  });

  it("combines country and minOrderValue scoping on the same rule", () => {
    const rules: ShippingRuleLike[] = [
      { country: "Israel", minOrderValue: 100, price: 0 }, // free, but only Israel AND over 100
      { country: null, minOrderValue: null, price: 30 }, // generic fallback so we can tell if the scoped rule matched
    ];
    expect(pickShippingPrice(rules, 50, "Israel")).toBe(30); // under threshold -> scoped rule doesn't match
    expect(pickShippingPrice(rules, 150, "USA")).toBe(30); // wrong country -> scoped rule doesn't match
    expect(pickShippingPrice(rules, 150, "Israel")).toBe(0); // both conditions met -> scoped rule wins (cheaper)
  });
});
