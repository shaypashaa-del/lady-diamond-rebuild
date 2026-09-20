import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { ScrollReveal } from "@/components/ScrollReveal";

type AboutBody = {
  story: LocalizedText;
  quote: LocalizedText;
};

// Splits the real story text (from the DB, written by the client) into
// its natural sections by blank-line-separated blocks, where a block
// starting with "## " marks a new section heading. This is real content,
// not invented — the layout below is simply a richer presentation of the
// exact same paragraphs already approved for this page.
function parseStory(text: string) {
  const blocks = text.split("\n\n");
  const intro: string[] = [];
  const sections: { heading: string; paragraphs: string[] }[] = [];
  let current: { heading: string; paragraphs: string[] } | null = null;

  for (const block of blocks) {
    if (block.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: block.slice(3), paragraphs: [] };
    } else if (current) {
      current.paragraphs.push(block);
    } else {
      intro.push(block);
    }
  }
  if (current) sections.push(current);
  return { intro, sections };
}

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.25" />
  </svg>
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await prisma.page.findUnique({ where: { slug: "about-us" } });
  if (!page) return {};
  return { title: localize(page.title as LocalizedText, locale as Locale) };
}

export default async function AboutUsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const page = await prisma.page.findUnique({ where: { slug: "about-us" } });
  if (!page) notFound();

  const body = page.body as unknown as AboutBody;
  const { intro, sections } = parseStory(localize(body.story, locale));
  const [birthOfBrand, aroundTheWorld, dianaFeature] = sections;

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-gold-soft bg-paper-soft py-16 text-center sm:py-24">
        <DiamondMark className="pointer-events-none absolute -top-16 -end-16 h-72 w-72 text-gold-bright/[0.07]" />
        <p className="text-xs uppercase tracking-[0.4em] text-gold-deep">{t("heroKicker")}</p>
        <span className="gold-rule mt-4 w-16" />
        <h1 className="font-display mt-4 text-3xl uppercase tracking-[0.15em] text-ink sm:text-5xl">
          {localize(page.title as LocalizedText, locale)}
        </h1>
        {intro[0] && (
          <p className="font-display mx-auto mt-5 max-w-md px-4 text-lg italic text-ink/70 sm:text-xl">{intro[0]}</p>
        )}
      </div>

      {/* FOUNDER INTRO */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-12 sm:grid-cols-12 sm:gap-10">
          <ScrollReveal className="relative sm:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-gold-bright">
              <Image
                src="/brand/about-founder.jpeg"
                alt="דיאנה אירימוב, מייסדת Lady Diamond"
                fill
                sizes="(min-width: 640px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* A second, offset outline behind the photo — a quiet "double
                frame" motif instead of a plain bordered rectangle. */}
            <div aria-hidden="true" className="absolute -z-10 inset-4 -bottom-4 -end-4 border border-gold-soft bg-paper-soft sm:inset-6 sm:-bottom-6 sm:-end-6" />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="sm:col-span-7">
            <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">{t("founderKicker")}</p>
            {intro[1] && (
              <p className="font-display mt-3 text-2xl leading-snug text-ink sm:text-3xl">{intro[1]}</p>
            )}
            {intro[2] && <p className="mt-5 text-sm leading-7 text-ink/60">{intro[2]}</p>}
          </ScrollReveal>
        </div>
      </section>

      {/* BIRTH OF THE BRAND — DARK BAND */}
      {birthOfBrand && (
        <section className="relative overflow-hidden bg-ink py-16 text-paper sm:py-24">
          <DiamondMark className="pointer-events-none absolute -bottom-14 -start-14 h-56 w-56 text-paper/[0.04]" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-12 sm:gap-10">
              <ScrollReveal className="order-2 sm:order-1 sm:col-span-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gold-bright">{t("heroKicker")}</p>
                <h2 className="font-display mt-3 text-2xl text-paper sm:text-4xl">{birthOfBrand.heading}</h2>
                <span className="mt-4 block h-px w-12 bg-gold-bright/60" />
                {birthOfBrand.paragraphs.map((p, i) => (
                  <p key={i} className="mt-5 text-sm leading-7 text-paper/60">
                    {p}
                  </p>
                ))}
              </ScrollReveal>
              <ScrollReveal delay={0.1} className="order-1 sm:order-2 sm:col-span-5 sm:col-start-8">
                <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden border border-paper/15 sm:max-w-none">
                  <Image
                    src="/brand/products/necklace-heart-yellow-gold-model.jpeg"
                    alt="דוגמנית עונדת שרשרת לב זהב של Lady Diamond בתצוגה"
                    fill
                    sizes="(min-width: 640px) 35vw, 80vw"
                    className="object-cover"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* AROUND THE WORLD — VALUES */}
      {aroundTheWorld && (
        <ScrollReveal>
          <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-8 sm:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">{aroundTheWorld.heading}</p>
            <span className="gold-rule mt-4 w-16" />
            {aroundTheWorld.paragraphs.map((p, i) => (
              <p key={i} className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink/60">
                {p}
              </p>
            ))}

            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
              {[
                { title: t("value1Title"), copy: t("value1Copy") },
                { title: t("value2Title"), copy: t("value2Copy") },
                { title: t("value3Title"), copy: t("value3Copy") },
              ].map((v) => (
                <div key={v.title} className="flex flex-col items-center gap-3">
                  <DiamondMark className="h-8 w-8 text-gold-bright" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink">{v.title}</h3>
                  <p className="text-xs leading-6 text-ink/50">{v.copy}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* DIANA — NAME FEATURE */}
      {dianaFeature && (
        <section className="border-t border-gold-soft bg-paper-soft py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-12 sm:gap-10">
              <ScrollReveal className="sm:col-span-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-gold-bright">
                  <Image
                    src="/brand/about-founder.jpeg"
                    alt="דיאנה אירימוב"
                    fill
                    sizes="(min-width: 640px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1} className="sm:col-span-7">
                <span className="font-display shimmer-text-gold text-5xl italic sm:text-6xl">דיאנה</span>
                <h2 className="font-display mt-4 text-xl text-ink sm:text-2xl">{dianaFeature.heading}</h2>
                {dianaFeature.paragraphs.map((p, i) => (
                  <p key={i} className="mt-5 text-sm leading-7 text-ink/60">
                    {p}
                  </p>
                ))}
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* CLOSING QUOTE */}
      <div className="relative overflow-hidden border-t border-gold-bright/20 bg-ink py-16 text-paper sm:py-24">
        <DiamondMark className="pointer-events-none absolute -top-10 -end-10 h-56 w-56 text-paper/[0.04]" />
        <ScrollReveal>
          <div className="relative mx-auto max-w-xl px-4 text-center sm:px-8">
            <Image
              src="/brand/diana-signature.png"
              alt="Diana Irimov"
              width={220}
              height={107}
              className="mx-auto mb-8 h-auto w-40 invert sm:w-52"
            />
            {localize(body.quote, locale)
              .split("\n\n")
              .map((block, i) =>
                i === 0 ? (
                  <h2 key={i} className="font-display shimmer-text-gold text-2xl leading-snug sm:text-3xl">
                    {block}
                  </h2>
                ) : (
                  <p key={i} className="mt-5 text-sm leading-7 text-paper/70">
                    {block}
                  </p>
                )
              )}
            <span aria-hidden="true" className="gold-rule mt-8 w-16" />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
