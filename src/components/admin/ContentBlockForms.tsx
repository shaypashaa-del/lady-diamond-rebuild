import { SavableForm } from "./SavableForm";
import {
  updateAnnouncementBar,
  updateHomepageHero,
  type AnnouncementBarContent,
  type HeroContent,
} from "@/server/actions/content-blocks";

function LocalizedInput({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value?: Partial<Record<"he" | "en" | "ru", string>>;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["he", "en", "ru"] as const).map((locale) => (
          <div key={locale}>
            <span className="mb-1 block text-[10px] uppercase text-neutral-400">{locale}</span>
            <input
              name={`${name}_${locale}`}
              defaultValue={value?.[locale] ?? ""}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnnouncementBarForm({ initial }: { initial: AnnouncementBarContent | null }) {
  return (
    <SavableForm action={updateAnnouncementBar} className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold">פס הודעה עליון</h2>
      <LocalizedInput label="טקסט" name="text" value={initial?.text} />
      <LocalizedInput label="טקסט קישור" name="linkText" value={initial?.linkText} />
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-neutral-500">קישור (URL)</label>
        <input
          name="linkHref"
          dir="ltr"
          defaultValue={initial?.linkHref ?? "#"}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
    </SavableForm>
  );
}

const BRAND_SLIDES = [
  "/brand/hero-heartstone.jpeg",
  "/brand/hero-slide-necklace.jpeg",
  "/brand/hero-slide-earring.jpeg",
  "/brand/hero-slide-choker.jpeg",
];

export function HomepageHeroForm({
  initial,
  media = [],
}: {
  initial: HeroContent | null;
  media?: { url: string; filename: string }[];
}) {
  const selected = new Set(initial?.images?.length ? initial.images : BRAND_SLIDES);
  const options = [...BRAND_SLIDES.map((url) => ({ url, filename: url.split("/").pop() ?? url })), ...media];
  return (
    <SavableForm action={updateHomepageHero} className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold">אזור הבאנר הראשי בעמוד הבית</h2>
      <LocalizedInput label="כותרת עילית" name="kicker" value={initial?.kicker} />
      <LocalizedInput label="כותרת ראשית" name="title" value={initial?.title} />
      <LocalizedInput label="תת-כותרת" name="subtitle" value={initial?.subtitle} />
      <LocalizedInput label="טקסט כפתור" name="ctaLabel" value={initial?.ctaLabel} />
      <fieldset className="mb-4">
        <legend className="mb-1 text-xs font-medium text-neutral-500">
          תמונות הבאנר (עד 8, מתחלפות לפי הסדר). ניתן להעלות תמונות חדשות בעמוד &quot;מדיה&quot;.
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {options.map((o) => (
            <label key={o.url} className="block text-[10px] text-neutral-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.url} alt={o.filename} className="aspect-square w-full rounded object-cover" />
              <input type="checkbox" name="images" value={o.url} defaultChecked={selected.has(o.url)} /> {o.filename.slice(0, 14)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-neutral-500">קישור כפתור</label>
        <input
          name="ctaHref"
          dir="ltr"
          defaultValue={initial?.ctaHref ?? "/category/all"}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
    </SavableForm>
  );
}
