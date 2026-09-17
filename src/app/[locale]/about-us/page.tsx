import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

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
  const page = await prisma.page.findUnique({ where: { slug: "about-us" } });
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <h1 className="mb-6 text-xl font-semibold uppercase tracking-wide">
        {localize(page.title as LocalizedText, locale)}
      </h1>
      <p className="whitespace-pre-line text-sm leading-7 text-ink/70">
        {localize(page.body as LocalizedText, locale)}
      </p>
    </div>
  );
}
