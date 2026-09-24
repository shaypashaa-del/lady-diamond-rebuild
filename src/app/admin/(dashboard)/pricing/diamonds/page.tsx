import { prisma } from "@/lib/prisma";
import { addDiamondPriceEntry, deleteDiamondPriceEntry } from "@/server/actions/pricing";

const SHAPE_LABEL: Record<string, string> = {
  ROUND: "עגול", OVAL: "אובלי", EMERALD: "אמרלד", PRINCESS: "פרינסס", PEAR: "אגס",
  MARQUISE: "מרקיז", CUSHION: "כרית", RADIANT: "רדיאנט", ASSCHER: "אשר",
};
const TYPE_LABEL: Record<string, string> = { NATURAL: "טבעי", LAB_GROWN: "מעבדה" };

export default async function DiamondPricingPage() {
  const entries = await prisma.diamondPriceEntry.findMany({
    orderBy: [{ diamondType: "asc" }, { shape: "asc" }, { caratMin: "asc" }],
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">טבלת מחירי יהלומים (ידני)</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        אין כיום מקור API חינמי ואמין למחירי יהלום לפי מפרט (carat/cut/color/clarity/shape) — מקורות
        מקצועיים כמו RapNet/IDEX דורשים מנוי בתשלום ואישור מפורש לפני חיבור (ראו AGENTS.md סעיף 17).
        לכן טבלה זו מנוהלת ידנית: לכל שילוב סוג-אבן/צורה/טווח קראט הזינו מחיר לקראט וציינו את המקור.
        מוצר עם יהלום שנבחרה עבורו קונפיגורציה שאין לה שורה מתאימה כאן יוצג ללקוח כ&quot;תמחור בבדיקה&quot;
        ולא יתומחר ניחוש.
      </p>

      {entries.length > 0 && (
        <table className="mb-8 w-full max-w-4xl text-xs">
          <thead className="border-b border-neutral-200 text-right text-neutral-500">
            <tr>
              <th className="py-2 font-medium">סוג</th>
              <th className="py-2 font-medium">צורה</th>
              <th className="py-2 font-medium">טווח קראט</th>
              <th className="py-2 font-medium">צבע</th>
              <th className="py-2 font-medium">ניקיון</th>
              <th className="py-2 font-medium">מחיר/קראט (₪)</th>
              <th className="py-2 font-medium">מקור</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100 last:border-0">
                <td className="py-2">{TYPE_LABEL[e.diamondType]}</td>
                <td className="py-2">{SHAPE_LABEL[e.shape]}</td>
                <td className="py-2" dir="ltr">{String(e.caratMin)}–{String(e.caratMax)}</td>
                <td className="py-2">{e.colorGrade ?? "כל צבע"}</td>
                <td className="py-2">{e.clarityGrade ?? "כל ניקיון"}</td>
                <td className="py-2">{Number(e.pricePerCarat).toLocaleString("he-IL")}</td>
                <td className="py-2">
                  {e.sourceUrl ? (
                    <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                      {e.source}
                    </a>
                  ) : (
                    e.source
                  )}
                </td>
                <td className="py-2">
                  <form action={deleteDiamondPriceEntry.bind(null, e.id)}>
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">הוספת שורת מחיר</h2>
      <form action={addDiamondPriceEntry} className="grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
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
        <input name="caratMin" type="number" step="0.001" min="0" placeholder="קראט מ-" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="caratMax" type="number" step="0.001" min="0" placeholder="קראט עד" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <select name="colorGrade" className="border border-neutral-300 px-2 py-2 text-xs">
          <option value="">כל צבע</option>
          {["D", "E", "F", "G", "H", "I", "J"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="clarityGrade" className="border border-neutral-300 px-2 py-2 text-xs">
          <option value="">כל ניקיון</option>
          {["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input name="pricePerCarat" type="number" step="0.01" min="0" placeholder="מחיר לקראט (₪)" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="source" placeholder="מקור (חובה)" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="sourceUrl" placeholder="קישור למקור" dir="ltr" className="border border-neutral-300 px-2 py-2 text-xs" />
        <button type="submit" className="col-span-2 rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 sm:col-span-1">
          הוספה
        </button>
      </form>
    </div>
  );
}
