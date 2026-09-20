// Substantially rewrites the privacy/terms/returns pages and adds a new
// cookies policy page, aligned with Israeli law: the Privacy Protection
// Law 5741-1981 (including the 2025 Amendment 13 obligations), the Equal
// Rights for Persons with Disabilities regulations (referenced from the
// existing accessibility page), and the Consumer Protection Law
// 5741-1981 distance-selling / right-of-withdrawal rules for e-commerce.
//
// IMPORTANT: this is still not a substitute for review by a lawyer
// licensed in Israel before the site goes live — the business identifier
// number is intentionally left as a visible placeholder, not invented.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

const BIZ_NUMBER_PLACEHOLDER = "[להשלים: מספר עוסק מורשה / ח\"פ]";
const LAWYER_NOTE = lt(
  "מסמך זה נכתב כטיוטה מקצועית מפורטת, אך אינו מהווה ייעוץ משפטי. יש להעבירו לאישור עורך/ת דין לפני העלאת האתר לאוויר, ולעדכן את פרטי העסק המדויקים (כולל מספר עוסק מורשה/ח\"פ) בהתאם.",
  "This document is a detailed professional draft, not legal advice. Have it reviewed by a lawyer before the site goes live, and complete the exact business details (including the business registration number) accordingly.",
  "Этот документ является подробным профессиональным черновиком, но не юридической консультацией. Перед запуском сайта его должен проверить юрист, а точные реквизиты компании (включая регистрационный номер) должны быть дополнены."
);

const BUSINESS_BLOCK = lt(
  `פרטי העסק: LADY DIAMOND ("החברה"/"אנחנו"). מספר עוסק מורשה/ח"פ: ${BIZ_NUMBER_PLACEHOLDER}. כתובת: מתחם בורסה, בניין נועם, רחוב תובל 23, רמת גן. טלפון: 972-50-3781589+. דוא"ל: info@ladydiamondjewels.com.`,
  `Business details: LADY DIAMOND ("the Company"/"we"). Business registration number: ${BIZ_NUMBER_PLACEHOLDER}. Address: Bursa Complex, Noam Building, 23 Tuval Street, Ramat Gan, Israel. Phone: +972-50-3781589. Email: info@ladydiamondjewels.com.`,
  `Реквизиты компании: LADY DIAMOND («Компания»/«мы»). Регистрационный номер: ${BIZ_NUMBER_PLACEHOLDER}. Адрес: Bursa Complex, Noam Building, 23 Tuval Street, Ramat Gan, Israel. Телефон: +972-50-3781589. Эл. почта: info@ladydiamondjewels.com.`
);

function join(...parts: LT[]): LT {
  return {
    he: parts.map((p) => p.he).join("\n\n"),
    en: parts.map((p) => p.en).join("\n\n"),
    ru: parts.map((p) => p.ru).join("\n\n"),
  };
}

const privacyBody = join(
  BUSINESS_BLOCK,
  lt(
    "מדיניות פרטיות זו מסבירה אילו נתונים אנו אוספים כשאתם גולשים או קונים באתר, לשם מה, עם מי הם עשויים להיות משותפים, ומהן הזכויות שלכם ביחס אליהם, בהתאם לחוק הגנת הפרטיות, התשמ\"א-1981 (לרבות תיקון 13 שנכנס לתוקף ב-2025) ולחוק הגנת הצרכן, התשמ\"א-1981.",
    "This Privacy Policy explains what data we collect when you browse or shop on the site, for what purpose, who it may be shared with, and what rights you have over it, in accordance with Israel's Privacy Protection Law, 5741-1981 (including Amendment 13, effective 2025) and the Consumer Protection Law, 5741-1981.",
    "Данная политика конфиденциальности объясняет, какие данные мы собираем, когда вы просматриваете сайт или совершаете покупки, для каких целей, с кем они могут передаваться и какие у вас есть права в отношении них, в соответствии с Законом о защите конфиденциальности Израиля 5741-1981 (включая поправку 13, вступившую в силу в 2025 году) и Законом о защите прав потребителей 5741-1981."
  ),
  lt(
    "המידע שאנו אוספים: פרטי זיהוי וקשר שאתם מוסרים ביוזמתכם (שם, טלפון, דוא\"ל, כתובת משלוח וחיוב) בעת הרשמה, רכישה, יצירת קשר או הצטרפות לתוכנית השותפים; פרטי הזמנות ורכישות; ונתוני שימוש טכניים באתר (כתובת IP, סוג דפדפן, עמודים שנצפו) הנאספים באמצעות קובצי Cookie, בכפוף להסכמתכם כמפורט במדיניות העוגיות שלנו.",
    "Information we collect: identification and contact details you provide voluntarily (name, phone, email, shipping/billing address) when registering, purchasing, contacting us, or joining the affiliate program; order and purchase history; and technical usage data (IP address, browser type, pages viewed) collected via cookies, subject to your consent as detailed in our Cookie Policy.",
    "Собираемая информация: идентификационные и контактные данные, которые вы предоставляете добровольно (имя, телефон, эл. почта, адрес доставки/выставления счёта) при регистрации, покупке, обращении к нам или вступлении в партнёрскую программу; история заказов и покупок; технические данные об использовании сайта (IP-адрес, тип браузера, просмотренные страницы), собираемые с помощью файлов cookie при вашем согласии, как указано в нашей Политике использования файлов cookie."
  ),
  lt(
    "מטרות השימוש: עיבוד וביצוע הזמנות ומשלוחים, מתן שירות לקוחות, ניהול תוכנית השותפים ותשלומי עמלות, עמידה בחובות חוקיות (כגון חשבוניות ומיסים), ובכפוף להסכמה מפורשת בלבד — משלוח דיוור שיווקי וניתוח סטטיסטי של השימוש באתר.",
    "Purposes of use: processing and fulfilling orders and shipments, providing customer service, managing the affiliate program and commission payments, complying with legal obligations (such as invoicing and tax), and — only with your explicit consent — sending marketing communications and analyzing site usage.",
    "Цели использования: обработка и выполнение заказов и доставок, предоставление обслуживания клиентов, управление партнёрской программой и выплата комиссий, соблюдение юридических обязательств (например, выставление счетов и налоги), а также — только с вашего явного согласия — рассылка маркетинговых сообщений и анализ использования сайта."
  ),
  lt(
    "צדדים שלישיים: איננו מוכרים את המידע האישי שלכם. אנו משתפים מידע מצומצם, ככל הנדרש, עם ספקי שירות הפועלים מטעמנו: חברת האחסון של האתר, סליקת תשלומים (לרבות PayPal, שאתריה עשויים להציב Cookies משלהם), וחברת השילוח. חלק מספקים אלו עשויים לעבד מידע בשרתים מחוץ לישראל; במקרה זה אנו דואגים להתקשרות המבטיחה רמת הגנה נאותה למידע.",
    "Third parties: we do not sell your personal information. We share limited information, as necessary, with service providers acting on our behalf: our website hosting provider, payment processors (including PayPal, whose own sites may set their own cookies), and our shipping carrier. Some of these providers may process data on servers outside Israel; where that is the case we ensure contractual safeguards providing an adequate level of data protection.",
    "Третьи стороны: мы не продаём ваши персональные данные. Мы передаём ограниченную информацию, при необходимости, поставщикам услуг, действующим от нашего имени: хостинг-провайдеру сайта, платёжным системам (включая PayPal, чьи сайты могут устанавливать собственные файлы cookie) и транспортной компании. Некоторые из этих поставщиков могут обрабатывать данные на серверах за пределами Израиля; в этом случае мы обеспечиваем договорные гарантии надлежащего уровня защиты данных."
  ),
  lt(
    "שמירת מידע: אנו שומרים את המידע האישי רק למשך הזמן הדרוש למטרות שלשמן נאסף, לרבות עמידה בדרישות חוק (למשל שמירת מסמכי חשבונאות כנדרש בדין).",
    "Data retention: we retain personal information only for as long as necessary for the purposes for which it was collected, including compliance with legal requirements (such as retaining accounting records as required by law).",
    "Хранение данных: мы храним персональные данные только в течение времени, необходимого для целей, для которых они были собраны, включая соблюдение юридических требований (например, хранение бухгалтерских документов согласно закону)."
  ),
  lt(
    "הזכויות שלכם: בהתאם לחוק הגנת הפרטיות, זכותכם לעיין במידע שנשמר עליכם, לבקש את תיקונו או מחיקתו, ולבקש הסרה מרשימות דיוור בכל עת. לצורך מימוש הזכויות, וכן לכל שאלה בנושא פרטיות, ניתן לפנות אלינו בפרטי הקשר שלעיל. אם אינכם מרוצים מהאופן בו טופלה פנייתכם, זכותכם לפנות לרשות להגנת הפרטיות.",
    "Your rights: under the Privacy Protection Law, you have the right to review the information held about you, request its correction or deletion, and opt out of marketing communications at any time. To exercise these rights, or for any privacy-related question, contact us using the details above. If you are not satisfied with how your request was handled, you may contact Israel's Privacy Protection Authority.",
    "Ваши права: в соответствии с Законом о защите конфиденциальности, вы имеете право просматривать хранящуюся о вас информацию, запрашивать её исправление или удаление, а также в любое время отказаться от маркетинговых рассылок. Для реализации этих прав, а также по любым вопросам, связанным с конфиденциальностью, свяжитесь с нами, используя контактные данные выше. Если вы не удовлетворены тем, как была обработана ваша просьба, вы можете обратиться в Управление по защите конфиденциальности Израиля."
  ),
  lt(
    "אבטחת מידע: אנו נוקטים אמצעי אבטחה סבירים בהתאם לתקנות אבטחת מידע, אולם אין באפשרותנו להבטיח הגנה מוחלטת מפני כל גישה בלתי מורשית.",
    "Data security: we take reasonable security measures in line with applicable data security regulations, though we cannot guarantee absolute protection against unauthorized access.",
    "Безопасность данных: мы принимаем разумные меры безопасности в соответствии с применимыми нормами защиты данных, однако не можем гарантировать абсолютную защиту от несанкционированного доступа."
  ),
  LAWYER_NOTE
);

const termsBody = join(
  BUSINESS_BLOCK,
  lt(
    "השימוש באתר זה ובשירותיו, לרבות ביצוע רכישות, כפוף לתנאי שימוש אלו. גלישה או רכישה באתר מהווה הסכמה לתנאים אלו במלואם.",
    "Use of this site and its services, including making purchases, is subject to these Terms of Service. Browsing or purchasing on the site constitutes full acceptance of these terms.",
    "Использование данного сайта и его услуг, включая совершение покупок, регулируется настоящими Условиями использования. Просмотр сайта или совершение покупки означает полное согласие с настоящими условиями."
  ),
  lt(
    "מוצרים ומחירים: אנו עושים מאמץ סביר להציג תיאורים ותמונות מדויקים של המוצרים, אך צבעים וגדלים עלולים להיראות שונה מעט במסכים שונים. המחירים המוצגים כוללים מע\"מ אלא אם צוין אחרת, ואנו שומרים את הזכות לעדכן מחירים וזמינות מלאי בכל עת וללא הודעה מוקדמת, למעט לגבי הזמנות שכבר אושרו.",
    "Products and pricing: we make reasonable efforts to display accurate product descriptions and images, though colors and sizes may appear slightly different on different screens. Prices shown include VAT unless stated otherwise, and we reserve the right to update prices and stock availability at any time without prior notice, except for orders already confirmed.",
    "Товары и цены: мы прилагаем разумные усилия для отображения точных описаний и изображений товаров, однако цвета и размеры могут немного отличаться на разных экранах. Указанные цены включают НДС, если не указано иное, и мы оставляем за собой право изменять цены и наличие товара в любое время без предварительного уведомления, за исключением уже подтверждённых заказов."
  ),
  lt(
    "ביטול עסקה והחזרות: זכותכם לבטל עסקה בהתאם לחוק הגנת הצרכן, התשמ\"א-1981 ולתקנות שהותקנו מכוחו — ראו את מדיניות ההחזרות המלאה שלנו לפרטים, לרבות מקרים חריגים (כגון פריטים שהוזמנו בהתאמה אישית או חוקקו לפי בקשה).",
    "Cancellation and returns: you have the right to cancel a transaction in accordance with Israel's Consumer Protection Law, 5741-1981 and its regulations — see our full Returns Policy for details, including exceptions (such as custom-made or personally engraved items).",
    "Отмена и возврат: вы имеете право отменить сделку в соответствии с Законом о защите прав потребителей Израиля 5741-1981 и соответствующими постановлениями — подробности, включая исключения (например, изделия, изготовленные на заказ или с персональной гравировкой), см. в нашей полной Политике возврата."
  ),
  lt(
    "קניין רוחני: כל התכנים באתר — לרבות טקסטים, תמונות, עיצוב ולוגו — הינם רכושה של LADY DIAMOND או מוצגים ברישיון כדין, ואין להעתיקם או להשתמש בהם ללא אישור מראש ובכתב.",
    "Intellectual property: all content on this site — including text, images, design, and logo — is the property of LADY DIAMOND or used under proper license, and may not be copied or used without prior written permission.",
    "Интеллектуальная собственность: весь контент на этом сайте — включая текст, изображения, дизайн и логотип — является собственностью LADY DIAMOND или используется на законных основаниях, и не может копироваться или использоваться без предварительного письменного разрешения."
  ),
  lt(
    "הגבלת אחריות: האתר וכל תוכן בו מוצגים כמות שהם (\"AS IS\"). ככל שיחול פגם במוצר, יחולו הוראות הדין הרלוונטיות (לרבות חוק הגנת הצרכן וחוק המכר) ומדיניות ההחזרות שלנו.",
    "Limitation of liability: the site and its content are provided \"as is.\" Should a product defect occur, the relevant statutory provisions (including the Consumer Protection Law and Sale Law) and our Returns Policy will apply.",
    "Ограничение ответственности: сайт и его содержимое предоставляются «как есть». В случае обнаружения дефекта товара применяются соответствующие законодательные положения (включая Закон о защите прав потребителей и Закон о купле-продаже) и наша Политика возврата."
  ),
  lt(
    "דין וסמכות שיפוט: על תנאים אלו יחולו דיני מדינת ישראל, וכל סכסוך יידון בבתי המשפט המוסמכים באזור מרכז הארץ, מבלי לגרוע מכל זכות שלכם על פי חוק הגנת הצרכן.",
    "Governing law and jurisdiction: these terms are governed by the laws of the State of Israel, and any dispute shall be brought before the competent courts in central Israel, without derogating from any right you have under the Consumer Protection Law.",
    "Применимое право и юрисдикция: настоящие условия регулируются законодательством Государства Израиль, и любой спор будет рассматриваться в компетентных судах центрального округа Израиля, без ущерба для любых ваших прав в соответствии с Законом о защите прав потребителей."
  ),
  LAWYER_NOTE
);

const returnsBody = join(
  BUSINESS_BLOCK,
  lt(
    "בהתאם לחוק הגנת הצרכן, התשמ\"א-1981 ולתקנות הגנת הצרכן (ביטול עסקה), ניתן לבטל עסקה ולהחזיר מוצר תוך 14 יום מיום קבלתו, כשהוא באריזתו המקורית ולא נעשה בו שימוש, ולקבל החזר כספי מלא בניכוי דמי ביטול (עד 5% ממחיר העסקה או 100 ש\"ח, לפי הנמוך מביניהם), אלא אם הביטול נובע מפגם במוצר או מאי-התאמה — ואז לא יגבו דמי ביטול.",
    "In accordance with Israel's Consumer Protection Law, 5741-1981 and the Consumer Protection (Cancellation of Transaction) Regulations, you may cancel a purchase and return an item within 14 days of receiving it, in its original packaging and unused condition, for a full refund less a cancellation fee (up to 5% of the transaction price or NIS 100, whichever is lower) — unless the cancellation is due to a product defect or a mismatch with its description, in which case no cancellation fee applies.",
    "В соответствии с Законом о защите прав потребителей Израиля 5741-1981 и Положениями о защите прав потребителей (об отмене сделки), вы можете отменить покупку и вернуть товар в течение 14 дней с момента его получения, в оригинальной упаковке и неиспользованном состоянии, и получить полный возврат средств за вычетом комиссии за отмену (до 5% от суммы сделки или 100 шекелей, в зависимости от того, что меньше) — если только отмена не связана с дефектом товара или несоответствием описанию, в этом случае комиссия за отмену не взимается."
  ),
  lt(
    "חריגים: פריטים שיוצרו או נחקקו בהתאמה אישית לפי בקשתכם אינם ניתנים לביטול לאחר תחילת הייצור, בהתאם לתקנות הגנת הצרכן.",
    "Exceptions: items manufactured or engraved to your personal specification cannot be cancelled once production has begun, in accordance with the Consumer Protection Regulations.",
    "Исключения: изделия, изготовленные или выгравированные по вашему индивидуальному заказу, не подлежат отмене после начала производства, в соответствии с Положениями о защите прав потребителей."
  ),
  lt(
    "כיצד לבצע החזרה: יש ליצור קשר עם שירות הלקוחות שלנו (פרטים לעיל) לפני משלוח ההחזרה, לצורך תיאום. לאחר קבלת המוצר המוחזר ובדיקתו, יינתן זיכוי כספי לאמצעי התשלום המקורי תוך 14 יום.",
    "How to return an item: please contact our customer service (details above) before sending a return, to coordinate the process. Once the returned item is received and inspected, a refund will be issued to the original payment method within 14 days.",
    "Как вернуть товар: пожалуйста, свяжитесь с нашей службой поддержки (контакты выше) перед отправкой возврата, чтобы согласовать процесс. После получения и проверки возвращённого товара возврат средств будет произведён на первоначальный способ оплаты в течение 14 дней."
  ),
  LAWYER_NOTE
);

const cookiesBody = join(
  BUSINESS_BLOCK,
  lt(
    "האתר משתמש בקובצי Cookie ובטכנולוגיות דומות. עם הכניסה לאתר תוצג לכם הודעת עוגיות המאפשרת לאשר את כל השימוש, לדחות שימוש שאינו הכרחי, או לבחור אילו קטגוריות לאשר. תוכלו לשנות את בחירתכם בכל עת דרך הגדרות הדפדפן שלכם.",
    "This site uses cookies and similar technologies. When you visit, a cookie notice lets you accept all use, reject non-essential use, or choose which categories to allow. You can change your choice at any time via your browser settings.",
    "Этот сайт использует файлы cookie и аналогичные технологии. При посещении сайта вам будет показано уведомление о cookie-файлах, позволяющее принять все, отклонить необязательные или выбрать нужные категории. Вы можете изменить свой выбор в любое время через настройки браузера."
  ),
  lt(
    "עוגיות הכרחיות: נדרשות לתפעול הבסיסי של האתר (עגלת קניות, התחברות לחשבון, אבטחה) ואינן ניתנות לביטול.\n\nעוגיות אנליטיקס: מסייעות לנו להבין כיצד משתמשים גולשים באתר, לשם שיפורו — פועלות רק בכפוף להסכמתכם.\n\nעוגיות שיווק: משמשות להצגת תוכן פרסומי רלוונטי — פועלות רק בכפוף להסכמתכם. נכון לכתיבת מסמך זה אין באתר עוגיות שיווק פעילות; סעיף זה מתעדכן ככל שיתווספו כלים כאלה.",
    "Necessary cookies: required for the site's basic operation (shopping cart, account login, security) and cannot be disabled.\n\nAnalytics cookies: help us understand how visitors use the site, to improve it — only run with your consent.\n\nMarketing cookies: used to show relevant advertising content — only run with your consent. As of this writing, no marketing cookies are active on the site; this section will be updated if such tools are added.",
    "Необходимые файлы cookie: требуются для базовой работы сайта (корзина покупок, вход в аккаунт, безопасность) и не могут быть отключены.\n\nАналитические файлы cookie: помогают нам понять, как посетители используют сайт, чтобы улучшить его — работают только с вашего согласия.\n\nМаркетинговые файлы cookie: используются для показа релевантной рекламы — работают только с вашего согласия. На момент написания этого документа на сайте нет активных маркетинговых файлов cookie; этот раздел будет обновлён при добавлении таких инструментов."
  ),
  lt(
    "צד שלישי חריג: בעת בחירת תשלום דרך PayPal בקופה, נטען סקריפט של PayPal עצמו, הכפוף למדיניות הפרטיות והעוגיות של PayPal.",
    "One exception: when you choose to pay via PayPal at checkout, PayPal's own script loads, which is subject to PayPal's own privacy and cookie policies.",
    "Одно исключение: при выборе оплаты через PayPal на кассе загружается собственный скрипт PayPal, на который распространяются собственная политика конфиденциальности и использования файлов cookie PayPal."
  ),
  LAWYER_NOTE
);

async function upsertPage(slug: string, title: LT, body: LT) {
  await prisma.page.upsert({
    where: { slug },
    update: { body },
    create: { slug, title, body },
  });
  console.log("Upserted", slug);
}

async function main() {
  await upsertPage("privacy", lt("מדיניות פרטיות", "Privacy Policy", "Политика конфиденциальности"), privacyBody);
  await upsertPage("terms", lt("תקנון האתר", "Terms of Service", "Условия использования"), termsBody);
  await upsertPage("returns", lt("מדיניות החזרות והחלפות", "Returns & Refunds Policy", "Политика возврата"), returnsBody);
  await upsertPage("cookies", lt("מדיניות עוגיות", "Cookie Policy", "Политика использования файлов cookie"), cookiesBody);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
