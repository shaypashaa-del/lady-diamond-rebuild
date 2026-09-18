// Adds a third batch of real client jewelry photography, sourced from
// the full site export (public_html.zip) the client provided directly,
// found in wp-content/uploads/2025/10 — an earlier, plain-white-background
// product photography batch distinct from the two AI-branded batches
// already added. Each image was individually verified before copying,
// following the same read-then-copy-immediately discipline established
// after an earlier mapping mistake. Does not touch or replace any
// previously-added media — only adds new MediaAsset/Product records.
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
      slug: "diamond-solitaire-classic-ring",
      filename: "ring-diamond-solitaire-classic-white.jpeg",
      category: rings,
      name: lt("טבעת יהלום סוליטר קלאסית", "Classic Diamond Solitaire Ring", "Классическое кольцо-солитер с бриллиантом"),
      shortDescription: lt("יהלום עגול קלאסי על שרשרת פייבה, זהב לבן.", "A classic round diamond on a pavé band, white gold.", "Классический круглый бриллиант на дорожке паве, белое золото."),
      description: lt("טבעת סוליטר נצחית עם יהלום עגול מרכזי על שרשרת פייבה עדינה בזהב לבן.", "A timeless solitaire ring with a central round diamond on a delicate pavé band in white gold.", "Кольцо-солитер вне времени с центральным круглым бриллиантом на тонкой дорожке паве из белого золота."),
      price: 219,
      sku: "DSC-101",
      featured: true,
    },
    {
      slug: "pearl-halo-ring",
      filename: "ring-pearl-halo-yellow.jpeg",
      category: rings,
      name: lt("טבעת פנינה הילה", "Pearl Halo Ring", "Кольцо с жемчугом в ореоле"),
      shortDescription: lt("פנינה לבנה קלאסית מוקפת הילת יהלומים, זהב צהוב.", "A classic white pearl framed by a diamond halo, yellow gold.", "Классический белый жемчуг в бриллиантовом ореоле, жёлтое золото."),
      description: lt("פנינה עגולה ומבריקה במרכז, מוקפת הילת יהלומים עדינה על זהב צהוב 14K.", "A round, lustrous pearl at the center, framed by a delicate diamond halo on 14K yellow gold.", "Круглая переливающаяся жемчужина в центре, в тонком бриллиантовом ореоле на жёлтом золоте 14К."),
      price: 199,
      sku: "PHR-102",
    },
    {
      slug: "mens-signet-ring",
      filename: "ring-mens-signet-black-white-diamond-yellow.jpeg",
      category: rings,
      name: lt("טבעת חותם לגבר", "Men's Signet Ring", "Мужское кольцо-печатка"),
      shortDescription: lt("עיצוב מקושר נועז עם יהלומים לבנים ושחורים, זהב צהוב.", "A bold link-style design with black and white diamonds, yellow gold.", "Смелый дизайн со звеньями, чёрные и белые бриллианты, жёлтое золото."),
      description: lt("טבעת גברית מרשימה בעיצוב מקושר, משובצת יהלומים לבנים ושחורים לסירוגין, על זהב צהוב 14K.", "A striking men's ring in a link-style design, set with alternating black and white diamonds, in 14K yellow gold.", "Впечатляющее мужское кольцо в стиле звеньев, чередующиеся чёрные и белые бриллианты, жёлтое золото 14К."),
      price: 289,
      sku: "MSR-103",
    },
    {
      slug: "mens-black-diamond-band",
      filename: "ring-mens-band-black-diamond-white.jpeg",
      category: rings,
      name: lt("טבעת גברים יהלומים שחורים", "Men's Black Diamond Band", "Мужское кольцо с чёрными бриллиантами"),
      shortDescription: lt("שורת יהלומים שחורים סביב הטבעת, זהב לבן.", "A ring of black diamonds all the way around, white gold.", "Кольцо из чёрных бриллиантов по всей окружности, белое золото."),
      description: lt("טבעת גברית מודרנית עם יהלומים שחורים המקיפים את הטבעת בשלמותה, על זהב לבן.", "A modern men's band featuring black diamonds set all the way around, in white gold.", "Современное мужское кольцо с чёрными бриллиантами по всей окружности, белое золото."),
      price: 259,
      sku: "MBD-104",
    },
    {
      slug: "diamond-cluster-pear-halo-ring",
      filename: "ring-diamond-cluster-pear-halo-white.jpeg",
      category: rings,
      name: lt("טבעת יהלומים קלאסטר בצורת אגס", "Diamond Cluster Pear Halo Ring", "Кольцо с кластером бриллиантов в форме груши"),
      shortDescription: lt("אשכול יהלומים בצורת אגס עם הילה עוטפת, זהב לבן.", "A pear-shaped cluster of diamonds framed by a halo, white gold.", "Кластер бриллиантов в форме груши в обрамляющем ореоле, белое золото."),
      description: lt("עיצוב קלאסטר ייחודי: אשכול יהלומים קטנים היוצר מראה של אבן גדולה בצורת אגס, מוקף הילה, על זהב לבן.", "A distinctive cluster design: small diamonds arranged to form the look of one large pear-shaped stone, framed by a halo, in white gold.", "Оригинальный кластерный дизайн: мелкие бриллианты складываются в форму одного крупного камня-груши в ореоле, белое золото."),
      price: 249,
      sku: "DCP-105",
      featured: true,
    },
    {
      slug: "ruby-emeraldcut-halo-ring",
      filename: "ring-ruby-emeraldcut-halo-white.jpeg",
      category: rings,
      name: lt("טבעת רובי הילה חיתוך אמרלד", "Ruby Emerald-Cut Halo Ring", "Кольцо с рубином изумрудной огранки в ореоле"),
      shortDescription: lt("רובי אדום עז בחיתוך מלבני, מוקף הילת יהלומים, זהב לבן.", "A vivid red ruby in a rectangular cut, framed by a diamond halo, white gold.", "Насыщенный красный рубин прямоугольной огранки в бриллиантовом ореоле."),
      description: lt("רובי מרכזי בחיתוך אמרלד, מוקף הילת יהלומים עגולה, על שרשרת פייבה בזהב לבן.", "A central emerald-cut ruby, framed by a round diamond halo, on a pavé band in white gold.", "Центральный рубин изумрудной огранки в круглом бриллиантовом ореоле, на дорожке паве из белого золота."),
      price: 269,
      sku: "REH-106",
    },
    {
      slug: "teal-sapphire-cushion-halo-ring",
      filename: "ring-teal-sapphire-cushion-halo-rose.jpeg",
      category: rings,
      name: lt("טבעת ספיר טורקיז הילה כרית", "Teal Sapphire Cushion Halo Ring", "Кольцо с сине-зелёным сапфиром «кушон» в ореоле"),
      shortDescription: lt("ספיר טורקיז נדיר בחיתוך כרית, מוקף הילת יהלומים, זהב ורוד.", "A rare teal sapphire in a cushion cut, framed by a diamond halo, rose gold.", "Редкий сине-зелёный сапфир огранки «кушон» в бриллиантовом ореоле."),
      description: lt("ספיר טורקיז-ירקרק נדיר בחיתוך כרית, מוקף הילת יהלומים עדינה, על שרשרת פייבה בזהב ורוד.", "A rare teal-green sapphire in a cushion cut, framed by a delicate diamond halo, on a pavé band in rose gold.", "Редкий сине-зелёный сапфир огранки «кушон» в тонком бриллиантовом ореоле, дорожка паве из розового золота."),
      price: 299,
      sku: "TSC-107",
      featured: true,
    },
    {
      slug: "bezel-solitaire-ring",
      filename: "ring-bezel-solitaire-yellow.jpeg",
      category: rings,
      name: lt("טבעת סוליטר משובצת", "Bezel Solitaire Ring", "Кольцо-солитер с рамочной оправой"),
      shortDescription: lt("יהלום עגול בשיבוץ משבצת חלק, זהב צהוב.", "A round diamond in a sleek bezel setting, yellow gold.", "Круглый бриллиант в гладкой рамочной оправе, жёлтое золото."),
      description: lt("עיצוב מודרני ונקי: יהלום עגול משובץ במשבצת חלקה על שרשרת זהב צהוב עשויה בעקומה רכה.", "A modern, clean design: a round diamond set in a sleek bezel on a softly curved yellow gold band.", "Современный лаконичный дизайн: круглый бриллиант в гладкой оправе на плавно изогнутом кольце из жёлтого золота."),
      price: 209,
      sku: "BSR-108",
    },
    {
      slug: "diamond-huggie-earrings",
      filename: "earrings-diamond-huggie-white.jpeg",
      category: earrings,
      name: lt("עגילי יהלום האגי", "Diamond Huggie Earrings", "Серьги-хаггі с бриллиантами"),
      shortDescription: lt("עגילי חישוק צמודים עם שורת יהלומים, זהב לבן.", "Close-fitting hoop earrings with a line of diamonds, white gold.", "Плотно прилегающие серьги-кольца с линией бриллиантов."),
      description: lt("עגילי האגי צמודים לאוזן עם יהלום עגול במרכז ושורת יהלומים לאורך החישוק, זהב לבן.", "Close-fitting huggie earrings with a round diamond centerpiece and a line of diamonds along the hoop, white gold.", "Плотно прилегающие серьги-хаггі с круглым бриллиантом в центре и линией бриллиантов вдоль кольца, белое золото."),
      price: 179,
      sku: "DHE-109",
    },
    {
      slug: "emerald-doublehalo-drop-earrings",
      filename: "earrings-emerald-doublehalo-drop-white.jpeg",
      category: earrings,
      name: lt("עגילי אמרלד הילה כפולה", "Emerald Double Halo Drop Earrings", "Серьги-подвески с изумрудом в двойном ореоле"),
      shortDescription: lt("אמרלד מלבני מוקף הילה כפולה של יהלומים, זהב לבן.", "A rectangular emerald framed by a double diamond halo, white gold.", "Прямоугольный изумруд в двойном бриллиантовом ореоле."),
      description: lt("עגילים תלויים עם אמרלד מרכזי בחיתוך מלבני, מוקף הילה כפולה של יהלומים, על חישוק זהב לבן.", "Drop earrings featuring a central rectangular-cut emerald, framed by a double diamond halo, on a white gold hoop.", "Серьги-подвески с центральным изумрудом прямоугольной огранки в двойном бриллиантовом ореоле, белое золото."),
      price: 259,
      sku: "EDH-110",
      featured: true,
    },
    {
      slug: "sapphire-halo-leverback-earrings",
      filename: "earrings-sapphire-halo-leverback-white.jpeg",
      category: earrings,
      name: lt("עגילי ספיר הילה", "Sapphire Halo Leverback Earrings", "Серьги с сапфиром в ореоле"),
      shortDescription: lt("ספיר אובלי מוקף הילת יהלומים, זהב לבן.", "An oval sapphire framed by a diamond halo, white gold.", "Овальный сапфир в бриллиантовом ореоле."),
      description: lt("עגילים תלויים עם ספיר אובלי מרכזי מוקף הילת יהלומים, על נעילת מנוף בזהב לבן.", "Drop earrings featuring a central oval sapphire framed by a diamond halo, on a white gold leverback.", "Серьги-подвески с центральным овальным сапфиром в бриллиантовом ореоле, замок-леверback, белое золото."),
      price: 249,
      sku: "SHL-111",
    },
    {
      slug: "ruby-halo-leverback-earrings",
      filename: "earrings-ruby-halo-leverback-white.jpeg",
      category: earrings,
      name: lt("עגילי רובי הילה", "Ruby Halo Leverback Earrings", "Серьги с рубином в ореоле"),
      shortDescription: lt("רובי אובלי מוקף הילת יהלומים, זהב לבן.", "An oval ruby framed by a diamond halo, white gold.", "Овальный рубин в бриллиантовом ореоле."),
      description: lt("עגילים תלויים עם רובי אובלי מרכזי מוקף הילת יהלומים, על נעילת מנוף בזהב לבן.", "Drop earrings featuring a central oval ruby framed by a diamond halo, on a white gold leverback.", "Серьги-подвески с центральным овальным рубином в бриллиантовом ореоле, замок-леверback, белое золото."),
      price: 249,
      sku: "RHL-112",
    },
    {
      slug: "sapphire-flower-huggie-earrings",
      filename: "earrings-sapphire-flower-huggie-white.jpeg",
      category: earrings,
      name: lt("עגילי פרח ספיר", "Sapphire Flower Huggie Earrings", "Серьги-хаггі «цветок» с сапфирами"),
      shortDescription: lt("פרח ספירים כחולים עם מרכז יהלום, זהב לבן.", "A blue sapphire flower with a diamond center, white gold.", "Цветок из синих сапфиров с бриллиантом в центре."),
      description: lt("עגילי האגי בעיצוב פרח, עם עלי כותרת ספיר כחול ומרכז יהלום, על זהב לבן.", "Huggie earrings in a flower design, with blue sapphire petals and a diamond center, in white gold.", "Серьги-хаггі в форме цветка с лепестками из синих сапфиров и бриллиантом в центре, белое золото."),
      price: 219,
      sku: "SFH-113",
    },
    {
      slug: "diamond-clover-pendant-necklace",
      filename: "necklace-diamond-clover-pendant-white.jpeg",
      category: necklaces,
      name: lt("שרשרת תליון תלתן יהלומים", "Diamond Clover Pendant Necklace", "Колье с бриллиантовым клевером"),
      shortDescription: lt("תליון תלתן בן ארבעה עלים משובץ יהלומים, זהב לבן.", "A four-petal clover pendant set with diamonds, white gold.", "Подвеска-клевер с четырьмя лепестками, украшенная бриллиантами."),
      description: lt("תליון תלתן עדין בן ארבעה עלים, משובץ יהלומים לאורך כל עלה, על שרשרת זהב לבן.", "A delicate four-petal clover pendant, set with diamonds along each petal, on a white gold chain.", "Изящная подвеска-клевер с четырьмя лепестками, украшенными бриллиантами, на цепочке из белого золота."),
      price: 229,
      sku: "DCN-114",
      featured: true,
    },
    {
      slug: "star-of-david-pendant",
      filename: "pendant-star-of-david-diamond-yellow.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד יהלומים", "Star of David Diamond Pendant", "Кулон «Звезда Давида» с бриллиантами"),
      shortDescription: lt("מגן דוד עגול משובץ יהלומים סביב ואבן מרכזית, זהב צהוב.", "A circular Star of David set with diamonds and a center stone, yellow gold.", "Круглая подвеска «Звезда Давида» с бриллиантами и центральным камнем."),
      description: lt("תליון מגן דוד בעיצוב עגול, עם יהלום מרכזי וטבעת יהלומים חיצונית, על זהב צהוב 14K.", "A circular Star of David pendant, featuring a center diamond and an outer ring of diamonds, in 14K yellow gold.", "Подвеска «Звезда Давида» круглой формы с центральным бриллиантом и внешним рядом бриллиантов, жёлтое золото 14К."),
      price: 239,
      sku: "SOD-115",
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
