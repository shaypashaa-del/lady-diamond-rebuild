"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// A required consent checkbox for any form that collects personal data —
// links to both policies so the person can actually read them before
// agreeing, and blocks submission (via `required`) until checked.
export function ConsentCheckbox({ id = "consent" }: { id?: string }) {
  const t = useTranslations("Consent");
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-xs text-ink/70">
      <input id={id} name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-gold-bright" />
      <span>
        {t("prefix")}{" "}
        <Link href="/policies/terms" className="underline hover:text-ink">
          {t("terms")}
        </Link>{" "}
        {t("and")}{" "}
        <Link href="/policies/privacy" className="underline hover:text-ink">
          {t("privacy")}
        </Link>
        .
      </span>
    </label>
  );
}
