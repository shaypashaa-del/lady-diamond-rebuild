import { Client } from "pg";
import { randomBytes } from "crypto";
import fs from "fs";

function id() {
  return "c" + randomBytes(12).toString("hex");
}

const IMG_DIR = "/brand/catalog6/";

// Each entry: images (1+ filenames, first is primary), category, price,
// sku, and trilingual name/shortDescription/description. Prices follow the
// existing catalog's real range (rings ~53-379₪, bracelets ~249-279₪) —
// scaled toward the upper end for these pieces since they're visibly more
// elaborate (denser pavé, multi-stone settings, wider bands) than the
// catalog average, not priced as if the stones were genuine large diamonds.
const products = [
  // ---------- Bracelets ----------
  {
    images: ["bracelet-oval-diamond-tennis-rose.jpeg"],
    category: "bracelets",
    price: 329,
    sku: "BRT-601",
    name: {
      he: "צמיד טניס יהלומים אובליים — זהב ורוד",
      en: "Oval Diamond Tennis Bracelet — Rose Gold",
      ru: "Теннисный браслет с овальными бриллиantami — розовое золото",
    },
    shortDescription: {
      he: "שורת יהלומים אובליים גרדואליים על צמיד טניס בזהב ורוד.",
      en: "A graduated row of oval diamonds on a rose gold tennis bracelet.",
      ru: "Градуированный ряд овальных бриллиантов на теннисном браслете из розового золота.",
    },
    description: {
      he: "צמיד טניס אלגנטי עם שורת יהלומים אובליים בשיבוץ שיניים, בגימור זהב ורוד מבריק. עיצוב קלאסי שמתאים לכל אירוע.",
      en: "An elegant tennis bracelet featuring a row of prong-set oval diamonds in polished rose gold. A classic design suited to any occasion.",
      ru: "Элегantный теннисный браслет с рядом овальных бриллиантов в крапановой оправе, полированное розовое золото. Классический дизайн для любого случая.",
    },
  },
  {
    images: ["bracelet-pave-diamond-bangle-yellow.jpeg"],
    category: "bracelets",
    price: 259,
    sku: "BRT-602",
    name: {
      he: "צמיד באנגל יהלומי פייבה — זהב צהוב",
      en: "Pavé Diamond Bangle Bracelet — Yellow Gold",
      ru: "Браслет-бэнгл с бриллиантами паве — жёлтое золото",
    },
    shortDescription: {
      he: "צמיד באנגל קשיח עם קו יהלומי פייבה, זהב צהוב.",
      en: "A rigid bangle bracelet with a line of pavé diamonds, yellow gold.",
      ru: "Жёсткий браслет с линией бриллиантов паве, жёлтое золото.",
    },
    description: {
      he: "צמיד באנגל קשיח בגימור זהב צהוב מבריק, עם קו יהלומי פייבה לאורך החלק העליון ומנגנון פתיחה נוח. תכשיט יומיומי שמוסיף נצנוץ עדין.",
      en: "A rigid bangle in polished yellow gold, with a line of pavé diamonds along the top and an easy-open clasp. An everyday piece with subtle sparkle.",
      ru: "Жёсткий браслет из полированного жёлтого золота с линией бриллиантов паве сверху и удобной застёжкой. Повседневное украшение с деликатным блеском.",
    },
  },
  {
    images: ["bracelet-triple-row-diamond-tennis-yellow.jpeg"],
    category: "bracelets",
    price: 379,
    sku: "BRT-603",
    name: {
      he: "צמיד טניס משולש שורות יהלומים — זהב צהוב",
      en: "Triple-Row Diamond Tennis Bracelet — Yellow Gold",
      ru: "Теннисный браслет в три ряда бриллиантов — жёлтое золото",
    },
    shortDescription: {
      he: "שלוש שורות יהלומים צפופות על צמיד זהב צהוב עם אבזם נסתר.",
      en: "Three dense rows of diamonds on a yellow gold bracelet with a hidden clasp.",
      ru: "Три плотных ряда бриллиантов на браслете из жёлтого золота со скрытой застёжкой.",
    },
    description: {
      he: "צמיד טניס עשיר במיוחד עם שלוש שורות יהלומים צפופות לאורך כל ההיקף, בגימור זהב צהוב, ואבזם נסתר עם עיטור לוגו. פריט מרשים לאירועים חגיגיים.",
      en: "A richly detailed tennis bracelet with three dense rows of diamonds all the way around, in yellow gold, with a hidden clasp and logo detail. A statement piece for special occasions.",
      ru: "Роскошный теннисный браслет с тремя плотными рядами бриллиантов по всей длине, жёлтое золото, скрытая застёжка с гравировкой. Эффектное украшение для особых случаев.",
    },
  },
  {
    images: ["bracelet-round-diamond-tennis-white.jpeg"],
    category: "bracelets",
    price: 299,
    sku: "BRT-604",
    name: {
      he: "צמיד טניס יהלומים עגולים — זהב לבן",
      en: "Round Diamond Tennis Bracelet — White Gold",
      ru: "Теннисный браслет с круглыми бриллиантами — белое золото",
    },
    shortDescription: {
      he: "צמיד טניס קלאסי עם יהלומים עגולים בשיבוץ שיניים, זהב לבן.",
      en: "A classic tennis bracelet with prong-set round diamonds, white gold.",
      ru: "Классический теннисный браслет с круглыми бриллиантами в крапановой оправе, белое золото.",
    },
    description: {
      he: "צמיד טניס נצחי עם שורת יהלומים עגולים אחידה בשיבוץ שיניים, על בסיס זהב לבן. הבחירה הבטוחה לכל ארון תכשיטים.",
      en: "A timeless tennis bracelet with an even row of prong-set round diamonds, in white gold. The safe choice for any jewelry box.",
      ru: "Вечная классика — теннисный браслет с ровным рядом круглых бриллиантов в крапановой оправе, белое золото. Надёжный выбор для любой шкатулки.",
    },
  },

  // ---------- Rings ----------
  {
    images: ["ring-two-pear-diamond-open-cuff-white.jpeg"],
    category: "rings",
    price: 289,
    sku: "RNG-611",
    name: {
      he: "טבעת פתוחה שני יהלומי פיר — זהב לבן",
      en: "Two-Stone Pear Diamond Open Ring — White Gold",
      ru: "Открытое кольцо с двумя бриллиантами груша — белое золото",
    },
    shortDescription: {
      he: "שני יהלומי פיר בקצוות טבעת פתוחה עם כתפיים משובצות, זהב לבן.",
      en: "Two pear-cut diamonds at the ends of an open band with pavé shoulders, white gold.",
      ru: "Два бриллианта огранки груша на концах открытого кольца с паве, белое золото.",
    },
    description: {
      he: "עיצוב מודרני עם שני יהלומי פיר הפונים זה לזה בקצוות טבעת פתוחה, כשהכתפיים משובצות יהלומים קטנים לאורך כל ההיקף. זהב לבן מלוטש.",
      en: "A modern design with two pear-cut diamonds facing each other at the ends of an open band, the shoulders pavé-set with smaller diamonds all around. Polished white gold.",
      ru: "Современный дизайн: два бриллианта груша, обращённые друг к другу на концах открытого кольца, плечики украшены паве по всей длине. Полированное белое золото.",
    },
  },
  {
    images: ["ring-round-diamond-halo-yellow.jpeg"],
    category: "rings",
    price: 259,
    sku: "RNG-612",
    name: {
      he: "טבעת הילה יהלום עגול — זהב צהוב",
      en: "Round Diamond Halo Ring — Yellow Gold",
      ru: "Кольцо с бриллиантом круглой огранки в ореоле — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי מוקף הילת יהלומים, זהב צהוב.",
      en: "A central round diamond surrounded by a diamond halo, yellow gold.",
      ru: "Центральный круглый бриллиант в ореоле из бриллиантов, жёлтое золото.",
    },
    description: {
      he: "טבעת אירוסין קלאסית עם יהלום עגול מרכזי מוקף הילת יהלומים קטנים, וכתפיים משובצות לאורך הטבעת. זהב צהוב 14K.",
      en: "A classic engagement ring with a central round diamond surrounded by a halo of smaller diamonds, and pavé shoulders along the band. 14K yellow gold.",
      ru: "Классическое обручальное кольцо с центральным круглым бриллиантом в ореоле из более мелких бриллиантов и паве на плечиках. Жёлтое золото 14К.",
    },
  },
  {
    images: ["ring-oval-diamond-halo-rose.jpeg"],
    category: "rings",
    price: 259,
    sku: "RNG-613",
    name: {
      he: "טבעת הילה יהלום אובלי — זהב ורוד",
      en: "Oval Diamond Halo Ring — Rose Gold",
      ru: "Кольцо с овальным бриллиантом в ореоле — розовое золото",
    },
    shortDescription: {
      he: "יהלום אובלי מרכזי מוקף הילת יהלומים, זהב ורוד.",
      en: "A central oval diamond surrounded by a diamond halo, rose gold.",
      ru: "Центральный овальный бриллиант в ореоле из бриллиантов, розовое золото.",
    },
    description: {
      he: "טבעת אירוסין רומנטית עם יהלום אובלי מרכזי מוקף הילת יהלומים, וכתפיים משובצות. זהב ורוד 14K.",
      en: "A romantic engagement ring with a central oval diamond surrounded by a diamond halo, and pavé shoulders. 14K rose gold.",
      ru: "Романтичное обручальное кольцо с центральным овальным бриллиантом в ореоле и паве на плечиках. Розовое золото 14К.",
    },
  },
  {
    images: ["ring-pear-diamond-split-shank-white.jpeg"],
    category: "rings",
    price: 279,
    sku: "RNG-614",
    name: {
      he: "טבעת יהלום פיר כתפיים כפולות — זהב לבן",
      en: "Pear-Cut Diamond Split Shank Ring — White Gold",
      ru: "Кольцо с бриллиантом груша и раздвоенным шинком — белое золото",
    },
    shortDescription: {
      he: "יהלום פיר מרכזי על טבעת כתפיים כפולות משובצות, זהב לבן.",
      en: "A central pear-cut diamond on a split-shank pavé band, white gold.",
      ru: "Центральный бриллиант груша на кольце с раздвоенным шинком паве, белое золото.",
    },
    description: {
      he: "טבעת אירוסין מודרנית עם יהלום פיר מרכזי, על בסיס כתפיים כפולות (split shank) משובצות יהלומים קטנים לאורך כל ההיקף. זהב לבן.",
      en: "A modern engagement ring with a central pear-cut diamond on a split-shank band, pavé-set with smaller diamonds all around. White gold.",
      ru: "Современное обручальное кольцо с центральным бриллиантом груша на раздвоенном шинке, паве по всей длине. Белое золото.",
    },
  },
  {
    images: ["ring-emerald-cut-three-stone-white.jpeg"],
    category: "rings",
    price: 299,
    sku: "RNG-615",
    name: {
      he: "טבעת שלישיית יהלומים חיתוך אמרלד — זהב לבן",
      en: "Emerald-Cut Three-Stone Diamond Ring — White Gold",
      ru: "Кольцо из трёх бриллиантов изумрудной огранки — белое золото",
    },
    shortDescription: {
      he: "יהלום אמרלד מרכזי לצד שני יהלומי באגט טרפז, זהב לבן.",
      en: "A central emerald-cut diamond flanked by two tapered baguette diamonds, white gold.",
      ru: "Центральный бриллиант изумрудной огранки в окружении двух трапециевидных багетов, белое золото.",
    },
    description: {
      he: "טבעת שלישייה קלאסית עם יהלום אמרלד מרכזי לצד שני יהלומי באגט טרפז, על בסיס משובץ יהלומים. זהב לבן 14K.",
      en: "A classic three-stone ring with a central emerald-cut diamond flanked by two tapered baguette diamonds, on a pavé band. 14K white gold.",
      ru: "Классическое кольцо из трёх камней: центральный бриллиант изумрудной огранки и два трапециевидных багета по бокам, паве на шинке. Белое золото 14К.",
    },
  },
  {
    images: ["ring-emerald-cut-three-stone-yellow.jpeg"],
    category: "rings",
    price: 299,
    sku: "RNG-616",
    name: {
      he: "טבעת שלישיית יהלומים חיתוך אמרלד — זהב צהוב",
      en: "Emerald-Cut Three-Stone Diamond Ring — Yellow Gold",
      ru: "Кольцо из трёх бриллиантов изумрудной огранки — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום אמרלד מרכזי לצד שני יהלומי באגט טרפז, זהב צהוב.",
      en: "A central emerald-cut diamond flanked by two tapered baguette diamonds, yellow gold.",
      ru: "Центральный бриллиант изумрудной огранки в окружении двух трапециевидных багетов, жёлтое золото.",
    },
    description: {
      he: "טבעת שלישייה קלאסית עם יהלום אמרלד מרכזי לצד שני יהלומי באגט טרפז, על בסיס משובץ יהלומים. זהב צהוב 14K.",
      en: "A classic three-stone ring with a central emerald-cut diamond flanked by two tapered baguette diamonds, on a pavé band. 14K yellow gold.",
      ru: "Классическое кольцо из трёх камней: центральный бриллиант изумрудной огранки и два трапециевидных багета по бокам, паве на шинке. Жёлтое золото 14К.",
    },
  },
  {
    images: ["ring-emerald-cut-three-stone-rose.jpeg"],
    category: "rings",
    price: 299,
    sku: "RNG-617",
    name: {
      he: "טבעת שלישיית יהלומים חיתוך אמרלד — זהב ורוד",
      en: "Emerald-Cut Three-Stone Diamond Ring — Rose Gold",
      ru: "Кольцо из трёх бриллиантов изумрудной огранки — розовое золото",
    },
    shortDescription: {
      he: "יהלום אמרלד מרכזי לצד שני יהלומי באגט טרפז, זהב ורוד.",
      en: "A central emerald-cut diamond flanked by two tapered baguette diamonds, rose gold.",
      ru: "Центральный бриллиант изумрудной огранки в окружении двух трапециевидных багетов, розовое золото.",
    },
    description: {
      he: "טבעת שלישייה קלאסית עם יהלום אמרלד מרכזי לצד שני יהלומי באגט טרפז, על בסיס משובץ יהלומים. זהב ורוד 14K.",
      en: "A classic three-stone ring with a central emerald-cut diamond flanked by two tapered baguette diamonds, on a pavé band. 14K rose gold.",
      ru: "Классическое кольцо из трёх камней: центральный бриллиант изумрудной огранки и два трапециевидных багета по бокам, паве на шинке. Розовое золото 14К.",
    },
  },
  {
    images: ["ring-cushion-double-halo-milgrain-white.jpeg"],
    category: "rings",
    price: 289,
    sku: "RNG-618",
    name: {
      he: "טבעת הילה כפולה כרית מילגריין — זהב לבן",
      en: "Cushion-Cut Double Halo Diamond Ring — White Gold",
      ru: "Кольцо с бриллиантом кушон в двойном ореоле — белое золото",
    },
    shortDescription: {
      he: "יהלום כרית מרכזי בהילה כפולה עם עיטור מילגריין, זהב לבן.",
      en: "A central cushion-cut diamond in a double halo with milgrain detail, white gold.",
      ru: "Центральный бриллиант кушон в двойном ореоле с миллегрейном, белое золото.",
    },
    description: {
      he: "טבעת וינטג' עדינה עם יהלום כרית מרכזי מוקף הילה כפולה ועיטור מילגריין קלאסי, על כתפיים משובצות. זהב לבן.",
      en: "A delicate vintage-inspired ring with a central cushion-cut diamond surrounded by a double halo and classic milgrain detailing, on pavé shoulders. White gold.",
      ru: "Изящное кольцо в винтажном стиле: центральный бриллиант кушон в двойном ореоле с классическим миллегрейном, паве на плечиках. Белое золото.",
    },
  },
  {
    images: ["ring-marquise-bezel-yellow.jpeg", "ring-marquise-bezel-solitaire-yellow.jpeg"],
    category: "rings",
    price: 239,
    sku: "RNG-619",
    name: {
      he: "טבעת מרקיז משובצת לונטה — זהב צהוב",
      en: "Marquise Diamond Bezel Ring — Yellow Gold",
      ru: "Кольцо с бриллиантом маркиз в оправе безель — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום מרקיז בשיבוץ לונטה על כתפיים משובצות, זהב צהוב.",
      en: "A bezel-set marquise diamond on a pavé band, yellow gold.",
      ru: "Бриллиант маркиз в оправе безель на кольце с паве, жёлтое золото.",
    },
    description: {
      he: "טבעת ייחודית עם יהלום מרקיז בשיבוץ לונטה מלא, על כתפיים משובצות יהלומים קטנים לכל האורך. זהב צהוב.",
      en: "A distinctive ring with a fully bezel-set marquise diamond, on shoulders pavé-set with smaller diamonds all around. Yellow gold.",
      ru: "Оригинальное кольцо с бриллиантом маркиз в полной оправе безель, паве на плечиках по всей длине. Жёлтое золото.",
    },
  },
  {
    images: ["ring-cushion-double-halo-milgrain-rose.jpeg"],
    category: "rings",
    price: 289,
    sku: "RNG-620",
    name: {
      he: "טבעת הילה כפולה כרית מילגריין — זהב ורוד",
      en: "Cushion-Cut Double Halo Diamond Ring — Rose Gold",
      ru: "Кольцо с бриллиантом кушон в двойном ореоле — розовое золото",
    },
    shortDescription: {
      he: "יהלום כרית מרכזי בהילה כפולה עם עיטור מילגריין, זהב ורוד.",
      en: "A central cushion-cut diamond in a double halo with milgrain detail, rose gold.",
      ru: "Центральный бриллиант кушон в двойном ореоле с миллегрейном, розовое золото.",
    },
    description: {
      he: "טבעת וינטג' עדינה עם יהלום כרית מרכזי מוקף הילה כפולה ועיטור מילגריין קלאסי, על כתפיים משובצות. זהב ורוד.",
      en: "A delicate vintage-inspired ring with a central cushion-cut diamond surrounded by a double halo and classic milgrain detailing, on pavé shoulders. Rose gold.",
      ru: "Изящное кольцо в винтажном стиле: центральный бриллиант кушон в двойном ореоле с классическим миллегрейном, паве на плечиках. Розовое золото.",
    },
  },
  {
    images: ["ring-cushion-double-halo-milgrain-yellow.jpeg"],
    category: "rings",
    price: 289,
    sku: "RNG-621",
    name: {
      he: "טבעת הילה כפולה כרית מילגריין — זהב צהוב",
      en: "Cushion-Cut Double Halo Diamond Ring — Yellow Gold",
      ru: "Кольцо с бриллиантом кушон в двойном ореоле — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום כרית מרכזי בהילה כפולה עם עיטור מילגריין, זהב צהוב.",
      en: "A central cushion-cut diamond in a double halo with milgrain detail, yellow gold.",
      ru: "Центральный бриллиант кушон в двойном ореоле с миллегрейном, жёлтое золото.",
    },
    description: {
      he: "טבעת וינטג' עדינה עם יהלום כרית מרכזי מוקף הילה כפולה ועיטור מילגריין קלאסי, על כתפיים משובצות. זהב צהוב.",
      en: "A delicate vintage-inspired ring with a central cushion-cut diamond surrounded by a double halo and classic milgrain detailing, on pavé shoulders. Yellow gold.",
      ru: "Изящное кольцо в винтажном стиле: центральный бриллиант кушон в двойном ореоле с классическим миллегрейном, паве на плечиках. Жёлтое золото.",
    },
  },
  {
    images: ["ring-marquise-bezel-split-shank-white.jpeg"],
    category: "rings",
    price: 249,
    sku: "RNG-622",
    name: {
      he: "טבעת מרקיז כתפיים כפולות — זהב לבן",
      en: "Marquise Diamond Split Shank Ring — White Gold",
      ru: "Кольцо с бриллиантом маркиз и раздвоенным шинком — белое золото",
    },
    shortDescription: {
      he: "יהלום מרקיז בשיבוץ לונטה על כתפיים כפולות משובצות, זהב לבן.",
      en: "A bezel-set marquise diamond on a split-shank pavé band, white gold.",
      ru: "Бриллиант маркиз в оправе безель на раздвоенном шинке с паве, белое золото.",
    },
    description: {
      he: "טבעת מודרנית עם יהלום מרקיז בשיבוץ לונטה, על בסיס כתפיים כפולות (split shank) משובצות יהלומים. זהב לבן.",
      en: "A modern ring with a bezel-set marquise diamond, on a split-shank band pavé-set with diamonds. White gold.",
      ru: "Современное кольцо с бриллиантом маркиз в оправе безель на раздвоенном шинке с паве. Белое золото.",
    },
  },
  {
    images: ["ring-marquise-bezel-split-shank-rose.jpeg"],
    category: "rings",
    price: 249,
    sku: "RNG-623",
    name: {
      he: "טבעת מרקיז כתפיים כפולות — זהב ורוד",
      en: "Marquise Diamond Split Shank Ring — Rose Gold",
      ru: "Кольцо с бриллиантом маркиз и раздвоенным шинком — розовое золото",
    },
    shortDescription: {
      he: "יהלום מרקיז בשיבוץ לונטה על כתפיים כפולות משובצות, זהב ורוד.",
      en: "A bezel-set marquise diamond on a split-shank pavé band, rose gold.",
      ru: "Бриллиант маркиз в оправе безель на раздвоенном шинке с паве, розовое золото.",
    },
    description: {
      he: "טבעת מודרנית עם יהלום מרקיז בשיבוץ לונטה, על בסיס כתפיים כפולות (split shank) משובצות יהלומים. זהב ורוד.",
      en: "A modern ring with a bezel-set marquise diamond, on a split-shank band pavé-set with diamonds. Rose gold.",
      ru: "Современное кольцо с бриллиантом маркиз в оправе безель на раздвоенном шинке с паве. Розовое золото.",
    },
  },
  {
    images: ["ring-marquise-bezel-split-shank-yellow.jpeg"],
    category: "rings",
    price: 249,
    sku: "RNG-624",
    name: {
      he: "טבעת מרקיז כתפיים כפולות — זהב צהוב",
      en: "Marquise Diamond Split Shank Ring — Yellow Gold",
      ru: "Кольцо с бриллиантом маркиз и раздвоенным шинком — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום מרקיז בשיבוץ לונטה על כתפיים כפולות משובצות, זהב צהוב.",
      en: "A bezel-set marquise diamond on a split-shank pavé band, yellow gold.",
      ru: "Бриллиант маркиз в оправе безель на раздвоенном шинке с паве, жёлтое золото.",
    },
    description: {
      he: "טבעת מודרנית עם יהלום מרקיז בשיבוץ לונטה, על בסיס כתפיים כפולות (split shank) משובצות יהלומים. זהב צהוב.",
      en: "A modern ring with a bezel-set marquise diamond, on a split-shank band pavé-set with diamonds. Yellow gold.",
      ru: "Современное кольцо с бриллиантом маркиз в оправе безель на раздвоенном шинке с паве. Жёлтое золото.",
    },
  },
  {
    images: ["ring-toi-et-moi-pear-white.jpeg"],
    category: "rings",
    price: 269,
    sku: "RNG-625",
    name: {
      he: "טבעת טואה את מואה יהלומי פיר — זהב לבן",
      en: "Toi et Moi Pear Diamond Ring — White Gold",
      ru: "Кольцо Toi et Moi с бриллиантами груша — белое золото",
    },
    shortDescription: {
      he: "שני יהלומי פיר זה מול זה בעיצוב טואה את מואה, זהב לבן.",
      en: "Two pear-cut diamonds facing each other in a toi et moi design, white gold.",
      ru: "Два бриллианта груша друг напротив друга в стиле Toi et Moi, белое золото.",
    },
    description: {
      he: "עיצוב טואה את מואה רומנטי עם שני יהלומי פיר בגדלים שונים הפונים זה לזה, על כתפיים משובצות. זהב לבן.",
      en: "A romantic toi et moi design with two differently sized pear-cut diamonds facing each other, on pavé shoulders. White gold.",
      ru: "Романтичный дизайн Toi et Moi с двумя бриллиантами груша разного размера, обращёнными друг к другу, паве на плечиках. Белое золото.",
    },
  },
  {
    images: ["ring-round-trellis-three-stone-white.jpeg"],
    category: "rings",
    price: 279,
    sku: "RNG-626",
    name: {
      he: "טבעת שלישיית יהלומים עגולים על משטח — זהב לבן",
      en: "Round Diamond Trellis Three-Stone Ring — White Gold",
      ru: "Кольцо из трёх круглых бриллиантов на решётчатой оправе — белое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי לצד שני יהלומים קטנים, שיבוץ משטח, זהב לבן.",
      en: "A central round diamond flanked by two smaller round diamonds on a trellis setting, white gold.",
      ru: "Центральный круглый бриллиант в окружении двух меньших бриллиантов на решётчатой оправе, белое золото.",
    },
    description: {
      he: "טבעת שלישייה קלאסית עם יהלום עגול מרכזי לצד שני יהלומים קטנים יותר, בשיבוץ משטח (trellis) על כתפיים משובצות. זהב לבן.",
      en: "A classic three-stone ring with a central round diamond flanked by two smaller round diamonds, in a trellis setting on pavé shoulders. White gold.",
      ru: "Классическое кольцо из трёх камней: центральный круглый бриллиант в окружении двух меньших, решётчатая оправа, паве на плечиках. Белое золото.",
    },
  },
  {
    images: ["ring-round-trellis-three-stone-rose.jpeg"],
    category: "rings",
    price: 279,
    sku: "RNG-627",
    name: {
      he: "טבעת שלישיית יהלומים עגולים על משטח — זהב ורוד",
      en: "Round Diamond Trellis Three-Stone Ring — Rose Gold",
      ru: "Кольцо из трёх круглых бриллиантов на решётчатой оправе — розовое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי לצד שני יהלומים קטנים, שיבוץ משטח, זהב ורוד.",
      en: "A central round diamond flanked by two smaller round diamonds on a trellis setting, rose gold.",
      ru: "Центральный круглый бриллиант в окружении двух меньших бриллиантов на решётчатой оправе, розовое золото.",
    },
    description: {
      he: "טבעת שלישייה קלאסית עם יהלום עגול מרכזי לצד שני יהלומים קטנים יותר, בשיבוץ משטח (trellis) על כתפיים משובצות. זהב ורוד.",
      en: "A classic three-stone ring with a central round diamond flanked by two smaller round diamonds, in a trellis setting on pavé shoulders. Rose gold.",
      ru: "Классическое кольцо из трёх камней: центральный круглый бриллиант в окружении двух меньших, решётчатая оправа, паве на плечиках. Розовое золото.",
    },
  },
  {
    images: ["ring-round-trellis-three-stone-yellow.jpeg"],
    category: "rings",
    price: 279,
    sku: "RNG-628",
    name: {
      he: "טבעת שלישיית יהלומים עגולים על משטח — זהב צהוב",
      en: "Round Diamond Trellis Three-Stone Ring — Yellow Gold",
      ru: "Кольцо из трёх круглых бриллиантов на решётчатой оправе — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי לצד שני יהלומים קטנים, שיבוץ משטח, זהב צהוב.",
      en: "A central round diamond flanked by two smaller round diamonds on a trellis setting, yellow gold.",
      ru: "Центральный круглый бриллиант в окружении двух меньших бриллиантов на решётчатой оправе, жёлтое золото.",
    },
    description: {
      he: "טבעת שלישייה קלאסית עם יהלום עגול מרכזי לצד שני יהלומים קטנים יותר, בשיבוץ משטח (trellis) על כתפיים משובצות. זהב צהוב.",
      en: "A classic three-stone ring with a central round diamond flanked by two smaller round diamonds, in a trellis setting on pavé shoulders. Yellow gold.",
      ru: "Классическое кольцо из трёх камней: центральный круглый бриллиант в окружении двух меньших, решётчатая оправа, паве на плечиках. Жёлтое золото.",
    },
  },
  {
    images: ["ring-toi-et-moi-pear-yellow.jpeg"],
    category: "rings",
    price: 269,
    sku: "RNG-629",
    name: {
      he: "טבעת טואה את מואה יהלומי פיר — זהב צהוב",
      en: "Toi et Moi Pear Diamond Ring — Yellow Gold",
      ru: "Кольцо Toi et Moi с бриллиантами груша — жёлтое золото",
    },
    shortDescription: {
      he: "שני יהלומי פיר זה מול זה בעיצוב טואה את מואה, זהב צהוב.",
      en: "Two pear-cut diamonds facing each other in a toi et moi design, yellow gold.",
      ru: "Два бриллианта груша друг напротив друга в стиле Toi et Moi, жёлтое золото.",
    },
    description: {
      he: "עיצוב טואה את מואה רומנטי עם שני יהלומי פיר בגדלים שונים הפונים זה לזה, על כתפיים משובצות. זהב צהוב.",
      en: "A romantic toi et moi design with two differently sized pear-cut diamonds facing each other, on pavé shoulders. Yellow gold.",
      ru: "Романтичный дизайн Toi et Moi с двумя бриллиантами груша разного размера, обращёнными друг к другу, паве на плечиках. Жёлтое золото.",
    },
  },
  {
    images: ["ring-toi-et-moi-pear-trillion-rose.jpeg"],
    category: "rings",
    price: 269,
    sku: "RNG-630",
    name: {
      he: "טבעת טואה את מואה פיר וטריליון — זהב ורוד",
      en: "Toi et Moi Pear & Trillion Diamond Ring — Rose Gold",
      ru: "Кольцо Toi et Moi груша и триллион — розовое золото",
    },
    shortDescription: {
      he: "יהלום פיר ויהלום טריליון בעיצוב טואה את מואה, זהב ורוד.",
      en: "A pear-cut and a trillion-cut diamond in a toi et moi design, rose gold.",
      ru: "Бриллиант груша и бриллиант триллион в дизайне Toi et Moi, розовое золото.",
    },
    description: {
      he: "עיצוב טואה את מואה ייחודי המשלב יהלום פיר ויהלום טריליון זה לצד זה, על כתפיים משובצות. זהב ורוד.",
      en: "A distinctive toi et moi design pairing a pear-cut diamond with a trillion-cut diamond side by side, on pavé shoulders. Rose gold.",
      ru: "Оригинальный дизайн Toi et Moi, сочетающий бриллиант груша и бриллиант триллион рядом, паве на плечиках. Розовое золото.",
    },
  },
  {
    images: ["ring-infinity-twist-solitaire-white.jpeg"],
    category: "rings",
    price: 249,
    sku: "RNG-631",
    name: {
      he: "טבעת סוליטר אינסוף שזור — זהב לבן",
      en: "Infinity Twist Diamond Solitaire Ring — White Gold",
      ru: "Кольцо-солитер с переплетением бесконечности — белое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי על בסיס שזור בצורת אינסוף, זהב לבן.",
      en: "A central round diamond on an infinity-twist band, white gold.",
      ru: "Центральный круглый бриллиант на переплетённом кольце в форме бесконечности, белое золото.",
    },
    description: {
      he: "טבעת סוליטר מיוחדת עם יהלום עגול מרכזי, על בסיס שזור בצורת אינסוף עם קווי יהלומים משני צדדיו. זהב לבן.",
      en: "A distinctive solitaire ring with a central round diamond, on an infinity-twist band lined with diamonds on both sides. White gold.",
      ru: "Оригинальное кольцо-солитер с центральным круглым бриллиантом на переплетённом кольце в форме бесконечности с бриллиантовыми дорожками. Белое золото.",
    },
  },
  {
    images: ["ring-eternity-round-emerald-white.jpeg", "ring-eternity-round-emerald-white-2.jpeg"],
    category: "rings",
    price: 259,
    sku: "RNG-632",
    name: {
      he: "טבעת נצח יהלומים עגולים ואמרלד — זהב לבן",
      en: "Round & Emerald-Cut Diamond Eternity Band — White Gold",
      ru: "Кольцо-дорожка с круглыми и изумрудными бриллиантами — белое золото",
    },
    shortDescription: {
      he: "יהלומים עגולים ואמרלד לסירוגין לאורך כל הטבעת, זהב לבן.",
      en: "Alternating round and emerald-cut diamonds all the way around, white gold.",
      ru: "Чередующиеся круглые и изумрудные бриллианты по всей окружности, белое золото.",
    },
    description: {
      he: "טבעת נצח עשירה עם יהלומים עגולים ויהלומי אמרלד לסירוגין, המקיפים את הטבעת כולה. זהב לבן.",
      en: "A rich eternity band with alternating round and emerald-cut diamonds encircling the entire ring. White gold.",
      ru: "Роскошное кольцо-дорожка с чередующимися круглыми и изумрудными бриллиантами по всей окружности. Белое золото.",
    },
  },
  {
    images: ["ring-eternity-round-emerald-yellow.jpeg"],
    category: "rings",
    price: 259,
    sku: "RNG-633",
    name: {
      he: "טבעת נצח יהלומים עגולים ואמרלד — זהב צהוב",
      en: "Round & Emerald-Cut Diamond Eternity Band — Yellow Gold",
      ru: "Кольцо-дорожка с круглыми и изумрудными бриллиантами — жёлтое золото",
    },
    shortDescription: {
      he: "יהלומים עגולים ואמרלד לסירוגין לאורך כל הטבעת, זהב צהוב.",
      en: "Alternating round and emerald-cut diamonds all the way around, yellow gold.",
      ru: "Чередующиеся круглые и изумрудные бриллианты по всей окружности, жёлтое золото.",
    },
    description: {
      he: "טבעת נצח עשירה עם יהלומים עגולים ויהלומי אמרלד לסירוגין, המקיפים את הטבעת כולה. זהב צהוב.",
      en: "A rich eternity band with alternating round and emerald-cut diamonds encircling the entire ring. Yellow gold.",
      ru: "Роскошное кольцо-дорожка с чередующимися круглыми и изумрудными бриллиантами по всей окружности. Жёлтое золото.",
    },
  },
  {
    images: ["ring-crossover-solitaire-rose.jpeg"],
    category: "rings",
    price: 249,
    sku: "RNG-634",
    name: {
      he: "טבעת סוליטר חוצה — זהב ורוד",
      en: "Crossover Diamond Solitaire Ring — Rose Gold",
      ru: "Кольцо-солитер с перекрёстным шинком — розовое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי על בסיס חוצה ומשובץ, זהב ורוד.",
      en: "A central round diamond on a crossover pavé band, rose gold.",
      ru: "Центральный круглый бриллиант на перекрёстном кольце с паве, розовое золото.",
    },
    description: {
      he: "טבעת עדינה עם יהלום עגול מרכזי, על בסיס חוצה משובץ יהלומים משני צדדיו. זהב ורוד.",
      en: "A delicate ring with a central round diamond, on a crossover band pavé-set with diamonds on both sides. Rose gold.",
      ru: "Изящное кольцо с центральным круглым бриллиантом на перекрёстном шинке с паве с обеих сторон. Розовое золото.",
    },
  },
  {
    images: ["ring-crossover-halo-triple-band-yellow.jpeg"],
    category: "rings",
    price: 289,
    sku: "RNG-635",
    name: {
      he: "טבעת הילה משולשת רצועות חוצות — זהב צהוב",
      en: "Crossover Triple Band Halo Ring — Yellow Gold",
      ru: "Кольцо с ореолом и тройным перекрёстным шинком — жёлтое золото",
    },
    shortDescription: {
      he: "יהלום עגול מרכזי בהילה, על שלוש רצועות חוצות משובצות, זהב צהוב.",
      en: "A central round diamond in a halo, on three crossover pavé bands, yellow gold.",
      ru: "Центральный круглый бриллиант в ореоле на трёх перекрёстных дорожках паве, жёлтое золото.",
    },
    description: {
      he: "טבעת עשירה ומיוחדת עם יהלום עגול מרכזי בהילה, על שלוש רצועות זהב חוצות ומשובצות יהלומים. זהב צהוב.",
      en: "A rich, distinctive ring with a central round diamond in a halo, on three intertwined gold bands pavé-set with diamonds. Yellow gold.",
      ru: "Роскошное оригинальное кольцо с центральным бриллиантом в ореоле на трёх переплетённых золотых дорожках с паве. Жёлтое золото.",
    },
  },
];

async function main() {
  const databaseUrl = fs
    .readFileSync(new URL("../.env", import.meta.url), "utf-8")
    .match(/DATABASE_URL="([^"]+)"/)[1];
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const catRes = await client.query('SELECT id, slug FROM "Category"');
  const catBySlug = Object.fromEntries(catRes.rows.map((r) => [r.slug, r.id]));

  let created = 0;
  for (const p of products) {
    const productId = id();
    const slug = p.sku.toLowerCase() + "-" + p.name.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

    await client.query(
      `INSERT INTO "Product" (id, name, slug, description, "shortDescription", "basePrice", sku, inventory, "trackInventory", status, "isFeatured", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,'PUBLISHED',false,now(),now())`,
      [productId, JSON.stringify(p.name), slug, JSON.stringify(p.description), JSON.stringify(p.shortDescription), p.price, p.sku, 5]
    );

    await client.query(
      `INSERT INTO "ProductCategory" ("productId", "categoryId") VALUES ($1,$2)`,
      [productId, catBySlug[p.category]]
    );

    for (let i = 0; i < p.images.length; i++) {
      const filename = p.images[i];
      const mediaId = id();
      await client.query(
        `INSERT INTO "MediaAsset" (id, url, filename, "createdAt") VALUES ($1,$2,$3,now())`,
        [mediaId, IMG_DIR + filename, filename]
      );
      await client.query(
        `INSERT INTO "ProductImage" (id, "productId", "mediaId", "sortOrder", "altText") VALUES ($1,$2,$3,$4,$5)`,
        [id(), productId, mediaId, i, p.name.he]
      );
    }

    created++;
    console.log(`✓ ${p.sku}  ${p.name.he}  (${p.images.length} img)`);
  }

  console.log(`\nCreated ${created} products.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
