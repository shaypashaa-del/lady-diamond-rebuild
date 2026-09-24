import { describe, expect, it } from "vitest";
import { computeConfiguredPrice, type PricingCostInputs } from "./engine";

const baseInput: PricingCostInputs = {
  metalWeightGrams: 5,
  manufacturingCost: 50,
  settingCost: 0,
  otherCost: 0,
  metalPricePerGram: 300, // pure 24K-equivalent price
  metal: { metalType: "GOLD", purity: "K14" },
  diamonds: [],
  diamondPriceEntries: [],
};

describe("computeConfiguredPrice", () => {
  it("computes 14K gold, no diamond, using Base Cost / 0.80", () => {
    const result = computeConfiguredPrice(baseInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // metalCost = 5g * 0.585 * 300 = 877.5
    expect(result.metalCost).toBeCloseTo(877.5, 2);
    expect(result.baseCost).toBeCloseTo(927.5, 2);
    // selling = baseCost / 0.8
    expect(result.sellingPrice).toBeCloseTo(1159.38, 1);
    expect(result.grossMargin).toBe(0.2);
    // sanity: gross margin actually is 20% of selling price, not markup
    expect(result.grossProfit / result.sellingPrice).toBeCloseTo(0.2, 2);
  });

  it("never uses a 1.2x markup (which would give a different, wrong number)", () => {
    const result = computeConfiguredPrice(baseInput);
    if (!result.ok) throw new Error("expected ok");
    const wrongMarkupPrice = result.baseCost * 1.2;
    expect(result.sellingPrice).not.toBeCloseTo(wrongMarkupPrice, 2);
  });

  it("Silver 925 without diamond", () => {
    const result = computeConfiguredPrice({
      ...baseInput,
      metal: { metalType: "SILVER", purity: "S925" },
      metalPricePerGram: 5,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metalCost).toBeCloseTo(5 * 0.925 * 5, 2);
  });

  it("18K gold without diamond", () => {
    const result = computeConfiguredPrice({
      ...baseInput,
      metal: { metalType: "GOLD", purity: "K18" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metalCost).toBeCloseTo(5 * 0.75 * 300, 2);
  });

  it("Gold with a natural diamond priced from the manual table", () => {
    const result = computeConfiguredPrice({
      ...baseInput,
      diamonds: [
        {
          diamondType: "NATURAL",
          shape: "ROUND",
          caratWeight: 0.5,
          colorGrade: "G",
          clarityGrade: "VS1",
          quantity: 1,
        },
      ],
      diamondPriceEntries: [
        {
          diamondType: "NATURAL",
          shape: "ROUND",
          caratMin: 0.3,
          caratMax: 0.69,
          colorGrade: "G",
          clarityGrade: "VS1",
          pricePerCarat: 20000,
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.diamondCost).toBeCloseTo(10000, 2);
    expect(result.baseCost).toBeCloseTo(877.5 + 50 + 10000, 2);
  });

  it("Gold with a lab-grown diamond priced independently from natural", () => {
    const labResult = computeConfiguredPrice({
      ...baseInput,
      diamonds: [
        {
          diamondType: "LAB_GROWN",
          shape: "ROUND",
          caratWeight: 0.5,
          colorGrade: "G",
          clarityGrade: "VS1",
          quantity: 1,
        },
      ],
      diamondPriceEntries: [
        {
          diamondType: "LAB_GROWN",
          shape: "ROUND",
          caratMin: 0.3,
          caratMax: 0.69,
          colorGrade: "G",
          clarityGrade: "VS1",
          pricePerCarat: 6000,
        },
        {
          diamondType: "NATURAL",
          shape: "ROUND",
          caratMin: 0.3,
          caratMax: 0.69,
          colorGrade: "G",
          clarityGrade: "VS1",
          pricePerCarat: 20000,
        },
      ],
    });
    expect(labResult.ok).toBe(true);
    if (!labResult.ok) return;
    expect(labResult.diamondCost).toBeCloseTo(3000, 2);
  });

  it("multiple diamonds of different sizes (e.g. stud earrings, 2 stones)", () => {
    const result = computeConfiguredPrice({
      ...baseInput,
      diamonds: [
        {
          diamondType: "NATURAL",
          shape: "ROUND",
          caratWeight: 0.25,
          colorGrade: "G",
          clarityGrade: "VS1",
          quantity: 2,
        },
      ],
      diamondPriceEntries: [
        {
          diamondType: "NATURAL",
          shape: "ROUND",
          caratMin: 0.2,
          caratMax: 0.29,
          colorGrade: "G",
          clarityGrade: "VS1",
          pricePerCarat: 15000,
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 0.25ct * 15000/ct * 2 stones
    expect(result.diamondCost).toBeCloseTo(0.25 * 15000 * 2, 2);
  });

  it("multiple metal options produce different prices for the same product", () => {
    const gold14 = computeConfiguredPrice({ ...baseInput, metal: { metalType: "GOLD", purity: "K14" } });
    const gold18 = computeConfiguredPrice({ ...baseInput, metal: { metalType: "GOLD", purity: "K18" } });
    if (!gold14.ok || !gold18.ok) throw new Error("expected ok");
    expect(gold18.sellingPrice).toBeGreaterThan(gold14.sellingPrice);
  });

  it("flags missing metal weight instead of guessing", () => {
    const result = computeConfiguredPrice({ ...baseInput, metalWeightGrams: null });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("MISSING_METAL_WEIGHT");
  });

  it("flags missing diamond price instead of guessing", () => {
    const result = computeConfiguredPrice({
      ...baseInput,
      diamonds: [
        {
          diamondType: "NATURAL",
          shape: "PEAR",
          caratWeight: 1.2,
          colorGrade: "D",
          clarityGrade: "FL",
          quantity: 1,
        },
      ],
      diamondPriceEntries: [],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("MISSING_DIAMOND_PRICE");
  });

  it("flags unavailable metal market price (API down) instead of zero-pricing", () => {
    const result = computeConfiguredPrice({ ...baseInput, metalPricePerGram: null });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("MISSING_METAL_PRICE");
  });

  it("flags missing manufacturing cost instead of guessing", () => {
    const result = computeConfiguredPrice({ ...baseInput, manufacturingCost: null });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("MISSING_MANUFACTURING_COST");
  });

  it("never produces NaN, negative, or zero prices when ok", () => {
    const result = computeConfiguredPrice(baseInput);
    if (!result.ok) throw new Error("expected ok");
    expect(Number.isFinite(result.sellingPrice)).toBe(true);
    expect(result.sellingPrice).toBeGreaterThan(0);
    expect(Number.isNaN(result.sellingPrice)).toBe(false);
  });
});
