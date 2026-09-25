import { prisma } from "@/lib/prisma";
import { setDiamondBaseCostRange, deleteDiamondBaseCostRange } from "@/server/actions/pricing";

const CATEGORY_LABEL: Record<string, string> = {
  LAB_GROWN: "מעבדה (CVD/HPHT)",
  NATURAL_BROWN_CHAMPAGNE: "טבעי חום/שמפניה",
  NATURAL_WHITE_COMMERCIAL: "טבעי לבן — איכות מסחרית",
  NATURAL_WHITE_GH_VS2: "טבעי לבן — G-H / VS2",
  NATURAL_WHITE_DF_VS_VVS: "טבעי לבן — D-F / VS-VVS",
  FANCY_YELLOW: "Fancy צהוב",
  FANCY_ORANGE: "Fancy כתום",
  FANCY_PINK: "Fancy ורוד",
  FANCY_GREEN: "Fancy ירוק",
  FANCY_BLUE: "Fancy כחול",
  FANCY_RED: "Fancy אדום",
};
const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL);

export default async function DiamondBaseCostsPage() {
  const rows = await prisma.diamondBaseCostRange.findMany();
  const byCategory = new Map<string, (typeof rows)[number]>(rows.map((r) => [r.category, r]));

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">טבלת עלות בסיס ליהלום (Reference, לפי קטגוריה)</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        זו טבלת ייחוס סיטונאית בקירוב (per ~1 קראט) — <strong>לא מחיר ספק חי ולא מחיר קמעונאי סופי</strong>.
        משמשת רק כגיבוי כשאין שורה מתאימה בטבלת מחירי היהלומים הרגילה (למשל יהלומי Fancy Color או
        חום/שמפניה, שאין להם היום מקור שוק ממוצע כמו יהלום לבן רגיל). ערוך את המספרים כאן בכל עת בלי
        לגעת בקוד — זה מקור האמת היחיד לטווח הזה.
      </p>

      <table className="mb-8 w-full max-w-4xl text-xs">
        <thead className="border-b border-neutral-200 text-right text-neutral-500">
          <tr>
            <th className="py-2 font-medium">קטגוריה</th>
            <th className="py-2 font-medium">טווח ($/קראט)</th>
            <th className="py-2 font-medium">מטבע</th>
            <th className="py-2 font-medium">מקור</th>
            <th className="py-2 font-medium">הערה</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {ALL_CATEGORIES.map((category) => {
            const row = byCategory.get(category);
            return (
              <tr key={category} className="border-b border-neutral-100 last:border-0">
                <td className="py-2">{CATEGORY_LABEL[category]}</td>
                <td className="py-2" dir="ltr">
                  {row ? `${Number(row.minCostPerCarat).toLocaleString()}–${Number(row.maxCostPerCarat).toLocaleString()}` : "—"}
                </td>
                <td className="py-2">{row?.currency ?? "—"}</td>
                <td className="py-2">{row?.source ?? "—"}</td>
                <td className="py-2 text-neutral-500">{row?.note ?? ""}</td>
                <td className="py-2">
                  {row && (
                    <form action={deleteDiamondBaseCostRange.bind(null, category)}>
                      <button type="submit" className="text-rose-600 hover:underline">
                        מחיקה
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">הוספה / עדכון קטגוריה</h2>
      <form action={setDiamondBaseCostRange} className="grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
        <select name="category" className="border border-neutral-300 px-2 py-2 text-xs" required>
          <option value="">קטגוריה…</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <input name="minCostPerCarat" type="number" step="0.01" min="0" placeholder="מינימום ($/קראט)" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="maxCostPerCarat" type="number" step="0.01" min="0" placeholder="מקסימום ($/קראט)" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <select name="currency" className="border border-neutral-300 px-2 py-2 text-xs" defaultValue="USD">
          <option value="USD">USD</option>
          <option value="ILS">ILS</option>
        </select>
        <input name="source" placeholder="מקור (חובה)" required className="border border-neutral-300 px-2 py-2 text-xs sm:col-span-2" />
        <input name="note" placeholder="הערה (רשות)" className="border border-neutral-300 px-2 py-2 text-xs sm:col-span-2" />
        <button type="submit" className="col-span-2 rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 sm:col-span-1">
          שמירה
        </button>
      </form>

      <p className="mt-4 max-w-2xl text-xs text-neutral-400">
        שימו לב: אם המטבע כאן הוא USD, מנוע התמחור לא ישתמש בשורה הזו לחישוב מחיר בפועל (כדי לא
        להמציא שער המרה) — היא תוצג ללקוח כ&quot;תמחור בבדיקה&quot; עד שתוזן שורה מקבילה בש&quot;ח.
      </p>
    </div>
  );
}
