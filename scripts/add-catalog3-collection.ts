// Fifth batch: final sweep of wp-content/uploads/2025/10 from the client's
// full site export (public_html.zip), catching pieces missed in the first
// pass. Each image individually verified before naming/copying.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/catalog3/${filename}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.mediaAsset.create({ data: { url, filename, altText: alt } });
}

async function main() {
  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  const earrings = await prisma.category.findUniqueOrThrow({ where: { slug: "earrings" } });

  const products = [
    {
      slug: "diamond-cluster-huggie-earrings",
      filename: "earrings-diamond-cluster-huggie-yellow.jpeg",
      category: earrings,
      name: lt("עגילי האגי יהלומים קלאסטר", "Diamond Cluster Huggie Earrings", "Серьги-хаггі с кластером бриллиантов"),
      shortDescription: lt("אשכול יהלומים מרובע על חישוק צמוד, זהב צהוב.", "A square diamond cluster on a close-fitting hoop, yellow gold.", "Квадратный кластер бриллиантов на плотно прилегающем кольце."),
      description: lt("עגילי האגי צמודים עם אשכול יהלומים בצורת ריבוע, על זהב צהוב 14K.", "Close-fitting huggie earrings featuring a square diamond cluster, in 14K yellow gold.", "Плотно прилегающие серьги-хаггі с квадратным кластером бриллиантов, жёлтое золото 14К."),
      price: 219,
      sku: "DCH-301",
      featured: true,
    },
    {
      slug: "sapphire-doublehalo-stud-earrings",
      filename: "earrings-sapphire-doublehalo-stud-rose.jpeg",
      category: earrings,
      name: lt("עגילי ספיר הילה כפולה", "Sapphire Double Halo Stud Earrings", "Серьги с сапфиром в двойном ореоле"),
      shortDescription: lt("ספיר אובלי גדול מוקף הילה כפולה של יהלומים, זהב ורוד.", "A large oval sapphire framed by a double diamond halo, rose gold.", "Крупный овальный сапфир в двойном бриллиантовом ореоле."),
      description: lt("עגילי סטאד מרשימים עם ספיר אובלי מרכזי מוקף הילה כפולה של יהלומים, על זהב ורוד.", "Striking stud earrings featuring a central oval sapphire framed by a double diamond halo, in rose gold.", "Впечатляющие серьги-гвоздики с овальным сапфиром в двойном бриллиантовом ореоле, розовое золото."),
      price: 289,
      sku: "SDH-302",
      featured: true,
    },
    {
      slug: "diamond-flower-pendant-necklace",
      filename: "necklace-diamond-flower-pendant-yellow.jpeg",
      category: necklaces,
      name: lt("שרשרת תליון פרח יהלומים", "Diamond Flower Pendant Necklace", "Колье с бриллиантовым цветком"),
      shortDescription: lt("פרח יהלומים בעיצוב מרקיז, זהב צהוב.", "A marquise-diamond flower design, yellow gold.", "Цветок из бриллиантов огранки «маркиз», жёлтое золото."),
      description: lt("תליון פרח עם עלי כותרת יהלום מרקיז ומרכז עגול, על שרשרת זהב צהוב עדינה.", "A flower pendant with marquise-diamond petals and a round center stone, on a delicate yellow gold chain.", "Подвеска-цветок с лепестками из бриллиантов «маркиз» и круглым камнем в центре, тонкая цепочка из жёлтого золота."),
      price: 229,
      sku: "DFP-303",
    },
    {
      slug: "diamond-journey-pendant-necklace",
      filename: "necklace-diamond-journey-pendant-yellow.jpeg",
      category: necklaces,
      name: lt("שרשרת תליון מסע יהלומים", "Diamond Journey Pendant Necklace", "Колье-«путешествие» с бриллиантами"),
      shortDescription: lt("שלושה יהלומים על עיצוב גלי, זהב צהוב.", "Three diamonds along a wave-like design, yellow gold.", "Три бриллианта на волнообразной подвеске."),
      description: lt("תליון \"מסע\" עם שלושה יהלומים עגולים בגדלים יורדים, על עיצוב גלי בזהב צהוב.", "A \"journey\" pendant featuring three round diamonds in graduating sizes, on a wave-like yellow gold design.", "Подвеска-«путешествие» с тремя круглыми бриллиантами убывающего размера на волнообразном жёлтом золоте."),
      price: 209,
      sku: "DJP-304",
    },
    {
      slug: "star-of-david-shema-outline-pendant",
      filename: "pendant-star-of-david-shema-outline-yellow.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד שמע ישראל קווי", "Star of David \"Shema\" Outline Pendant", "Кулон «Звезда Давида» контурная с «Шма»"),
      shortDescription: lt("מגן דוד בקווי מתאר עם חריטת \"שמע ישראל\", זהב צהוב.", "An outline Star of David engraved with \"Shema Yisrael\", yellow gold.", "Контурная «Звезда Давида» с гравировкой «Шма Исраэль»."),
      description: lt("תליון מגן דוד בעיצוב קווי מתאר, עם המילים \"שמע ישראל\" חרוטות במרכז ומסגרת יהלומים, זהב צהוב.", "An outline-style Star of David pendant, with \"Shema Yisrael\" engraved at the center and a diamond frame, in yellow gold.", "Контурная подвеска «Звезда Давида» с гравировкой «Шма Исраэль» в центре и бриллиантовой окантовкой, жёлтое золото."),
      price: 199,
      sku: "SDS-305",
      featured: true,
    },
    {
      slug: "diamond-round-pave-branded-ring",
      filename: "ring-diamond-round-pave-branded-yellow.jpeg",
      category: rings,
      name: lt("טבעת יהלום עגול פייבה — זהב צהוב", "Diamond Round Ring with Pavé — Yellow Gold", "Кольцо с круглым бриллиантом и паве — жёлтое золото"),
      shortDescription: lt("יהלום עגול על שרשרת פייבה, זהב צהוב, חקוקה Lady Diamond.", "A round diamond on a pavé band, yellow gold, engraved Lady Diamond.", "Круглый бриллиант на дорожке паве, жёлтое золото, гравировка Lady Diamond."),
      description: lt("טבעת עם יהלום עגול מרכזי על שרשרת פייבה בזהב צהוב, חקוקה Lady Diamond.", "A ring featuring a central round diamond on a pavé band in yellow gold, engraved Lady Diamond.", "Кольцо с центральным круглым бриллиантом на дорожке паве, жёлтое золото, гравировка Lady Diamond."),
      price: 229,
      sku: "DRP-306",
    },
    {
      slug: "diamond-round-solitaire-branded-ring-rose",
      filename: "ring-diamond-round-solitaire-branded-rose.jpeg",
      category: rings,
      name: lt("טבעת יהלום עגול — זהב ורוד", "Diamond Round Solitaire Ring — Rose Gold", "Кольцо-солитер с круглым бриллиантом — розовое золото"),
      shortDescription: lt("יהלום עגול על שרשרת חלקה, זהב ורוד, חקוקה Lady Diamond.", "A round diamond on a plain band, rose gold, engraved Lady Diamond.", "Круглый бриллиант на гладком кольце, розовое золото, гравировка Lady Diamond."),
      description: lt("טבעת סוליטר קלאסית עם יהלום עגול, על שרשרת חלקה בזהב ורוד, חקוקה Lady Diamond.", "A classic solitaire ring featuring a round diamond, on a plain rose gold band, engraved Lady Diamond.", "Классическое кольцо-солитер с круглым бриллиантом на гладком розовом золоте, гравировка Lady Diamond."),
      price: 209,
      sku: "DRS-307",
      featured: true,
    },
    {
      slug: "ruby-heart-halo-branded-ring",
      filename: "ring-ruby-heart-halo-branded-white.jpeg",
      category: rings,
      name: lt("טבעת רובי לב הילה 18K", "Ruby Heart Halo Ring 18K", "Кольцо с рубином-сердцем в ореоле, 18К"),
      shortDescription: lt("רובי בחיתוך לב מוקף יהלומים, זהב לבן 18K, חקוקה Lady Diamond.", "A heart-cut ruby framed by diamonds, 18K white gold, engraved Lady Diamond.", "Рубин огранки «сердце» в бриллиантовом ореоле, белое золото 18К."),
      description: lt("טבעת רומנטית עם רובי בחיתוך לב מוקף הילת יהלומים, על שרשרת פייבה בזהב לבן 18K, חקוקה Lady Diamond.", "A romantic ring featuring a heart-cut ruby framed by a diamond halo, on a pavé band in 18K white gold, engraved Lady Diamond.", "Романтичное кольцо с рубином-сердцем в бриллиантовом ореоле, дорожка паве, белое золото 18К."),
      price: 279,
      sku: "RHB-308",
      featured: true,
    },
  ];

  for (const p of products) {
    const media = await mediaFor(p.filename, p.name.he);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        basePrice: p.price,
        sku: p.sku,
        status: "PUBLISHED",
        isFeatured: !!p.featured,
        inventory: 5,
        categories: { create: [{ categoryId: p.category.id }] },
        images: { create: [{ mediaId: media.id, sortOrder: 0, altText: p.name.he }] },
      },
    });
    console.log("Upserted", p.slug);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
