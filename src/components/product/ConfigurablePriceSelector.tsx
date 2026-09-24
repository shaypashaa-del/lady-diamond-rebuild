"use client";

import { useEffect, useState, useTransition } from "react";
import { getConfiguredPrice } from "@/server/actions/product-pricing";

type MaterialOption = {
  id: string;
  metalType: "GOLD" | "SILVER" | "PLATINUM";
  purity: "K9" | "K14" | "K18" | "K22" | "K24" | "S925" | "S999" | "PT950";
  goldColor: "YELLOW" | "WHITE" | "ROSE" | null;
  isDefault: boolean;
};

type DiamondOption = {
  id: string;
  diamondType: "NATURAL" | "LAB_GROWN";
  shape: string;
  caratWeight: number;
  colorGrade: string | null;
  clarityGrade: string | null;
  quantity: number;
  isDefault: boolean;
};

const METAL_LABEL: Record<string, string> = { GOLD: "זהב", SILVER: "כסף", PLATINUM: "פלטינה" };
const PURITY_LABEL: Record<string, string> = {
  K9: "9K", K14: "14K", K18: "18K", K22: "22K", K24: "24K", S925: "925", S999: "999", PT950: "950",
};
const GOLD_COLOR_LABEL: Record<string, string> = { YELLOW: "זהב צהוב", WHITE: "זהב לבן", ROSE: "זהב רוז" };
const SHAPE_LABEL: Record<string, string> = {
  ROUND: "עגול", OVAL: "אובלי", EMERALD: "אמרלד", PRINCESS: "פרינסס", PEAR: "אגס",
  MARQUISE: "מרקיז", CUSHION: "כרית", RADIANT: "רדיאנט", ASSCHER: "אשר",
};
const DIAMOND_TYPE_LABEL: Record<string, string> = { NATURAL: "טבעי", LAB_GROWN: "מעבדה" };

function materialLabel(m: MaterialOption) {
  const metal = m.metalType === "GOLD" && m.goldColor ? GOLD_COLOR_LABEL[m.goldColor] : METAL_LABEL[m.metalType];
  return `${metal} ${PURITY_LABEL[m.purity]}`;
}

function diamondLabel(d: DiamondOption) {
  return `${d.caratWeight}ct ${SHAPE_LABEL[d.shape]} · ${DIAMOND_TYPE_LABEL[d.diamondType]}${
    d.colorGrade ? ` · צבע ${d.colorGrade}` : ""
  }${d.clarityGrade ? ` · ניקיון ${d.clarityGrade}` : ""}`;
}

export function ConfigurablePriceSelector({
  productId,
  materialOptions,
  diamondOptions,
}: {
  productId: string;
  materialOptions: MaterialOption[];
  diamondOptions: DiamondOption[];
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

  const material = materialOptions.find((m) => m.id === materialId);
  const diamond = diamondOptions.find((d) => d.id === diamondId);

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

  return (
    <div className="mt-6 space-y-4 border-t border-gold-soft pt-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">חומר</label>
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
              {materialLabel(m)}
            </button>
          ))}
        </div>
      </div>

      {diamondOptions.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">יהלום</label>
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
                {diamondLabel(d)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plain-language summary of exactly what's selected — no internal
          cost data, per AGENTS.md step 20/26. */}
      {material && (
        <p className="rounded-lg bg-paper-soft px-4 py-3 text-sm leading-relaxed text-ink/80">
          אתה קונה: {materialLabel(material)}
          {diamond ? ` עם יהלום ${diamondLabel(diamond)}` : ""}.
        </p>
      )}

      <div className="text-2xl font-semibold text-ink" aria-live="polite">
        {isPending && "מעדכן מחיר…"}
        {!isPending && result?.ok && `${result.sellingPrice.toLocaleString("he-IL")} ₪`}
        {!isPending && result && !result.ok && (
          <span className="text-base font-normal text-ink/60">{result.message}</span>
        )}
      </div>
    </div>
  );
}
