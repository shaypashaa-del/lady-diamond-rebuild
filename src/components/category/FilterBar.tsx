"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export function FilterBar({
  minPrice,
  maxPrice,
  inStockOnly,
}: {
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}) {
  const t = useTranslations("Category");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(minPrice != null ? String(minPrice) : "");
  const [max, setMax] = useState(maxPrice != null ? String(maxPrice) : "");

  function apply(next: { min?: string; max?: string; inStock?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextMin = next.min ?? min;
    const nextMax = next.max ?? max;
    const nextInStock = next.inStock ?? inStockOnly;

    if (nextMin) params.set("minPrice", nextMin);
    else params.delete("minPrice");
    if (nextMax) params.set("maxPrice", nextMax);
    else params.delete("maxPrice");
    if (nextInStock) params.set("inStock", "1");
    else params.delete("inStock");
    // A changed filter can shrink the result set below the current page.
    params.delete("page");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const hasActiveFilters = Boolean(min || max || inStockOnly);

  return (
    <div className="flex flex-wrap items-end gap-4 border-b border-gold-soft/60 pb-6">
      <div className="flex items-end gap-2">
        <label className="flex flex-col text-xs text-ink/60">
          {t("filterMinPrice")}
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={() => apply({ min })}
            onKeyDown={(e) => e.key === "Enter" && apply({ min })}
            className="mt-1 w-24 border border-gold-soft bg-paper px-2 py-1.5 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </label>
        <span className="pb-2 text-ink/40">–</span>
        <label className="flex flex-col text-xs text-ink/60">
          {t("filterMaxPrice")}
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={() => apply({ max })}
            onKeyDown={(e) => e.key === "Enter" && apply({ max })}
            className="mt-1 w-24 border border-gold-soft bg-paper px-2 py-1.5 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 pb-1.5 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={Boolean(inStockOnly)}
          onChange={(e) => apply({ inStock: e.target.checked })}
          className="h-4 w-4 accent-[var(--color-gold-bright,#ddaa5d)]"
        />
        {t("filterInStockOnly")}
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setMin("");
            setMax("");
            apply({ min: "", max: "", inStock: false });
          }}
          className="pb-1.5 text-sm text-ink/50 underline decoration-gold-soft underline-offset-4 hover:text-ink"
        >
          {t("filterClear")}
        </button>
      )}
    </div>
  );
}
