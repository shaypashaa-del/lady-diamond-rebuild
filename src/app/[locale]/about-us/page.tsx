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

function renderStory(text: string) {
  return text.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 text-lg font-semibold uppercase tracking-[0.2em] text-ink first:mt-0">
          {block.slice(3)}
          <span className="gold-rule-start mt-3 w-10" />
        </h2>
      );
    }
    return (
      <p key={i} className="mt-4 text-sm leading-7 text-ink/70">
        {block}
      </p>
    );
  });
}

export default async function AboutUsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const page = await prisma.page.findUnique({ where: { slug: "about-us" } });
  if (!page) notFound();

  const body = page.body as unknown as AboutBody;

  return (
    <div>
      <div className="border-b border-gold-soft bg-paper-soft py-14 text-center sm:py-20">
        <p className="text-xs uppercase tracking-[0.4em] text-gold-deep">{t("heroKicker")}</p>
        <span className="gold-rule mt-4 w-16" />
        <h1 className="font-display mt-4 text-3xl uppercase tracking-[0.15em] text-ink sm:text-5xl">
          {localize(page.title as LocalizedText, locale)}
        </h1>
      </div>

      <ScrollReveal>
        <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-6xl px-4 sm:aspect-[21/9] sm:px-8">
          <div className="relative h-full w-full overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)]">
            <Image
              src="/brand/about-founder.jpeg"
              alt="דיאנה אירימוב, מייסדת Lady Diamond"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          {/* Two fine corner brackets in gold — a quiet "framed portrait"
              motif instead of a plain rectangular photo. */}
          <span aria-hidden="true" className="absolute -top-3 -start-3 h-10 w-10 border-t-2 border-s-2 border-gold-bright" />
          <span aria-hidden="true" className="absolute -bottom-3 -end-3 h-10 w-10 border-b-2 border-e-2 border-gold-bright" />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8 sm:py-20">{renderStory(localize(body.story, locale))}</div>
      </ScrollReveal>

      <div className="relative overflow-hidden border-t border-gold-bright/20 bg-ink py-16 text-paper sm:py-24">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-10 -end-10 h-56 w-56 text-paper/[0.04]"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            d="M100 10 L160 70 L100 190 L40 70 Z M40 70 L160 70 M70 70 L100 190 M130 70 L100 190"
          />
        </svg>
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
