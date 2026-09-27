// Substantially rewrites the privacy/terms/returns pages and adds a new
// cookies policy page, aligned with Israeli law: the Privacy Protection
// Law 5741-1981 (including the 2025 Amendment 13 obligations), the Equal
// Rights for Persons with Disabilities regulations (referenced from the
// existing accessibility page), and the Consumer Protection Law
// 5741-1981 distance-selling / right-of-withdrawal rules for e-commerce.
//
// IMPORTANT: this is still not a substitute for review by a lawyer
// licensed in Israel before the site goes live. Business registration
// number (310618715) provided directly by the business owner.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LT = { he: string; en: string; ru: string };
const lt = (he: string, en: string, ru: string): LT => ({ he, en, ru });

const BIZ_NUMBER = "310618715";

// U+2066/U+2069 (LRI/PDI) isolate the phone number and email from the
// surrounding Hebrew (RTL) sentence — without them, the bidi algorithm can
// visually scramble a "+"/"-" digit run embedded in plain RTL text (this is
// what the owner saw as the phone number displaying reversed on the legal
// pages, which render this whole block as one plain-text paragraph with no
// per-substring dir="ltr" element to anchor it, unlike the Footer/contact
// page which use real dir="ltr"/<bdi> elements and were already correct).
const LRI = "⁦";
const PDI = "⁩";
const PHONE_DISPLAY = `${LRI}+972-50-3781589${PDI}`;
const EMAIL_DISPLAY = `${LRI}diana@ladydiamondjewels.com${PDI}`;

const BUSINESS_BLOCK = lt(
  `פרטי העסק: LADY DIAMOND ("החברה"/"אנחנו"). מספר עוסק מורשה: ${BIZ_NUMBER}. כתובת: מתחם בורסה, בניין נועם, רחוב תובל 23, רמת גן. טלפון: ${PHONE_DISPLAY}. דוא"ל: ${EMAIL_DISPLAY}.`,
  `Business details: LADY DIAMOND ("the Company"/"we"). Business registration number (עוסק מורשה): ${BIZ_NUMBER}. Address: Bursa Complex, Noam Building, 23 Tuval Street, Ramat Gan, Israel. Phone: ${PHONE_DISPLAY}. Email: ${EMAIL_DISPLAY}.`,
  `Реквизиты компании: LADY DIAMOND («Компания»/«мы»). Регистрационный номер: ${BIZ_NUMBER}. Адрес: Bursa Complex, Noam Building, 23 Tuval Street, Ramat Gan, Israel. Телефон: ${PHONE_DISPLAY}. Эл. почта: ${EMAIL_DISPLAY}.`
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
  )
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
  )
);

const shippingBody = join(
  BUSINESS_BLOCK,
  lt(
    "מדיניות משלוחים זו חלה על כל הזמנה שמתבצעת באתר LADY DIAMOND, ומפרטת את זמני ההכנה והמשלוח, עלויות המשלוח, אזורי החלוקה, ומעמדם המשפטי של פריטים המיוצרים לפי הזמנה אישית.",
    "This Shipping Policy applies to every order placed on the LADY DIAMOND site, and details preparation and delivery times, shipping costs, delivery areas, and the legal status of items made to a personal order.",
    "Данная политика доставки применяется к каждому заказу, оформленному на сайте LADY DIAMOND, и описывает сроки подготовки и доставки, стоимость доставки, зоны доставки и правовой статус изделий, изготавливаемых по индивидуальному заказу."
  ),
  lt(
    "זמן הכנת ההזמנה: חלק ניכר מתכשיטי האתר מיוצרים או משוכללים לפי הזמנה אישית (כפי שמצוין בדף המוצר הרלוונטי), ולכן זמן ההכנה עשוי לנוע בין 3 ל-14 ימי עסקים בטרם המשלוח בפועל, בהתאם למורכבות הפריט. פריטים המצוינים כזמינים במלאי נשלחים בדרך כלל תוך 1-3 ימי עסקים ממועד אישור התשלום.",
    "Order preparation time: many of the jewelry pieces on this site are manufactured or finished to your personal order (as indicated on the relevant product page), so preparation may take between 3 and 14 business days before dispatch, depending on the item's complexity. Items marked as in stock are typically shipped within 1-3 business days of payment confirmation.",
    "Срок подготовки заказа: многие украшения на сайте изготавливаются или дорабатываются по индивидуальному заказу (как указано на странице соответствующего товара), поэтому подготовка может занять от 3 до 14 рабочих дней до фактической отправки, в зависимости от сложности изделия. Товары, отмеченные как имеющиеся в наличии, обычно отправляются в течение 1-3 рабочих дней после подтверждения оплаты."
  ),
  lt(
    "עלויות ואזורי משלוח: עלות המשלוח בפועל, אזורי החלוקה הזמינים, וכל סף להנחה או פטור ממשלוח (ככל שקיים), מוצגים במלואם בעמוד הקופה טרם השלמת התשלום, בהתאם לכתובת המשלוח ולסכום ההזמنה — בהתאם לחובת הגילוי הנאות הקבועה בסעיף 14ג לחוק הגנת הצרכן, התשמ\"א-1981, החל על עסקאות מכר מרחוק. משלוח בתוך ישראל מתבצע באמצעות חברת שילוח חיצונית; משלוח בינלאומי, ככל שמוצע ליעד המבוקש, עשוי להיות כפוף לזמני אספקה ארוכים יותר ולמסים/היטלי מכס החלים במדינת היעד, שאינם באחריות החברה.",
    "Shipping costs and delivery areas: the actual shipping cost, available delivery areas, and any free-shipping threshold (where applicable) are shown in full at checkout before payment is completed, based on the delivery address and order value — in line with the duty of proper disclosure under Section 14c of the Consumer Protection Law, 5741-1981, which applies to distance/internet sales. Domestic delivery within Israel is handled through an external courier; international shipping, where offered to the requested destination, may involve longer delivery times and destination-country taxes/customs duties, which are not the Company's responsibility.",
    "Стоимость и зоны доставки: фактическая стоимость доставки, доступные зоны доставки и любой порог для бесплатной доставки (если применимо) полностью отображаются на странице оформления заказа до завершения оплаты, в зависимости от адреса доставки и суммы заказа — в соответствии с обязанностью надлежащего раскрытия информации, установленной статьёй 14в Закона о защите прав потребителей Израиля 5741-1981, применимой к дистанционным продажам. Доставка внутри Израиля осуществляется через стороннюю курьерскую службу; международная доставка, если она предлагается для запрашиваемого направления, может занимать больше времени и облагаться налогами/таможенными пошлinами страны назначения, за что Компания ответственности не несёт."
  ),
  lt(
    "מעקב ואישור מסירה: לאחר משלוח ההזמנה תישלח אליכם הודעת אישור, לרבות מספר מעקב ככל שהדואר/חברת השילוח מספקים כזה. באחריותכם לוודא כי כתובת המשלוח וטלפון ליצירת קשר שנמסרו נכונים ומעודכנים; החברה אינה אחראית לעיכוב או אי-מסירה הנובעים מפרטי משלוח שגויים שנמסרו על ידכם.",
    "Tracking and delivery confirmation: once your order ships, you will receive a confirmation notice, including a tracking number where the postal service/courier provides one. It is your responsibility to ensure the delivery address and contact phone number you provided are correct and up to date; the Company is not liable for delays or failed delivery resulting from incorrect delivery details you supplied.",
    "Отслеживание и подтверждение доставки: после отправки заказа вам будет направлено уведомление с подтверждением, включая номер для отслеживания, если почтовая/курьерская служба его предоставляет. Вы обязаны убедиться, что указанные вами адрес доставки и контактный телефон верны и актуальны; Компания не несёт ответственности за задержку или несостоявшуюся доставку, вызванные неверными данными доставки, предоставленными вами."
  ),
  lt(
    "עיכובים ונסיבות שאינן בשליטת החברה: מועדי המשלוח המצוינים הם הערכה ואינם מהווים התחייבות מוחלטת. אירועים שאינם בשליטת החברה (לרבות עיצומים/שביתות בשירותי הדואר או השילוח, מזג אוויר קיצוני, אירועי ביטחון, או כוח עליון) עשויים לגרום לעיכוב; במקרה כזה תעודכנו במייל או בטלפון, בהתאם לפרטי הקשר שנמסרו.",
    "Delays and circumstances beyond the Company's control: stated delivery times are estimates and do not constitute an absolute commitment. Events outside the Company's control (including postal/courier service disruptions or strikes, extreme weather, security events, or force majeure) may cause delays; in such a case you will be updated by email or phone, using the contact details provided.",
    "Задержки и обстоятельства вне контроля Компании: указанные сроки доставки являются оценочными и не составляют абсолютного обязательства. События вне контроля Компании (включая сбои или забастовки почтовых/курьерских служб, экстремальную погоду, обстоятельства безопасности или форс-мажор) могут вызвать задержку; в этом случае вы будете уведомлены по электронной почте или телефону, указанным вами."
  ),
  lt(
    "משלוחים לחו\"ל: ככל שמוצע משלוח מחוץ לישראל, האחריות לבירור והסדרת מסי יבוא, מכס והיטלים החלים במדינת היעד חלה על הלקוח/ה בלבד, ואינה נכללת במחיר המוצר או המשלוח המוצג באתר.",
    "International shipments: where shipping outside Israel is offered, responsibility for determining and settling any import taxes, customs duties, or levies applicable in the destination country rests solely with the customer, and is not included in the product or shipping price shown on the site.",
    "Международные отправления: если предлагается доставка за пределы Израиля, ответственность за определение и уплату любых импортных налогов, таможенных пошлин или сборов, применимых в стране назначения, лежит исключительно на покупателе и не включена в цену товара или доставки, указанную на сайте."
  )
);

const returnsBody = join(
  BUSINESS_BLOCK,
  lt(
    "מדיניות ביטול, החזרות והחלפות זו נכתבה בהתאם לחוק הגנת הצרכן, התשמ\"א-1981 (ובכלל זה סעיף 14ג הדן בעסקת מכר מרחוק), תקנות הגנת הצרכן (ביטול עסקה), התשע\"א-2010, וחוק המכר, התשכ\"ח-1968, ומפרטת את זכויותיכם וחובותיכם בעת ביטול עסקה, החזרת מוצר, או טענת אי-התאמה/פגם.",
    "This Cancellation, Returns and Exchanges Policy is written in accordance with Israel's Consumer Protection Law, 5741-1981 (including Section 14c on distance-selling transactions), the Consumer Protection (Cancellation of Transaction) Regulations, 5771-2010, and the Sale Law, 5728-1968, and details your rights and obligations when cancelling a transaction, returning an item, or making a claim of non-conformity or defect.",
    "Данная политика отмены, возврата и обмена составлена в соответствии с Законом о защите прав потребителей Израиля 5741-1981 (включая статью 14в о дистанционных сделках), Положениями о защите прав потребителей (об отмене сделки) 5771-2010 и Законом о купле-продаже 5728-1968, и подробно описывает ваши права и обязанности при отмене сделки, возврате товара или заявлении о несоответствии/дефекте."
  ),
  lt(
    "זכות ביטול עסקה (\"תקופת צינון\"): בהתאם לסעיף 14ג לחוק הגנת הצרכן, ניתן לבטל עסקה בתוך 14 ימים מיום קבלת המוצר (או ממועד עריכת העסקה, לפי המאוחר), ללא צורך בנימוק. הביטול ייעשה בהודעה בכתב (דוא\"ל, הודעה בטלפון או פנייה דרך טופס יצירת הקשר באתר) הכוללת את פרטי ההזמנה. במקרה של ביטול שלא עקב פגם או אי-התאמה, תחויבו בדמי ביטול בשיעור שאינו עולה על 5% ממחיר העסקה או 100 ש\"ח, לפי הנמוך מביניהם (סכום זה מתעדכן מעת לעת בהתאם לתקנות הגנת הצרכן, והסכום העדכני יובהר לפי דרישה).",
    "Right to cancel a transaction (\"cooling-off period\"): under Section 14c of the Consumer Protection Law, you may cancel a transaction within 14 days of receiving the product (or from the date the transaction was made, whichever is later), without needing to give a reason. Cancellation must be made by written notice (email, a phone message, or the site's contact form) including your order details. Where cancellation is not due to a defect or non-conformity, a cancellation fee applies, not exceeding 5% of the transaction price or NIS 100, whichever is lower (this amount is updated from time to time under the Consumer Protection Regulations; the current figure will be confirmed on request).",
    "Право отмены сделки («период охлаждения»): в соответствии со статьёй 14в Закона о защите прав потребителей, вы можете отменить сделку в течение 14 дней с момента получения товара (или с даты заключения сделки, в зависимости от того, что позже), без объяснения причин. Отмена оформляется письменным уведомлением (по эл. почте, телефонным сообщением или через форму обратной связи на сайте) с указанием данных заказа. При отмене не по причине дефекта или несоответствия взимается комиссия за отмену в размере не более 5% от суммы сделки или 100 шекелей, в зависимости от того, что меньше (эта сумма периодически обновляется согласно Положениям о защите прав потребителей; актуальная сумма будет уточнена по запросу)."
  ),
  lt(
    "תנאי המוצר להחזרה: על המוצר המוחזר להיות באריזתו המקורית, במצב שלא נעשה בו שימוש, ללא סימני נשיאה או שינוי (לרבות שינוי מידה/גודל שבוצע לאחר המסירה), ובצירוף כל תעודה, אריזה ואביזר נלווים שנמסרו עמו (כגון תעודת התאמה ליהלום, ככל שנמסרה). מוצר שלא יוחזר בהתאם לתנאים אלה עשוי לזכות בהחזר חלקי בלבד, בהתאם לירידת ערכו.",
    "Product condition for return: the returned item must be in its original packaging, unused, free of wear marks or alteration (including a size/resizing change made after delivery), and accompanied by all certificates, packaging, and accessories originally supplied with it (such as a diamond certificate, if one was provided). An item not returned in this condition may receive only a partial refund, reflecting its reduced value.",
    "Состояние товара для возврата: возвращаемый товар должен быть в оригинальной упаковке, неиспользованным, без следов носки или изменений (включая изменение размера, произведённое после доставки), и в комплекте со всеми сертификатами, упаковкой и аксессуарами, поставленными вместе с ним (например, сертификатом на бриллиант, если он предоставлялся). Товар, возвращённый не в этом состоянии, может получить только частичный возврат средств, соответствующий снижению его стоимости."
  ),
  lt(
    "חריגים לזכות הביטול: בהתאם לתקנות הגנת הצרכן (ביטול עסקה), פריטים שיוצרו, נחקקו, שוכללו במידה, או הותאמו אישית במיוחד עבורכם לפי בקשה מפורשת (ובכלל זה טבעות שגודלן שונה מהמידה הסטנדרטית, ותכשיטים עם חריטה אישית) אינם ניתנים לביטול לאחר שהחל תהליך הייצור המותאם, למעט אם נפל בהם פגם או שאינם תואמים את שהוזמן.",
    "Exceptions to the right of cancellation: under the Consumer Protection (Cancellation of Transaction) Regulations, items that were manufactured, engraved, resized, or otherwise custom-made specifically for you upon express request (including rings resized from the standard size, and jewelry with personal engraving) cannot be cancelled once the custom manufacturing process has begun, unless the item is defective or does not match what was ordered.",
    "Исключения из права отмены: в соответствии с Положениями о защите прав потребителей (об отмене сделки), изделия, изготовленные, выгравированные, изменённые по размеру или иным образом персонализированные специально для вас по прямому запросу (включая кольца, размер которых отличается от стандартного, и украшения с персональной гравировкой), не подлежат отмене после начала процесса индивидуального изготовления, за исключением случаев дефекта или несоответствия заказу."
  ),
  lt(
    "פגם או אי-התאמה: מוצר שנפל בו פגם, או שאינו תואם את התיאור שפורסם באתר, ניתן להחזירו ללא דמי ביטול ולקבל החזר כספי מלא, החלפה, או תיקון — לבחירתכם ובהתאם לזכויותיכם על פי חוק המכר, התשכ\"ח-1968 וחוק הגנת הצרכן. יש ליצור קשר בהקדם האפשרי לאחר גילוי הפגם ולפרט את הבעיה, במידת האפשר בצירוף תיעוד/תמונות.",
    "Defect or non-conformity: an item found to be defective, or that does not match the description published on the site, may be returned without a cancellation fee, for a full refund, replacement, or repair — at your choice and in accordance with your rights under the Sale Law, 5728-1968 and the Consumer Protection Law. Please contact us as soon as possible after discovering the defect and describe the issue, ideally with supporting documentation/photos.",
    "Дефект или несоответствие: товар с обнаруженным дефектом, либо не соответствующий описанию, опубликованному на сайте, может быть возвращён без комиссии за отмену для полного возврата средств, замены или ремонта — по вашему выбору и в соответствии с вашими правами по Закону о купле-продаже 5728-1968 и Закону о защите прав потребителей. Пожалуйста, свяжитесь с нами как можно скорее после обнаружения дефекта и опишите проблему, по возможности приложив документы/фотографии."
  ),
  lt(
    "כיצד לבצע ביטול או החזרה: יש ליצור קשר עם שירות הלקוחות שלנו (בפרטי הקשר לעיל, או בטופס יצירת הקשר באתר) לפני משלוח כל החזרה, לצורך אישור הביטול/ההחזרה ותיאום אופן המשלוח החוזר. עלות משלוח ההחזרה חלה על הלקוח/ה במקרה של ביטול שלא עקב פגם, ועל החברה במקרה של פגם או אי-התאמה.",
    "How to cancel or return an item: please contact our customer service (details above, or via the site's contact form) before sending any return, to confirm the cancellation/return and coordinate the return shipment. Return shipping cost is borne by the customer for a cancellation not due to a defect, and by the Company where the return is due to a defect or non-conformity.",
    "Как оформить отмену или возврат: пожалуйста, свяжитесь с нашей службой поддержки (контакты выше или через форму обратной связи на сайте) до отправки любого возврата, чтобы подтвердить отмену/возврат и согласовать способ обратной отправки. Стоимость обратной доставки несёт покупатель в случае отмены не по причине дефекта, и Компания — в случае дефекта или несоответствия."
  ),
  lt(
    "זיכוי כספי: לאחר קבלת המוצר המוחזר ובדיקתו (ותוך זמן סביר שלא יעלה, ככלל, על 14 יום), יינתן זיכוי כספי לאמצעי התשלום המקורי ששימש לביצוע ההזמנה, בניכוי דמי הביטול החלים (ככל שחלים) ובניכוי עלות המשלוח המקורי אם ההזמנה כללה משלוח בתשלום ולא הייתה מנוגדת לביטול עקב פגם.",
    "Refund: once the returned item is received and inspected (generally within a reasonable period not exceeding 14 days), a refund will be issued to the original payment method used for the order, less any applicable cancellation fee and less the original shipping cost if the order included paid shipping and the cancellation was not due to a defect.",
    "Возврат средств: после получения и проверки возвращённого товара (как правило, в разумный срок, не превышающий 14 дней), возврат средств осуществляется на первоначальный способ оплаты, использованный при оформлении заказа, за вычетом применимой комиссии за отмену и стоимости первоначальной доставки, если заказ включал платную доставку и отмена не была связана с дефектом."
  )
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
  )
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
  await upsertPage("shipping", lt("מדיניות משלוחים", "Shipping Policy", "Политика доставки"), shippingBody);
  await upsertPage("returns", lt("מדיניות ביטול, החזרות והחלפות", "Cancellation, Returns & Exchanges Policy", "Политика отмены, возврата и обмена"), returnsBody);
  await upsertPage("cookies", lt("מדיניות עוגיות", "Cookie Policy", "Политика использования файлов cookie"), cookiesBody);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
