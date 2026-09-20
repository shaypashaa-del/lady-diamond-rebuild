import type { Metadata } from "next";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

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
  const page = await prisma.page.findUnique({ where: { slug: "about-us" } });
  if (!page) notFound();

  const body = page.body as unknown as AboutBody;

  return (
    <div>
      <div className="border-b border-gold-soft bg-paper-soft py-12 text-center">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.2em] text-gold-deep sm:text-4xl">
          {localize(page.title as LocalizedText, locale)}
        </h1>
      </div>

      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <Image src="/brand/about-founder.jpeg" alt="דיאנה אירימוב, מייסדת Lady Diamond" fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">{renderStory(localize(body.story, locale))}</div>

      <div className="border-t border-gold-soft bg-ink py-16 text-paper">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-8">
          <Image
            src="/brand/diana-signature.png"
            alt="Diana Irimov"
            width={220}
            height={107}
            className="mx-auto mb-8 invert"
          />
          {localize(body.quote, locale)
            .split("\n\n")
            .map((block, i) =>
              i === 0 ? (
                <h2 key={i} className="text-lg font-semibold uppercase tracking-[0.2em] text-gold-bright">
                  {block}
                </h2>
              ) : (
                <p key={i} className="mt-4 text-sm leading-7 text-paper/80">
                  {block}
                </p>
              )
            )}
        </div>
      </div>
    </div>
  );
}
