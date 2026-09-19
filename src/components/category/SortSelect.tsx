"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ProductSort } from "@/server/repositories/catalog";

export function SortSelect({ value, slug }: { value: ProductSort; slug: string }) {
  const t = useTranslations("Category");
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-ink/60">
      {t("sortBy")}
      <select
        value={value}
        onChange={(e) => {
          const sort = e.target.value;
          router.push(sort === "newest" ? `/category/${slug}` : `/category/${slug}?sort=${sort}`);
        }}
        className="border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="price_asc">{t("sortPriceAsc")}</option>
        <option value="price_desc">{t("sortPriceDesc")}</option>
      </select>
    </label>
  );
}
