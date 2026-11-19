import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GemBackdrop } from "@/components/gem/GemBackdrop";

const SECTIONS = 11;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AffiliateTerms");
  return { title: t("title") };
}

export default async function AffiliateTermsPage() {
  const t = await getTranslations("AffiliateTerms");
  return (
    <div>
      <div className="relative overflow-hidden bg-ink pb-12 pt-20 text-center sm:pb-16 sm:pt-24">
        <div className="relative">
          <GemBackdrop stone="diamond" />
          <span className="gold-rule mt-2 w-16" />
          <h1 className="mx-auto mt-4 max-w-3xl px-4 text-2xl font-semibold uppercase tracking-[0.15em] text-paper sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-xs text-paper/60">{t("updated")}</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="glass rounded-[28px] p-6 sm:p-10">
          <ol className="space-y-7">
            {Array.from({ length: SECTIONS }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <h2 className="text-sm font-semibold text-ink">
                  {n}. {t(`s${n}Title`)}
                </h2>
                <p className="mt-1.5 text-[0.95rem] leading-8 text-ink/75">{t(`s${n}Body`)}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-6 text-center">
          <Link href="/affiliate" className="link-underline text-sm font-medium text-ink">
            ←
          </Link>
        </p>
      </div>
    </div>
  );
}
