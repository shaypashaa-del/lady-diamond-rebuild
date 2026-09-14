import { PrismaClient, ProductStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

async function main() {
  console.log("Seeding categories...");

  const categories = [
    {
      slug: "earrings",
      name: lt("עגילים", "Earrings", "Серьги"),
      description: lt(
        "עגילים עדינים בזהב וכסף, ללבישה יומיומית.",
        "Delicate gold and silver earrings for everyday wear.",
        "Изящные серьги из золота и серебра для повседневной носки."
      ),
      sortOrder: 1,
    },
    {
      slug: "rings",
      name: lt("טבעות", "Rings", "Кольца"),
      description: lt(
        "טבעות מינימליסטיות בזהב ובכסף 925.",
        "Minimalist rings in gold and 925 silver.",
        "Минималистичные кольца из золота и серебра 925 пробы."
      ),
      sortOrder: 2,
    },
    {
      slug: "bracelets",
      name: lt("צמידים", "Bracelets", "Браслеты"),
      description: lt(
        "צמידים דקים המשתלבים מצוין יחד.",
        "Fine bracelets that stack beautifully together.",
        "Тонкие браслеты, которые прекрасно сочетаются между собой."
      ),
      sortOrder: 3,
    },
    {
      slug: "necklaces",
      name: lt("שרשראות", "Necklaces", "Колье"),
      description: lt(
        "שרשראות ותליונים, מהעדין ועד המרשים.",
        "Necklaces and pendants, from delicate to statement.",
        "Колье и подвески — от лёгких до заметных."
      ),
      sortOrder: 4,
    },
  ];

  const categoryBySlug: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: c,
    });
    categoryBySlug[c.slug] = created.id;
  }

  console.log("Seeding products...");

  type SeedProduct = {
    slug: string;
    name: LT;
    shortDescription: LT;
    description: LT;
    basePrice: number;
    salePrice?: number;
    sku: string;
    category: string;
    isFeatured?: boolean;
    variants?: { attributes: { color: LT }; price: number; sku: string }[];
  };

  const products: SeedProduct[] = [
    {
      slug: "circle-necklace",
      name: lt("שרשרת עיגול", "Circle Necklace", "Колье «Круг»"),
      shortDescription: lt(
        "תליון עיגול דק, לזהב או לכסף, מושלם לשכבות.",
        "A slim circle pendant in gold or silver, made for everyday layering.",
        "Тонкая подвеска-круг из золота или серебра для многослойности."
      ),
      description: lt(
        "שרשרת עדינה עם תליון עיגול, מיוצרת מכסף 925 עם ציפוי זהב אופציונלי. משקל כ-0.3 ק\"ג.",
        "A delicate chain with a circle pendant, made from 925 silver with an optional gold plating. Weighs about 0.3kg.",
        "Тонкая цепочка с подвеской-кругом из серебра 925 пробы с опциональным золотым покрытием. Вес около 0,3 кг."
      ),
      basePrice: 52,
      sku: "021",
      category: "necklaces",
      isFeatured: true,
      variants: [
        { attributes: { color: lt("זהב", "Gold", "Золото") }, price: 52, sku: "021-G" },
        { attributes: { color: lt("כסף", "Silver", "Серебро") }, price: 52, sku: "021-S" },
      ],
    },
    {
      slug: "small-earrings",
      name: lt("עגילים קטנים", "Small Earrings", "Маленькие серьги"),
      shortDescription: lt(
        "עגילי סטאד עדינים שמאירים בלי להכביד.",
        "Understated studs that catch the light without saying too much.",
        "Скромные серьги-гвоздики, которые красиво ловят свет."
      ),
      description: lt(
        "עגילי סטאד קלאסיים, מתאימים ללבישה יומיומית לצד כל אאוטפיט.",
        "Classic stud earrings, suited for everyday wear with any outfit.",
        "Классические серьги-гвоздики для повседневной носки с любым образом."
      ),
      basePrice: 46,
      sku: "032",
      category: "earrings",
      isFeatured: true,
    },
    {
      slug: "circle-earrings",
      name: lt("עגילי עיגול", "Circle Earrings", "Серьги «Круг»"),
      shortDescription: lt(
        "הזוג התואם לשרשרת העיגול, בזהב או בכסף.",
        "The circle pendant's matching pair, sold in gold or silver.",
        "Пара к колье «Круг», доступна в золоте или серебре."
      ),
      description: lt(
        "עגילי עיגול תואמים לשרשרת, זמינים בזהב או בכסף.",
        "Circle earrings matching the necklace, available in gold or silver.",
        "Серьги-круг в тон колье, доступны в золоте или серебре."
      ),
      basePrice: 56,
      sku: "033",
      category: "earrings",
      isFeatured: true,
      variants: [
        { attributes: { color: lt("זהב", "Gold", "Золото") }, price: 56, sku: "033-G" },
        { attributes: { color: lt("כסף", "Silver", "Серебро") }, price: 56, sku: "033-S" },
      ],
    },
    {
      slug: "heart-bracelet",
      name: lt("צמיד לב", "Heart Bracelet", "Браслет «Сердце»"),
      shortDescription: lt(
        "צמיד שרשרת דק עם תליון לב יחיד.",
        "A fine chain bracelet with a single heart charm.",
        "Тонкий браслет-цепочка с одной подвеской-сердцем."
      ),
      description: lt(
        "צמיד עדין עם תליון לב קטן, מתאים גם כמתנה.",
        "A delicate bracelet with a small heart charm, also makes a great gift.",
        "Изящный браслет с маленькой подвеской-сердцем — отличный подарок."
      ),
      basePrice: 62,
      sku: "044",
      category: "bracelets",
      isFeatured: true,
    },
    {
      slug: "simple-ring",
      name: lt("טבעת פשוטה", "Simple Ring", "Простое кольцо"),
      shortDescription: lt(
        "טבעת כסף 925 דקה ומינימליסטית.",
        "A thin, minimalist 925 silver band.",
        "Тонкое минималистичное кольцо из серебра 925 пробы."
      ),
      description: lt(
        "טבעת כסף 925 בעיצוב נקי, מתאימה ללבישה יומיומית או לשילוב בערימת טבעות.",
        "A clean-lined 925 silver ring, perfect for everyday wear or ring-stacking.",
        "Кольцо из серебра 925 пробы лаконичного дизайна — для повседневной носки или сочетания с другими кольцами."
      ),
      basePrice: 62,
      sku: "144",
      category: "rings",
    },
    {
      slug: "spiral-ring",
      name: lt("טבעת ספירלה", "Spiral Ring", "Кольцо-спираль"),
      shortDescription: lt(
        "טבעת שעוטפת את האצבע בקו אחד רציף.",
        "A ring that wraps the finger in one continuous line.",
        "Кольцо, обвивающее палец одной непрерывной линией."
      ),
      description: lt(
        "עיצוב ספירלה ייחודי שעוטף את האצבע, בגימור זהב.",
        "A distinctive spiral design that wraps the finger, in a gold finish.",
        "Оригинальный дизайн спирали, обвивающей палец, в золотом покрытии."
      ),
      basePrice: 53,
      sku: "145",
      category: "rings",
      isFeatured: true,
    },
    {
      slug: "nouvates-earrings",
      name: lt("עגילי נובאט", "Nouvates Earrings", "Серьги Nouvates"),
      shortDescription: lt(
        "עגילים בציפוי זהב עם קו עגול ורך.",
        "Gold-plated drops with a soft, rounded silhouette.",
        "Серьги с золотым покрытием мягкой округлой формы."
      ),
      description: lt(
        "עגילים תלויים בציפוי זהב, בעיצוב עגול ורך.",
        "Gold-plated drop earrings with a soft, rounded design.",
        "Серьги-капли с золотым покрытием мягкого округлого дизайна."
      ),
      basePrice: 79,
      salePrice: 88,
      sku: "057",
      category: "earrings",
    },
    {
      slug: "mix-necklaces",
      name: lt("שרשראות מיקס", "Mix Necklaces", "Набор колье"),
      shortDescription: lt(
        "שתי שרשראות דקות ללבישה יחד, נמכרות כסט.",
        "Two fine chains worn together, sold as a set.",
        "Две тонкие цепочки, которые носят вместе, продаются в комплекте."
      ),
      description: lt(
        "סט של שתי שרשראות דקות, מושלם ללבישה בשכבות.",
        "A set of two fine chains, perfect for layered wear.",
        "Комплект из двух тонких цепочек, идеален для многослойной носки."
      ),
      basePrice: 82,
      sku: "068",
      category: "necklaces",
      variants: [
        { attributes: { color: lt("זהב", "Gold", "Золото") }, price: 82, sku: "068-G" },
        { attributes: { color: lt("כסף", "Silver", "Серебро") }, price: 82, sku: "068-S" },
      ],
    },
  ];

  for (const p of products) {
    const { category, variants, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        sku: data.sku,
        status: ProductStatus.PUBLISHED,
        isFeatured: data.isFeatured ?? false,
      },
      create: {
        slug: p.slug,
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        sku: data.sku,
        status: ProductStatus.PUBLISHED,
        isFeatured: data.isFeatured ?? false,
        inventory: 50,
      },
    });

    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: product.id, categoryId: categoryBySlug[category] } },
      update: {},
      create: { productId: product.id, categoryId: categoryBySlug[category] },
    });

    if (variants) {
      for (const v of variants) {
        await prisma.productVariant.upsert({
          where: { sku: v.sku },
          update: { price: v.price, attributes: v.attributes },
          create: {
            productId: product.id,
            sku: v.sku,
            attributes: v.attributes,
            price: v.price,
            inventory: 25,
          },
        });
      }
    }
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
