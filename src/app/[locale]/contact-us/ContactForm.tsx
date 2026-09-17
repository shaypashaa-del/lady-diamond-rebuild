"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm, type ContactResult } from "@/server/actions/contact";

export function ContactForm() {
  const t = useTranslations("ContactPage");
  const [state, action, pending] = useActionState<ContactResult | undefined, FormData>(
    submitContactForm,
    undefined
  );

  if (state && "sent" in state) {
    return <p className="rounded bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t("sent")}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded bg-rose-50 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" placeholder={t("name")} required className="border border-gold-soft px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder={t("email")} required className="border border-gold-soft px-3 py-2 text-sm" />
        <input name="phone" placeholder={t("phone")} className="border border-gold-soft px-3 py-2 text-sm" />
        <input name="subject" placeholder={t("subject")} className="border border-gold-soft px-3 py-2 text-sm" />
      </div>
      <textarea name="message" placeholder={t("message")} required rows={5} className="w-full border border-gold-soft px-3 py-2 text-sm" />
      <button
        type="submit"
        disabled={pending}
        className="border border-gold-bright bg-ink px-8 py-3 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright disabled:opacity-50"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
