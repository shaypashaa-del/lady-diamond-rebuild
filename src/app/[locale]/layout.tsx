import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Assistant, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "./globals.css";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReferralCapture } from "@/components/ReferralCapture";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";
import { getContentBlock, type AnnouncementBarContent } from "@/server/actions/content-blocks";
import { CONTENT_KEYS } from "@/lib/content-keys";
import { t as tContent } from "@/lib/i18n-content";

// Frank Ruhl Libre: an editorial Hebrew serif for headings — warm and
// crafted rather than the generic geometric sans the site launched with.
// Assistant: a clean Hebrew-native sans for body text, paired to feel
// intentional rather than a stock system-font fallback.
const displayFont = Frank_Ruhl_Libre({
  variable: "--font-display",
  subsets: ["latin", "hebrew"],
  weight: ["400", "700"],
});

const bodyFont = Assistant({
  variable: "--font-body",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s — ${t("title")}` },
    description: t("description"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === routing.defaultLocale ? "/" : `/${l}`])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: path,
      siteName: t("title"),
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  const announcement = await getContentBlock<AnnouncementBarContent>(CONTENT_KEYS.announcementBar);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${displayFont.variable} ${bodyFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <NextIntlClientProvider>
          <ReferralCapture />
          <AnnouncementBar
            text={announcement ? tContent(announcement.text, locale as Locale) : undefined}
            subscribeLabel={announcement ? tContent(announcement.linkText, locale as Locale) : undefined}
          />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
