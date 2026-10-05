import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePage } from "@/server/actions/pages";
import type { LocalizedText } from "@/lib/i18n-content";
import { SavableForm } from "@/components/admin/SavableForm";

function LocalizedField({
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
              rows={textarea ? 10 : undefined}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  const isAbout = page.slug === "about-us";
  const body = page.body as unknown as Record<string, LocalizedText> & LocalizedText;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">עריכת עמוד: {page.slug}</h1>
      <SavableForm
        action={updatePage.bind(null, page.id)}
        className="max-w-3xl"
        buttonClassName="rounded bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        submitLabel="שמירת שינויים"
      >
        <LocalizedField label="כותרת" name="title" value={page.title as LocalizedText} />
        {isAbout ? (
          <>
            <LocalizedField label="הסיפור" name="story" value={body?.story} textarea />
            <LocalizedField label="ציטוט" name="quote" value={body?.quote} textarea />
          </>
        ) : (
          <LocalizedField label="תוכן" name="body" value={page.body as LocalizedText} textarea />
        )}
      </SavableForm>
    </div>
  );
}
