// One-off script: adds a second batch of real client-supplied jewelry
// photography (WhatsApp export, 2026-09-18, curated set) as catalog
// products under existing categories. Every image here was individually
// re-verified (read immediately before copying) after an earlier pass
// mismatched several filenames. Safe to re-run — upserts on product slug.
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
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  const bracelets = await prisma.category.findUniqueOrThrow({ where: { slug: "bracelets" } });
  const earrings = await prisma.category.findUniqueOrThrow({ where: { slug: "earrings" } });

  // 1. Emerald halo ring (emerald-cut), rose gold
  {
    const img = await mediaFor("ring-emerald-halo-emeraldcut-rose.jpeg", "טבעת אמרלד הילה זהב ורוד");
    await prisma.product.upsert({
      where: { slug: "emerald-halo-ring" },
      update: {},
      create: {
        slug: "emerald-halo-ring",
        name: lt("טבעת אמרלד הילה", "Emerald Halo Ring", "Кольцо с изумрудом в ореоле"),
        shortDescription: lt(
          "אמרלד ירוק עמוק בחיתוך מלבני, מוקף הילת יהלומים זוהרת על זהב ורוד.",
          "A deep green emerald-cut stone, framed by a brilliant diamond halo on rose gold.",
          "Изумруд глубокого зелёного цвета в ореоле бриллиантов на розовом золоте."
        ),
        description: lt(
          "טבעת מרשימה עם אבן אמרלד מרכזית בחיתוך מלבני, משובצת הילת יהלומים עדינה על זהב ורוד 14K.",
          "A statement ring featuring a central emerald-cut stone framed by a delicate diamond halo, in 14K rose gold.",
          "Эффектное кольцо с изумрудом центральной огранки в тонком бриллиантовом ореоле на розовом золоте 14К."
        ),
        basePrice: 289,
        sku: "EHR-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 5,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת אמרלד הילה זהב ורוד" }] },
      },
    });
    console.log("Upserted emerald-halo-ring");
  }

  // 2. Emerald pear halo ring, rose gold
  {
    const img = await mediaFor("ring-emerald-halo-pear-rose.jpeg", "טבעת אמרלד הילה בצורת אגס זהב ורוד");
    await prisma.product.upsert({
      where: { slug: "emerald-pear-halo-ring" },
      update: {},
      create: {
        slug: "emerald-pear-halo-ring",
        name: lt("טבעת אמרלד הילה — אגס", "Emerald Pear Halo Ring", "Кольцо с изумрудом-«груша» в ореоле"),
        shortDescription: lt(
          "אמרלד בחיתוך אגס רומנטי, על זהב ורוד, מוקף הילת יהלומים.",
          "A romantic pear-cut emerald in rose gold, framed by a diamond halo.",
          "Изумруд огранки «груша» в розовом золоте, в ореоле бриллиантов."
        ),
        description: lt(
          "אמרלד בחיתוך אגס ייחודי, משובץ בהילת יהלומים על שרשרת זהב ורוד 14K.",
          "A distinctive pear-cut emerald set in a diamond halo on 14K rose gold.",
          "Изумруд огранки «груша» в бриллиантовом ореоле на розовом золоте 14К."
        ),
        basePrice: 299,
        sku: "EPH-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 4,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת אמרלד הילה בצורת אגס זהב ורוד" }] },
      },
    });
    console.log("Upserted emerald-pear-halo-ring");
  }

  // 3. Ruby double-halo ring, yellow gold
  {
    const img = await mediaFor("ring-ruby-halo-yellow.jpeg", "טבעת רובי הילה כפולה זהב צהוב");
    await prisma.product.upsert({
      where: { slug: "ruby-halo-ring" },
      update: {},
      create: {
        slug: "ruby-halo-ring",
        name: lt("טבעת רובי הילה כפולה", "Ruby Double Halo Ring", "Кольцо с рубином в двойном ореоле"),
        shortDescription: lt(
          "רובי אדום עז בחיתוך אובלי, מוקף הילה כפולה של יהלומים על זהב צהוב.",
          "A vivid oval-cut ruby, framed by a double diamond halo on yellow gold.",
          "Насыщенный рубин овальной огранки в двойном бриллиантовом ореоле на жёлтом золоте."
        ),
        description: lt(
          "טבעת נועזת עם רובי מרכזי בחיתוך אובלי, מוקף הילה כפולה של יהלומים, על זהב צהוב 14K.",
          "A bold ring featuring a central oval-cut ruby framed by a double diamond halo, in 14K yellow gold.",
          "Смелое кольцо с рубином овальной огранки в двойном бриллиантовом ореоле на жёлтом золоте 14К."
        ),
        basePrice: 269,
        sku: "RHR-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 4,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת רובי הילה כפולה זהב צהוב" }] },
      },
    });
    console.log("Upserted ruby-halo-ring");
  }

  // 4. Pink sapphire three-stone ring, white gold
  {
    const img = await mediaFor("ring-pinksapphire-3stone-white.jpeg", "טבעת ספיר ורוד שלוש אבנים זהב לבן");
    await prisma.product.upsert({
      where: { slug: "pink-sapphire-three-stone-ring" },
      update: {},
      create: {
        slug: "pink-sapphire-three-stone-ring",
        name: lt("טבעת ספיר ורוד שלוש אבנים", "Pink Sapphire Three-Stone Ring", "Кольцо с розовым сапфиром «три камня»"),
        shortDescription: lt(
          "ספיר ורוד רומנטי בחיתוך אגס, לצד שתי אבני יהלום, על זהב לבן.",
          "A romantic pear-cut pink sapphire flanked by two diamonds, in white gold.",
          "Романтичный розовый сапфир огранки «груша» в окружении двух бриллиантов на белом золоте."
        ),
        description: lt(
          "טבעת שלוש אבנים עם ספיר ורוד מרכזי ושתי אבני יהלום צדדיות, על זהב לבן 14K.",
          "A three-stone ring featuring a pink sapphire center stone with two diamond side stones, in 14K white gold.",
          "Кольцо «три камня» с розовым сапфиром в центре и двумя бриллиантами по бокам на белом золоте 14К."
        ),
        basePrice: 259,
        sku: "PS3S-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 4,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת ספיר ורוד שלוש אבנים זהב לבן" }] },
      },
    });
    console.log("Upserted pink-sapphire-three-stone-ring");
  }

  // 5. Diamond oval solitaire ring, white gold
  {
    const img = await mediaFor("ring-diamond-solitaire-oval-white.jpeg", "טבעת יהלום סוליטר אובלי זהב לבן");
    await prisma.product.upsert({
      where: { slug: "diamond-oval-solitaire-ring" },
      update: {},
      create: {
        slug: "diamond-oval-solitaire-ring",
        name: lt("טבעת יהלום סוליטר אובלי", "Diamond Oval Solitaire Ring", "Кольцо-солитер с овальным бриллиантом"),
        shortDescription: lt(
          "יהלום אובלי קלאסי על שרשרת פייבה עדינה — הבחירה הנצחית.",
          "A classic oval-cut diamond on a delicate pavé band — the timeless choice.",
          "Классический овальный бриллиант на тонкой дорожке из паве — вечный выбор."
        ),
        description: lt(
          "טבעת סוליטר עם יהלום אובלי מרכזי על שרשרת פייבה, בזהב לבן 14K.",
          "A solitaire ring featuring a central oval-cut diamond on a pavé band, in 14K white gold.",
          "Кольцо-солитер с центральным овальным бриллиантом на дорожке паве, белое золото 14К."
        ),
        basePrice: 229,
        sku: "DOS-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 6,
        categories: { create: [{ categoryId: rings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "טבעת יהלום סוליטר אובלי זהב לבן" }] },
      },
    });
    console.log("Upserted diamond-oval-solitaire-ring");
  }

  // 6. Sapphire teardrop pendant necklace, white gold
  {
    const img = await mediaFor("necklace-sapphire-teardrop-pendant.jpeg", "שרשרת תליון ספיר טיפה זהב לבן");
    await prisma.product.upsert({
      where: { slug: "sapphire-teardrop-necklace" },
      update: {},
      create: {
        slug: "sapphire-teardrop-necklace",
        name: lt("שרשרת תליון ספיר", "Sapphire Teardrop Necklace", "Колье с сапфиром-каплей"),
        shortDescription: lt(
          "ספיר כחול עמוק בחיתוך טיפה, מוקף הילת יהלומים על שרשרת זהב לבן.",
          "A deep blue teardrop sapphire, framed by a diamond halo on a white gold chain.",
          "Сапфир глубокого синего цвета огранки «капля» в бриллиантовом ореоле."
        ),
        description: lt(
          "תליון ספיר כחול בחיתוך טיפה עדין, עם הילת יהלומים, על שרשרת זהב לבן 14K.",
          "A delicate teardrop-cut sapphire pendant with a diamond halo, on a 14K white gold chain.",
          "Изящная подвеска с сапфиром огранки «капля» в бриллиантовом ореоле на цепочке из белого золота 14К."
        ),
        basePrice: 219,
        sku: "STN-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 6,
        categories: { create: [{ categoryId: necklaces.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "שרשרת תליון ספיר טיפה זהב לבן" }] },
      },
    });
    console.log("Upserted sapphire-teardrop-necklace");
  }

  // 7. Emerald teardrop pendant necklace, white gold
  {
    const img = await mediaFor("necklace-emerald-teardrop-pendant.jpeg", "שרשרת תליון אמרלד טיפה זהב לבן");
    await prisma.product.upsert({
      where: { slug: "emerald-teardrop-necklace" },
      update: {},
      create: {
        slug: "emerald-teardrop-necklace",
        name: lt("שרשרת תליון אמרלד", "Emerald Teardrop Necklace", "Колье с изумрудом-каплей"),
        shortDescription: lt(
          "אמרלד ירוק בחיתוך טיפה, על שרשרת עם נקודות אמרלד זעירות.",
          "A green teardrop emerald, on a chain accented with tiny emerald points.",
          "Изумруд-«капля» на цепочке с мелкими изумрудными акцентами."
        ),
        description: lt(
          "תליון אמרלד בחיתוך טיפה עם הילת יהלומים, על שרשרת זהב לבן 14K המשובצת בנקודות אמרלד.",
          "A teardrop-cut emerald pendant with a diamond halo, on a 14K white gold chain accented with emerald points.",
          "Подвеска с изумрудом огранки «капля» в бриллиантовом ореоле на цепочке белого золота 14К с изумрудными акцентами."
        ),
        basePrice: 209,
        sku: "ETN-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 5,
        categories: { create: [{ categoryId: necklaces.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "שרשרת תליון אמרלד טיפה זהב לבן" }] },
      },
    });
    console.log("Upserted emerald-teardrop-necklace");
  }

  // 8. Emerald & diamond tennis bracelet, white gold
  {
    const img = await mediaFor("bracelet-tennis-emerald-diamond.jpeg", "צמיד טניס אמרלד ויהלום זהב לבן");
    await prisma.product.upsert({
      where: { slug: "emerald-diamond-tennis-bracelet" },
      update: {},
      create: {
        slug: "emerald-diamond-tennis-bracelet",
        name: lt("צמיד טניס אמרלד ויהלום", "Emerald & Diamond Tennis Bracelet", "Теннисный браслет с изумрудами и бриллиантами"),
        shortDescription: lt(
          "אמרלדים ויהלומים לסירוגין, בעבודת צביטה קלאסית — ירוק ולבן שמשלימים זה את זה.",
          "Alternating emeralds and diamonds in a classic prong setting — green and white in perfect balance.",
          "Чередующиеся изумруды и бриллианты в классической крапановой оправе."
        ),
        description: lt(
          "צמיד טניס עם אבני אמרלד ויהלום לסירוגין על זהב לבן 14K. עוטף את פרק היד בקו נוצץ ורציף.",
          "A tennis bracelet featuring alternating emerald and diamond stones on 14K white gold — a continuous line of brilliance.",
          "Теннисный браслет с чередующимися изумрудами и бриллиантами на белом золоте 14К."
        ),
        basePrice: 279,
        sku: "EDT-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 5,
        categories: { create: [{ categoryId: bracelets.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "צמיד טניס אמרלד ויהלום זהב לבן" }] },
      },
    });
    console.log("Upserted emerald-diamond-tennis-bracelet");
  }

  // 9. Sapphire & diamond tennis bracelet, white gold
  {
    const img = await mediaFor("bracelet-tennis-sapphire-diamond.jpeg", "צמיד טניס ספיר ויהלום זהב לבן");
    await prisma.product.upsert({
      where: { slug: "sapphire-diamond-tennis-bracelet" },
      update: {},
      create: {
        slug: "sapphire-diamond-tennis-bracelet",
        name: lt("צמיד טניס ספיר ויהלום", "Sapphire & Diamond Tennis Bracelet", "Теннисный браслет с сапфирами и бриллиантами"),
        shortDescription: lt(
          "ספירים כחולים ויהלומים לסירוגין — קו נוצץ של כחול ולבן.",
          "Alternating blue sapphires and diamonds — a brilliant line of blue and white.",
          "Чередующиеся синие сапфиры и бриллианты — сияющая линия синего и белого."
        ),
        description: lt(
          "צמיד טניס עם אבני ספיר ויהלום לסירוגין על זהב לבן 14K.",
          "A tennis bracelet featuring alternating sapphire and diamond stones on 14K white gold.",
          "Теннисный браслет с чередующимися сапфирами и бриллиантами на белом золоте 14К."
        ),
        basePrice: 279,
        sku: "SDT-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 5,
        categories: { create: [{ categoryId: bracelets.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "צמיד טניס ספיר ויהלום זהב לבן" }] },
      },
    });
    console.log("Upserted sapphire-diamond-tennis-bracelet");
  }

  // 10. Emerald oval halo stud earrings, white gold
  {
    const img = await mediaFor("earrings-emerald-oval-halo-white.jpeg", "עגילי אמרלד הילה זהב לבן");
    await prisma.product.upsert({
      where: { slug: "emerald-oval-halo-earrings" },
      update: {},
      create: {
        slug: "emerald-oval-halo-earrings",
        name: lt("עגילי אמרלד הילה", "Emerald Oval Halo Earrings", "Серьги с изумрудом в ореоле"),
        shortDescription: lt(
          "אמרלד אובלי מוקף הילת יהלומים — זוג עגילי סטאד קלאסיים בזהב לבן.",
          "An oval emerald framed by a diamond halo — a classic stud pair in white gold.",
          "Овальный изумруд в бриллиантовом ореоле — классическая пара серёг-гвоздиков."
        ),
        description: lt(
          "עגילי סטאד עם אמרלד אובלי מרכזי מוקף הילת יהלומים, על זהב לבן 14K.",
          "Stud earrings featuring a central oval emerald framed by a diamond halo, in 14K white gold.",
          "Серьги-гвоздики с овальным изумрудом в бриллиантовом ореоле на белом золоте 14К."
        ),
        basePrice: 199,
        sku: "EOE-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 6,
        categories: { create: [{ categoryId: earrings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "עגילי אמרלד הילה זהב לבן" }] },
      },
    });
    console.log("Upserted emerald-oval-halo-earrings");
  }

  // 11. Emerald teardrop drop earrings, white gold
  {
    const img = await mediaFor("earrings-emerald-teardrop-drop.jpeg", "עגילי אמרלד טיפה תלויים");
    await prisma.product.upsert({
      where: { slug: "emerald-teardrop-drop-earrings" },
      update: {},
      create: {
        slug: "emerald-teardrop-drop-earrings",
        name: lt("עגילי אמרלד טיפה תלויים", "Emerald Teardrop Drop Earrings", "Серьги-подвески с изумрудом-каплей"),
        shortDescription: lt(
          "אמרלד בחיתוך טיפה, תלוי משורת יהלומים עדינה — לערב שדורש נוכחות.",
          "A teardrop emerald, dangling from a delicate diamond line — for an evening that calls for presence.",
          "Изумруд-«капля», свисающий с тонкой бриллиантовой линии — для особого вечера."
        ),
        description: lt(
          "עגילים תלויים עם אמרלד בחיתוך טיפה, על שורת יהלומים עדינה בזהב לבן 14K.",
          "Drop earrings featuring a teardrop-cut emerald on a delicate 14K white gold diamond line.",
          "Серьги-подвески с изумрудом огранки «капля» на тонкой линии из белого золота 14К."
        ),
        basePrice: 229,
        sku: "ETD-001",
        status: "PUBLISHED",
        isFeatured: false,
        inventory: 5,
        categories: { create: [{ categoryId: earrings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "עגילי אמרלד טיפה תלויים" }] },
      },
    });
    console.log("Upserted emerald-teardrop-drop-earrings");
  }

  // 12. Diamond drop dangle earrings, white gold
  {
    const img = await mediaFor("earrings-diamond-drop-dangle.jpeg", "עגילי יהלום תלויים");
    await prisma.product.upsert({
      where: { slug: "diamond-drop-dangle-earrings" },
      update: {},
      create: {
        slug: "diamond-drop-dangle-earrings",
        name: lt("עגילי יהלום תלויים", "Diamond Drop Dangle Earrings", "Бриллиантовые серьги-подвески"),
        shortDescription: lt(
          "שורת יהלומים גרדואלית, מסתיימת בטיפת יהלום גדולה — ניצוץ שנע איתך.",
          "A graduated diamond line, ending in a large teardrop diamond — sparkle that moves with you.",
          "Градуированная линия бриллиантов, завершающаяся крупным бриллиантом-каплей."
        ),
        description: lt(
          "עגילים תלויים עם שורת יהלומים גרדואלית וטיפת יהלום מרכזית, על זהב לבן 14K.",
          "Dangle earrings featuring a graduated diamond line and a central teardrop diamond, in 14K white gold.",
          "Серьги-подвески с градуированной линией бриллиантов и центральным бриллиантом-каплей на белом золоте 14К."
        ),
        basePrice: 239,
        sku: "DDD-001",
        status: "PUBLISHED",
        isFeatured: true,
        inventory: 5,
        categories: { create: [{ categoryId: earrings.id }] },
        images: { create: [{ mediaId: img.id, sortOrder: 0, altText: "עגילי יהלום תלויים" }] },
      },
    });
    console.log("Upserted diamond-drop-dangle-earrings");
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
