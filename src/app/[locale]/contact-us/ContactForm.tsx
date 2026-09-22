"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm, type ContactResult } from "@/server/actions/contact";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

export function ContactForm() {
  const t = useTranslations("ContactPage");
  const [state, action, pending] = useActionState<ContactResult | undefined, FormData>(
    submitContactForm,
    undefined
  );

  if (state && "sent" in state) {
    return <p className="border border-gold-soft bg-paper-soft px-4 py-3 text-sm text-ink">{t("sent")}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" placeholder={t("name")} required className="border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
        <input name="email" type="email" placeholder={t("email")} required className="border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
        <input name="phone" placeholder={t("phone")} className="border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
        <input name="subject" placeholder={t("subject")} className="border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
      </div>
      <textarea name="message" placeholder={t("message")} required rows={5} className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
      <ConsentCheckbox id="contact-consent" />
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
