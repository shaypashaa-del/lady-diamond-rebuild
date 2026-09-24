import { getAllMetalPrices, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { setManualMetalPriceAction } from "@/server/actions/pricing";
import { PURITY_LABEL, VALID_PURITIES_FOR_METAL } from "@/lib/pricing/constants";

const METAL_LABEL: Record<string, string> = { GOLD: "זהב", SILVER: "כסף", PLATINUM: "פלטינה" };

export default async function MetalPricesPage() {
  await refreshGoldPriceIfStale();
  const prices = await getAllMetalPrices();
  const byType = new Map(prices.map((p) => [p.metalType, p]));

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">מחירי מתכות (ייחוס, 100% טוהר)</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        זהו מחיר הייחוס למתכת טהורה (24K לזהב / 999 לכסף / 950 לפלטינה) לגרם, ש-Pricing Engine מכפיל
        באחוז הטוהר של כל אפשרות חומר בפועל. זהב מתעדכן אוטומטית ממקור חי (goldprice.dev). כסף ופלטינה
        אין להם היום מקור חינמי אמין, ולכן יש להזין אותם ידנית — ראו AGENTS.md סעיף 17.
      </p>

      <table className="mb-10 w-full max-w-2xl text-sm">
        <thead className="border-b border-neutral-200 text-right text-xs text-neutral-500">
          <tr>
            <th className="py-2 font-medium">מתכת</th>
            <th className="py-2 font-medium">מחיר לגרם (₪)</th>
            <th className="py-2 font-medium">מקור</th>
            <th className="py-2 font-medium">עודכן</th>
          </tr>
        </thead>
        <tbody>
          {(["GOLD", "SILVER", "PLATINUM"] as const).map((metalType) => {
            const row = byType.get(metalType);
            return (
              <tr key={metalType} className="border-b border-neutral-100 last:border-0">
                <td className="py-2">{METAL_LABEL[metalType]}</td>
                <td className="py-2">{row ? Number(row.pricePerGram).toFixed(2) : "— אין נתון"}</td>
                <td className="py-2">
                  {row ? (row.isManual ? `ידני: ${row.source}` : row.source) : "—"}
                </td>
                <td className="py-2" dir="ltr">
                  {row ? new Date(row.fetchedAt).toLocaleString("he-IL") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">עדכון ידני</h2>
      <form action={setManualMetalPriceAction} className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
        <select name="metalType" className="border border-neutral-300 px-2 py-2 text-xs" required>
          <option value="">מתכת…</option>
          {Object.keys(VALID_PURITIES_FOR_METAL).map((m) => (
            <option key={m} value={m}>
              {METAL_LABEL[m]}
            </option>
          ))}
        </select>
        <input
          name="pricePerGram"
          type="number"
          step="0.01"
          min="0"
          placeholder="מחיר לגרם (100% טוהר)"
          required
          className="border border-neutral-300 px-2 py-2 text-xs"
        />
        <input name="source" placeholder="מקור (שם)" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="sourceUrl" placeholder="קישור למקור" dir="ltr" className="border border-neutral-300 px-2 py-2 text-xs" />
        <button type="submit" className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">
          שמירה
        </button>
      </form>
      <p className="mt-2 text-xs text-neutral-400">לעיון: טבלת הטוהר הנוכחית — {Object.values(PURITY_LABEL).join(", ")}</p>
    </div>
  );
}
