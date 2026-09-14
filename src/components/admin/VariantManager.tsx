import { addVariant, deleteVariant } from "@/server/actions/variants";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";

type VariantRow = {
  id: string;
  sku: string | null;
  price: unknown;
  inventory: number;
  attributes: unknown;
};

export function VariantManager({ productId, variants }: { productId: string; variants: VariantRow[] }) {
  return (
    <div className="mt-10 max-w-3xl border-t border-neutral-200 pt-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
        וריאציות (למשל: צבע, מידה, חומר)
      </h2>

      {variants.length > 0 && (
        <table className="mb-6 w-full text-sm">
          <thead className="border-b border-neutral-200 text-right text-xs text-neutral-500">
            <tr>
              <th className="py-2 font-medium">ערך</th>
              <th className="py-2 font-medium">מחיר</th>
              <th className="py-2 font-medium">מלאי</th>
              <th className="py-2 font-medium">SKU</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => {
              const attrs = v.attributes as Record<string, LocalizedText>;
              const [attrName, attrValue] = Object.entries(attrs)[0] ?? [];
              return (
                <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2">
                    {attrName}: {attrValue ? localize(attrValue, "he") : ""}
                  </td>
                  <td className="py-2">{Number(v.price).toFixed(2)} ₪</td>
                  <td className="py-2">{v.inventory}</td>
                  <td className="py-2" dir="ltr">{v.sku ?? "—"}</td>
                  <td className="py-2">
                    <form action={deleteVariant.bind(null, v.id, productId)}>
                      <button type="submit" className="text-xs text-rose-600 hover:underline">
                        מחיקה
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <form action={addVariant.bind(null, productId)} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <select name="attributeName" className="border border-neutral-300 px-2 py-2 text-xs">
          <option value="color">צבע</option>
          <option value="size">מידה</option>
          <option value="material">חומר</option>
          <option value="length">אורך</option>
          <option value="stone">אבן</option>
        </select>
        <input name="value_he" placeholder="עברית" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="value_en" placeholder="English" className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="value_ru" placeholder="Русский" className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="price" type="number" step="0.01" placeholder="מחיר" required className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="inventory" type="number" placeholder="מלאי" className="border border-neutral-300 px-2 py-2 text-xs" />
        <input name="sku" placeholder="SKU" dir="ltr" className="col-span-2 border border-neutral-300 px-2 py-2 text-xs" />
        <button type="submit" className="col-span-2 rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">
          הוספת וריאציה
        </button>
      </form>
    </div>
  );
}
