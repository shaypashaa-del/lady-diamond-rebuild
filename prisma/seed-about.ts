import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.page.upsert({
    where: { slug: "about-us" },
    update: {},
    create: {
      slug: "about-us",
      title: {
        he: "הסיפור שלנו",
        en: "Our Story",
        ru: "Наша история",
      },
      body: {
        he: "LADY DIAMOND נוסדה ב-2010 מתוך אהבה לתכשיטים פשוטים שמלווים אותך כל יום. כל פריט מעוצב בבית ומיוצר בקפידה מזהב וכסף 925, מתוך אמונה שתכשיט טוב לא צריך לצעוק כדי להיראות — הוא פשוט נראה נכון.\n\nאנחנו חנות משפחתית קטנה שגדלה בזכות לקוחות שחוזרים, וכל הזמנה מטופלת באופן אישי מהקצה אל הקצה.",
        en: "Lady Diamond was founded in 2010 out of a love for simple jewelry that goes with you every day. Every piece is designed in-house and carefully made from gold and 925 silver, built on the belief that good jewelry doesn't need to shout to look right — it just does.\n\nWe're a small, family-run shop that grew thanks to returning customers, and every order is handled personally from start to finish.",
        ru: "Lady Diamond была основана в 2010 году из любви к простым украшениям, которые сопровождают вас каждый день. Каждое изделие создаётся собственным дизайном и тщательно изготавливается из золота и серебра 925 пробы — мы верим, что хорошее украшение не должно кричать, чтобы выглядеть правильно.\n\nМы небольшой семейный магазин, выросший благодаря постоянным клиентам, и каждый заказ обрабатывается лично от начала до конца.",
      },
    },
  });

  await prisma.page.upsert({
    where: { slug: "contact-us" },
    update: {},
    create: {
      slug: "contact-us",
      title: { he: "צור קשר", en: "Contact Us", ru: "Связаться с нами" },
      body: {
        he: "יש לך שאלה על הזמנה, מוצר או משלוח? נשמח לעזור — מלאו את הטופס ונחזור אליכם בהקדם.",
        en: "Have a question about an order, a product, or shipping? We'd love to help — fill out the form and we'll get back to you soon.",
        ru: "Есть вопрос о заказе, товаре или доставке? Мы будем рады помочь — заполните форму, и мы скоро свяжемся с вами.",
      },
    },
  });

  console.log("Seeded about-us and contact-us pages.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
