// One-off: replaces the About Us page content with the real founder
// story copied verbatim (English) / translated (he, ru) from the live
// site's about-us page, per explicit client request to match it 1:1.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const title = {
  he: "אודות",
  en: "About Us",
  ru: "О нас",
};

const body = {
  he: `האישה שמאמינה שכל אישה היא יהלום

יש הנולדים עם חוש לעיצוב, ויש הנולדים עם תשוקה ליופי — דיאנה נולדה עם שניהם, עטופה בנשמה של סוחרת עתיקה ובחזון של יוצרת מודרנית שיודעת לזהות יהלום עוד לפני שנחתך.

הכל התחיל במסע אישי. כאישה צעירה עם אהבה אינסופית לאסתטיקה, דיאנה גילתה את הקסם של אבני החן במהלך טיול באסיה. היא מצאה את עצמה שבויה ביופיין הנסתר, באנרגיה שלהן, ובסיפורים הבלתי מסופרים החבויים בכל יהלום ופנינה. מה שהתחיל כרגע של התפעלות הפך עד מהרה למטרת חייה — להביא לעולם יצירות נדירות שגורמות לכל אישה להרגיש ייחודית באמת.

## הולדת המותג

מונחית מתוך חזון של יושרה, הגינות ומקצועיות שאינה יודעת פשרות, דיאנה הקימה את בית היוקרה שלה — LADY DIAMOND. כל פריט, כל אבן וכל עיצוב נבחרים ומעודנים באופן אישי תחת עינה הפקוחה של דיאנה, מתוך אמונתה שהיופי האמיתי טמון בפרטים הקטנים ביותר — ובאותנטיות של היוצר.

הלקוחות שלה אינם רק לקוחות — הם שותפים למסע משותף. רבים חוזרים שוב ושוב, נמשכים אל קשר הבנוי על שקיפות, נדיבות והבנה עמוקה של מה שהופך מתנה לנצחית.

## מסביב לעולם — למען אישה אחת

דיאנה נוסעת בין יבשות, ירידי מסחר ובורסות יהלומים בלעדיות בחיפוש אחר היוצא דופן — אבנים ייחודיות, עיצובים נדירים וסיפורים ארוגים בזהב. היא מאמינה שלכל אישה יש סיפור משלה, ושכל פריט תכשיט צריך להיות פרק בו — אישי, בלתי חוזר, ומושלם בשבילה בלבד.

## 💫 דיאנה — שם נרדף לסטייל, אמת וקסם

מטבעת יהלום קלאסית ועד תליון עבודת יד שמקורו בקצוות רחוקים של העולם, דיאנה משרה בכל יצירה את הנגיעה הבלתי ניתנת לטעות שלה. היא לא רק מוכרת תכשיטים — היא מגשימה חלומות, עוטפת רגשות בברק, ומעניקה לכל אישה את ההזדמנות ללבוש את הסיפור שלה.`,
  en: `The Woman Who Believes Every Woman Is a Diamond

Some are born with a sense for design, others with a passion for beauty — Diana was born with both, wrapped in the soul of an ancient merchant and the vision of a modern creator who can recognize a diamond long before it is cut.

It all began with a personal journey. As a young woman with an endless love for aesthetics, Diana discovered the magic of gemstones during a trip through Asia. She found herself captivated by their hidden beauty, their energy, and the untold stories within every diamond and pearl. What began as a moment of wonder soon became her life's purpose — to bring to the world rare creations that make every woman feel truly one of a kind.

## The Birth of the Brand

Guided by a vision of integrity, fairness, and uncompromising professionalism, Diana founded her house of luxury — LADY DIAMOND. Every piece, every stone, and every design is personally chosen and refined under Diana's watchful eye, driven by her belief that true beauty lies in the smallest details — and in the creator's authenticity.

Her clients are not just customers — they are partners in a shared journey. Many return time and again, drawn by a bond built on transparency, generosity, and a deep understanding of what makes a gift timeless.

## Around the World — For One Woman

Diana travels across continents, trade fairs, and exclusive diamond exchanges in search of the extraordinary — unique stones, rare designs, and stories woven in gold. She believes that every woman carries her own story, and that each piece of jewelry should be a chapter in it — individual, unrepeatable, and perfect for her alone.

## 💫 Diana — A Name Synonymous with Style, Truth, and Magic

From a classic diamond ring to a handcrafted pendant sourced from the far corners of the world, Diana infuses each creation with her unmistakable touch. She doesn't just sell jewelry — she fulfills dreams, wraps emotions in brilliance, and offers every woman the chance to wear her own story.`,
  ru: `Женщина, которая верит, что каждая женщина — бриллиант

Одни рождаются с чувством стиля, другие — со страстью к красоте. Диана родилась и с тем, и с другим — с душой древнего торговца и видением современного творца, способного разглядеть бриллиант ещё до огранки.

Всё началось с личного пути. Будучи молодой женщиной с безграничной любовью к эстетике, Диана открыла для себя магию драгоценных камней во время путешествия по Азии. Она была очарована их скрытой красотой, энергией и невысказанными историями внутри каждого бриллианта и жемчужины. То, что начиналось как момент восхищения, вскоре стало целью её жизни — дарить миру редкие творения, которые заставляют каждую женщину чувствовать себя по-настоящему уникальной.

## Рождение бренда

Руководствуясь принципами честности, справедливости и безупречного профессионализма, Диана основала свой дом роскоши — LADY DIAMOND. Каждое изделие, каждый камень и каждый дизайн лично отбираются и дорабатываются под пристальным взглядом Дианы, ведь она верит, что настоящая красота — в мельчайших деталях и в подлинности создателя.

Её клиенты — не просто покупатели, а партнёры в общем пути. Многие возвращаются снова и снова, привлечённые связью, построенной на прозрачности, щедрости и глубоком понимании того, что делает подарок вечным.

## Вокруг света — ради одной женщины

Диана путешествует по континентам, выставкам и эксклюзивным биржам бриллиантов в поисках необычного — уникальных камней, редких дизайнов и историй, вплетённых в золото. Она верит, что у каждой женщины есть своя история, и каждое украшение должно стать её главой — личной, неповторимой и созданной только для неё.

## 💫 Диана — имя, синоним стиля, правды и волшебства

От классического бриллиантового кольца до подвески ручной работы, привезённой из дальних уголков света, Диана вкладывает в каждое творение свой неповторимый почерк. Она не просто продаёт украшения — она исполняет мечты, облекает эмоции в блеск и дарит каждой женщине возможность носить свою собственную историю.`,
};

const quote = {
  he: `ברוכים הבאים אל דיאנה ליידי דיאמונד

מאז הייתי ילדה קטנה, נמשכתי אל האופן שבו תכשיט יכול להכיל בתוכו רגשות, זכרונות וחלומות. עבורי, כל פריט הוא הרבה מעבר לאביזר — הוא סיפור, שיקוף של אהבה, עוצמה ויופי.

אני יוצרת כל עיצוב במגע רגיש ובלב מלא בתשוקה, כך שכשתלבשו אותו, לא תלבשו רק תכשיט — תלבשו פיסת משמעות, שנוצרה במיוחד כדי לעורר בכם השראה ולהעצים אתכם.

החלום שלי פשוט: לשתף ביופי, באלגנטיות וברגעים בלתי נשכחים עם נשים וגברים ברחבי העולם. כשאתם בוחרים פריט מדיאנה ליידי דיאמונד, אתם לא רק קונים תכשיט — אתם הופכים לחלק מסיפור שחוגג אתכם.`,
  en: `Welcome to Diana Lady Diamond

Ever since I was a little girl, I've been fascinated by the way jewelry can hold emotions, memories, and dreams. For me, every piece is more than just an accessory – it's a story, a reflection of love, strength, and beauty.

I create each design with a sensitive touch and a heart full of passion, so that when you wear it, you don't just wear jewelry – you wear a piece of meaning, crafted especially to inspire and empower you.

My dream is simple: to share beauty, elegance, and unforgettable moments with women and men around the world. When you choose a piece from Diana Lady Diamond, you're not only buying jewelry – you're becoming part of a story that celebrates you.`,
  ru: `Добро пожаловать в Diana Lady Diamond

С самого детства меня завораживало то, как украшения способны хранить в себе эмоции, воспоминания и мечты. Для меня каждое изделие — это больше, чем аксессуар: это история, отражение любви, силы и красоты.

Я создаю каждый дизайн с чуткостью и сердцем, полным страсти, чтобы, надевая его, вы носили не просто украшение, а частицу смысла, созданную специально, чтобы вдохновлять и придавать вам силы.

Моя мечта проста: делиться красотой, элегантностью и незабываемыми моментами с женщинами и мужчинами по всему миру. Выбирая изделие от Diana Lady Diamond, вы не просто покупаете украшение — вы становитесь частью истории, которая прославляет вас.`,
};

async function main() {
  await prisma.page.upsert({
    where: { slug: "about-us" },
    update: { title, body: { story: body, quote } as never },
    create: { slug: "about-us", title, body: { story: body, quote } as never },
  });
  console.log("Updated about-us page content.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
