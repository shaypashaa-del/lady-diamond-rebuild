import type { LocalizedText } from "@/lib/i18n-content";

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

export function CategoryForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initial?: { slug: string; name?: LocalizedText; description?: LocalizedText | null; sortOrder?: number };
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
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
          <label className="mb-1 block text-xs font-medium text-neutral-500">סדר הצגה</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={initial?.sortOrder ?? 0}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <LocalizedInput label="שם הקטגוריה" name="name" value={initial?.name} />
      <LocalizedInput label="תיאור" name="description" value={initial?.description ?? undefined} textarea />

      <button
        type="submit"
        className="rounded bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
