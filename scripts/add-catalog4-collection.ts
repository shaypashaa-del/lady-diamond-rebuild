// Sixth batch: 31 real jewelry photos found in wp-content/uploads/2025/10
// that were NOT part of the first sweep (verified via MD5 diff against
// already-copied catalog/catalog2/catalog3 files). Each image individually
// verified before naming/copying, per the established discipline.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/catalog4/${filename}`;
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
      slug: "star-of-david-circle-pave-pendant",
      filename: "pendant-star-of-david-circle-pave-yellow.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד במסגרת עגולה", "Star of David Circle Pavé Pendant", "Кулон «Звезда Давида» в круге паве"),
      shortDescription: lt("מגן דוד יהלומים במסגרת עגולה, זהב צהוב.", "A diamond Star of David framed in a pavé circle, yellow gold.", "Звезда Давида из бриллиантов в круглой оправе паве, жёлтое золото."),
      description: lt("תליון מגן דוד עדין החתום במסגרת עגולה משובצת יהלומים, על זהב צהוב 14K.", "A delicate Star of David pendant set within a diamond-paved circle frame, in 14K yellow gold.", "Изящная подвеска «Звезда Давида» в круглой оправе, украшенной бриллиантами, жёлтое золото 14К."),
      price: 219,
      sku: "SDC-309",
    },
    {
      slug: "diamond-full-eternity-band",
      filename: "ring-diamond-full-eternity-yellow.jpeg",
      category: rings,
      name: lt("טבעת נצח יהלומים מלאה", "Diamond Full Eternity Band", "Кольцо-вечность с бриллиантами"),
      shortDescription: lt("יהלומים עגולים לאורך כל הטבעת, זהב צהוב.", "Round diamonds set the entire way around, yellow gold.", "Круглые бриллианты по всей окружности, жёлтое золото."),
      description: lt("טבעת נצח קלאסית עם יהלומים עגולים המשובצים לאורך כל ההיקף, זהב צהוב 14K.", "A classic eternity band with round diamonds set continuously around the full circumference, in 14K yellow gold.", "Классическое кольцо-вечность с круглыми бриллиантами по всей окружности, жёлтое золото 14К."),
      price: 349,
      sku: "DFE-310",
      featured: true,
    },
    {
      slug: "ruby-oval-sunburst-halo-ring",
      filename: "ring-ruby-oval-sunburst-halo-white.jpeg",
      category: rings,
      name: lt("טבעת רובי אובלי הילת קרניים", "Ruby Oval Sunburst Halo Ring", "Кольцо с рубином в ореоле-солнце"),
      shortDescription: lt("רובי אובלי עם הילת יהלומים בצורת קרני שמש, זהב לבן.", "An oval ruby framed by a sunburst diamond halo, white gold.", "Овальный рубин в бриллиантовом ореоле в форме солнечных лучей."),
      description: lt("טבעת מרשימה עם רובי אובלי מרכזי מוקף הילת יהלומים בעיצוב קרני שמש, זהב לבן 14K.", "A striking ring featuring a central oval ruby framed by a sunburst-style diamond halo, in 14K white gold.", "Эффектное кольцо с центральным овальным рубином в бриллиантовом ореоле-«солнце», белое золото 14К."),
      price: 289,
      sku: "ROS-311",
      featured: true,
    },
    {
      slug: "diamond-flame-pendant-necklace",
      filename: "necklace-diamond-flame-pendant-rose.jpeg",
      category: necklaces,
      name: lt("שרשרת תליון להבה יהלום", "Diamond Flame Pendant Necklace", "Колье-подвеска «пламя» с бриллиантом"),
      shortDescription: lt("יהלום עגול בתוך עיצוב להבה גלי, זהב ורוד.", "A round diamond cradled in a wave-like flame silhouette, rose gold.", "Круглый бриллиант в изогнутом силуэте «пламени»."),
      description: lt("תליון בעיצוב להבה אסימטרי עם יהלום עגול מרכזי, על שרשרת זהב ורוד עדינה.", "An asymmetric flame-shaped pendant cradling a central round diamond, on a delicate rose gold chain.", "Асимметричная подвеска в форме пламени с круглым бриллиантом в центре, тонкая цепочка розового золота."),
      price: 229,
      sku: "DFL-312",
    },
    {
      slug: "diamond-open-cuff-band",
      filename: "ring-diamond-open-cuff-pave-rose.jpeg",
      category: rings,
      name: lt("טבעת פתוחה עם ריבועי יהלומים", "Diamond Open Cuff Band", "Кольцо-манжета с бриллиантовыми квадратами"),
      shortDescription: lt("טבעת פתוחה עם שני ריבועי פייבה, זהב ורוד.", "An open-front band with two pavé-diamond squares, rose gold.", "Разомкнутое кольцо с двумя квадратами паве."),
      description: lt("טבעת מודרנית בעיצוב פתוח, עם שני ריבועי יהלומים בקצוות, זהב ורוד 14K.", "A modern open-cuff band with a square diamond cluster set at each open end, in 14K rose gold.", "Современное разомкнутое кольцо с квадратными кластерами бриллиантов на концах, розовое золото 14К."),
      price: 209,
      sku: "DOC-313",
    },
    {
      slug: "diamond-statement-wave-ring",
      filename: "ring-diamond-statement-wave-cage-white.jpeg",
      category: rings,
      name: lt("טבעת סטייטמנט יהלומים גלית", "Diamond Statement Wave Ring", "Кольцо-стейтмент «волна» с бриллиантами"),
      shortDescription: lt("טבעת ארוכה בעיצוב גלים חופפים משובצי יהלומים, זהב לבן.", "An elongated ring of overlapping diamond-set waves, white gold.", "Удлинённое кольцо из перекрывающихся волн с бриллиантами."),
      description: lt("טבעת סטייטמנט דרמטית המכסה את פרק האצבע, בעיצוב גלים חופפים משובצי יהלומים, זהב לבן 14K.", "A dramatic statement ring spanning the finger joint, built from overlapping diamond-paved waves, in 14K white gold.", "Драматичное кольцо-стейтмент, покрывающее сустав пальца, из перекрывающихся волн с бриллиантами, белое золото 14К."),
      price: 379,
      sku: "DSW-314",
      featured: true,
    },
    {
      slug: "diamond-cluster-pave-shoulder-ring",
      filename: "ring-diamond-cluster-pave-shoulders-white.jpeg",
      category: rings,
      name: lt("טבעת אשכול יהלומים עם כתפי פייבה", "Diamond Cluster Ring with Pavé Shoulders", "Кольцо с кластером и паве на плечиках"),
      shortDescription: lt("אשכול יהלומים מרכזי עם כתפיים משובצות, זהב לבן.", "A central diamond cluster with pavé-set shoulders, white gold.", "Центральный кластер бриллиантов с паве на плечиках."),
      description: lt("טבעת עם אשכול יהלומים מרכזי בצורת פרח וכתפי פייבה עדינות, זהב לבן 14K.", "A ring featuring a flower-shaped central diamond cluster and delicate pavé shoulders, in 14K white gold.", "Кольцо с центральным кластером бриллиантов в форме цветка и изящными плечиками паве, белое золото 14К."),
      price: 249,
      sku: "DCP-315",
    },
    {
      slug: "black-white-diamond-halo-earrings",
      filename: "earrings-black-white-diamond-halo-white.jpeg",
      category: earrings,
      name: lt("עגילי הילה יהלומים שחור-לבן", "Black & White Diamond Halo Earrings", "Серьги с чёрно-белыми бриллиантами"),
      shortDescription: lt("אשכול יהלומים לבנים מוקף יהלומים שחורים, זהב לבן.", "A white diamond cluster framed by black diamonds, white gold.", "Кластер белых бриллиантов в обрамлении чёрных."),
      description: lt("עגילי טבעת עם אשכול יהלומים לבנים במרכז, מוקף הילת יהלומים שחורים, זהב לבן 14K.", "Hoop earrings with a central white-diamond cluster framed by a halo of black diamonds, in 14K white gold.", "Серьги-кольца с центральным кластером белых бриллиантов в ореоле из чёрных, белое золото 14К."),
      price: 259,
      sku: "BWD-316",
      featured: true,
    },
    {
      slug: "diamond-three-stone-bar-necklace",
      filename: "necklace-diamond-three-stone-bar-yellow.jpeg",
      category: necklaces,
      name: lt("שרשרת תליון שלושה יהלומים בקו", "Diamond Three-Stone Bar Necklace", "Колье с тремя бриллиантами в ряд"),
      shortDescription: lt("שלושה יהלומים עגולים בטור אנכי, זהב צהוב.", "Three round diamonds set in a straight vertical line, yellow gold.", "Три круглых бриллианта в вертикальный ряд."),
      description: lt("תליון מינימליסטי עם שלושה יהלומים עגולים בטור אנכי, על שרשרת זהב צהוב עדינה.", "A minimalist pendant with three round diamonds set in a straight vertical bar, on a delicate yellow gold chain.", "Минималистичная подвеска с тремя круглыми бриллиантами в вертикальном ряду, тонкая цепочка жёлтого золота."),
      price: 199,
      sku: "DTB-317",
    },
    {
      slug: "sapphire-sunburst-halo-drop-earrings",
      filename: "earrings-sapphire-sunburst-halo-drop-rose.jpeg",
      category: earrings,
      name: lt("עגילי תלייה ספיר הילת קרניים", "Sapphire Sunburst Halo Drop Earrings", "Серьги-подвески с сапфиром в ореоле-солнце"),
      shortDescription: lt("ספיר אובלי מוקף הילת יהלומים, זהב ורוד.", "An oval sapphire framed by a diamond sunburst halo, rose gold.", "Овальный сапфир в бриллиантовом ореоле-«солнце»."),
      description: lt("עגילי תלייה עם ספיר אובלי מרכזי מוקף הילת יהלומים בעיצוב קרני שמש, זהב ורוד 14K.", "Drop earrings featuring a central oval sapphire framed by a sunburst-style diamond halo, in 14K rose gold.", "Серьги-подвески с центральным овальным сапфиром в бриллиантовом ореоле-«солнце», розовое золото 14К."),
      price: 279,
      sku: "SSH-318",
    },
    {
      slug: "diamond-bezel-solitaire-necklace",
      filename: "necklace-diamond-bezel-solitaire-white.jpeg",
      category: necklaces,
      name: lt("שרשרת יהלום סוליטר משובץ", "Diamond Bezel Solitaire Necklace", "Колье с бриллиантом в оправе-безель"),
      shortDescription: lt("יהלום עגול במסגרת משובצת, זהב לבן.", "A round diamond set in a smooth bezel frame, white gold.", "Круглый бриллиант в гладкой оправе."),
      description: lt("שרשרת מינימליסטית עם יהלום עגול בודד במסגרת בזל חלקה, זהב לבן 14K.", "A minimalist necklace with a single round diamond set in a smooth bezel frame, in 14K white gold.", "Минималистичное колье с одним круглым бриллиантом в гладкой оправе, белое золото 14К."),
      price: 179,
      sku: "DBS-319",
    },
    {
      slug: "sapphire-halo-leverback-earrings",
      filename: "earrings-sapphire-halo-leverback-white.jpeg",
      category: earrings,
      name: lt("עגילי ספיר הילה עם סוגר מנוף", "Sapphire Halo Leverback Earrings", "Серьги с сапфиром на замке-леверляк"),
      shortDescription: lt("ספיר אובלי מוקף יהלומים, סוגר מנוף, זהב לבן.", "An oval sapphire framed by diamonds, on a leverback closure, white gold.", "Овальный сапфир в бриллиантовом ореоле, замок-леверляк."),
      description: lt("עגילים אלגנטיים עם ספיר אובלי מוקף הילת יהלומים וסוגר מנוף בטוח, זהב לבן 14K.", "Elegant earrings featuring an oval sapphire framed by a diamond halo, on a secure leverback closure, in 14K white gold.", "Элегантные серьги с овальным сапфиром в бриллиантовом ореоле, надёжный замок-леверляк, белое золото 14К."),
      price: 269,
      sku: "SHL-320",
    },
    {
      slug: "diamond-heart-solitaire-necklace",
      filename: "necklace-diamond-heart-solitaire-yellow.jpeg",
      category: necklaces,
      name: lt("שרשרת יהלום חיתוך לב", "Diamond Heart Solitaire Necklace", "Колье с бриллиантом огранки «сердце»"),
      shortDescription: lt("יהלום בחיתוך לב בודד, זהב צהוב.", "A single heart-cut diamond, yellow gold.", "Одиночный бриллиант огранки «сердце»."),
      description: lt("שרשרת עדינה עם יהלום בחיתוך לב הנתלה מעל שרשרת זהב צהוב.", "A delicate necklace with a single heart-cut diamond suspended along a yellow gold chain.", "Изящное колье с одним бриллиантом огранки «сердце» на цепочке жёлтого золота."),
      price: 219,
      sku: "DHS-321",
      featured: true,
    },
    {
      slug: "ruby-oval-halo-leverback-earrings",
      filename: "earrings-ruby-oval-halo-leverback-white.jpeg",
      category: earrings,
      name: lt("עגילי רובי הילה עם סוגר מנוף", "Ruby Oval Halo Leverback Earrings", "Серьги с рубином на замке-леверляк"),
      shortDescription: lt("רובי אובלי מוקף יהלומים, סוגר מנוף, זהב לבן.", "An oval ruby framed by diamonds, on a leverback closure, white gold.", "Овальный рубин в бриллиантовом ореоле, замок-леверляк."),
      description: lt("עגילים קלאסיים עם רובי אובלי מוקף הילת יהלומים וסוגר מנוף, זהב לבן 14K.", "Classic earrings featuring an oval ruby framed by a diamond halo, on a leverback closure, in 14K white gold.", "Классические серьги с овальным рубином в бриллиантовом ореоле, замок-леверляк, белое золото 14К."),
      price: 279,
      sku: "ROH-322",
    },
    {
      slug: "diamond-round-solitaire-branded-ring-white",
      filename: "ring-diamond-round-solitaire-branded-white.jpeg",
      category: rings,
      name: lt("טבעת יהלום עגול — זהב לבן", "Diamond Round Solitaire Ring — White Gold", "Кольцо-солитер с круглым бриллиантом — белое золото"),
      shortDescription: lt("יהלום עגול קלאסי, זהב לבן, חקוקה Lady Diamond.", "A classic round diamond, white gold, engraved Lady Diamond.", "Классический круглый бриллиант, белое золото, гравировка Lady Diamond."),
      description: lt("טבעת סוליטר קלאסית עם יהלום עגול על שרשרת חלקה בזהב לבן, חקוקה Lady Diamond.", "A classic solitaire ring featuring a round diamond, on a plain white gold band, engraved Lady Diamond.", "Классическое кольцо-солитер с круглым бриллиантом на гладком белом золоте, гравировка Lady Diamond."),
      price: 209,
      sku: "DRW-323",
    },
    {
      slug: "sapphire-oval-halo-necklace",
      filename: "necklace-sapphire-oval-halo-lifestyle-white.jpeg",
      category: necklaces,
      name: lt("שרשרת ספיר אובלי הילה", "Sapphire Oval Halo Necklace", "Колье с овальным сапфиром в ореоле"),
      shortDescription: lt("ספיר אובלי מוקף הילת יהלומים, זהב לבן.", "An oval sapphire framed by a diamond halo, white gold.", "Овальный сапфир в бриллиантовом ореоле."),
      description: lt("תליון עם ספיר אובלי מרכזי מוקף הילת יהלומים, על שרשרת זהב לבן עדינה.", "A pendant featuring a central oval sapphire framed by a diamond halo, on a delicate white gold chain.", "Подвеска с центральным овальным сапфиром в бриллиантовом ореоле, тонкая цепочка белого золота."),
      price: 259,
      sku: "SOH-324",
      featured: true,
    },
    {
      slug: "diamond-round-cluster-halo-ring",
      filename: "ring-diamond-round-cluster-halo-white.jpeg",
      category: rings,
      name: lt("טבעת אשכול יהלומים עגולה עם הילה", "Diamond Round Cluster Halo Ring", "Кольцо с круглым кластером в ореоле"),
      shortDescription: lt("אשכול יהלומים עגול מוקף הילה, זהב לבן.", "A round diamond cluster framed by a halo, white gold.", "Круглый кластер бриллиантов в ореоле."),
      description: lt("טבעת עם אשכול יהלומים עגול המדמה יהלום בודד, מוקף הילת יהלומים נוספת, זהב לבן 14K.", "A ring with a round diamond cluster designed to look like a single large stone, framed by an additional diamond halo, in 14K white gold.", "Кольцо с круглым кластером бриллиантов, имитирующим крупный камень, в дополнительном бриллиантовом ореоле, белое золото 14К."),
      price: 229,
      sku: "DRC-325",
    },
    {
      slug: "diamond-marquise-round-alternating-band",
      filename: "ring-diamond-marquise-round-alternating-rose.jpeg",
      category: rings,
      name: lt("טבעת יהלומים מרקיז ועגול לסירוגין", "Marquise & Round Diamond Alternating Band", "Кольцо с чередованием маркиз и круглых бриллиантов"),
      shortDescription: lt("יהלומי מרקיז ועגול לסירוגין, זהב ורוד.", "Marquise and round diamonds set in alternating rhythm, rose gold.", "Бриллианты «маркиз» и круглые бриллианты в чередовании."),
      description: lt("טבעת נצח עם יהלומי מרקיז ועגולים המשובצים לסירוגין, זהב ורוד 14K.", "An eternity-style band with marquise and round diamonds set in an alternating rhythm, in 14K rose gold.", "Кольцо-вечность с чередующимися бриллиантами «маркиз» и круглыми, розовое золото 14К."),
      price: 239,
      sku: "DMR-326",
    },
    {
      slug: "star-of-david-center-cluster-pendant",
      filename: "pendant-star-of-david-center-cluster-yellow.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד עם אשכול יהלומים במרכז", "Star of David Center-Cluster Pendant", "Кулон «Звезда Давида» с кластером в центре"),
      shortDescription: lt("מגן דוד זהב מלא במסגרת פייבה, אשכול יהלומים במרכז.", "A solid gold Star of David in a pavé-roped frame, diamond cluster at center.", "Цельная золотая «Звезда Давида» с кластером бриллиантов в центре."),
      description: lt("תליון מגן דוד בזהב מלא במסגרת עגולה משובצת יהלומים בעיצוב חבל, ואשכול יהלומים קטן במרכז הכוכב, זהב צהוב.", "A solid-gold Star of David pendant within a rope-textured diamond-paved circle, with a small diamond cluster set at the star's center, yellow gold.", "Подвеска «Звезда Давида» из цельного золота в круглой оправе с бриллиантами и текстурой каната, с небольшим кластером бриллиантов в центре звезды, жёлтое золото."),
      price: 249,
      sku: "SDT-327",
    },
    {
      slug: "diamond-solitaire-pave-shoulder-ring-white",
      filename: "ring-diamond-solitaire-pave-shoulders-white.jpeg",
      category: rings,
      name: lt("טבעת סוליטר עם כתפי פייבה — לבן", "Diamond Solitaire with Pavé Shoulders — White Gold", "Кольцо-солитер с паве на плечиках — белое золото"),
      shortDescription: lt("יהלום עגול מרכזי עם כתפיים משובצות, זהב לבן.", "A central round diamond with pavé-set shoulders, white gold.", "Центральный круглый бриллиант с паве на плечиках."),
      description: lt("טבעת אירוסין קלאסית עם יהלום עגול מרכזי וכתפי פייבה עדינות, זהב לבן 14K.", "A classic engagement-style ring with a central round diamond and delicate pavé shoulders, in 14K white gold.", "Классическое кольцо с центральным круглым бриллиантом и изящными плечиками паве, белое золото 14К."),
      price: 219,
      sku: "DSP-328",
    },
    {
      slug: "diamond-five-stone-branded-band",
      filename: "ring-diamond-five-stone-branded-white.jpeg",
      category: rings,
      name: lt("טבעת חמישה יהלומים חקוקה", "Diamond Five-Stone Branded Band", "Кольцо с пятью бриллиантами, гравировка"),
      shortDescription: lt("חמישה יהלומים עגולים בטור, זהב לבן, חקוקה Lady Diamond.", "Five round diamonds set in a row, white gold, engraved Lady Diamond.", "Пять круглых бриллиантов в ряд, гравировка Lady Diamond."),
      description: lt("טבעת עם חמישה יהלומים עגולים בגדלים אחידים, על שרשרת זהב לבן חקוקה Lady Diamond.", "A band featuring five uniformly sized round diamonds set in a row, on a white gold band engraved Lady Diamond.", "Кольцо с пятью бриллиантами одинакового размера в ряд, белое золото, гравировка Lady Diamond."),
      price: 259,
      sku: "DFS-329",
      featured: true,
    },
    {
      slug: "sapphire-cocktail-halo-ring",
      filename: "ring-sapphire-cocktail-lifestyle-white.jpeg",
      category: rings,
      name: lt("טבעת קוקטייל ספיר עם הילה", "Sapphire Cocktail Halo Ring", "Коктейльное кольцо с сапфиром в ореоле"),
      shortDescription: lt("ספיר אובלי גדול מוקף הילת יהלומים, זהב לבן.", "A large oval sapphire framed by a diamond halo, white gold.", "Крупный овальный сапфир в бриллиантовом ореоле."),
      description: lt("טבעת קוקטייל מרשימה עם ספיר אובלי גדול במרכז, מוקף הילת יהלומים בעיצוב קרני שמש, זהב לבן 14K.", "A striking cocktail ring featuring a large central oval sapphire framed by a sunburst-style diamond halo, in 14K white gold.", "Впечатляющее коктейльное кольцо с крупным овальным сапфиром в центре, в бриллиантовом ореоле-«солнце», белое золото 14К."),
      price: 329,
      sku: "SCH-330",
      featured: true,
    },
    {
      slug: "diamond-pear-cluster-halo-ring",
      filename: "ring-diamond-pear-cluster-halo-split-shank-white.jpeg",
      category: rings,
      name: lt("טבעת אשכול יהלומים בצורת אגס", "Diamond Pear Cluster Halo Ring", "Кольцо с кластером-«груша» в ореоле"),
      shortDescription: lt("אשכול יהלומים בצורת אגס עם הילה ושרשרת מפוצלת, זהב לבן.", "A pear-shaped diamond cluster with a halo and split shank, white gold.", "Кластер бриллиантов в форме груши с ореолом и раздвоенным кольцом."),
      description: lt("טבעת עם אשכול יהלומים בצורת אגס המדמה אבן בודדת, מוקף הילת יהלומים ושרשרת מפוצלת משובצת, זהב לבן 14K.", "A ring with a pear-shaped diamond cluster designed to look like a single large stone, framed by a diamond halo and a pavé split shank, in 14K white gold.", "Кольцо с кластером бриллиантов в форме груши, имитирующим крупный камень, в ореоле и на раздвоенном кольце с паве, белое золото 14К."),
      price: 289,
      sku: "DPC-331",
    },
    {
      slug: "diamond-cushion-double-halo-baguette-ring",
      filename: "ring-diamond-cushion-double-halo-baguette-white.jpeg",
      category: rings,
      name: lt("טבעת כרית הילה כפולה עם באגט", "Diamond Cushion Double Halo Baguette Ring", "Кольцо-«подушка» с двойным ореолом и багетами"),
      shortDescription: lt("מרכז באגטים ועגולים במסגרת כרית הילה כפולה, זהב לבן.", "A baguette-and-round center in a cushion-shaped double halo, white gold.", "Центр из багетов и круглых камней в двойном ореоле-«подушка»."),
      description: lt("טבעת מרשימה עם מרכז יהלומי באגט ועגולים, מוקף הילה כפולה בצורת כרית, זהב לבן 14K.", "A striking ring with a baguette-and-round diamond center, framed by a cushion-shaped double halo, in 14K white gold.", "Впечатляющее кольцо с центром из бриллиантов-багетов и круглых камней, в двойном ореоле-«подушка», белое золото 14К."),
      price: 339,
      sku: "DCB-332",
      featured: true,
    },
    {
      slug: "diamond-flower-halo-set",
      filename: "set-diamond-flower-halo-ring-earrings-white.jpeg",
      category: rings,
      name: lt("סט פרח יהלומים — טבעת ועגילים", "Diamond Flower Halo Set — Ring & Earrings", "Комплект «цветок» — кольцо и серьги"),
      shortDescription: lt("סט תואם: טבעת ועגילי פרח יהלומים, זהב לבן.", "A matching set: diamond flower-halo ring and earrings, white gold.", "Комплект: кольцо и серьги «цветок» с бриллиантами."),
      description: lt("סט תואם הכולל טבעת ועגילים בעיצוב פרח, עם יהלום מרכזי מוקף עלי כותרת משובצים, זהב לבן 14K.", "A matching ring-and-earrings set in a flower design, each with a central diamond framed by paved petals, in 14K white gold.", "Комплект из кольца и серёг в форме цветка, с центральным бриллиантом в обрамлении лепестков паве, белое золото 14К."),
      price: 359,
      sku: "DFH-333",
      featured: true,
    },
    {
      slug: "star-of-david-solid-pave-pendant",
      filename: "pendant-star-of-david-solid-pave-two-tone.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד פייבה מלא", "Star of David Solid Pavé Pendant", "Кулон «Звезда Давида» с полным паве"),
      shortDescription: lt("מגן דוד מלא משובץ יהלומים, זהב צהוב או לבן.", "A fully paved solid Star of David, yellow or white gold.", "Полностью покрытая паве «Звезда Давида», жёлтое или белое золото."),
      description: lt("תליון מגן דוד בעיצוב מלא ומוצק, משובץ יהלומים לאורך כל פני הכוכב, זמין בזהב צהוב או לבן.", "A solid, fully paved Star of David pendant with diamonds set across the entire face of the star, available in yellow or white gold.", "Подвеска «Звезда Давида» цельной формы, полностью покрытая бриллиантами, доступна в жёлтом или белом золоте."),
      price: 229,
      sku: "SDF-334",
    },
    {
      slug: "diamond-heart-solitaire-branded-ring",
      filename: "ring-diamond-heart-solitaire-branded-white.jpeg",
      category: rings,
      name: lt("טבעת יהלום חיתוך לב חקוקה", "Diamond Heart Solitaire Branded Ring", "Кольцо с бриллиантом «сердце», гравировка"),
      shortDescription: lt("יהלום בחיתוך לב עם כתפי פייבה, זהב לבן, חקוקה Lady Diamond.", "A heart-cut diamond with pavé shoulders, white gold, engraved Lady Diamond.", "Бриллиант огранки «сердце» с паве на плечиках, гравировка Lady Diamond."),
      description: lt("טבעת עם יהלום בחיתוך לב וכתפי פייבה עדינות, על שרשרת זהב לבן חקוקה Lady Diamond.", "A ring featuring a heart-cut diamond with delicate pavé shoulders, on a white gold band engraved Lady Diamond.", "Кольцо с бриллиантом огранки «сердце» и изящными плечиками паве, белое золото, гравировка Lady Diamond."),
      price: 259,
      sku: "DHB-335",
      featured: true,
    },
    {
      slug: "mens-black-white-diamond-link-ring",
      filename: "ring-mens-black-white-diamond-link-yellow.jpeg",
      category: rings,
      name: lt("טבעת גברים יהלומים שחור-לבן", "Men's Black & White Diamond Link Ring", "Мужское кольцо с чёрно-белыми бриллиантами"),
      shortDescription: lt("עיצוב רצועת שעון עם יהלומים שחורים ולבנים, זהב צהוב.", "A watch-link design with black and white diamonds, yellow gold.", "Дизайн в стиле часового браслета с чёрными и белыми бриллиантами."),
      description: lt("טבעת גברים רחבה בעיצוב רצועת שעון, עם יהלום מרכזי וניגוד יהלומים שחורים ולבנים, זהב צהוב 14K.", "A wide men's band in a watch-link design, featuring a central diamond and a contrast of black and white diamond accents, in 14K yellow gold.", "Широкое мужское кольцо в стиле часового браслета, с центральным бриллиантом и контрастом чёрных и белых бриллиантов, жёлтое золото 14К."),
      price: 289,
      sku: "MBW-336",
    },
    {
      slug: "diamond-round-halo-plain-branded-ring",
      filename: "ring-diamond-round-halo-plain-branded-white.jpeg",
      category: rings,
      name: lt("טבעת הילה עגולה על שרשרת חלקה", "Diamond Round Halo Plain Band Ring", "Кольцо с круглым ореолом на гладком кольце"),
      shortDescription: lt("יהלום עגול מוקף הילה, שרשרת חלקה, חקוקה Lady Diamond.", "A round diamond framed by a halo, on a plain band, engraved Lady Diamond.", "Круглый бриллиант в ореоле на гладком кольце, гравировка Lady Diamond."),
      description: lt("טבעת עם יהלום עגול מוקף הילת יהלומים, על שרשרת חלקה בזהב לבן, חקוקה Lady Diamond.", "A ring featuring a round diamond framed by a diamond halo, on a plain white gold band, engraved Lady Diamond.", "Кольцо с круглым бриллиантом в ореоле, на гладком белом золоте, гравировка Lady Diamond."),
      price: 229,
      sku: "DRH-337",
    },
    {
      slug: "star-of-david-blue-enamel-pendant",
      filename: "pendant-star-of-david-blue-enamel-diamond-yellow.jpeg",
      category: necklaces,
      name: lt("תליון מגן דוד אמייל כחול ויהלומים", "Star of David Blue Enamel & Diamond Pendant", "Кулон «Звезда Давида» с синей эмалью и бриллиантами"),
      shortDescription: lt("מגן דוד עם אמייל כחול ופס יהלומים, זהב צהוב.", "A Star of David with blue enamel edges and a diamond inlay, yellow gold.", "«Звезда Давида» с синей эмалью и бриллиантовой инкрустацией."),
      description: lt("תליון מגן דוד ייחודי עם קצוות אמייל כחול עמוק ופס יהלומים במרכז כל קרן, זהב צהוב 14K.", "A distinctive Star of David pendant with deep blue enamel edges and a diamond inlay running through the center of each point, in 14K yellow gold.", "Оригинальная подвеска «Звезда Давида» с глубокой синей эмалью по краям и бриллиантовой инкрустацией в центре каждого луча, жёлтое золото 14К."),
      price: 249,
      sku: "SDE-338",
      featured: true,
    },
    {
      slug: "diamond-solitaire-pave-shoulder-ring-yellow",
      filename: "ring-diamond-solitaire-pave-shoulders-yellow.jpeg",
      category: rings,
      name: lt("טבעת סוליטר עם כתפי פייבה — צהוב", "Diamond Solitaire with Pavé Shoulders — Yellow Gold", "Кольцо-солитер с паве на плечиках — жёлтое золото"),
      shortDescription: lt("יהלום עגול מרכזי עם כתפיים משובצות, זהב צהוב.", "A central round diamond with pavé-set shoulders, yellow gold.", "Центральный круглый бриллиант с паве на плечиках."),
      description: lt("טבעת קלאסית עם יהלום עגול מרכזי בשיבוץ שיניים וכתפי פייבה עדינות, זהב צהוב 14K.", "A classic ring with a prong-set central round diamond and delicate pavé shoulders, in 14K yellow gold.", "Классическое кольцо с центральным круглым бриллиантом в крапановой оправе и изящными плечиками паве, жёлтое золото 14К."),
      price: 219,
      sku: "DSY-339",
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
