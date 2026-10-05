import { SavableForm } from "./SavableForm";
import { updateProductExtras } from "@/server/actions/product-extras";
import type { ProductExtras } from "@/server/product-extras";

const inputCls = "mt-1 w-full rounded border border-neutral-300 px-2 py-2 text-sm";

function Num({ name, label, value, step }: { name: string; label: string; value?: number; step?: string }) {
  return (
    <label className="text-xs">
      {label}
      <input name={name} type="number" min="0" step={step ?? "1"} defaultValue={value ?? ""} className={inputCls} />
    </label>
  );
}

function Loc({ label, name, value }: { label: string; name: string; value?: { he?: string; en?: string; ru?: string } }) {
  return (
    <div className="mb-3">
      <span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["he", "en", "ru"] as const).map((l) => (
          <div key={l}>
            <span className="mb-0.5 block text-[10px] uppercase text-neutral-400">{l}</span>
            <textarea name={`${name}_${l}`} rows={3} defaultValue={value?.[l] ?? ""} className="w-full rounded border border-neutral-300 px-2 py-2 text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-5 rounded border border-neutral-200 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">{title}</legend>
      {hint && <p className="mb-3 text-xs text-neutral-500">{hint}</p>}
      {children}
    </fieldset>
  );
}

export function ProductExtrasForm({ productId, extras }: { productId: string; extras: ProductExtras }) {
  return (
    <div className="mt-10 max-w-3xl border-t border-neutral-200 pt-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide">פרטי מסחר נוספים</h2>
      <p className="mb-4 text-xs text-neutral-500">כל השדות אופציונליים. שדה ריק = לא מוצג ולא פעיל.</p>

      <SavableForm
        action={updateProductExtras.bind(null, productId)}
        submitLabel="שמירת פרטי מסחר"
        buttonClassName="rounded bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        <Group title="תצוגה ושיווק" hint="התווית מוצגת בעמוד המוצר. מותג וברקוד נשלחים לגוגל (נתונים מובנים).">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="text-xs">
              תווית
              <select name="badge" defaultValue={extras.badge ?? ""} className={inputCls}>
                <option value="">ללא</option>
                <option value="NEW">חדש</option>
                <option value="BESTSELLER">רב מכר</option>
                <option value="LIMITED">מהדורה מוגבלת</option>
              </select>
            </label>
            <label className="text-xs">
              מותג
              <input name="brand" defaultValue={extras.brand ?? ""} placeholder="LADY DIAMOND" className={inputCls} />
            </label>
            <label className="text-xs">
              ברקוד (GTIN)
              <input name="gtin" dir="ltr" inputMode="numeric" defaultValue={extras.gtin ?? ""} className={inputCls} />
            </label>
            <label className="text-xs">
              מק״ט יצרן (MPN)
              <input name="mpn" dir="ltr" defaultValue={extras.mpn ?? ""} className={inputCls} />
            </label>
          </div>
        </Group>

        <Group title="תוכן נוסף בעמוד המוצר" hint="כל אחד מופיע כקטע נפרד מתחת לתיאור, בשפות שמולאו.">
          <Loc label="אחריות" name="warranty" value={extras.warranty} />
          <Loc label="הוראות טיפול ותחזוקה" name="care" value={extras.care} />
          <Loc label="תעודה ופרטי אבן (למשל GIA)" name="certificate" value={extras.certificate} />
        </Group>

        <Group title="מלאי והזמנה" hint="נאכף בעמוד המוצר ובקופה.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Num name="minQty" label="כמות מינימום להזמנה" value={extras.minQty} />
            <Num name="maxQty" label="כמות מקסימום להזמנה" value={extras.maxQty} />
            <Num name="lowStockThreshold" label="סף מלאי נמוך (יחידות)" value={extras.lowStockThreshold} />
            <Num name="leadTimeDays" label="זמן אספקה בהזמנה מראש (ימים)" value={extras.leadTimeDays} />
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input type="checkbox" name="allowBackorder" defaultChecked={extras.allowBackorder} />
            אפשר הזמנה גם כשאין מלאי (הזמנה מראש)
          </label>
        </Group>

        <Group title="משלוח ומידות" hint="נשמר לתיעוד ולחישובי משלוח עתידיים.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Num name="shippingWeightGrams" label="משקל משלוח (גרם)" value={extras.shippingWeightGrams} step="0.1" />
            <Num name="lengthMm" label="אורך (מ״מ)" value={extras.lengthMm} step="0.1" />
            <Num name="widthMm" label="רוחב (מ״מ)" value={extras.widthMm} step="0.1" />
            <Num name="heightMm" label="גובה (מ״מ)" value={extras.heightMm} step="0.1" />
          </div>
        </Group>

        <Group title="פנימי (לא מוצג ללקוחות)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Num name="costPrice" label="מחיר עלות (₪)" value={extras.costPrice} step="0.01" />
            <label className="text-xs">
              ספק
              <input name="supplier" defaultValue={extras.supplier ?? ""} className={inputCls} />
            </label>
          </div>
          <label className="mt-3 block text-xs">
            הערות פנימיות
            <textarea name="internalNotes" rows={3} defaultValue={extras.internalNotes ?? ""} className={inputCls} />
          </label>
        </Group>
      </SavableForm>
    </div>
  );
}
