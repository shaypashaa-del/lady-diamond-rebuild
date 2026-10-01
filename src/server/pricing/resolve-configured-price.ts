import { prisma } from "@/lib/prisma";
import {
  computeConfiguredPrice,
  estimateCalculatorDiamondPrice,
  round2,
  type DiamondSelection,
  type CalculatorDiamondSpec,
  type CalculatorDiamondChoice,
} from "@/lib/pricing/engine";
import { getMetalPrice, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { VAT_RATE } from "@/lib/pricing/constants";
import {
  MetalType,
  type DiamondShape,
  type DiamondColorGrade,
  type DiamondClarityGrade,
} from "@/generated/prisma/enums";

// The single, authoritative place a CONFIGURABLE product's selling price is
// computed — called from the client-facing getConfiguredPrice action (for
// the live price shown while shopping) AND from createOrder at checkout
// (so what a customer is actually charged is always recomputed here too,
// never trusted from the client/cart). Takes a materialOptionId rather than
// a raw metal type/purity so it can validate the selection actually belongs
// to this product, instead of pricing an arbitrary metal/purity combo the
// product was never configured to sell.
export type ResolveConfiguredPriceResult =
  | {
      ok: true;
      sellingPrice: number;
      materialOptionId: string;
      diamondOptionIds: string[];
      calculatorDiamondSpec?: CalculatorDiamondChoice;
    }
  | { ok: false; reason: string; message: string };

const MISSING_DATA_MESSAGE_HE: Record<string, string> = {
  MISSING_PRODUCT: "המוצר לא נמצא.",
  INVALID_MATERIAL: "אפשרות החומר שנבחרה אינה תקינה עבור המוצר הזה.",
  MISSING_METAL_WEIGHT: "התמחור עבור המוצר הזה עדיין בבדיקה.",
  MISSING_METAL_PRICE: "מחיר השוק הנוכחי אינו זמין כרגע — נסו שוב בעוד מספר דקות.",
  MISSING_MANUFACTURING_COST: "התמחור עבור המוצר הזה עדיין בבדיקה.",
  MISSING_DIAMOND_PRICE: "התמחור עבור הבחירה הזו עדיין בבדיקה.",
  MISSING_FX_RATE: "התמחור עבור הבחירה הזו עדיין בבדיקה.",
  MISSING_DIAMOND_SELECTION: "נא לבחור את מפרט היהלום.",
};

// Short-lived in-memory caches. Computing a price used to cost four or five
// sequential database round-trips (product, gold-price freshness check, metal
// price, pricelist row) — about three seconds per click on the product page.
// Product costs and metal prices change rarely, so the live product page reads
// them from here for up to 30s; the diamond pricelist (static spreadsheet
// data) for ten minutes. Checkout passes `fresh: true` and always reads the
// database, so what a customer is actually charged is never served from cache.
const PRODUCT_TTL_MS = 30_000;
const METAL_TTL_MS = 30_000;
const GOLD_CHECK_EVERY_MS = 60_000;
const PRICELIST_TTL_MS = 10 * 60_000;

const fetchProductForPricing = (id: string) =>
  prisma.product.findUnique({ where: { id }, include: { materialOptions: true, diamondOptions: true } });
type ProductForPricing = NonNullable<Awaited<ReturnType<typeof fetchProductForPricing>>>;

const productCache = new Map<string, { at: number; value: ProductForPricing }>();
const metalCache = new Map<string, { at: number; value: NonNullable<Awaited<ReturnType<typeof getMetalPrice>>> }>();
const pricelistCache = new Map<string, { at: number; value: Awaited<ReturnType<typeof prisma.calculatorDiamondPrice.findFirst>> }>();
let lastGoldCheckAt = 0;

async function loadProduct(id: string, fresh: boolean) {
  const hit = productCache.get(id);
  if (!fresh && hit && Date.now() - hit.at < PRODUCT_TTL_MS) return hit.value;
  const value = await fetchProductForPricing(id);
  if (value) productCache.set(id, { at: Date.now(), value });
  return value;
}

async function loadMetalPrice(metalType: MetalType, fresh: boolean) {
  if (metalType === MetalType.GOLD && (fresh || Date.now() - lastGoldCheckAt > GOLD_CHECK_EVERY_MS)) {
    await refreshGoldPriceIfStale();
    lastGoldCheckAt = Date.now();
  }
  const hit = metalCache.get(metalType);
  if (!fresh && hit && Date.now() - hit.at < METAL_TTL_MS) return hit.value;
  const value = await getMetalPrice(metalType);
  if (value) metalCache.set(metalType, { at: Date.now(), value });
  return value;
}

async function loadPricelistRow(spec: CalculatorDiamondSpec) {
  const key = [spec.diamondType, spec.growthMethod, spec.shape, spec.caratWeight, spec.colorGrade, spec.clarityGrade].join("|");
  const hit = pricelistCache.get(key);
  if (hit && Date.now() - hit.at < PRICELIST_TTL_MS) return hit.value;
  const value = await prisma.calculatorDiamondPrice.findFirst({
    where: {
      diamondType: spec.diamondType,
      growthMethod: spec.growthMethod,
      shape: spec.shape as DiamondShape,
      caratWeight: spec.caratWeight,
      colorGrade: spec.colorGrade as DiamondColorGrade,
      clarityGrade: spec.clarityGrade as DiamondClarityGrade,
    },
  });
  if (value) pricelistCache.set(key, { at: Date.now(), value });
  return value;
}

async function resolveConfiguredPriceExVat(params: {
  productId: string;
  materialOptionId: string;
  diamondOptionIds: string[];
  // Only used for a product with no real ProductDiamondOption rows of its
  // own yet (see AGENTS.md / the calculator pricelists) — either a real
  // selection from the same exact-match shape/carat/color/clarity filter
  // the public diamond calculator uses (its resulting price — cost + the
  // calculator's own 25% margin, via estimateCalculatorDiamondPrice — is
  // added as-is on top of this product's metal-only price, never
  // re-margined again), or the literal string "none" when the customer has
  // confirmed this specific piece has no diamond at all (prices metal-only,
  // same as before this fallback existed).
  calculatorDiamondSpec?: CalculatorDiamondChoice | null;
  // True at checkout: read everything from the database, never from the
  // short-lived caches above.
  fresh?: boolean;
}): Promise<ResolveConfiguredPriceResult> {
  const fresh = params.fresh === true;
  const product = await loadProduct(params.productId, fresh);
  if (!product) {
    return { ok: false, reason: "MISSING_PRODUCT", message: MISSING_DATA_MESSAGE_HE.MISSING_PRODUCT };
  }

  const material = product.materialOptions.find((m) => m.id === params.materialOptionId && m.active);
  if (!material) {
    return { ok: false, reason: "INVALID_MATERIAL", message: MISSING_DATA_MESSAGE_HE.INVALID_MATERIAL };
  }

  // The metal price and (when the customer picked a pricelist diamond) the one
  // exact pricelist row are independent database round-trips — run them
  // together instead of one after the other, since this is what a customer is
  // waiting on every time they change a selection.
  const pickedSpec =
    params.calculatorDiamondSpec != null && params.calculatorDiamondSpec !== "none"
      ? params.calculatorDiamondSpec
      : null;
  const [metalPrice, pricelistRow] = await Promise.all([
    loadMetalPrice(material.metalType, fresh),
    pickedSpec ? loadPricelistRow(pickedSpec) : Promise.resolve(null),
  ]);

  // This product has no real diamond-option data of its own — a plain
  // metal item legitimately has none, so this isn't automatically "missing
  // data"; the customer either confirms there's no diamond (metal-only
  // price, same as always) or picks one via the calculator's own pricelist
  // filter, whose priced-in-full (cost + 25% margin) number is added as-is
  // to the metal-only price computed below. Either way it's a live,
  // explicit choice — never guessed.
  // A product with no designed diamond always goes this way (the customer must
  // say "none" or pick one); a product that HAS a designed diamond goes this
  // way only when the customer explicitly chose a different diamond from the
  // pricelist — otherwise it prices its designed diamond below.
  const pickedPricelistDiamond =
    params.calculatorDiamondSpec != null && params.calculatorDiamondSpec !== "none";
  const usesCalculatorDiamondFallback = product.diamondOptions.length === 0 || pickedPricelistDiamond;
  if (usesCalculatorDiamondFallback) {
    if (!params.calculatorDiamondSpec) {
      return {
        ok: false,
        reason: "MISSING_DIAMOND_SELECTION",
        message: MISSING_DATA_MESSAGE_HE.MISSING_DIAMOND_SELECTION,
      };
    }
    const metalOnly = computeConfiguredPrice({
      metalWeightGrams: product.metalWeightGrams ? Number(product.metalWeightGrams) : null,
      manufacturingCost: product.manufacturingCost ? Number(product.manufacturingCost) : null,
      settingCost: product.settingCost ? Number(product.settingCost) : null,
      otherCost: product.otherCost ? Number(product.otherCost) : null,
      metalPricePerGram: metalPrice ? Number(metalPrice.pricePerGram) : null,
      metal: { metalType: material.metalType, purity: material.purity },
      diamonds: [],
      diamondPriceEntries: [],
      diamondBaseCostRanges: [],
    });
    if (!metalOnly.ok) {
      return {
        ok: false,
        reason: metalOnly.reason,
        message: MISSING_DATA_MESSAGE_HE[metalOnly.reason] ?? "התמחור עדיין בבדיקה.",
      };
    }

    if (params.calculatorDiamondSpec === "none") {
      return {
        ok: true,
        sellingPrice: metalOnly.sellingPrice,
        materialOptionId: material.id,
        diamondOptionIds: [],
        calculatorDiamondSpec: "none",
      };
    }

    const spec: CalculatorDiamondSpec = params.calculatorDiamondSpec;
    const diamondEstimate = estimateCalculatorDiamondPrice(
      spec,
      pricelistRow
        ? [
            {
              diamondType: pricelistRow.diamondType as "NATURAL" | "LAB_GROWN",
              growthMethod: pricelistRow.growthMethod,
              shape: pricelistRow.shape,
              caratWeight: Number(pricelistRow.caratWeight),
              colorGrade: pricelistRow.colorGrade,
              clarityGrade: pricelistRow.clarityGrade,
              costPerCaratUsd: Number(pricelistRow.costPerCaratUsd),
            },
          ]
        : []
    );
    if (!diamondEstimate.ok) {
      return {
        ok: false,
        reason: "MISSING_DIAMOND_PRICE",
        message: MISSING_DATA_MESSAGE_HE.MISSING_DIAMOND_PRICE,
      };
    }

    return {
      ok: true,
      sellingPrice: round2(metalOnly.sellingPrice + diamondEstimate.retailPrice),
      materialOptionId: material.id,
      diamondOptionIds: [],
      calculatorDiamondSpec: spec,
    };
  }

  // Silently drop any id that doesn't actually belong to this product,
  // rather than erroring — a stale/tampered id should just not price in,
  // never crash checkout.
  const validDiamondIds = new Set(product.diamondOptions.map((d) => d.id));
  const diamondOptionIds = params.diamondOptionIds.filter((id) => validDiamondIds.has(id));

  const [diamondPriceEntries, diamondBaseCostRanges] = diamondOptionIds.length
    ? await Promise.all([prisma.diamondPriceEntry.findMany(), prisma.diamondBaseCostRange.findMany()])
    : [[], []];

  const selectedDiamonds: DiamondSelection[] = product.diamondOptions
    .filter((d) => diamondOptionIds.includes(d.id))
    .map((d) => ({
      diamondType: d.diamondType,
      shape: d.shape,
      caratWeight: Number(d.caratWeight),
      colorGrade: d.colorGrade,
      clarityGrade: d.clarityGrade,
      fancyColor: d.fancyColor,
      quantity: d.quantity,
    }));

  const result = computeConfiguredPrice({
    metalWeightGrams: product.metalWeightGrams ? Number(product.metalWeightGrams) : null,
    manufacturingCost: product.manufacturingCost ? Number(product.manufacturingCost) : null,
    settingCost: product.settingCost ? Number(product.settingCost) : null,
    otherCost: product.otherCost ? Number(product.otherCost) : null,
    metalPricePerGram: metalPrice ? Number(metalPrice.pricePerGram) : null,
    metal: { metalType: material.metalType, purity: material.purity },
    diamonds: selectedDiamonds,
    diamondPriceEntries: diamondPriceEntries.map((e) => ({
      diamondType: e.diamondType,
      shape: e.shape,
      caratMin: Number(e.caratMin),
      caratMax: Number(e.caratMax),
      colorGrade: e.colorGrade,
      clarityGrade: e.clarityGrade,
      pricePerCarat: Number(e.pricePerCarat),
    })),
    diamondBaseCostRanges: diamondBaseCostRanges.map((r) => ({
      category: r.category,
      minCostPerCarat: Number(r.minCostPerCarat),
      maxCostPerCarat: Number(r.maxCostPerCarat),
      currency: r.currency,
    })),
  });

  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason,
      message: MISSING_DATA_MESSAGE_HE[result.reason] ?? "התמחור עדיין בבדיקה.",
    };
  }
  return { ok: true, sellingPrice: result.sellingPrice, materialOptionId: material.id, diamondOptionIds };
}

// Every price a customer sees or is charged includes Israeli VAT (18%). The
// cost/margin formulas above stay VAT-free; VAT is applied exactly once, here,
// so the live product page and checkout can never disagree.
export async function resolveConfiguredPrice(
  params: Parameters<typeof resolveConfiguredPriceExVat>[0]
): Promise<ResolveConfiguredPriceResult> {
  const r = await resolveConfiguredPriceExVat(params);
  if (!r.ok) return r;
  return { ...r, sellingPrice: round2(r.sellingPrice * (1 + VAT_RATE)) };
}
