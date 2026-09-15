import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { ContactForm } from "./ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await prisma.page.findUnique({ where: { slug: "contact-us" } });
  if (!page) return {};
  return { title: localize(page.title as LocalizedText, locale as Locale) };
}

export default async function ContactUsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ContactPage");
  const page = await prisma.page.findUnique({ where: { slug: "contact-us" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="mb-4 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      {page && (
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-neutral-500">
          {localize(page.body as LocalizedText, locale)}
        </p>
      )}

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <ContactForm />
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("info")}
          </h2>
          <p className="text-sm text-neutral-600" dir="ltr">info@ladydiamondjewels.com</p>
        </div>
      </div>
    </div>
  );
}
