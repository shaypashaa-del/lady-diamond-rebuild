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
    .then(() => undefined)
    .catch((err) => {
      ready = null;
      throw err;
    });
  return ready;
}

const TTL_MS = 30_000;
let allCache: { at: number; value: Map<string, number> } | null = null;

// optionId -> manual price, for every product (small table; one query).
export async function getAllManualPrices(fresh = false): Promise<Map<string, number>> {
  if (!fresh && allCache && Date.now() - allCache.at < TTL_MS) return allCache.value;
  try {
    await ensureTable();
    const rows = await prisma.$queryRaw<{ optionId: string; price: string }[]>`
      SELECT "optionId", "price"::text AS "price" FROM "ManualOptionPrice"`;
    const value = new Map(rows.map((r) => [r.optionId, Number(r.price)]));
    allCache = { at: Date.now(), value };
    return value;
  } catch (err) {
    // Never let the optional table break pricing: no manual prices instead.
    console.error("[pricing] manual option prices unavailable", err);
    return new Map();
  }
}

export async function setManualOptionPrice(optionId: string, productId: string, price: number | null) {
  await ensureTable();
  if (price === null) {
    await prisma.$executeRaw`DELETE FROM "ManualOptionPrice" WHERE "optionId" = ${optionId}`;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "ManualOptionPrice" ("optionId", "productId", "price")
      VALUES (${optionId}, ${productId}, ${price})
      ON CONFLICT ("optionId") DO UPDATE SET "price" = EXCLUDED."price", "updatedAt" = now()`;
  }
  allCache = null;
}
