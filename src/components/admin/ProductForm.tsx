import type { LocalizedText } from "@/lib/i18n-content";

type CategoryOption = { id: string; name: LocalizedText };
type TagOption = { id: string; name: LocalizedText };
type ProductOption = { id: string; name: LocalizedText };

type ProductFormValues = {
  slug: string;
  name?: LocalizedText;
  shortDescription?: LocalizedText | null;
  description?: LocalizedText | null;
  seoTitle?: LocalizedText | null;
  seoDescription?: LocalizedText | null;
  basePrice?: number;
  salePrice?: number | null;
  sku?: string | null;
  inventory?: number;
  status?: string;
  isFeatured?: boolean;
  categoryId?: string;
  tagIds?: string[];
  relatedIds?: string[];
};

function LocalizedInput({
  label,
  name,
  value,
  textarea,
}: {
  label: string;
  name: string;
  value?: Partial<Record<"he" | "en" | "ru", string>>;
  textarea?: boolean;
}) {
  const Field = textarea ? "textarea" : "input";
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["he", "en", "ru"] as const).map((locale) => (
          <div key={locale}>
            <span className="mb-1 block text-[10px] uppercase text-neutral-400">{locale}</span>
            <Field
              name={`${name}_${locale}`}
              defaultValue={value?.[locale] ?? ""}
              required={locale === "he" && name === "name"}
              rows={textarea ? 3 : undefined}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductForm({
  action,
  categories,
  tags,
  relatedOptions,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  tags: TagOption[];
  relatedOptions: ProductOption[];
  initial?: ProductFormValues;
  submitLabel: string;
}) {
  const selectedTagIds = new Set(initial?.tagIds ?? []);
  const selectedRelatedIds = new Set(initial?.relatedIds ?? []);

  return (
    <form action={action} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Slug (כתובת URL)</label>
          <input
            name="slug"
            defaultValue={initial?.slug}
            required
            dir="ltr"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">קטגוריה</label>
          <select
            name="categoryId"
            defaultValue={initial?.categoryId}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">— ללא —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.he}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LocalizedInput label="שם המוצר" name="name" value={initial?.name} />
      <LocalizedInput label="תיאור קצר" name="shortDescription" value={initial?.shortDescription ?? undefined} textarea />
      <LocalizedInput label="תיאור מלא" name="description" value={initial?.description ?? undefined} textarea />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">מחיר רגיל (₪)</label>
          <input
            name="basePrice"
            type="number"
            step="0.01"
            defaultValue={initial?.basePrice}
            required
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">מחיר מבצע (₪)</label>
          <input
            name="salePrice"
            type="number"
            step="0.01"
            defaultValue={initial?.salePrice ?? undefined}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">SKU</label>
          <input
            name="sku"
            defaultValue={initial?.sku ?? undefined}
            dir="ltr"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">מלאי</label>
          <input
            name="inventory"
            type="number"
            defaultValue={initial?.inventory ?? 0}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">סטטוס</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "DRAFT"}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="DRAFT">טיוטה</option>
            <option value="PUBLISHED">פורסם</option>
            <option value="ARCHIVED">בארכיון</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} />
          מוצר מומלץ
        </label>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-500">תגיות</label>
        {tags.length === 0 ? (
          <p className="text-sm text-neutral-400">אין תגיות עדיין — ניתן ליצור בעמוד ניהול התגיות.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={selectedTagIds.has(tag.id)} />
                {tag.name.he}
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-500">
          מוצרים קשורים (מוצג בעמוד המוצר — ריק = בחירה אוטומטית לפי קטגוריה)
        </label>
        {relatedOptions.length === 0 ? (
          <p className="text-sm text-neutral-400">אין מוצרים נוספים זמינים.</p>
        ) : (
          <select
            name="relatedIds"
            multiple
            defaultValue={[...selectedRelatedIds]}
            className="h-32 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            {relatedOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.he}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">SEO</h3>
        <LocalizedInput label="SEO Title" name="seoTitle" value={initial?.seoTitle ?? undefined} />
        <LocalizedInput label="Meta Description" name="seoDescription" value={initial?.seoDescription ?? undefined} textarea />
      </div>

      <button
        type="submit"
        className="rounded bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
