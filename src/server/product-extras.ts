import "server-only";
import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/lib/i18n-content";

// Extra e-commerce details per product, kept as one JSON document in its own
// table (created on first use, so no manual migration). Everything is optional.
export type ProductExtras = {
  badge?: "NEW" | "BESTSELLER" | "LIMITED";
  brand?: string;
  gtin?: string;
  mpn?: string;
  warranty?: LocalizedText;
  care?: LocalizedText;
  certificate?: LocalizedText;
  minQty?: number;
  maxQty?: number;
  allowBackorder?: boolean;
  leadTimeDays?: number;
  lowStockThreshold?: number;
  shippingWeightGrams?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  costPrice?: number;
  supplier?: string;
  internalNotes?: string;
  // Scheduled sale: the product's sale price applies only inside this window
  // (ISO dates, YYYY-MM-DD, Israel time). Either end may be left open.
  // Personalisation: ring/size choices (comma list entered by the admin),
  // engraving and gift wrap. Fees are final VAT-inclusive prices per unit.
  sizes?: string[];
  engraving?: boolean;
  engravingFee?: number;
  engravingMaxLen?: number;
  giftWrap?: boolean;
  giftWrapFee?: number;
  saleStart?: string;
  saleEnd?: string;
};

export function isSaleActive(extras: ProductExtras | undefined, now = new Date()): boolean {
  if (!extras || (!extras.saleStart && !extras.saleEnd)) return true;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
  if (extras.saleStart && today < extras.saleStart) return false;
  if (extras.saleEnd && today > extras.saleEnd) return false;
  return true;
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= prisma
    .$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "ProductExtra" (
         "productId" TEXT PRIMARY KEY,
         "data" JSONB NOT NULL DEFAULT '{}'::jsonb,
         "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    )
    .then(() => undefined)
    .catch((err) => {
      ready = null;
      throw err;
    });
  return ready;
}

const TTL_MS = 30_000;
let cache: { at: number; value: Map<string, ProductExtras> } | null = null;

export async function getAllProductExtras(fresh = false): Promise<Map<string, ProductExtras>> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.value;
  try {
    await ensureTable();
    const rows = await prisma.$queryRaw<{ productId: string; data: ProductExtras }[]>`
      SELECT "productId", "data" FROM "ProductExtra"`;
    const value = new Map(rows.map((r) => [r.productId, r.data ?? {}]));
    cache = { at: Date.now(), value };
    return value;
  } catch (err) {
    // The optional table must never break the shop: no extras instead.
    console.error("[product-extras] unavailable", err);
    return new Map();
  }
}

export async function getProductExtras(productId: string, fresh = false): Promise<ProductExtras> {
  return (await getAllProductExtras(fresh)).get(productId) ?? {};
}

export async function saveProductExtras(productId: string, data: ProductExtras) {
  await ensureTable();
  const json = JSON.stringify(data);
  await prisma.$executeRaw`
    INSERT INTO "ProductExtra" ("productId", "data") VALUES (${productId}, ${json}::jsonb)
    ON CONFLICT ("productId") DO UPDATE SET "data" = EXCLUDED."data", "updatedAt" = now()`;
  cache = null;
}
