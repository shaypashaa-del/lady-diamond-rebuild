// One-off script: adds the real product photos supplied by the client
// (WhatsApp export, 2026-09-18) as proper catalog products under the
// existing Necklaces/Bracelets categories, with real MediaAsset records
// (not placeholder blocks). Safe to re-run — uses upsert on product slug.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/products/${filename}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.mediaAsset.create({
    data: { url, filename, altText: alt },
  });
}

async function main() {
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  const bracelets = await prisma.category.findUniqueOrThrow({ where: { slug: "bracelets" } });

  // 1. Heart-cut solitaire pendant — white gold
  {
    const img1 = await mediaFor("necklace-heart-white-gold-1.jpeg", "שרשרת לב יהלום זהב לבן");
    const img2 = await mediaFor("necklace-heart-white-gold-worn.jpeg", "שרשרת לב יהלום זהב לבן על הצוואר");
    const img3 = await mediaFor("necklace-heart-white-gold-hand.jpeg", "שרשרת לב יהלום זהב לבן ביד");
    const product = await prisma.product.upsert({
      where: { slug: "heart-necklace-white-gold" },
      update: {},
      create: {
        slug: "heart-necklace-white-gold",
        name: lt("שרשרת לב יהלום — זהב לבן", "Heart Diamond Necklace — White Gold", "Колье «Сердце» — белое золото"),
        shortDescription: lt(
          "לב יהלום זהוב יחיד על שרשרת זהב לבן דקה, לנוכחות עדינה שמאירה כל יום.",
          "A single heart-cut stone set in delicate white gold, for an everyday glow.",
          "Одиночный камень в форме сердца на тонкой цепочке из белого золота."
        ),
        description: lt(
          "תליון לב יהלום בעיצוב סוליטר קלאסי, משובץ בארבעה צבתות על שרשרת זהב לבן 14K. עיצוב נקי שמתאים לכל אירוע — מהיומיום ועד לערב מיוחד.",
          "A classic solitaire heart-cut pendant, set in a four-prong mount on a fine 14K white gold chain. Clean and versatile — from everyday wear to a special evening.",
          "Классический подвес-солитер в форме сердца на четырёх крапанах, на тонкой цепочке из белого золота 14К. Подходит как для повседневной носки, так и для особого вечера."
        ),
        basePrice: 189,
        sku: "HN-WG-001",
        inventory: 8,
        status: "PUBLISHED",
        isFeatured: true,
        categories: { create: [{ categoryId: necklaces.id }] },
        images: {
          create: [
            { mediaId: img1.id, sortOrder: 0, altText: "שרשרת לב יהלום זהב לבן" },
            { mediaId: img2.id, sortOrder: 1, altText: "שרשרת לב יהלום זהב לבן על הצוואר" },
            { mediaId: img3.id, sortOrder: 2, altText: "שרשרת לב יהלום זהב לבן ביד" },
          ],
        },
      },
    });
    console.log("Upserted", product.slug);
  }

  // 2. Heart-cut solitaire pendant — yellow gold
  {
    const img1 = await mediaFor("necklace-heart-yellow-gold-1.jpeg", "שרשרת לב יהלום זהב צהוב");
    const img2 = await mediaFor("necklace-heart-yellow-gold-worn-1.jpeg", "שרשרת לב יהלום זהב צהוב על הצוואר");
    const img3 = await mediaFor("necklace-heart-yellow-gold-worn-2.jpeg", "שרשרת לב יהלום זהב צהוב תקריב");
    const img4 = await mediaFor("necklace-heart-yellow-gold-model.jpeg", "דוגמנית עונדת שרשרת לב יהלום זהב צהוב");
    const img5 = await mediaFor("necklace-heart-gold-worn-dress.jpeg", "שרשרת לב יהלום זהב על שמלת סאטן");
    const img6 = await mediaFor("necklace-heart-gold-hand.jpeg", "שרשרת לב יהלום זהב ביד");
    const product = await prisma.product.upsert({
      where: { slug: "heart-necklace-gold" },
      update: {},
      create: {
        slug: "heart-necklace-gold",
        name: lt("שרשרת לב יהלום — זהב צהוב", "Heart Diamond Necklace — Yellow Gold", "Колье «Сердце» — жёлтое золото"),
        shortDescription: lt(
          "לב יהלום זהוב על שרשרת זהב צהוב קלאסית, החתיכה שתמיד עובדת.",
          "A heart-cut stone on a classic yellow gold chain — the piece that always works.",
          "Камень в форме сердца на классической цепочке из жёлтого золота."
        ),
        description: lt(
          "תליון לב יהלום בעיצוב סוליטר על שרשרת זהב צהוב 14K. חם, קלאסי, ומתאים לשכבות עם שאר התכשיטים שלך.",
          "A solitaire heart-cut pendant on a 14K yellow gold chain. Warm and classic — layers beautifully with the rest of your jewelry.",
          "Подвес-солитер в форме сердца на цепочке из жёлтого золота 14К. Тёплый классический вариант, отлично сочетается с другими украшениями."
        ),
        basePrice: 179,
        sku: "HN-YG-001",
        inventory: 8,
        status: "PUBLISHED",
        isFeatured: true,
        categories: { create: [{ categoryId: necklaces.id }] },
        images: {
          create: [
            { mediaId: img1.id, sortOrder: 0, altText: "שרשרת לב יהלום זהב צהוב" },
            { mediaId: img4.id, sortOrder: 1, altText: "דוגמנית עונדת שרשרת לב יהלום זהב צהוב" },
            { mediaId: img2.id, sortOrder: 2, altText: "שרשרת לב יהלום זהב צהוב על הצוואר" },
            { mediaId: img3.id, sortOrder: 3, altText: "שרשרת לב יהלום זהב צהוב תקריב" },
            { mediaId: img5.id, sortOrder: 4, altText: "שרשרת לב יהלום זהב על שמלת סאטן" },
            { mediaId: img6.id, sortOrder: 5, altText: "שרשרת לב יהלום זהב ביד" },
          ],
        },
      },
    });
    console.log("Upserted", product.slug);
  }

  // 3. Heart-cut halo pendant — rose gold
  {
    const img1 = await mediaFor("necklace-heart-rosegold-halo-box.jpeg", "שרשרת לב הילה זהב ורוד בקופסת מתנה");
    const img2 = await mediaFor("necklace-heart-rosegold-halo-macro.jpeg", "תקריב שרשרת לב הילה זהב ורוד");
    const img3 = await mediaFor("necklace-heart-rosegold-halo-worn.jpeg", "שרשרת לב הילה זהב ורוד על הצוואר");
    const product = await prisma.product.upsert({
      where: { slug: "heart-halo-necklace-rose-gold" },
      update: {},
      create: {
        slug: "heart-halo-necklace-rose-gold",
        name: lt("שרשרת לב הילה — זהב ורוד", "Heart Halo Necklace — Rose Gold", "Колье «Сердце в ореоле» — розовое золото"),
        shortDescription: lt(
          "לב יהלום מוקף הילת יהלומים זעירה על זהב ורוד רומנטי — התכשיט למתנה בלתי נשכחת.",
          "A heart-cut stone framed by a delicate halo, set in romantic rose gold — the gift that's remembered.",
          "Камень в форме сердца в ореоле мелких камней на розовом золоте — идеальный подарок."
        ),
        description: lt(
          "תליון לב יהלום עם הילת אבנים עדינה, על שרשרת זהב ורוד 14K. מגיע בקופסת מתנה מהודרת — מוכן לרגע המיוחד.",
          "A heart-cut pendant framed by a delicate diamond halo, on a fine 14K rose gold chain. Arrives in an elegant gift box — ready for the moment that matters.",
          "Подвеска-сердце в ореоле мелких камней на цепочке из розового золота 14К. Поставляется в элегантной подарочной упаковке."
        ),
        basePrice: 219,
        sku: "HHN-RG-001",
        inventory: 6,
        status: "PUBLISHED",
        isFeatured: true,
        categories: { create: [{ categoryId: necklaces.id }] },
        images: {
          create: [
            { mediaId: img1.id, sortOrder: 0, altText: "שרשרת לב הילה זהב ורוד בקופסת מתנה" },
            { mediaId: img2.id, sortOrder: 1, altText: "תקריב שרשרת לב הילה זהב ורוד" },
            { mediaId: img3.id, sortOrder: 2, altText: "שרשרת לב הילה זהב ורוד על הצוואר" },
          ],
        },
      },
    });
    console.log("Upserted", product.slug);
  }

  // 4. Diamond tennis bracelet — 3 metal-color variants in one shot
  {
    const img1 = await mediaFor("bracelet-tennis-trio.jpeg", "צמיד טניס יהלומים בשלושה גוונים");
    const product = await prisma.product.upsert({
      where: { slug: "diamond-tennis-bracelet" },
      update: {},
      create: {
        slug: "diamond-tennis-bracelet",
        name: lt("צמיד טניס יהלומים", "Diamond Tennis Bracelet", "Теннисный браслет с бриллиантами"),
        shortDescription: lt(
          "שורת יהלומים רציפה שעוטפת את פרק היד בקו אחד נוצץ — זמין בזהב לבן, זהב צהוב וזהב ורוד.",
          "A continuous line of diamonds wrapping the wrist in one brilliant line — available in white, yellow, and rose gold.",
          "Непрерывная линия бриллиантов, обвивающая запястье — доступен в белом, жёлтом и розовом золоте."
        ),
        description: lt(
          "צמיד טניס קלאסי עם שורת יהלומים אחידה, בעבודת צביטה עדינה. הבחירה המושלמת ללבישה יומיומית או לשכבות עם צמידים נוספים.",
          "A classic tennis bracelet featuring a uniform line of stones in a delicate prong setting. Perfect worn alone or stacked with your other bracelets.",
          "Классический теннисный браслет с ровной линией камней в изящной крапановой оправе. Идеален как отдельное украшение или в сочетании с другими браслетами."
        ),
        basePrice: 249,
        sku: "TB-001",
        inventory: 15,
        status: "PUBLISHED",
        isFeatured: true,
        categories: { create: [{ categoryId: bracelets.id }] },
        images: {
          create: [{ mediaId: img1.id, sortOrder: 0, altText: "צמיד טניס יהלומים בשלושה גוונים" }],
        },
        variants: {
          create: [
            { attributes: { color: lt("זהב לבן", "White Gold", "Белое золото") }, price: 249, sku: "TB-001-WG", inventory: 5 },
            { attributes: { color: lt("זהב צהוב", "Yellow Gold", "Жёлтое золото") }, price: 249, sku: "TB-001-YG", inventory: 5 },
            { attributes: { color: lt("זהב ורוד", "Rose Gold", "Розовое золото") }, price: 249, sku: "TB-001-RG", inventory: 5 },
          ],
        },
      },
    });
    console.log("Upserted", product.slug);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
