"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

export function AffiliateLinkGenerator({
  code,
  products,
}: {
  code: string;
  products: { slug: string; name: unknown }[];
}) {
  const t = useTranslations("Affiliate");
  const locale = useLocale() as Locale;
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const link = slug
    ? `https://ladydiamondjewels.com/product/${slug}?ref=${code}`
    : `https://ladydiamondjewels.com/?ref=${code}`;

  function copy() {
    navigator.clipboard
      ?.writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  }

  return (
    <div className="border border-gold-soft p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/60">{t("linkGenerator")}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="flex-1 border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
        >
          <option value="">{t("homepageOption")}</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {localize(p.name as LocalizedText, locale)}
            </option>
          ))}
        </select>
        <button
          onClick={copy}
          className="border border-gold-bright px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gold-bright hover:text-ink"
        >
          {copied ? t("copied") : t("copyLink")}
        </button>
      </div>
      <p className="mt-3 break-all text-xs text-ink/60" dir="ltr">
        {link}
      </p>
    </div>
  );
}
