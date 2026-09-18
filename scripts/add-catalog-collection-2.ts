// Follow-up to add-catalog-collection.ts: more individually-verified
// pieces from the same wp-content/uploads/2025/10 export batch.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/catalog/${filename}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.mediaAsset.create({ data: { url, filename, altText: alt } });
}

async function main() {
  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  const earrings = await prisma.category.findUniqueOrThrow({ where: { slug: "earrings" } });

  const products: {
    slug: string;
    filename: string;
    category: typeof rings;
    name: LT;
    shortDescription: LT;
    description: LT;
    price: number;
    sku: string;
    featured?: boolean;
  }[] = [
    {
      slug: "sapphire-halo-clipon-earrings",
      filename: "earrings-sapphire-halo-clipon-white.jpeg",
      category: earrings,
      name: lt("עגילי ספיר הילה גדולים", "Sapphire Halo Cluster Earrings", "Серьги с сапфиром в крупном ореоле"),
      shortDescription: lt("ספיר אובלי גדול מוקף הילת יהלומים רחבה, זהב לבן.", "A large oval sapphire framed by a wide diamond halo, white gold.", "Крупный овальный сапфир в широком бриллиантовом ореоле."),
      description: lt("עגילים בולטים עם ספיר אובלי מרכזי גדול, מוקף הילת יהלומים רחבה, על זהב לבן.", "Statement earrings featuring a large central oval sapphire, framed by a wide diamond halo, in white gold.", "Эффектные серьги с крупным овальным сапфиром в широком бриллиантовом ореоле, белое золото."),
      price: 279,
      sku: "SHC-116",
    },
    {
      slug: "diamond-solitaire-pendant-necklace",
      filename: "necklace-diamond-solitaire-pendant-yellow.jpeg",
      category: necklaces,
      name: lt("שרשרת תליון יהלום סוליטר", "Diamond Solitaire Pendant Necklace", "Колье с бриллиантом-солитером"),
      shortDescription: lt("יהלום עגול קלאסי בתליון יחיד, זהב צהוב.", "A classic round diamond in a single pendant, yellow gold.", "Классический круглый бриллиант в одиночной подвеске."),
      description: lt("תליון יהלום עגול קלאסי בשיבוץ צבתות, על שרשרת זהב צהוב עדינה.", "A classic round diamond pendant in a prong setting, on a delicate yellow gold chain.", "Классическая подвеска с круглым бриллиантом в крапановой оправе, на тонкой цепочке из жёлтого золота."),
      price: 199,
      sku: "DSP-117",
    },
    {
      slug: "diamond-cluster-pave-ring",
      filename: "ring-diamond-cluster-pave-yellow.jpeg",
      category: rings,
      name: lt("טבעת יהלומים קלאסטר פייבה", "Diamond Cluster Pavé Ring", "Кольцо с кластером бриллиантов паве"),
      shortDescription: lt("אשכול יהלומים מרובע על שרשרת פייבה, זהב צהוב.", "A square diamond cluster on a pavé band, yellow gold.", "Квадратный кластер бриллиантов на дорожке паве."),
      description: lt("אשכול יהלומים קטנים בצורת ריבוע, על שרשרת פייבה מעוקלת בזהב צהוב.", "A cluster of small diamonds arranged in a square, on a curved pavé band in yellow gold.", "Кластер мелких бриллиантов в форме квадрата на изогнутой дорожке паве, жёлтое золото."),
      price: 189,
      sku: "DCP-118",
    },
    {
      slug: "black-diamond-halo-ring",
      filename: "ring-black-diamond-halo-white.jpeg",
      category: rings,
      name: lt("טבעת יהלום שחור הילה", "Black Diamond Halo Ring", "Кольцо с чёрным бриллиантом в ореоле"),
      shortDescription: lt("יהלום שחור עגול מוקף הילת יהלומים לבנים, זהב לבן.", "A round black diamond framed by a white diamond halo, white gold.", "Круглый чёрный бриллиант в ореоле белых бриллиантов."),
      description: lt("טבעת נועזת עם יהלום שחור מרכזי מוקף הילת יהלומים לבנים, ואבנים שחורות נוספות על השרשרת, בזהב לבן.", "A bold ring featuring a central black diamond framed by a white diamond halo, with more black stones along the band, in white gold.", "Смелое кольцо с чёрным бриллиантом в центре, в ореоле белых бриллиантов, чёрные камни по кольцу, белое золото."),
      price: 259,
      sku: "BDH-119",
      featured: true,
    },
    {
      slug: "diamond-asschercut-statement-ring",
      filename: "ring-diamond-asschercut-statement-hand.jpeg",
      category: rings,
      name: lt("טבעת יהלום סטייטמנט חיתוך אשר", "Diamond Asscher-Cut Statement Ring", "Кольцо-стейтмент с бриллиантом огранки ашер"),
      shortDescription: lt("יהלום גדול בחיתוך מרובע וינטג'י, פלטינה.", "A large diamond in a vintage square cut, platinum.", "Крупный бриллиант винтажной квадратной огранки, платина."),
      description: lt("טבעת סטייטמנט עם יהלום גדול בחיתוך אשר וינטג'י, על שרשרת פלטינה עם צדדים משובצים.", "A statement ring featuring a large vintage asscher-cut diamond, on a platinum band with pavé shoulders.", "Кольцо-стейтмент с крупным бриллиантом винтажной огранки ашер на платиновом кольце с паве по бокам."),
      price: 349,
      sku: "DAS-120",
      featured: true,
    },
    {
      slug: "diamond-solitaire-twistband-ring",
      filename: "ring-diamond-solitaire-twistband-white.jpeg",
      category: rings,
      name: lt("טבעת יהלום סוליטר שרשרת מפותלת", "Diamond Solitaire Twist Band Ring", "Кольцо-солитер с витым кольцом"),
      shortDescription: lt("יהלום עגול על שרשרת חלקה מפותלת, זהב לבן.", "A round diamond on a smooth twisted band, white gold.", "Круглый бриллиант на гладком витом кольце."),
      description: lt("טבעת סוליטר מינימליסטית עם יהלום עגול על שרשרת חלקה בעיצוב מפותל עדין, זהב לבן.", "A minimalist solitaire ring with a round diamond on a smooth band with a subtle twist, white gold.", "Минималистичное кольцо-солитер с круглым бриллиантом на гладком кольце с изящным изгибом."),
      price: 179,
      sku: "DTB-121",
    },
    {
      slug: "diamond-solitaire-heartprong-ring",
      filename: "ring-diamond-solitaire-heartprong-white.jpeg",
      category: rings,
      name: lt("טבעת יהלום סוליטר צבתות לב", "Diamond Solitaire Heart-Prong Ring", "Кольцо-солитер с сердцевидными крапанами"),
      shortDescription: lt("יהלום עגול בשיבוץ צבתות בצורת לב, זהב לבן.", "A round diamond in a heart-shaped prong setting, white gold.", "Круглый бриллиант в сердцевидной крапановой оправе."),
      description: lt("טבעת סוליטר קלאסית עם יהלום עגול, בשיבוץ צבתות עדין בצורת לב, זהב לבן.", "A classic solitaire ring with a round diamond, set in a delicate heart-shaped prong, white gold.", "Классическое кольцо-солитер с круглым бриллиантом в изящной сердцевидной крапановой оправе."),
      price: 179,
      sku: "DHP-122",
    },
    {
      slug: "star-of-david-outline-pendant",
      filename: "pendant-star-of-david-outline-white.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד קווי מתאר", "Star of David Outline Pendant", "Кулон «Звезда Давида» контурный"),
      shortDescription: lt("מגן דוד בעיצוב קווי מתאר פתוח, משובץ יהלומים, זהב לבן.", "An open outline Star of David, set with diamonds, white gold.", "Открытая контурная «Звезда Давида», украшена бриллиантами."),
      description: lt("תליון מגן דוד בעיצוב קווי מתאר עדין ופתוח, משובץ יהלומים לאורך כל הצורה, על זהב לבן.", "A delicate open-outline Star of David pendant, set with diamonds along its full shape, in white gold.", "Изящная контурная подвеска «Звезда Давида» с бриллиантами по всей форме, белое золото."),
      price: 199,
      sku: "SDO-123",
    },
    {
      slug: "star-of-david-blackwhite-pendant",
      filename: "pendant-star-of-david-blackwhite-white.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד יהלומים שחור-לבן", "Black & White Diamond Star of David", "«Звезда Давида» с чёрными и белыми бриллиантами"),
      shortDescription: lt("מגן דוד משובץ יהלומים שחורים ולבנים לסירוגין, זהב לבן.", "A Star of David set with alternating black and white diamonds, white gold.", "«Звезда Давида» с чередующимися чёрными и белыми бриллиантами."),
      description: lt("תליון מגן דוד נועז עם יהלומים שחורים במרכז ומסגרת יהלומים לבנים, על זהב לבן.", "A bold Star of David pendant with black diamonds at the center and a white diamond frame, in white gold.", "Смелая подвеска «Звезда Давида» с чёрными бриллиантами в центре и белой бриллиантовой окантовкой."),
      price: 219,
      sku: "SDB-124",
      featured: true,
    },
    {
      slug: "ruby-heart-halo-ring",
      filename: "ring-ruby-heart-halo-white.jpeg",
      category: rings,
      name: lt("טבעת רובי לב הילה", "Ruby Heart Halo Ring", "Кольцо с рубином-сердцем в ореоле"),
      shortDescription: lt("רובי בחיתוך לב מוקף הילת יהלומים, זהב לבן.", "A heart-cut ruby framed by a diamond halo, white gold.", "Рубин огранки «сердце» в бриллиантовом ореоле."),
      description: lt("רובי בחיתוך לב רומנטי, מוקף הילת יהלומים, על שרשרת פייבה בזהב לבן — הבחירה המושלמת למתנת אהבה.", "A romantic heart-cut ruby, framed by a diamond halo, on a pavé band in white gold — the perfect gift of love.", "Романтичный рубин огранки «сердце» в бриллиантовом ореоле на дорожке паве — идеальный подарок в знак любви."),
      price: 269,
      sku: "RHH-125",
      featured: true,
    },
    {
      slug: "sapphire-simple-stud-earrings",
      filename: "earrings-sapphire-simple-stud-white.jpeg",
      category: earrings,
      name: lt("עגילי ספיר פשוטים", "Simple Sapphire Stud Earrings", "Простые серьги-гвоздики с сапфиром"),
      shortDescription: lt("ספיר אובלי בשיבוץ צבתות פשוט, זהב לבן.", "An oval sapphire in a simple prong setting, white gold.", "Овальный сапфир в простой крапановой оправе."),
      description: lt("עגילי סטאד יומיומיים עם ספיר אובלי בשיבוץ צבתות נקי, על זהב לבן.", "Everyday stud earrings featuring an oval sapphire in a clean prong setting, in white gold.", "Повседневные серьги-гвоздики с овальным сапфиром в лаконичной крапановой оправе."),
      price: 129,
      sku: "SSS-126",
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
