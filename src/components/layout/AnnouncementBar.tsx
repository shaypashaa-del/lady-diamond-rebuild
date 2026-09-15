"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeToNewsletter, type NewsletterResult } from "@/server/actions/newsletter";

export function AnnouncementBar() {
  const t = useTranslations("Announcement");
  const [visible, setVisible] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState<NewsletterResult | undefined, FormData>(
    subscribeToNewsletter,
    undefined
  );

  if (!visible) return null;

  const subscribed = state && "subscribed" in state;

  return (
    <div className="relative flex flex-col items-center justify-center gap-1 bg-[#f4efe9] px-10 py-2 text-center text-xs tracking-wide text-neutral-700 sm:flex-row sm:gap-2">
      {subscribed ? (
        <p>✓ נרשמת בהצלחה!</p>
      ) : showForm ? (
        <form action={action} className="flex items-center gap-2">
          <input
            name="email"
            type="email"
            required
            autoFocus
            placeholder="you@example.com"
            dir="ltr"
            className="border border-neutral-300 bg-white px-2 py-1 text-xs"
          />
          <button type="submit" disabled={pending} className="font-semibold underline underline-offset-2 disabled:opacity-50">
            {pending ? "..." : t("subscribe")}
          </button>
        </form>
      ) : (
        <p>
          {t("text")}{" "}
          <button onClick={() => setShowForm(true)} className="font-semibold underline underline-offset-2">
            {t("subscribe")}
          </button>
        </p>
      )}
      {state && "error" in state && <p className="text-rose-600">{state.error}</p>}
      <button
        aria-label="Dismiss announcement"
        onClick={() => setVisible(false)}
        className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-900"
      >
        ×
      </button>
    </div>
  );
}
