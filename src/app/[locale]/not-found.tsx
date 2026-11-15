import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GemAccent } from "@/components/gem/GemAccent";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <GemAccent stone="sapphire" className="w-40" />
      <p className="mt-4 text-5xl font-semibold tracking-widest text-gold-deep" dir="ltr">404</p>
      <h1 className="mt-3 text-xl font-semibold">{t("title")}</h1>
      <p className="mt-2 mb-6 text-sm text-ink/60">{t("text")}</p>
      <Link href="/" className="glass-pill glass-pill-gold">{t("home")}</Link>
    </div>
  );
}
