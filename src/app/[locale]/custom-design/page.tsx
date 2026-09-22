import { getTranslations } from "next-intl/server";
import { CustomDesignClient } from "./CustomDesignClient";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.25" />
  </svg>
);

export default async function CustomDesignPage() {
  const t = await getTranslations("CustomDesign");

  return (
    <div>
      <div className="relative overflow-hidden bg-ink py-14 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,170,93,0.16)_0%,transparent_65%)]"
        />
        <DiamondMark className="pointer-events-none absolute -top-14 -end-14 h-56 w-56 text-paper/[0.05]" />
        <DiamondMark className="pointer-events-none absolute -bottom-12 -start-12 h-44 w-44 text-paper/[0.04]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-bright">{t("kicker")}</p>
          <span className="gold-rule mt-4 w-16" />
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.15em] text-paper sm:text-4xl">
            {t("pageTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl px-4 text-sm text-paper/60">{t("pageIntro")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8">
        <CustomDesignClient />
      </div>
    </div>
  );
}
