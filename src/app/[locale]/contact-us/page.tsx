import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { ContactForm } from "./ContactForm";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SocialLinks } from "@/components/layout/SocialLinks";

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
    <div>
      <div className="border-b border-gold-soft bg-paper-soft py-14 text-center sm:py-20">
        <p className="text-xs uppercase tracking-[0.4em] text-gold-deep">{t("kicker")}</p>
        <span className="gold-rule mt-4 w-16" />
        <h1 className="font-display mt-4 text-3xl uppercase tracking-[0.15em] text-ink sm:text-5xl">{t("title")}</h1>
        {page && (
          <p className="mx-auto mt-5 max-w-xl px-4 text-center text-sm text-ink/60">
            {localize(page.body as LocalizedText, locale)}
          </p>
        )}
      </div>

      <ScrollReveal>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          <div className="relative grid grid-cols-1 gap-10 border border-gold-soft p-6 sm:grid-cols-[1.3fr_1fr] sm:gap-0 sm:divide-x sm:divide-gold-soft sm:p-0 rtl:sm:divide-x-reverse">
            <span aria-hidden="true" className="absolute -top-3 -start-3 h-10 w-10 border-t-2 border-s-2 border-gold-bright" />
            <span aria-hidden="true" className="absolute -bottom-3 -end-3 h-10 w-10 border-b-2 border-e-2 border-gold-bright" />

            <div className="sm:p-10">
              <ContactForm />
            </div>

            <div className="bg-paper-soft p-6 sm:bg-transparent sm:p-10">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">{t("info")}</h2>
              <span className="mt-3 block h-px w-8 bg-gold-bright/60" />
              <p className="mt-5 text-sm leading-6 text-ink/70">{t("address")}</p>
              <a href="tel:+972503781589" className="mt-3 block text-sm text-ink/70 transition-colors hover:text-gold-deep" dir="ltr">
                +972-50-3781589
              </a>
              <p className="mt-2 text-sm text-ink/60">{t("hours")}</p>
              <a href="mailto:info@ladydiamondjewels.com" className="mt-3 block text-sm text-ink/70 transition-colors hover:text-gold-deep" dir="ltr">
                info@ladydiamondjewels.com
              </a>
              <SocialLinks className="mt-6 flex items-center gap-4" />
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
