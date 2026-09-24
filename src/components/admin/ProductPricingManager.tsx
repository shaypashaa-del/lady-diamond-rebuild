import {
  addDiamondOption,
  addMaterialOption,
  deleteDiamondOption,
  deleteMaterialOption,
  updateProductPricingSettings,
} from "@/server/actions/pricing";
import { getConfiguredPriceBreakdownForAdmin } from "@/server/actions/product-pricing";
import { PURITY_LABEL, VALID_PURITIES_FOR_METAL } from "@/lib/pricing/constants";
import type {
  DiamondCertification,
  DiamondClarityGrade,
  DiamondColorGrade,
  DiamondShape,
  DiamondType,
  GoldColor,
  MetalPurity,
  MetalType,
  PricingMode,
} from "@/generated/prisma/enums";

type MaterialOptionRow = {
  id: string;
  metalType: MetalType;
  purity: MetalPurity;
  goldColor: GoldColor | null;
  isDefault: boolean;
};

type DiamondOptionRow = {
  id: string;
  diamondType: DiamondType;
  shape: DiamondShape;
  caratWeight: unknown;
  colorGrade: DiamondColorGrade | null;
  clarityGrade: DiamondClarityGrade | null;
  certification: DiamondCertification | null;
  quantity: number;
  isDefault: boolean;
};

const GOLD_COLOR_LABEL: Record<GoldColor, string> = { YELLOW: "צהוב", WHITE: "לבן", ROSE: "רוז" };
const METAL_LABEL: Record<MetalType, string> = { GOLD: "זהב", SILVER: "כסף", PLATINUM: "פלטינה" };
const SHAPE_LABEL: Record<DiamondShape, string> = {
  ROUND: "עגול", OVAL: "אובלי", EMERALD: "אמרלד", PRINCESS: "פרינסס", PEAR: "אגס",
  MARQUISE: "מרקיז", CUSHION: "כרית", RADIANT: "רדיאנט", ASSCHER: "אשר",
};
const DIAMOND_TYPE_LABEL: Record<DiamondType, string> = { NATURAL: "טבעי", LAB_GROWN: "מעבדה" };

export async function ProductPricingManager({
  productId,
  pricingMode,
  metalWeightGrams,
  manufacturingCost,
  settingCost,
  otherCost,
  hasDiamond,
  materialOptions,
  diamondOptions,
}: {
  productId: string;
  pricingMode: PricingMode;
  metalWeightGrams: unknown;
  manufacturingCost: unknown;
  settingCost: unknown;
  otherCost: unknown;
  hasDiamond: boolean;
  materialOptions: MaterialOptionRow[];
  diamondOptions: DiamondOptionRow[];
}) {
  const missingCore = metalWeightGrams == null || manufacturingCost == null;
  const missingOptions = materialOptions.length === 0;
  const canBeConfigurable = !missingCore && !missingOptions;

  const preview = pricingMode === "CONFIGURABLE" && canBeConfigurable
    ? await getConfiguredPriceBreakdownForAdmin(productId)
    : null;

  return (
    <div className="mt-10 max-w-3xl border-t border-neutral-200 pt-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide">תמחור דינמי וחומרים</h2>
      <p className="mb-4 text-xs text-neutral-500">
        כברירת מחדל המוצר משתמש במחיר הקבוע (basePrice) כרגיל. הפעלת &quot;תמחור לפי בחירת לקוח&quot; תציג
        ללקוח בורר חומר/יהלום בעמוד המוצר, והמחיר יחושב אוטומטית — רק לאחר שכל הנתונים הנדרשים הוזנו.
      </p>

      {(missingCore || missingOptions) && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-semibold">נתוני תמחור חסרים — לא ניתן להפעיל תמחור דינמי עדיין:</p>
          <ul className="mt-1 list-inside list-disc">
            {metalWeightGrams == null && <li>משקל מתכת (גרם)</li>}
            {manufacturingCost == null && <li>עלות ייצור</li>}
            {missingOptions && <li>אין ולו אפשרות חומר אחת מוגדרת</li>}
          </ul>
        </div>
      )}

      {preview && !preview.ok && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          תמחור לא זמין כרגע: {preview.reason}
        </div>
      )}
      {preview && preview.ok && (
        <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900">
          <p className="font-semibold">תצוגה מקדימה (לפי אפשרות ברירת המחדל):</p>
          <p className="mt-1">
            עלות מתכת {preview.metalCost.toFixed(2)} ₪ · עלות יהלום {preview.diamondCost.toFixed(2)} ₪ · עלות
            ייצור {preview.manufacturingCost.toFixed(2)} ₪ · עלות שיבוץ {preview.settingCost.toFixed(2)} ₪ ·
            עלות נוספת {preview.otherCost.toFixed(2)} ₪
          </p>
          <p className="mt-1 font-semibold">
            עלות בסיס: {preview.baseCost.toFixed(2)} ₪ → מחיר מכירה (רווח גולמי 20%):{" "}
            {preview.sellingPrice.toFixed(2)} ₪ (רווח {preview.grossProfit.toFixed(2)} ₪)
          </p>
        </div>
      )}

      <form action={updateProductPricingSettings.bind(null, productId)} className="mb-6 space-y-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name="pricingMode"
            value="CONFIGURABLE"
            defaultChecked={pricingMode === "CONFIGURABLE"}
            disabled={!canBeConfigurable && pricingMode !== "CONFIGURABLE"}
          />
          תמחור לפי בחירת לקוח (במקום מחיר קבוע)
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="hasDiamond" defaultChecked={hasDiamond} />
          המוצר כולל יהלום
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="text-xs">
            משקל מתכת (גרם)
            <input
              name="metalWeightGrams"
              type="number"
              step="0.001"
              min="0"
              defaultValue={metalWeightGrams != null ? String(metalWeightGrams) : ""}
              className="mt-1 w-full border border-neutral-300 px-2 py-2"
            />
          </label>
          <label className="text-xs">
            עלות ייצור (₪)
            <input
              name="manufacturingCost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={manufacturingCost != null ? String(manufacturingCost) : ""}
              className="mt-1 w-full border border-neutral-300 px-2 py-2"
            />
          </label>
          <label className="text-xs">
            עלות שיבוץ (₪)
            <input
              name="settingCost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settingCost != null ? String(settingCost) : ""}
              className="mt-1 w-full border border-neutral-300 px-2 py-2"
            />
          </label>
          <label className="text-xs">
            עלות נוספת (₪)
            <input
              name="otherCost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={otherCost != null ? String(otherCost) : ""}
              className="mt-1 w-full border border-neutral-300 px-2 py-2"
            />
          </label>
        </div>
        <button type="submit" className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">
          שמירת הגדרות תמחור
        </button>
      </form>

      {/* Material options */}
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">אפשרויות חומר</h3>
      {materialOptions.length > 0 && (
        <table className="mb-4 w-full text-sm">
          <thead className="border-b border-neutral-200 text-right text-xs text-neutral-500">
            <tr>
              <th className="py-2 font-medium">מתכת</th>
              <th className="py-2 font-medium">טוהר</th>
              <th className="py-2 font-medium">גוון</th>
              <th className="py-2 font-medium">ברירת מחדל</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {materialOptions.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                <td className="py-2">{METAL_LABEL[m.metalType]}</td>
                <td className="py-2">{PURITY_LABEL[m.purity]}</td>
                <td className="py-2">{m.goldColor ? GOLD_COLOR_LABEL[m.goldColor] : "—"}</td>
                <td className="py-2">{m.isDefault ? "✓" : ""}</td>
                <td className="py-2">
                  <form action={deleteMaterialOption.bind(null, m.id, productId)}>
                    <button type="submit" className="text-xs text-rose-600 hover:underline">
                      מחיקה
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form action={addMaterialOption.bind(null, productId)} className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <select name="metalType" className="border border-neutral-300 px-2 py-2 text-xs" required>
          <option value="">מתכת…</option>
          <option value="GOLD">זהב</option>
          <option value="SILVER">כסף</option>
          <option value="PLATINUM">פלטינה</option>
        </select>
        <select name="purity" className="border border-neutral-300 px-2 py-2 text-xs" required>
          <option value="">טוהר…</option>
          {Object.entries(VALID_PURITIES_FOR_METAL).flatMap(([metal, purities]) =>
            purities.map((p) => (
              <option key={`${metal}-${p}`} value={p}>
                {METAL_LABEL[metal as MetalType]} · {PURITY_LABEL[p]}
              </option>
            ))
          )}
        </select>
        <select name="goldColor" className="border border-neutral-300 px-2 py-2 text-xs">
          <option value="">גוון (לזהב בלבד)</option>
          <option value="YELLOW">צהוב</option>
          <option value="WHITE">לבן</option>
          <option value="ROSE">רוז</option>
        </select>
        <label className="flex items-center gap-1 text-xs">
          <input type="checkbox" name="isDefault" /> ברירת מחדל
        </label>
        <button type="submit" className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">
          הוספה
        </button>
      </form>

      {/* Diamond options */}
      {hasDiamond && (
        <>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">אפשרויות יהלום</h3>
          {diamondOptions.length > 0 && (
            <table className="mb-4 w-full text-xs">
              <thead className="border-b border-neutral-200 text-right text-neutral-500">
                <tr>
                  <th className="py-2 font-medium">סוג</th>
                  <th className="py-2 font-medium">צורה</th>
                  <th className="py-2 font-medium">קראט</th>
                  <th className="py-2 font-medium">צבע</th>
                  <th className="py-2 font-medium">ניקיון</th>
                  <th className="py-2 font-medium">כמות</th>
                  <th className="py-2 font-medium">ברירת מחדל</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {diamondOptions.map((d) => (
                  <tr key={d.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2">{DIAMOND_TYPE_LABEL[d.diamondType]}</td>
                    <td className="py-2">{SHAPE_LABEL[d.shape]}</td>
                    <td className="py-2">{String(d.caratWeight)}</td>
                    <td className="py-2">{d.colorGrade ?? "—"}</td>
                    <td className="py-2">{d.clarityGrade ?? "—"}</td>
                    <td className="py-2">{d.quantity}</td>
                    <td className="py-2">{d.isDefault ? "✓" : ""}</td>
                    <td className="py-2">
                      <form action={deleteDiamondOption.bind(null, d.id, productId)}>
                        <button type="submit" className="text-rose-600 hover:underline">
                          מחיקה
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <form action={addDiamondOption.bind(null, productId)} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select name="diamondType" className="border border-neutral-300 px-2 py-2 text-xs" required>
              <option value="">סוג יהלום…</option>
              <option value="NATURAL">טבעי</option>
              <option value="LAB_GROWN">מעבדה</option>
            </select>
            <select name="shape" className="border border-neutral-300 px-2 py-2 text-xs" required>
              <option value="">צורה…</option>
              {Object.entries(SHAPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input name="caratWeight" type="number" step="0.001" min="0.01" placeholder="קראט" required className="border border-neutral-300 px-2 py-2 text-xs" />
            <select name="colorGrade" className="border border-neutral-300 px-2 py-2 text-xs">
              <option value="">צבע (D-J)</option>
              {["D", "E", "F", "G", "H", "I", "J"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select name="clarityGrade" className="border border-neutral-300 px-2 py-2 text-xs">
              <option value="">ניקיון</option>
              {["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select name="certification" className="border border-neutral-300 px-2 py-2 text-xs">
              <option value="">הסמכה</option>
              <option value="GIA">GIA</option>
              <option value="IGI">IGI</option>
              <option value="OTHER">אחר</option>
            </select>
            <input name="quantity" type="number" min="1" defaultValue={1} placeholder="כמות אבנים" className="border border-neutral-300 px-2 py-2 text-xs" />
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" name="isDefault" /> ברירת מחדל
            </label>
            <button type="submit" className="col-span-2 rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 sm:col-span-1">
              הוספה
            </button>
          </form>
        </>
      )}
    </div>
  );
}
