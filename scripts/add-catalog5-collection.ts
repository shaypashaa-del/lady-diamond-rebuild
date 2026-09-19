// Seventh batch: one real branded product photo the client sent directly
// (a leaf-accent diamond solitaire engagement ring, white gold), plus SEO
// metadata for it and for the four categories. Keywords used throughout
// are drawn only from the generic, brand-neutral terms in the client's
// keyword-research export (messages/keyword volumes) — competitor and
// unrelated brand names present in that same export (other jewelers,
// Pandora, etc.) were deliberately excluded.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/catalog5/${filename}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.mediaAsset.create({ data: { url, filename, altText: alt } });
}

async function main() {
  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });
  const earrings = await prisma.category.findUniqueOrThrow({ where: { slug: "earrings" } });
  const bracelets = await prisma.category.findUniqueOrThrow({ where: { slug: "bracelets" } });
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });

  console.log("Adding leaf-accent solitaire ring...");
  const media = await mediaFor(
    "ring-diamond-solitaire-leaf-accent-white.jpeg",
    "טבעת אירוסין סוליטר יהלום עם עלים - Lady Diamond"
  );
  const name = lt(
    "טבעת אירוסין סוליטר יהלום עם עיטור עלים",
    "Diamond Solitaire Engagement Ring with Leaf Accent",
    "Кольцо-солитер с бриллиантом и листовым узором"
  );
  await prisma.product.upsert({
    where: { slug: "diamond-solitaire-leaf-accent-ring" },
    update: {},
    create: {
      slug: "diamond-solitaire-leaf-accent-ring",
      name,
      shortDescription: lt(
        "יהלום עגול מרכזי עם עיטור עלים משובץ יהלומים, זהב לבן.",
        "A central round diamond framed by a diamond-set leaf accent, white gold.",
        "Центральный круглый бриллиант в обрамлении листового узора с бриллиантами."
      ),
      description: lt(
        "טבעת אירוסין קלאסית עם יהלום עגול מרכזי בשיבוץ שיניים, לצד עיטור עלים עדין משובץ יהלומים קטנים, על טבעת זהב לבן 14K.",
        "A classic engagement ring featuring a prong-set central round diamond alongside a delicate diamond-paved leaf accent, in 14K white gold.",
        "Классическое обручальное кольцо с центральным круглым бриллиантом в крапановой оправе и изящным листовым узором с мелкими бриллиантами, белое золото 14К."
      ),
      basePrice: 259,
      sku: "DSL-401",
      status: "PUBLISHED",
      isFeatured: true,
      inventory: 5,
      seoTitle: lt(
        "טבעת אירוסין יהלום סוליטר בזהב לבן | Lady Diamond",
        "Diamond Solitaire Engagement Ring in White Gold | Lady Diamond",
        "Обручальное кольцо-солитер с бриллиантом, белое золото | Lady Diamond"
      ),
      seoDescription: lt(
        "טבעת אירוסין יהלום סוליטר עם עיטור עלים, זהב לבן. טבעת יהלומים אלגנטית לרגע המיוחד, מקולקציית Lady Diamond.",
        "A diamond solitaire engagement ring with a leaf accent, in white gold. An elegant diamond ring for the special moment, from the Lady Diamond collection.",
        "Обручальное кольцо-солитер с бриллиантом и листовым узором, белое золото. Элегантное кольцо с бриллиантом для особого момента от Lady Diamond."
      ),
      categories: { create: [{ categoryId: rings.id }] },
      images: { create: [{ mediaId: media.id, sortOrder: 0, altText: name.he }] },
    },
  });

  console.log("Setting category SEO metadata...");

  await prisma.category.update({
    where: { id: rings.id },
    data: {
      seoTitle: lt(
        "טבעות זהב, טבעות יהלומים וטבעות אירוסין | Lady Diamond",
        "Gold Rings, Diamond Rings & Engagement Rings | Lady Diamond",
        "Золотые кольца, кольца с бриллиантами и обручальные кольца | Lady Diamond"
      ),
      seoDescription: lt(
        "טבעות זהב לבן, טבעות יהלומים וטבעות אירוסין בעיצוב מינימליסטי — לחיי היומיום ולרגעים המיוחדים ביותר.",
        "White gold rings, diamond rings and engagement rings in a minimalist design — for everyday wear and life's most special moments.",
        "Кольца из белого золота, кольца с бриллиантами и обручальные кольца минималистичного дизайна — для повседневной носки и особых моментов."
      ),
    },
  });

  await prisma.category.update({
    where: { id: earrings.id },
    data: {
      seoTitle: lt(
        "עגילי זהב, עגילי חישוק ועגילי יהלום | Lady Diamond",
        "Gold Earrings, Hoop Earrings & Diamond Earrings | Lady Diamond",
        "Золотые серьги, серьги-кольца и серьги с бриллиантами | Lady Diamond"
      ),
      seoDescription: lt(
        "עגילי זהב עדינים, עגילי חישוק ועגילי יהלום ללבישה יומיומית ולאירועים מיוחדים.",
        "Delicate gold earrings, hoop earrings and diamond earrings for everyday wear and special occasions.",
        "Изящные золотые серьги, серьги-кольца и серьги с бриллиантами для повседневной носки и особых случаев."
      ),
    },
  });

  await prisma.category.update({
    where: { id: bracelets.id },
    data: {
      seoTitle: lt(
        "צמידי זהב וצמיד טניס יהלומים | Lady Diamond",
        "Gold Bracelets & Diamond Tennis Bracelets | Lady Diamond",
        "Золотые браслеты и теннисные браслеты с бриллиантами | Lady Diamond"
      ),
      seoDescription: lt(
        "צמידי זהב לאישה, צמיד טניס יהלומים וצמידים דקים המשתלבים נהדר יחד.",
        "Gold bracelets for women, diamond tennis bracelets and fine bracelets that stack beautifully together.",
        "Золотые браслеты для женщин, теннисные браслеты с бриллиантами и тонкие браслеты, прекрасно сочетающиеся между собой."
      ),
    },
  });

  await prisma.category.update({
    where: { id: necklaces.id },
    data: {
      seoTitle: lt(
        "שרשראות זהב, תליונים ושרשראות יהלומים | Lady Diamond",
        "Gold Necklaces, Pendants & Diamond Necklaces | Lady Diamond",
        "Золотые колье, подвески и колье с бриллиантами | Lady Diamond"
      ),
      seoDescription: lt(
        "שרשראות זהב וכסף, תליונים עדינים ושרשראות יהלומים — מהעדין ועד המרשים.",
        "Gold and silver necklaces, delicate pendants and diamond necklaces — from delicate to statement.",
        "Золотые и серебряные колье, изящные подвески и колье с бриллиантами — от лёгких до заметных."
      ),
    },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
