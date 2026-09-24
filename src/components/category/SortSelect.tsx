"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { ProductSort } from "@/server/repositories/catalog";

export function SortSelect({ value, slug }: { value: ProductSort; slug: string }) {
  const t = useTranslations("Category");
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-ink/60">
      {t("sortBy")}
      <select
        value={value}
        onChange={(e) => {
          const sort = e.target.value;
          const params = new URLSearchParams(searchParams.toString());
          if (sort === "newest") params.delete("sort");
          else params.set("sort", sort);
          const qs = params.toString();
          router.push(qs ? `/category/${slug}?${qs}` : `/category/${slug}`);
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
