"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { getConfiguredPrice } from "@/server/actions/product-pricing";

export type MaterialOption = {
  id: string;
  metalType: "GOLD" | "SILVER" | "PLATINUM";
  purity: "K9" | "K14" | "K18" | "K22" | "K24" | "S925" | "S999" | "PT950";
  goldColor: "YELLOW" | "WHITE" | "ROSE" | null;
  isDefault: boolean;
  imageUrl?: string | null;
};

export type DiamondOption = {
  id: string;
  diamondType: "NATURAL" | "LAB_GROWN" | "FANCY_COLOR";
  shape: string;
  caratWeight: number;
  colorGrade: string | null;
  clarityGrade: string | null;
  quantity: number;
  isDefault: boolean;
  qualityTierLabel: string | null;
};

// Swatch colors for the round color-picker dots — a real gold-tone hex per
// color, not a generic UI accent, so the dot itself reads as "this metal"
// the way a jewelry site's swatches do.
const GOLD_COLOR_SWATCH: Record<string, string> = { YELLOW: "#D4AF37", WHITE: "#D9D9D9", ROSE: "#E8B4A0" };

type Translator = ReturnType<typeof useTranslations>;

function materialLabel(t: Translator, m: MaterialOption) {
  const metal =
    m.metalType === "GOLD" && m.goldColor ? t(`goldColor_${m.goldColor}`) : t(`metal_${m.metalType}`);
  return `${metal} ${t(`purity_${m.purity}`)}`;
}

// A customer sees "0.5ct Round · Natural · Classic" — not raw grade codes
// like "color G, clarity VS1", which mean nothing to most shoppers. The tier
// label (see DIAMOND_QUALITY_TIERS) stands in for the technical grades;
// only diamonds the admin set up without a tier fall back to showing them.
function diamondLabel(t: Translator, d: DiamondOption) {
  const quality = d.qualityTierLabel
    ? d.qualityTierLabel
    : [
        d.colorGrade && t("colorGradeLabel", { grade: d.colorGrade }),
        d.clarityGrade && t("clarityGradeLabel", { grade: d.clarityGrade }),
      ]
        .filter(Boolean)
        .join(" · ");
  return `${d.caratWeight}ct ${t(`shape_${d.shape}`)} · ${t(`diamondType_${d.diamondType}`)}${
    quality ? ` · ${quality}` : ""
  }`;
}

export function ConfigurablePriceSelector({
  productId,
  materialOptions,
  diamondOptions,
  onMaterialImageChange,
}: {
  productId: string;
  materialOptions: MaterialOption[];
  diamondOptions: DiamondOption[];
  onMaterialImageChange?: (imageUrl: string | null) => void;
}) {
  const [materialId, setMaterialId] = useState(
    materialOptions.find((m) => m.isDefault)?.id ?? materialOptions[0]?.id ?? ""
  );
  const [diamondId, setDiamondId] = useState(
    diamondOptions.find((d) => d.isDefault)?.id ?? diamondOptions[0]?.id ?? ""
  );
  const [result, setResult] = useState<{ ok: true; sellingPrice: number } | { ok: false; message: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Product");

  const material = materialOptions.find((m) => m.id === materialId);
  const diamond = diamondOptions.find((d) => d.id === diamondId);

  // Only overrides the gallery's main photo when this specific color has a
  // real photo of its own (imageUrl set) — otherwise leaves the product's
  // default image showing rather than guessing.
  useEffect(() => {
    onMaterialImageChange?.(material?.imageUrl ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.imageUrl]);

  useEffect(() => {
    if (!material) return;
    startTransition(async () => {
      const res = await getConfiguredPrice({
        productId,
        metal: { metalType: material.metalType, purity: material.purity },
        diamondOptionIds: diamond ? [diamond.id] : [],
      });
      setResult(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, materialId, diamondId]);

  if (materialOptions.length === 0) return null;

  // Gold-color options render as round swatches (matching how jewelry
  // retailers present metal color); silver/platinum and multi-purity
  // choices fall back to labeled pills since a color dot wouldn't make
  // sense for them.
  const hasGoldColorSwatches = materialOptions.some((m) => m.metalType === "GOLD" && m.goldColor);

  // If every diamond option is the same shape and type, the only real
  // choice is carat weight — show a carat dropdown instead of pills that
  // would otherwise all look identical apart from a number.
  const isCaratOnlyChoice =
    diamondOptions.length > 1 &&
    diamondOptions.every(
      (d) => d.shape === diamondOptions[0].shape && d.diamondType === diamondOptions[0].diamondType
    );

  return (
    <div className="mt-6 space-y-5 border-t border-gold-soft pt-6">
      {/* Price leads, "starting from" framing, since it changes with the
          selection below it rather than being fixed. */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/50">
          {materialOptions.length > 1 || diamondOptions.length > 1 ? t("startingFrom") : t("priceLabel")}
        </p>
        <div className="text-3xl font-semibold text-ink" aria-live="polite">
          {isPending && <span className="text-lg font-normal text-ink/50">{t("updatingPrice")}</span>}
          {!isPending && result?.ok && `${result.sellingPrice.toLocaleString("he-IL")} ₪`}
          {!isPending && result && !result.ok && (
            <span className="text-base font-normal text-ink/60">{result.message}</span>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          {hasGoldColorSwatches ? t("goldColorLabel") : t("materialLabel")}
        </label>
        {hasGoldColorSwatches ? (
          <div className="flex flex-wrap items-center gap-3">
            {materialOptions.map((m) => (
              <button
                key={m.id}
                type="button"
                title={materialLabel(t, m)}
                aria-label={materialLabel(t, m)}
                aria-pressed={m.id === materialId}
                onClick={() => setMaterialId(m.id)}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  m.id === materialId ? "border-ink scale-110" : "border-transparent hover:scale-105"
                }`}
                style={{
                  backgroundColor:
                    m.metalType === "GOLD" && m.goldColor ? GOLD_COLOR_SWATCH[m.goldColor] : "#C0C0C0",
                }}
              />
            ))}
            <span className="text-sm text-ink/70">
              {material ? materialLabel(t, material) : ""}
            </span>
          </div>
        ) : null}
        {hasGoldColorSwatches && (
          <p className="mt-2 text-xs text-ink/50">{t("madeToOrderDisclaimer")}</p>
        )}
        {!hasGoldColorSwatches && (
          <div className="flex flex-wrap gap-2">
            {materialOptions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMaterialId(m.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  m.id === materialId
                    ? "border-gold-bright bg-ink text-paper"
                    : "border-gold-soft text-ink hover:border-gold-bright"
                }`}
              >
                {materialLabel(t, m)}
              </button>
            ))}
          </div>
        )}
      </div>

      {diamondOptions.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            {isCaratOnlyChoice ? t("chooseByCarat") : t("diamondLabel")}
          </label>
          {isCaratOnlyChoice ? (
            // Same shape/type across all options (e.g. a solitaire ring
            // offered at several carat weights) — a carat dropdown reads
            // far cleaner than a row of near-identical pills, matching how
            // jewelry sites present this exact choice.
            <select
              value={diamondId}
              onChange={(e) => setDiamondId(e.target.value)}
              className="w-full max-w-[220px] border border-gold-soft bg-paper px-4 py-2.5 text-sm text-ink focus:border-gold-bright focus:outline-none"
            >
              {[...diamondOptions]
                .sort((a, b) => a.caratWeight - b.caratWeight)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {t("caratUnit", { weight: d.caratWeight })}
                  </option>
                ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              {diamondOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiamondId(d.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    d.id === diamondId
                      ? "border-gold-bright bg-ink text-paper"
                      : "border-gold-soft text-ink hover:border-gold-bright"
                  }`}
                >
                  {diamondLabel(t, d)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plain-language summary of exactly what's selected — no internal
          cost data. */}
      {material && (
        <p className="rounded-lg bg-paper-soft px-4 py-3 text-sm leading-relaxed text-ink/80">
          {t("youAreBuying", {
            summary: `${materialLabel(t, material)}${diamond ? ` · ${diamondLabel(t, diamond)}` : ""}`,
          })}
        </p>
      )}

      {diamond && (
        <details className="group border border-gold-soft/60 open:border-gold-soft">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-ink marker:content-none">
            <span className="inline-flex items-center gap-1.5">
              {t("gemstoneDetails")}
              <span className="text-ink/40 transition-transform group-open:rotate-180">▾</span>
            </span>
          </summary>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gold-soft/60 px-4 py-3 text-sm">
            <dt className="text-ink/50">{t("detailType")}</dt>
            <dd className="text-ink">{t(`diamondType_${diamond.diamondType}`)}</dd>
            <dt className="text-ink/50">{t("detailShape")}</dt>
            <dd className="text-ink">{t(`shape_${diamond.shape}`)}</dd>
            <dt className="text-ink/50">{t("detailWeight")}</dt>
            <dd className="text-ink">{t("caratUnit", { weight: diamond.caratWeight })}</dd>
            {diamond.quantity > 1 && (
              <>
                <dt className="text-ink/50">{t("detailQuantity")}</dt>
                <dd className="text-ink">{diamond.quantity}</dd>
              </>
            )}
            {diamond.colorGrade && (
              <>
                <dt className="text-ink/50">{t("detailColor")}</dt>
                <dd className="text-ink">{diamond.colorGrade}</dd>
              </>
            )}
            {diamond.clarityGrade && (
              <>
                <dt className="text-ink/50">{t("detailClarity")}</dt>
                <dd className="text-ink">{diamond.clarityGrade}</dd>
              </>
            )}
          </dl>
        </details>
      )}
    </div>
  );
}
