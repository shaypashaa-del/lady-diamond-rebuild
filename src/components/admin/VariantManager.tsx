import { addVariant, deleteVariant, updateVariant } from "@/server/actions/variants";
import { SavableForm } from "./SavableForm";
import type { LocalizedText } from "@/lib/i18n-content";

type VariantRow = {
  id: string;
  sku: string | null;
  price: unknown;
  salePrice?: unknown;
  inventory: number;
  imageId?: string | null;
  attributes: unknown;
};

type ImageOption = { mediaId: string; filename: string };

const ATTR_LABEL: Record<string, string> = { color: "צבע", size: "מידה", material: "חומר", length: "אורך", stone: "אבן" };
const cell = "w-full rounded border border-neutral-300 px-2 py-1.5 text-xs";
const addBtn = "rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50";

function ImageSelect({ images, value }: { images: ImageOption[]; value?: string | null }) {
  return (
    <select name="imageId" defaultValue={value ?? ""} aria-label="תמונה" className={cell}>
      <option value="">ללא תמונה</option>
      {images.map((i) => (
        <option key={i.mediaId} value={i.mediaId}>
          {i.filename}
        </option>
      ))}
    </select>
  );
}

export function VariantManager({
  productId,
  variants,
  images = [],
}: {
  productId: string;
  variants: VariantRow[];
  images?: ImageOption[];
}) {
  return (
    <div className="mt-10 max-w-3xl border-t border-neutral-200 pt-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide">וריאציות (למשל: צבע, מידה, חומר)</h2>
      <p className="mb-4 text-xs text-neutral-500">
        לכל וריאציה מחיר, מחיר מבצע, מלאי, מק״ט ותמונה משלה. עריכה שומרת על אותה וריאציה, כך שהזמנות ועגלות קיימות לא נפגעות.
      </p>

      {variants.map((v) => {
        const attrs = (v.attributes as Record<string, LocalizedText>) ?? {};
        const [attrName, attrValue] = Object.entries(attrs)[0] ?? ["color", { he: "" }];
        const val = attrValue as { he?: string; en?: string; ru?: string };
        return (
          <div key={v.id}>
          <SavableForm
            action={updateVariant.bind(null, v.id, productId)}
            className="mb-3 rounded border border-neutral-200 p-3"
            submitLabel="שמירה"
            buttonClassName={addBtn}
          >
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold">{ATTR_LABEL[attrName] ?? attrName}</span>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-2">
              <input name="value_he" defaultValue={val.he ?? ""} placeholder="עברית" required className={cell} />
              <input name="value_en" defaultValue={val.en ?? ""} placeholder="English" className={cell} />
              <input name="value_ru" defaultValue={val.ru ?? ""} placeholder="Русский" className={cell} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <label className="text-[11px] text-neutral-500">
                מחיר (₪)
                <input name="price" type="number" step="0.01" min="0" defaultValue={Number(v.price)} required className={cell} />
              </label>
              <label className="text-[11px] text-neutral-500">
                מבצע (₪)
                <input name="salePrice" type="number" step="0.01" min="0" defaultValue={v.salePrice != null ? Number(v.salePrice) : ""} className={cell} />
              </label>
              <label className="text-[11px] text-neutral-500">
                מלאי
                <input name="inventory" type="number" min="0" defaultValue={v.inventory} className={cell} />
              </label>
              <label className="text-[11px] text-neutral-500">
                SKU
                <input name="sku" dir="ltr" defaultValue={v.sku ?? ""} className={cell} />
              </label>
              <label className="text-[11px] text-neutral-500">
                תמונה
                <ImageSelect images={images} value={v.imageId} />
              </label>
            </div>
          </SavableForm>
          <form action={deleteVariant.bind(null, v.id, productId)} className="-mt-2 mb-3 text-end">
            <button className="text-xs text-red-600 underline">מחיקת וריאציה</button>
          </form>
          </div>
        );
      })}

      <SavableForm
        action={addVariant.bind(null, productId)}
        className="mt-4 rounded border border-dashed border-neutral-300 p-3"
        submitLabel="הוספת וריאציה"
        buttonClassName={addBtn}
      >
        <p className="mb-2 text-xs font-semibold">וריאציה חדשה</p>
        <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select name="attributeName" className={cell}>
            {Object.entries(ATTR_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <input name="value_he" placeholder="עברית" required className={cell} />
          <input name="value_en" placeholder="English" className={cell} />
          <input name="value_ru" placeholder="Русский" className={cell} />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input name="price" type="number" step="0.01" min="0" placeholder="מחיר" required className={cell} />
          <input name="salePrice" type="number" step="0.01" min="0" placeholder="מבצע" className={cell} />
          <input name="inventory" type="number" min="0" placeholder="מלאי" className={cell} />
          <input name="sku" dir="ltr" placeholder="SKU" className={cell} />
          <ImageSelect images={images} />
        </div>
      </SavableForm>
    </div>
  );
}
