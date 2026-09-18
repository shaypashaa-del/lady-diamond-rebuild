// Adds a fourth batch of real client jewelry photography (WhatsApp
// export, 2026-09-18, second folder): a full "LD" solitaire collection
// across diamond cuts, several men's rings, three Star of David ring
// designs plus pendant variants, a Chai pendant, and statement earrings.
// Each image individually verified before naming/copying. Does not
// touch any previously-added media.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function mediaFor(filename: string, alt: string) {
  const url = `/brand/catalog2/${filename}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.mediaAsset.create({ data: { url, filename, altText: alt } });
}

async function main() {
  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  const earrings = await prisma.category.findUniqueOrThrow({ where: { slug: "earrings" } });

  type Simple = {
    slug: string;
    filenames: string[];
    category: typeof rings;
    name: LT;
    shortDescription: LT;
    description: LT;
    price: number;
    sku: string;
    featured?: boolean;
  };

  const products: Simple[] = [
    {
      slug: "diamond-cushion-solitaire-ring",
      filenames: ["ring-diamond-cushion-solitaire-white-box.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר חיתוך כרית", "Diamond Cushion-Cut Solitaire Ring", "Кольцо-солитер с бриллиантом «кушон»"),
      shortDescription: lt("יהלום בחיתוך כרית רך על שרשרת חלקה, זהב לבן.", "A soft cushion-cut diamond on a plain band, white gold.", "Бриллиант огранки «кушон» на гладком кольце, белое золото."),
      description: lt("טבעת סוליטר עם יהלום בחיתוך כרית, על שרשרת חלקה בזהב לבן, חקוקה LD.", "A solitaire ring featuring a cushion-cut diamond, on a plain white gold band, engraved LD.", "Кольцо-солитер с бриллиантом огранки «кушон» на гладком кольце из белого золота, гравировка LD."),
      price: 229,
      sku: "LD-CU-201",
      featured: true,
    },
    {
      slug: "diamond-emeraldcut-solitaire-ring-yellow",
      filenames: ["ring-diamond-emeraldcut-solitaire-yellow.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר חיתוך אמרלד — זהב צהוב", "Diamond Emerald-Cut Solitaire Ring — Yellow Gold", "Кольцо-солитер, огранка изумруд — жёлтое золото"),
      shortDescription: lt("יהלום מלבני קלאסי על זהב צהוב.", "A classic rectangular diamond on yellow gold.", "Классический прямоугольный бриллиант на жёлтом золоте."),
      description: lt("טבעת סוליטר עם יהלום בחיתוך אמרלד, על זהב צהוב חלק, חקוקה LD.", "A solitaire ring featuring an emerald-cut diamond, on a plain yellow gold band, engraved LD.", "Кольцо-солитер с бриллиантом изумрудной огранки на гладком жёлтом золоте, гравировка LD."),
      price: 229,
      sku: "LD-EC-202",
    },
    {
      slug: "diamond-heart-solitaire-ring-rose",
      filenames: ["ring-diamond-heart-solitaire-rose.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר לב — זהב ורוד", "Diamond Heart Solitaire Ring — Rose Gold", "Кольцо-солитер «сердце» — розовое золото"),
      shortDescription: lt("יהלום בחיתוך לב על זהב ורוד עדין.", "A heart-cut diamond on delicate rose gold.", "Бриллиант огранки «сердце» на изящном розовом золоте."),
      description: lt("טבעת סוליטר רומנטית עם יהלום בחיתוך לב, על שרשרת דקה בזהב ורוד, חקוקה LD.", "A romantic solitaire ring featuring a heart-cut diamond, on a thin rose gold band, engraved LD.", "Романтичное кольцо-солитер с бриллиантом огранки «сердце» на тонком розовом золоте, гравировка LD."),
      price: 219,
      sku: "LD-HT-203",
      featured: true,
    },
    {
      slug: "diamond-marquise-solitaire-ring-white",
      filenames: ["ring-diamond-marquise-solitaire-white-hand.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר מרקיז", "Diamond Marquise Solitaire Ring", "Кольцо-солитер с бриллиантом «маркиз»"),
      shortDescription: lt("יהלום מוארך בחיתוך מרקיז, זהב לבן.", "An elongated marquise-cut diamond, white gold.", "Удлинённый бриллиант огранки «маркиз», белое золото."),
      description: lt("טבעת סוליטר עם יהלום בחיתוך מרקיז מוארך, על זהב לבן חלק, חקוקה LD.", "A solitaire ring featuring an elongated marquise-cut diamond, on a plain white gold band, engraved LD.", "Кольцо-солитер с удлинённым бриллиантом огранки «маркиз» на белом золоте, гравировка LD."),
      price: 229,
      sku: "LD-MQ-204",
    },
    {
      slug: "diamond-oval-eternity-band-ring",
      filenames: [
        "ring-diamond-oval-eternity-band-yellow.jpeg",
        "ring-diamond-oval-eternity-band-white.jpeg",
        "ring-diamond-oval-eternity-band-rose.jpeg",
        "ring-diamond-oval-eternity-band-dark.jpeg",
      ],
      category: rings,
      name: lt("טבעת יהלומים אובלית חצי נצח", "Diamond Oval Half-Eternity Ring", "Кольцо-дорожка с овальными бриллиантами"),
      shortDescription: lt("שורת יהלומים אובליים גדולים לאורך הטבעת.", "A row of large oval diamonds along the band.", "Ряд крупных овальных бриллиантов вдоль кольца."),
      description: lt("טבעת חצי נצח עם שורת יהלומים אובליים גדולים, זמינה בזהב לבן, צהוב וורוד.", "A half-eternity band featuring a row of large oval diamonds, available in white, yellow, and rose gold.", "Кольцо-дорожка с рядом крупных овальных бриллиантов. Доступно в белом, жёлтом и розовом золоте."),
      price: 349,
      sku: "LD-OE-205",
      featured: true,
    },
    {
      slug: "diamond-oval-thin-solitaire-ring-rose",
      filenames: ["ring-diamond-oval-thin-solitaire-rose.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר אובלי דקה", "Delicate Diamond Oval Solitaire Ring", "Тонкое кольцо-солитер с овальным бриллиантом"),
      shortDescription: lt("יהלום אובלי על שרשרת דקה ועדינה, זהב ורוד.", "An oval diamond on a thin, delicate band, rose gold.", "Овальный бриллиант на тонком изящном кольце, розовое золото."),
      description: lt("טבעת סוליטר מינימליסטית עם יהלום אובלי על שרשרת דקה בזהב ורוד, חקוקה LD.", "A minimalist solitaire ring featuring an oval diamond on a thin rose gold band, engraved LD.", "Минималистичное кольцо-солитер с овальным бриллиантом на тонком розовом золоте, гравировка LD."),
      price: 199,
      sku: "LD-OV-206",
    },
    {
      slug: "diamond-pear-solitaire-ring-white",
      filenames: ["ring-diamond-pear-solitaire-white-macro.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר אגס", "Diamond Pear-Cut Solitaire Ring", "Кольцо-солитер с бриллиантом «груша»"),
      shortDescription: lt("יהלום בחיתוך אגס טיפתי, זהב לבן.", "A teardrop pear-cut diamond, white gold.", "Бриллиант огранки «груша», белое золото."),
      description: lt("טבעת סוליטר עם יהלום בחיתוך אגס, על זהב לבן חלק, חקוקה LD.", "A solitaire ring featuring a pear-cut diamond, on a plain white gold band, engraved LD.", "Кольцо-солитер с бриллиантом огранки «груша» на белом золоте, гравировка LD."),
      price: 229,
      sku: "LD-PR-207",
    },
    {
      slug: "diamond-princess-solitaire-ring-white",
      filenames: ["ring-diamond-princess-solitaire-white-studio.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר פרינסס", "Diamond Princess-Cut Solitaire Ring", "Кольцо-солитер «принцесса»"),
      shortDescription: lt("יהלום מרובע בחיתוך פרינסס, זהב לבן.", "A square princess-cut diamond, white gold.", "Квадратный бриллиант огранки «принцесса», белое золото."),
      description: lt("טבעת סוליטר עם יהלום מרובע בחיתוך פרינסס, על זהב לבן חלק, חקוקה LD.", "A solitaire ring featuring a square princess-cut diamond, on a plain white gold band, engraved LD.", "Кольцо-солитер с квадратным бриллиантом огранки «принцесса» на белом золоте, гравировка LD."),
      price: 219,
      sku: "LD-PC-208",
    },
    {
      slug: "diamond-radiant-solitaire-ring-white",
      filenames: ["ring-diamond-radiant-solitaire-white.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר רדיאנט", "Diamond Radiant-Cut Solitaire Ring", "Кольцо-солитер огранки «радиант»"),
      shortDescription: lt("יהלום מלבני נוצץ בחיתוך רדיאנט, זהב לבן.", "A brilliant rectangular radiant-cut diamond, white gold.", "Сверкающий прямоугольный бриллиант огранки «радиант»."),
      description: lt("טבעת סוליטר עם יהלום בחיתוך רדיאנט, על זהב לבן חלק, חקוקה LD.", "A solitaire ring featuring a radiant-cut diamond, on a plain white gold band, engraved LD.", "Кольцо-солитер с бриллиантом огранки «радиант» на белом золоте, гравировка LD."),
      price: 219,
      sku: "LD-RD-209",
    },
    {
      slug: "diamond-round-pave-solitaire-ring-white",
      filenames: ["ring-diamond-round-pave-solitaire-white.jpeg", "ring-diamond-round-pave-doublerow-white.jpeg"],
      category: rings,
      name: lt("טבעת יהלום סוליטר עגול פייבה", "Diamond Round Solitaire Ring with Pavé", "Кольцо-солитер с круглым бриллиантом и паве"),
      shortDescription: lt("יהלום עגול קלאסי על שרשרת פייבה, זהב לבן.", "A classic round diamond on a pavé band, white gold.", "Классический круглый бриллиант на дорожке паве, белое золото."),
      description: lt("טבעת סוליטר קלאסית עם יהלום עגול על שרשרת פייבה בזהב לבן, חקוקה LD.", "A classic solitaire ring featuring a round diamond on a pavé band in white gold, engraved LD.", "Классическое кольцо-солитер с круглым бриллиантом на дорожке паве, белое золото, гравировка LD."),
      price: 239,
      sku: "LD-RP-210",
      featured: true,
    },
    {
      slug: "mens-black-center-halo-ring",
      filenames: ["ring-mens-black-center-halo-brushed-silver.jpeg"],
      category: rings,
      name: lt("טבעת גברים אבן שחורה הילה", "Men's Black Stone Halo Ring", "Мужское кольцо с чёрным камнем в ореоле"),
      shortDescription: lt("אבן שחורה גדולה מוקפת יהלומים, כסף מוברש.", "A large black center stone framed by diamonds, brushed silver.", "Крупный чёрный камень в ореоле бриллиантов, матовое серебро."),
      description: lt("טבעת גברית נועזת עם אבן שחורה מרכזית מוקפת הילת יהלומים, ואבנים שחורות נוספות על השרשרת המוברשת.", "A bold men's ring featuring a large black center stone framed by a diamond halo, with more black stones along the brushed band.", "Смелое мужское кольцо с крупным чёрным камнем в бриллиантовом ореоле, дополнительные чёрные камни на матовом кольце."),
      price: 289,
      sku: "MBH-211",
      featured: true,
    },
    {
      slug: "mens-checkerboard-ring",
      filenames: ["ring-mens-checkerboard-blackwhite-silver.jpeg"],
      category: rings,
      name: lt("טבעת גברים לוח שחמט", "Men's Checkerboard Ring", "Мужское кольцо «шахматная доска»"),
      shortDescription: lt("דוגמת שחמט של יהלומים שחורים ולבנים, כסף.", "A checkerboard pattern of black and white diamonds, silver.", "Шахматный узор из чёрных и белых бриллиантов, серебро."),
      description: lt("טבעת גברית עם פאנל מרובע בדוגמת שחמט של יהלומים שחורים ולבנים לסירוגין, על כסף.", "A men's ring with a square panel in a checkerboard pattern of alternating black and white diamonds, in silver.", "Мужское кольцо с квадратной панелью в шахматном узоре из чередующихся чёрных и белых бриллиантов, серебро."),
      price: 259,
      sku: "MCB-212",
    },
    {
      slug: "mens-greekkey-square-ring",
      filenames: ["ring-mens-greekkey-square-yellow.jpeg"],
      category: rings,
      name: lt("טבעת גברים יוונית מרובעת", "Men's Greek Key Square Ring", "Мужское кольцо «греческий орнамент»"),
      shortDescription: lt("פאנל מרובע עם יהלומים ודוגמה יוונית, זהב צהוב.", "A square panel with diamonds and a Greek key pattern, yellow gold.", "Квадратная панель с бриллиантами и греческим орнаментом."),
      description: lt("טבעת גברית עם פאנל מרובע משובץ יהלומים לבנים ושחורים, ודוגמת מפתח יווני על השרשרת, זהב צהוב.", "A men's ring with a square panel set with black and white diamonds, and a Greek key pattern along the band, yellow gold.", "Мужское кольцо с квадратной панелью, украшенной чёрными и белыми бриллиантами, и греческим орнаментом на кольце, жёлтое золото."),
      price: 279,
      sku: "MGK-213",
    },
    {
      slug: "mens-onyx-diagonal-ring",
      filenames: ["ring-mens-onyx-diagonal-yellow.jpeg"],
      category: rings,
      name: lt("טבעת גברים אוניקס אלכסונית", "Men's Diagonal Onyx Ring", "Мужское кольцо с ониксом по диагонали"),
      shortDescription: lt("פסי אוניקס שחור אלכסוניים עם קו יהלומים, זהב צהוב.", "Diagonal black onyx stripes with a diamond line, yellow gold.", "Диагональные полосы чёрного оникса с линией бриллиантов."),
      description: lt("טבעת גברית עם פסי אוניקס שחור אלכסוניים וקו יהלומים במרכז, על זהב צהוב.", "A men's ring featuring diagonal black onyx stripes with a diamond line through the center, in yellow gold.", "Мужское кольцо с диагональными полосами чёрного оникса и линией бриллиантов по центру, жёлтое золото."),
      price: 219,
      sku: "MOD-214",
    },
    {
      slug: "mens-rect-blackdiamond-ring",
      filenames: ["ring-mens-rect-blackdiamond-yellow.jpeg"],
      category: rings,
      name: lt("טבעת גברים מלבנית יהלומים שחורים", "Men's Rectangular Black Diamond Ring", "Мужское кольцо с чёрными бриллиантами"),
      shortDescription: lt("פאנל מלבני משובץ יהלומים שחורים, זהב צהוב.", "A rectangular panel set with black diamonds, yellow gold.", "Прямоугольная панель с чёрными бриллиантами, жёлтое золото."),
      description: lt("טבעת גברית עם פאנל מלבני משובץ שורות יהלומים שחורים, על זהב צהוב.", "A men's ring featuring a rectangular panel set with rows of black diamonds, in yellow gold.", "Мужское кольцо с прямоугольной панелью из рядов чёрных бриллиантов, жёлтое золото."),
      price: 249,
      sku: "MRB-215",
    },
    {
      slug: "mens-wideband-stripes-ring",
      filenames: ["ring-mens-wideband-stripes-yellow.jpeg"],
      category: rings,
      name: lt("טבעת גברים רחבה פסים", "Men's Wide Striped Band Ring", "Мужское широкое кольцо с полосами"),
      shortDescription: lt("שורות מתחלפות של יהלומים שחורים ולבנים, זהב צהוב.", "Alternating rows of black and white diamonds, yellow gold.", "Чередующиеся ряды чёрных и белых бриллиантов, жёлтое золото."),
      description: lt("טבעת גברית רחבה עם שורות מתחלפות של יהלומים שחורים ולבנים, ודוגמת מפתח יווני בצדדים, זהב צהוב.", "A wide men's band featuring alternating rows of black and white diamonds, with a Greek key pattern along the sides, in yellow gold.", "Широкое мужское кольцо с чередующимися рядами чёрных и белых бриллиантов и греческим орнаментом по бокам."),
      price: 299,
      sku: "MWS-216",
      featured: true,
    },
    {
      slug: "star-of-david-diamond-ring",
      filenames: ["ring-star-of-david-diamond-yellow.jpeg"],
      category: rings,
      name: lt("טבעת מגן דוד יהלומים", "Star of David Diamond Ring", "Кольцо «Звезда Давида» с бриллиантами"),
      shortDescription: lt("מגן דוד קטן משובץ יהלומים, זהב צהוב.", "A small diamond-set Star of David, yellow gold.", "Маленькая «Звезда Давида» с бриллиантами, жёлтое золото."),
      description: lt("טבעת עדינה עם מגן דוד משובץ יהלומים במרכז, על שרשרת זהב צהוב חלקה.", "A delicate ring featuring a diamond-set Star of David centerpiece, on a plain yellow gold band.", "Изящное кольцо со «Звездой Давида», украшенной бриллиантами, на гладком жёлтом золоте."),
      price: 189,
      sku: "SDR-217",
      featured: true,
    },
    {
      slug: "star-of-david-filigree-ring",
      filenames: ["ring-star-of-david-filigree-worn.jpeg"],
      category: rings,
      name: lt("טבעת מגן דוד אז'ור", "Star of David Filigree Ring", "Кольцо «Звезда Давида» филигрань"),
      shortDescription: lt("מגן דוד בעיצוב אז'ור עדין, זהב דו-גוני.", "A delicate open filigree Star of David, two-tone gold.", "Изящная ажурная «Звезда Давида», двухцветное золото."),
      description: lt("טבעת עם מגן דוד בעיצוב אז'ור עדין משובץ יהלום מרכזי, על זהב דו-גוני.", "A ring featuring a delicate open filigree Star of David set with a center diamond, in two-tone gold.", "Кольцо с изящной ажурной «Звездой Давида» с центральным бриллиантом, двухцветное золото."),
      price: 179,
      sku: "SDF-218",
    },
    {
      slug: "star-of-david-outline-pave-ring",
      filenames: ["ring-star-of-david-outline-pave-yellow.jpeg"],
      category: rings,
      name: lt("טבעת מגן דוד קווי מתאר פייבה", "Star of David Outline Pavé Ring", "Кольцо «Звезда Давида» контурное паве"),
      shortDescription: lt("מגן דוד גדול בקווי מתאר, על שרשרת פייבה, זהב צהוב.", "A large open-outline Star of David, on a pavé band, yellow gold.", "Крупная контурная «Звезда Давида» на дорожке паве, жёлтое золото."),
      description: lt("טבעת עם מגן דוד גדול בעיצוב קווי מתאר פתוח, על שרשרת פייבה עדינה בזהב צהוב.", "A ring featuring a large open-outline Star of David, on a delicate pavé band in yellow gold.", "Кольцо с крупной контурной «Звездой Давида» на тонкой дорожке паве, жёлтое золото."),
      price: 199,
      sku: "SDP-219",
    },
    {
      slug: "chai-diamond-pendant",
      filenames: ["pendant-chai-diamond-yellow.jpeg"],
      category: necklaces,
      name: lt("תליון חי יהלומים", "Chai Diamond Pendant", "Кулон «Хай» с бриллиантами"),
      shortDescription: lt("סמל החיים היהודי \"חי\" משובץ יהלומים, זהב צהוב.", "The Jewish \"Chai\" (life) symbol set with diamonds, yellow gold.", "Символ жизни «Хай» с бриллиантами, жёлтое золото."),
      description: lt("תליון \"חי\" — סמל החיים היהודי המסורתי, משובץ יהלומים לאורך כל האותיות, על שרשרת זהב צהוב.", "A \"Chai\" pendant — the traditional Jewish symbol for life — set with diamonds along each letter, on a yellow gold chain.", "Подвеска «Хай» — традиционный еврейский символ жизни — украшена бриллиантами вдоль каждой буквы, жёлтое золото."),
      price: 209,
      sku: "CHP-220",
      featured: true,
    },
    {
      slug: "star-of-david-blueenamel-pendant",
      filenames: ["pendant-star-of-david-blueenamel-twotone.jpeg"],
      category: necklaces,
      name: lt("תליון מגן דוד אמייל כחול", "Star of David Blue Enamel Pendant", "Кулон «Звезда Давида» с синей эмалью"),
      shortDescription: lt("מגן דוד דו-גוני עם קווי אמייל כחול, זהב.", "A two-tone Star of David with blue enamel accents, gold.", "Двухцветная «Звезда Давида» с синими эмалевыми акцентами."),
      description: lt("תליון מגן דוד בעיצוב דו-גוני, עם קווי מתאר באמייל כחול עמוק ומרכז יהלומים.", "A two-tone Star of David pendant, with deep blue enamel outlines and a diamond-set center.", "Двухцветная подвеска «Звезда Давида» с контуром из глубокой синей эмали и бриллиантовым центром."),
      price: 219,
      sku: "SDE-221",
    },
    {
      slug: "star-of-david-onyx-pendant",
      filenames: ["pendant-star-of-david-onyx-filigree.jpeg"],
      category: necklaces,
      name: lt("תליון מגן דוד אוניקס אז'ור", "Star of David Onyx Filigree Pendant", "Кулон «Звезда Давида» с ониксом"),
      shortDescription: lt("מגן דוד אז'ור דו-גוני עם דיסקית אוניקס שחורה, זהב.", "A two-tone filigree Star of David with a black onyx disc, gold.", "Ажурная двухцветная «Звезда Давида» с диском из чёрного оникса."),
      description: lt("תליון מגן דוד בעיצוב אז'ור עשיר, משובץ יהלומים, עם דיסקית אוניקס שחורה במרכז, זהב דו-גוני.", "A pendant featuring a richly detailed filigree Star of David, set with diamonds, with a black onyx disc at the center, two-tone gold.", "Подвеска с богато детализированной ажурной «Звездой Давида», украшенной бриллиантами, с диском из чёрного оникса в центре."),
      price: 229,
      sku: "SDN-222",
      featured: true,
    },
    {
      slug: "star-of-david-shema-pendant",
      filenames: ["pendant-star-of-david-shema-yisrael-yellow.jpeg"],
      category: necklaces,
      name: lt("תליון מגן דוד שמע ישראל", "Star of David \"Shema Yisrael\" Pendant", "Кулон «Звезда Давида» с надписью «Шма Исраэль»"),
      shortDescription: lt("מגן דוד עם חריטת \"שמע ישראל\" במרכז, זהב צהוב.", "A Star of David engraved with \"Shema Yisrael\" at the center, yellow gold.", "«Звезда Давида» с гравировкой «Шма Исраэль» в центре."),
      description: lt("תליון מגן דוד משובץ יהלומים, עם המילים \"שמע ישראל\" חרוטות במרכז, זהב צהוב — תכשיט של אמונה ומשמעות.", "A diamond-set Star of David pendant, with the words \"Shema Yisrael\" engraved at the center, yellow gold — a piece of faith and meaning.", "Подвеска «Звезда Давида» с бриллиантами и словами «Шма Исраэль», выгравированными в центре, жёлтое золото."),
      price: 209,
      sku: "SDS-223",
      featured: true,
    },
    {
      slug: "ruby-diamond-chandelier-earrings",
      filenames: ["earrings-ruby-diamond-chandelier-box.jpeg", "earrings-ruby-diamond-chandelier-worn.jpeg"],
      category: earrings,
      name: lt("עגילי צ'נדלייר רובי ויהלום", "Ruby & Diamond Chandelier Earrings", "Серьги-люстры с рубинами и бриллиантами"),
      shortDescription: lt("מפל אבני רובי ויהלום בעיצוב עלים, זהב לבן.", "A cascade of ruby and diamond stones in a leaf design, white gold.", "Каскад рубинов и бриллиантов в форме листьев, белое золото."),
      description: lt("עגילי צ'נדלייר מרשימים עם מפל אבני רובי ויהלום בעיצוב עלים, על זהב לבן — התכשיט לערב הגדול.", "Statement chandelier earrings featuring a cascade of ruby and diamond stones in a leaf design, in white gold — the piece for the big night.", "Впечатляющие серьги-люстры с каскадом рубинов и бриллиантов в форме листьев, белое золото — украшение для особого вечера."),
      price: 449,
      sku: "RDC-224",
      featured: true,
    },
    {
      slug: "sapphire-flower-stud-earrings-large",
      filenames: ["earrings-sapphire-flower-stud-navybox.jpeg"],
      category: earrings,
      name: lt("עגילי פרח ספיר גדולים", "Large Sapphire Flower Stud Earrings", "Крупные серьги-цветок с сапфирами"),
      shortDescription: lt("פרח ספירים ויהלומים גדול, זהב לבן.", "A large sapphire and diamond flower, white gold.", "Крупный цветок из сапфиров и бриллиантов, белое золото."),
      description: lt("עגילי סטאד בעיצוב פרח גדול, עם עלי כותרת ספיר ויהלום, על זהב לבן — הצהרת סטייל אלגנטית.", "Stud earrings in a large flower design, with sapphire and diamond petals, in white gold — an elegant style statement.", "Серьги-гвоздики в форме крупного цветка с лепестками из сапфиров и бриллиантов, белое золото."),
      price: 329,
      sku: "SFL-225",
      featured: true,
    },
    {
      slug: "sapphire-halo-evening-earrings",
      filenames: ["earrings-sapphire-halo-evening-worn.jpeg"],
      category: earrings,
      name: lt("עגילי ספיר הילה לערב", "Sapphire Halo Evening Earrings", "Вечерние серьги с сапфиром в ореоле"),
      shortDescription: lt("ספיר אובלי מוקף יהלומים, תלוי מעלה יהלום, זהב לבן.", "An oval sapphire framed by diamonds, dangling from a diamond cluster, white gold.", "Овальный сапфир в бриллиантовом ореоле на бриллиантовой шапочке."),
      description: lt("עגילים תלויים אלגנטיים עם ספיר אובלי מוקף יהלומים, תלוי מעלה יהלומים קטנה, על זהב לבן.", "Elegant drop earrings featuring an oval sapphire framed by diamonds, dangling from a small diamond cluster, in white gold.", "Элегантные серьги-подвески с овальным сапфиром в бриллиантовом ореоле на маленькой бриллиантовой шапочке, белое золото."),
      price: 259,
      sku: "SHE-226",
    },
    {
      slug: "sapphire-heart-drop-earrings",
      filenames: ["earrings-sapphire-heart-drop-hand.jpeg"],
      category: earrings,
      name: lt("עגילי ספיר לב תלויים", "Sapphire Heart Drop Earrings", "Серьги-подвески с сапфиром-сердцем"),
      shortDescription: lt("ספיר בחיתוך לב מוקף יהלומים, תלוי מעלה יהלומים מרקיז, זהב לבן.", "A heart-cut sapphire framed by diamonds, dangling from a marquise diamond cluster, white gold.", "Сапфир огранки «сердце» в бриллиантовом ореоле на кластере бриллиантов «маркиз»."),
      description: lt("עגילים תלויים רומנטיים עם ספיר בחיתוך לב מוקף יהלומים, תלוי מעלה יהלומים מרקיז, על זהב לבן.", "Romantic drop earrings featuring a heart-cut sapphire framed by diamonds, dangling from a marquise diamond cluster, in white gold.", "Романтичные серьги-подвески с сапфиром-сердцем в бриллиантовом ореоле, белое золото."),
      price: 279,
      sku: "SHD-227",
      featured: true,
    },
  ];

  for (const p of products) {
    const mediaAssets = [];
    for (const filename of p.filenames) {
      mediaAssets.push(await mediaFor(filename, p.name.he));
    }

    const isEternity = p.slug === "diamond-oval-eternity-band-ring";

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
        images: {
          create: mediaAssets.map((m, i) => ({ mediaId: m.id, sortOrder: i, altText: p.name.he })),
        },
        ...(isEternity
          ? {
              variants: {
                create: [
                  { attributes: { color: lt("זהב צהוב", "Yellow Gold", "Жёлтое золото") }, price: p.price, sku: `${p.sku}-YG`, inventory: 2, imageId: mediaAssets[0].id },
                  { attributes: { color: lt("זהב לבן", "White Gold", "Белое золото") }, price: p.price, sku: `${p.sku}-WG`, inventory: 2, imageId: mediaAssets[1].id },
                  { attributes: { color: lt("זהב ורוד", "Rose Gold", "Розовое золото") }, price: p.price, sku: `${p.sku}-RG`, inventory: 2, imageId: mediaAssets[2].id },
                ],
              },
            }
          : {}),
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
