// Backfills seoTitle/seoDescription for every product that doesn't have
// one yet, generated from the product's own already-written name and
// short description (no invented content) — appends "| Lady Diamond" to
// the title for brand recognition in search results, matching the
// pattern used for the categories and the one product seeded by hand.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };

const brandSuffix: LT = { he: " | Lady Diamond", en: " | Lady Diamond", ru: " | Lady Diamond" };

async function main() {
  const products = await prisma.product.findMany();
  const toUpdate = products.filter((p) => !p.seoTitle);
  console.log(`Backfilling SEO for ${toUpdate.length} products...`);

  for (const p of toUpdate) {
    const name = p.name as unknown as LT;
    const shortDesc = p.shortDescription as unknown as LT | null;

    const seoTitle: LT = {
      he: `${name.he}${brandSuffix.he}`,
      en: `${name.en}${brandSuffix.en}`,
      ru: `${name.ru}${brandSuffix.ru}`,
    };
    const seoDescription: LT = shortDesc
      ? { he: shortDesc.he, en: shortDesc.en, ru: shortDesc.ru }
      : seoTitle;

    await prisma.product.update({
      where: { id: p.id },
      data: { seoTitle, seoDescription },
    });
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
