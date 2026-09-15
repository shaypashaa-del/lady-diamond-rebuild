import Image from "next/image";
import type { LocalizedText } from "@/lib/i18n-content";

type MediaOption = { id: string; url: string; filename: string };

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
  media = [],
}: {
  action: (formData: FormData) => void;
  initial?: {
    slug: string;
    name?: LocalizedText;
    description?: LocalizedText | null;
    sortOrder?: number;
    imageId?: string | null;
  };
  submitLabel: string;
  media?: MediaOption[];
}) {
  const currentImage = media.find((m) => m.id === initial?.imageId);

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

      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-500">תמונת קטגוריה</label>
        {currentImage && (
          <div className="relative mb-2 h-24 w-24 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
            <Image src={currentImage.url} alt={currentImage.filename} fill sizes="96px" className="object-cover" />
          </div>
        )}
        <select name="imageId" defaultValue={initial?.imageId ?? ""} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm">
          <option value="">— ללא תמונה —</option>
          {media.map((m) => (
            <option key={m.id} value={m.id}>
              {m.filename}
            </option>
          ))}
        </select>
        {media.length === 0 && (
          <p className="mt-1 text-xs text-neutral-400">אין תמונות בספריית המדיה — העלו בעמוד ניהול מדיה.</p>
        )}
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
