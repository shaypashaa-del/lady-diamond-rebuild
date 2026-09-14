/**
 * Seeds draft legal/policy pages. These are NOT legal advice — a lawyer
 * should review before real launch (per project spec: don't present
 * generated text as legal counsel). Content is editable afterwards via
 * /admin/pages.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

const pages: { slug: string; title: LT; body: LT }[] = [
  {
    slug: "privacy",
    title: lt("מדיניות פרטיות", "Privacy Policy", "Политика конфиденциальности"),
    body: lt(
      "אנו אוספים רק את המידע הדרוש לעיבוד הזמנתך ולשיפור חוויית הקנייה שלך באתר, ובכלל זה שם, פרטי קשר וכתובת משלוח. אנו לא מוכרים את המידע האישי שלך לצדדים שלישיים. ניתן לפנות אלינו בכל עת בבקשה לעיין, לתקן או למחוק את המידע השמור עליך. מסמך זה הינו טיוטה ראשונית ואינו מהווה ייעוץ משפטי — יש להחליפו בנוסח שאושר על ידי עורך דין לפני עליית האתר לאוויר.",
      "We only collect the information needed to process your order and improve your shopping experience, including your name, contact details, and shipping address. We do not sell your personal information to third parties. You may contact us at any time to review, correct, or delete the information we hold about you. This is a first draft and does not constitute legal advice — it should be replaced with lawyer-reviewed text before the site goes live.",
      "Мы собираем только те данные, которые необходимы для обработки вашего заказа и улучшения покупательского опыта, включая имя, контактные данные и адрес доставки. Мы не продаём вашу личную информацию третьим лицам. Вы можете в любое время обратиться к нам с просьбой просмотреть, исправить или удалить хранимую информацию. Этот документ является первым черновиком и не является юридической консультацией — его следует заменить текстом, проверенным юристом, до запуска сайта."
    ),
  },
  {
    slug: "terms",
    title: lt("תקנון האתר", "Terms of Service", "Условия использования"),
    body: lt(
      "השימוש באתר ובשירותיו כפוף לתנאים אלו. המחירים המוצגים באתר כוללים מע\"מ אלא אם צוין אחרת. אנו שומרים לעצמנו את הזכות לעדכן מחירים, מלאי ותנאים אלו ללא הודעה מוקדמת. מסמך זה הינו טיוטה ראשונית ואינו מהווה ייעוץ משפטי.",
      "Use of this site and its services is subject to these terms. Prices shown include VAT unless stated otherwise. We reserve the right to update prices, inventory, and these terms without prior notice. This is a first draft and does not constitute legal advice.",
      "Использование сайта и его сервисов регулируется данными условиями. Указанные цены включают НДС, если не указано иное. Мы оставляем за собой право изменять цены, наличие товара и данные условия без предварительного уведомления. Этот документ является первым черновиком и не является юридической консультацией."
    ),
  },
  {
    slug: "shipping",
    title: lt("מדיניות משלוחים", "Shipping Policy", "Политика доставки"),
    body: lt(
      "אנו שואפים לשלוח כל הזמנה תוך 1-3 ימי עסקים. עלויות ואפשרויות המשלוח מוצגות בעת התשלום בהתאם לכתובת המשלוח וסכום ההזמנה. במקרה של עיכוב נעדכן אותך במייל.",
      "We aim to ship every order within 1-3 business days. Shipping costs and options are shown at checkout based on your delivery address and order value. If there's a delay, we'll email you.",
      "Мы стремимся отправить каждый заказ в течение 1-3 рабочих дней. Стоимость и варианты доставки отображаются при оформлении заказа в зависимости от адреса доставки и суммы заказа. В случае задержки мы сообщим вам по электронной почте."
    ),
  },
  {
    slug: "returns",
    title: lt("מדיניות החזרות והחלפות", "Returns & Refunds Policy", "Политика возврата"),
    body: lt(
      "ניתן להחזיר מוצר שלא נעשה בו שימוש תוך 14 יום מיום קבלת ההזמנה, באריזתו המקורית. יש ליצור קשר עם שירות הלקוחות לפני משלוח החזרה. זיכוי כספי יינתן תוך 14 יום מקבלת המוצר המוחזר.",
      "You may return an unused item within 14 days of receiving your order, in its original packaging. Please contact customer service before sending a return. A refund will be issued within 14 days of receiving the returned item.",
      "Вы можете вернуть неиспользованный товар в течение 14 дней с момента получения заказа, в оригинальной упаковке. Пожалуйста, свяжитесь со службой поддержки перед отправкой возврата. Возврат средств будет произведён в течение 14 дней с момента получения возвращённого товара."
    ),
  },
  {
    slug: "affiliate-terms",
    title: lt("תנאי תוכנית השותפים", "Affiliate Program Terms", "Условия партнёрской программы"),
    body: lt(
      "ההצטרפות לתוכנית השותפים כפופה לאישור מנהל. עמלות מחושבות על פי הכללים המוגדרים בלוח הבקרה של השותף ומשולמות לאחר אישור ההזמנה וחלוף תקופת ההחזרות. איננו מאשרים עמלה על רכישה עצמית של השותף. אנו שומרים את הזכות להשעות או לסיים שותפות במקרה של פעילות חשודה.",
      "Joining the affiliate program is subject to admin approval. Commissions are calculated per the rules shown in the affiliate dashboard and are paid after the order is confirmed and the return window has passed. We do not approve commission on an affiliate's own purchases. We reserve the right to suspend or terminate a partnership in case of suspicious activity.",
      "Присоединение к партнёрской программе требует одобрения администратора. Комиссии рассчитываются согласно правилам, указанным в панели партнёра, и выплачиваются после подтверждения заказа и истечения периода возврата. Мы не начисляем комиссию за собственные покупки партнёра. Мы оставляем за собой право приостановить или прекратить партнёрство в случае подозрительной активности."
    ),
  },
];

async function main() {
  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { slug: page.slug, title: page.title, body: page.body },
    });
  }
  console.log(`Seeded ${pages.length} policy pages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
