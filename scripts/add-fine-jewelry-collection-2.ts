// Follow-up to add-fine-jewelry-collection.ts: adds the remaining
// individually-verified pieces from the same client photo batch, plus a
// second gallery photo for the already-added sapphire necklace.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/collection/${filename}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.mediaAsset.create({ data: { url, filename, altText: alt } });
}

async function main() {
  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });

  // Add a second gallery photo to the already-existing sapphire necklace
  {
    const product = await prisma.product.findUnique({ where: { slug: "sapphire-teardrop-necklace" } });
    if (product) {
      const img2 = await mediaFor("v2-necklace-sapphire-teardrop-pendant-stand.jpeg", "שרשרת תליון ספיר על מעמד");
      const already = await prisma.productImage.findFirst({ where: { productId: product.id, mediaId: img2.id } });
      if (!already) {
        await prisma.productImage.create({ data: { productId: product.id, mediaId: img2.id, sortOrder: 1 } });
        console.log("Added second image to sapphire-teardrop-necklace");
      }
    }
  }

  // Sapphire flower halo ring, white gold
  {
    const img = await mediaFor("v2-ring-sapphire-flower-halo-white.jpeg", "טבעת פרח ספיר זהב לבן");
    await prisma.product.upsert({
      where: { slug: "sapphire-flower-halo-ring" },
      update: {},
      create: {
        slug: "sapphire-flower-halo-ring",
        name: lt("טבעת פרח ספיר", "Sapphire Flower Halo Ring", "Кольцо-цветок с сапфирами"),
        shortDescription: lt(
          "יהלום עגול במרכז, מוקף עלי כותרת ספיר כחולים — פרח נוצץ על האצבע.",
          "A round diamond center framed by blue sapphire petals — a brilliant flower for the finger.",
          "Круглый бриллиант в центре, окружённый лепестками из синих сапфиров."
        ),
        description: lt(
          "עיצוב פרח משעשע עם יהלום מרכזי ועלי כותרת ספיר, על זהב לבן 14K.",
          "A playful flower design with a diamond center and sapphire petals, set in 14K white gold.",
          "Игривый дизайн цветка с бриллиантом в центре и сапфировыми лепестками на белом золоте 14К."
        ),
        basePrice: 249,
        sku: "SFH-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 5,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת פרח ספיר זהב לבן" }] },
      },
    });
    console.log("Upserted sapphire-flower-halo-ring");
  }

  // Emerald cushion halo ring, white gold
  {
    const img = await mediaFor("v2-ring-emerald-cushion-halo-white.jpeg", "טבעת אמרלד הילה כרית זהב לבן");
    await prisma.product.upsert({
      where: { slug: "emerald-cushion-halo-ring" },
      update: {},
      create: {
        slug: "emerald-cushion-halo-ring",
        name: lt("טבעת אמרלד הילה — כרית", "Emerald Cushion Halo Ring", "Кольцо с изумрудом «кушон» в ореоле"),
        shortDescription: lt(
          "אמרלד בחיתוך כרית רך, על זהב לבן, מוקף הילת יהלומים.",
          "A soft cushion-cut emerald in white gold, framed by a diamond halo.",
          "Изумруд огранки «кушон» в белом золоте, в ореоле бриллиантов."
        ),
        description: lt(
          "אמרלד בחיתוך כרית קלאסי, משובץ בהילת יהלומים על שרשרת זהב לבן 14K.",
          "A classic cushion-cut emerald set in a diamond halo on 14K white gold.",
          "Изумруд огранки «кушон» в бриллиантовом ореоле на белом золоте 14К."
        ),
        basePrice: 299,
        sku: "ECH-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 4,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת אמרלד הילה כרית זהב לבן" }] },
      },
    });
    console.log("Upserted emerald-cushion-halo-ring");
  }

  // Diamond emerald-cut solitaire ring, rose gold
  {
    const img = await mediaFor("v2-ring-diamond-solitaire-emeraldcut-rose.jpeg", "טבעת יהלום סוליטר חיתוך אמרלד זהב ורוד");
    await prisma.product.upsert({
      where: { slug: "diamond-emeraldcut-solitaire-ring" },
      update: {},
      create: {
        slug: "diamond-emeraldcut-solitaire-ring",
        name: lt("טבעת יהלום סוליטר — חיתוך אמרלד", "Diamond Emerald-Cut Solitaire Ring", "Кольцо-солитер с бриллиантом изумрудной огранки"),
        shortDescription: lt(
          "יהלום בחיתוך אמרלד ארכיטקטוני, על שרשרת פייבה עדינה בזהב ורוד.",
          "An architectural emerald-cut diamond on a delicate pavé band, in rose gold.",
          "Бриллиант изумрудной огранки на тонкой дорожке паве, розовое золото."
        ),
        description: lt(
          "טבעת סוליטר עם יהלום מלבני בחיתוך אמרלד, על שרשרת פייבה בזהב ורוד 14K. קווים נקיים לעיצוב מודרני.",
          "A solitaire ring featuring a rectangular emerald-cut diamond on a pavé band, in 14K rose gold. Clean lines for a modern look.",
          "Кольцо-солитер с прямоугольным бриллиантом изумрудной огранки на дорожке паве, розовое золото 14К."
        ),
        basePrice: 239,
        sku: "DEC-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 5,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת יהלום סוליטר חיתוך אמרלד זהב ורוד" }] },
      },
    });
    console.log("Upserted diamond-emeraldcut-solitaire-ring");
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
