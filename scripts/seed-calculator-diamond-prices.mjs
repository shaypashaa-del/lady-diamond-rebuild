// One-off: replaces ALL rows in CalculatorDiamondPrice with data extracted
// from the owner's two spreadsheets (natural + CVD lab-grown, Sep/Q2 2026).
// This table feeds ONLY the public diamond calculator display — it is never
// read by real catalog product pricing (see DiamondPriceEntry for that).
// Run with `npx tsx scripts/seed-calculator-diamond-prices.mjs` — plain
// `node` cannot resolve the generated Prisma client's extensionless imports.
import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rows = JSON.parse(
  readFileSync(new URL("./_calculator-diamond-prices-data.json", import.meta.url), "utf-8")
);

const deleted = await prisma.calculatorDiamondPrice.deleteMany({});
console.log(`Deleted ${deleted.count} existing rows.`);

const BATCH = 500;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH).map((r) => ({
    diamondType: r.diamondType,
    growthMethod: r.growthMethod,
    shape: r.shape,
    caratWeight: r.caratWeight,
    colorGrade: r.colorGrade,
    clarityGrade: r.clarityGrade,
    costPerCaratUsd: r.costPerCaratUsd,
    source: r.source,
    sourceUrl: r.sourceUrl,
  }));
  const result = await prisma.calculatorDiamondPrice.createMany({ data: batch });
  inserted += result.count;
}
console.log(`Inserted ${inserted} rows (expected ${rows.length}).`);

await prisma.$disconnect();
