import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.5" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.5" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return {};
  return { title: localize(page.title as LocalizedText, locale as Locale) };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <DiamondMark className="h-7 w-7 text-gold-bright" />
      <h1 className="mt-3 mb-6 text-xl font-semibold uppercase tracking-wide">
        {localize(page.title as LocalizedText, locale)}
      </h1>
      <p className="whitespace-pre-line text-sm leading-7 text-ink/70">
        {localize(page.body as LocalizedText, locale)}
      </p>
    </div>
  );
}
