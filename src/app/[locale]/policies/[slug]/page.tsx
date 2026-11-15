import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { GemBackdrop } from "@/components/gem/GemBackdrop";

// This page reads its content from the DB (Page model) via a plain Prisma
// query in a Server Component — without an explicit revalidate, Next.js
// statically freezes it at build time, so admin edits to policy pages
// never show up in production (same class of bug as the shapes-page
// pricing freeze).
export const revalidate = 300;

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
    <div>
      <div className="relative overflow-hidden bg-ink py-12 text-center sm:py-16">
        <div className="relative">
          <GemBackdrop stone="diamond" />
          <span className="gold-rule mt-2 w-16" />
          <h1 className="mx-auto mt-4 max-w-3xl px-4 text-2xl font-semibold uppercase tracking-[0.15em] text-paper sm:text-4xl">
            {localize(page.title as LocalizedText, locale)}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="glass rounded-[28px] p-6 sm:p-10">
          <p className="whitespace-pre-line text-[0.95rem] leading-8 text-ink/75">
            {localize(page.body as LocalizedText, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
