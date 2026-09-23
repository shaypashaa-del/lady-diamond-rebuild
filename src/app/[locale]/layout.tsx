import type { Metadata } from "next";
import { Rubik, Italiana, Geist_Mono } from "next/font/google";
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
import { WhatsappButton } from "@/components/layout/WhatsappButton";
import { ShootingStar } from "@/components/layout/ShootingStar";
import { SparkleCursor } from "@/components/layout/SparkleCursor";
import { AccessibilityWidget } from "@/components/layout/AccessibilityWidget";
import { IntroReveal } from "@/components/layout/IntroReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";
import { getContentBlock, type AnnouncementBarContent } from "@/server/actions/content-blocks";
import { CONTENT_KEYS } from "@/lib/content-keys";
import { t as tContent } from "@/lib/i18n-content";

// Rubik: a clean geometric sans with full Hebrew + Cyrillic + Latin coverage
// — matches the real brand's actual look (its live site runs Poppins, which
// has no Hebrew glyphs; Rubik is the closest Hebrew-native equivalent) rather
// than the invented editorial-serif direction from an earlier pass. It is the
// single typeface used across all three site languages (he/en/ru) so that
// switching languages never swaps in a different, unstyled fallback font.
const bodyFont = Rubik({
  variable: "--font-body",
  subsets: ["latin", "hebrew", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Italiana: has no Hebrew or Cyrillic glyphs, so it is reserved strictly for
// the fixed Latin brand wordmark ("Lady Diamond" in the header) that is never
// translated. It must never be applied to translated headings/body text —
// doing so silently falls back to the browser's default serif for Hebrew and
// Russian, breaking the "one consistent font everywhere" requirement.
const displayFont = Italiana({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
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
    // Makes "Add to Home Screen" launch as a standalone app (no browser
    // chrome) on iOS, using the real brand icon rather than a screenshot of
    // the page — appleWebApp controls Safari's behavior specifically, since
    // iOS only partially honors the web manifest (auto-linked separately via
    // the src/app/manifest.ts file convention).
    appleWebApp: {
      capable: true,
      title: "LADY DIAMOND",
      statusBarStyle: "default",
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
      className={`${bodyFont.variable} ${geistMono.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IntroReveal />
        <ShootingStar />
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
          <WhatsappButton />
          <SparkleCursor />
          <AccessibilityWidget />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
