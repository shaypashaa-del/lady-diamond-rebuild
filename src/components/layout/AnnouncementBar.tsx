"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeToNewsletter, type NewsletterResult } from "@/server/actions/newsletter";

export function AnnouncementBar({
  text,
  subscribeLabel,
}: {
  text?: string;
  subscribeLabel?: string;
}) {
  const t = useTranslations("Announcement");
  const [visible, setVisible] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState<NewsletterResult | undefined, FormData>(
    subscribeToNewsletter,
    undefined
  );

  if (!visible) return null;

  const subscribed = state && "subscribed" in state;
  const displayText = text ?? t("text");
  const displaySubscribe = subscribeLabel ?? t("subscribe");

  return (
    <div className="relative flex flex-col items-center justify-center gap-1 bg-ink px-10 py-2 text-center text-xs tracking-wide text-paper sm:flex-row sm:gap-2">
      {subscribed ? (
        <p>✓ נרשמת בהצלחה!</p>
      ) : showForm ? (
        <div className="flex flex-col items-center gap-1">
          <form action={action} className="flex items-center gap-2">
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              dir="ltr"
              className="border border-gold-soft bg-paper px-2 py-1 text-xs"
            />
            <button type="submit" disabled={pending} className="py-2.5 font-semibold text-gold-bright underline underline-offset-2 disabled:opacity-50">
              {pending ? "..." : displaySubscribe}
            </button>
          </form>
          <p className="text-[10px] text-paper/50">{t("consentNote")}</p>
        </div>
      ) : (
        <p>
          {displayText}{" "}
          <button onClick={() => setShowForm(true)} className="inline-block py-2.5 font-semibold text-gold-bright underline underline-offset-2">
            {displaySubscribe}
          </button>
        </p>
      )}
      {state && "error" in state && <p className="text-rose-400">{state.error}</p>}
      <button
        aria-label="Dismiss announcement"
        onClick={() => setVisible(false)}
        className="absolute end-0 top-0 flex h-full min-h-11 w-11 items-center justify-center text-base text-paper/60 transition-colors hover:text-paper"
      >
        ×
      </button>
    </div>
  );
}
