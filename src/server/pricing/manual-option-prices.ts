import "server-only";
import { prisma } from "@/lib/prisma";

// Optional hand-entered final price (VAT included) for one material option of
// a product. When present it replaces the formula for that option. Kept in its
// own table, created on first use, so no manual migration is needed.
let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= prisma
    .$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "ManualOptionPrice" (
         "optionId" TEXT PRIMARY KEY,
         "productId" TEXT NOT NULL,
         "price" NUMERIC(12,2) NOT NULL,
         "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    )
    // Sale price per option (added later): the table is created/extended at runtime.
    .then(() => prisma.$executeRawUnsafe(`ALTER TABLE "ManualOptionPrice" ADD COLUMN IF NOT EXISTS "salePrice" NUMERIC(12,2)`))
    .then(() => undefined)
    .catch((err) => {
      ready = null;
      throw err;
    });
  return ready;
}

const TTL_MS = 30_000;
type Loaded = { prices: Map<string, number>; sales: Map<string, number> };
let allCache: { at: number; value: Loaded } | null = null;

async function loadAll(fresh: boolean): Promise<Loaded> {
  if (!fresh && allCache && Date.now() - allCache.at < TTL_MS) return allCache.value;
  try {
    await ensureTable();
    const rows = await prisma.$queryRaw<{ optionId: string; price: string; salePrice: string | null }[]>`
      SELECT "optionId", "price"::text AS "price", "salePrice"::text AS "salePrice" FROM "ManualOptionPrice"`;
    const value: Loaded = {
      prices: new Map(rows.map((r) => [r.optionId, Number(r.price)])),
      sales: new Map(rows.filter((r) => r.salePrice != null && Number(r.salePrice) > 0).map((r) => [r.optionId, Number(r.salePrice)])),
    };
    allCache = { at: Date.now(), value };
    return value;
  } catch (err) {
    // Never let the optional table break pricing: no manual prices instead.
    console.error("[pricing] manual option prices unavailable", err);
    return { prices: new Map(), sales: new Map() };
  }
}

// optionId -> manual list price, for every product (small table; one query).
export async function getAllManualPrices(fresh = false): Promise<Map<string, number>> {
  return (await loadAll(fresh)).prices;
}

// optionId -> manual sale price (only options that have one).
export async function getAllManualSalePrices(fresh = false): Promise<Map<string, number>> {
  return (await loadAll(fresh)).sales;
}

// `salePrice`: undefined = leave the stored sale price as it is; null = clear it.
export async function setManualOptionPrice(
  optionId: string,
  productId: string,
  price: number | null,
  salePrice?: number | null
) {
  await ensureTable();
  if (price === null) {
    await prisma.$executeRaw`DELETE FROM "ManualOptionPrice" WHERE "optionId" = ${optionId}`;
  } else if (salePrice === undefined) {
    await prisma.$executeRaw`
      INSERT INTO "ManualOptionPrice" ("optionId", "productId", "price")
      VALUES (${optionId}, ${productId}, ${price})
      ON CONFLICT ("optionId") DO UPDATE SET "price" = EXCLUDED."price", "updatedAt" = now()`;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "ManualOptionPrice" ("optionId", "productId", "price", "salePrice")
      VALUES (${optionId}, ${productId}, ${price}, ${salePrice})
      ON CONFLICT ("optionId") DO UPDATE SET "price" = EXCLUDED."price", "salePrice" = EXCLUDED."salePrice", "updatedAt" = now()`;
  }
  allCache = null;
}

// Admin "reset all prices": removes every hand-entered list and sale price.
export async function clearAllManualPrices(): Promise<number> {
  await ensureTable();
  const n = await prisma.$executeRaw`DELETE FROM "ManualOptionPrice"`;
  allCache = null;
  return Number(n);
}
