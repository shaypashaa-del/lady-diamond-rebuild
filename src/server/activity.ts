import "server-only";
import { prisma } from "@/lib/prisma";
import { ttlMemo } from "@/lib/ttl-memo";

// Real visitor activity, kept in the database so numbers survive deploys. One row per
// anonymous visitor, per day, per kind (and per product for views/cart/wishlist), so a
// reload never counts twice. Table created on first use (no manual migration).
export type ActivityKind = "visit" | "view" | "cart" | "wish";

let ready: Promise<void> | null = null;
function ensureTable() {
  ready ??= (async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SiteActivity" (
      "id" BIGSERIAL PRIMARY KEY,
      "kind" TEXT NOT NULL,
      "visitor" TEXT NOT NULL,
      "product" TEXT NOT NULL DEFAULT '',
      "day" DATE NOT NULL,
      "at" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "SiteActivity_once" ON "SiteActivity" ("kind", "visitor", "day", "product")`
    );
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SiteActivity_kind_at" ON "SiteActivity" ("kind", "at")`);
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

const israelDay = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());

// In-process dedupe so a heartbeat every 30 s does not hit the database each time.
const g = globalThis as unknown as { __activitySeen?: Set<string> };
const seen = (g.__activitySeen ??= new Set());

export async function recordActivity(kind: ActivityKind, visitor: string, product = "") {
  const day = israelDay();
  const key = `${kind}|${visitor}|${day}|${product}`;
  if (seen.has(key)) return;
  if (seen.size > 50_000) seen.clear();
  seen.add(key);
  try {
    await ensureTable();
    await prisma.$executeRaw`
      INSERT INTO "SiteActivity" ("kind", "visitor", "product", "day")
      VALUES (${kind}, ${visitor}, ${product}, ${day}::date)
      ON CONFLICT DO NOTHING`;
  } catch (err) {
    seen.delete(key);
    console.error("[activity] record failed", err);
  }
}

export type ActivitySummary = {
  visitsToday: number;
  views24h: Record<string, number>;
  interested7d: Record<string, number>;
  popular: string[];
  recentCart: { product: string; at: string }[];
};

export const getActivitySummary = ttlMemo(
  "activity-summary",
  async (): Promise<ActivitySummary> => {
    try {
      await ensureTable();
      const [visits, views, interest, popular, recent] = await Promise.all([
        prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "SiteActivity" WHERE "kind" = 'visit' AND "day" = ${israelDay()}::date`,
        prisma.$queryRaw<{ product: string; n: bigint }[]>`
          SELECT "product", count(*) AS n FROM "SiteActivity"
          WHERE "kind" = 'view' AND "at" > now() - interval '24 hours' GROUP BY "product"`,
        prisma.$queryRaw<{ product: string; n: bigint }[]>`
          SELECT "product", count(DISTINCT "visitor") AS n FROM "SiteActivity"
          WHERE "kind" IN ('cart', 'wish') AND "at" > now() - interval '7 days' GROUP BY "product"`,
        prisma.$queryRaw<{ product: string; n: bigint }[]>`
          SELECT "product", count(*) AS n FROM "SiteActivity"
          WHERE "kind" = 'view' AND "at" > now() - interval '7 days' GROUP BY "product"
          HAVING count(*) >= 5 ORDER BY n DESC LIMIT 6`,
        prisma.$queryRaw<{ product: string; at: Date }[]>`
          SELECT "product", "at" FROM "SiteActivity"
          WHERE "kind" = 'cart' AND "at" > now() - interval '48 hours' ORDER BY "at" DESC LIMIT 8`,
      ]);
      const toMap = (rows: { product: string; n: bigint }[]) => Object.fromEntries(rows.map((r) => [r.product, Number(r.n)]));
      return {
        visitsToday: Number(visits[0]?.n ?? 0),
        views24h: toMap(views),
        interested7d: toMap(interest),
        popular: popular.map((r) => r.product),
        recentCart: recent.map((r) => ({ product: r.product, at: new Date(r.at).toISOString() })),
      };
    } catch (err) {
      console.error("[activity] summary failed", err);
      return { visitsToday: 0, views24h: {}, interested7d: {}, popular: [], recentCart: [] };
    }
  },
  60_000,
  { swr: true }
);
