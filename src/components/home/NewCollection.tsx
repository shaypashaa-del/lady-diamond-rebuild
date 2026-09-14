import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function NewCollection() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-8">
      <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("newCollectionTitle")}</h2>
      <p className="mt-2 text-sm uppercase tracking-[0.3em] text-neutral-400">{t("newCollectionSubtitle")}</p>
      <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-500">{t("newCollectionCopy")}</p>
      <Link
        href="/category/all"
        className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
      >
        {t("shopNow")}
      </Link>
    </section>
  );
}

export function EuphoriaSpotlight() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 text-center sm:px-8">
      <div className="border border-neutral-200 bg-neutral-50 px-6 py-16">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.3em]">{t("euphoriaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">{t("euphoriaCopy")}</p>
        <Link
          href="/category/rings"
          className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
        >
          {t("shopMore")}
        </Link>
      </div>
    </section>
  );
}
