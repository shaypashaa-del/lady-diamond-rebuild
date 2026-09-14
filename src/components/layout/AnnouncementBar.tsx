"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AnnouncementBar() {
  const t = useTranslations("Announcement");
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center bg-[#f4efe9] px-10 py-2 text-center text-xs tracking-wide text-neutral-700">
      <p>
        {t("text")}{" "}
        <Link href="/newsletter" className="font-semibold underline underline-offset-2">
          {t("subscribe")}
        </Link>
      </p>
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
