"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useFloatingAvoid } from "@/lib/use-floating-avoid";

type Sale = { city: string; product: string; at: string };

// Real-activity social proof: live visitor count, other people on this product right
// now, and recent real purchases (city + product, never names). Everything comes from
// the server's real data; when there is none, nothing is shown.
function visitorId(): string {
  try {
    const k = "ld_vid";
    let v = window.localStorage.getItem(k);
    if (!v) {
      v = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`).toLowerCase();
      window.localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function agoText(iso: string, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return rtf.format(-mins, "minute");
  const hours = Math.round(mins / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

function stripLocale(path: string) {
  return path.replace(/^\/(en|ru)(?=\/|$)/, "") || "/";
}

export function SocialProof() {
  const t = useTranslations("SocialProof");
  const locale = useLocale();
  const pathname = usePathname();
  const avoid = useFloatingAvoid();
  const idRef = useRef<string>("");
  const [site, setSite] = useState<number | null>(null);
  const [others, setOthers] = useState<number | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [toast, setToast] = useState<(Sale & { ago: string }) | null>(null);
  const [closed, setClosed] = useState(false);

  // Heartbeat: on every page and every 30 s while the tab is visible.
  useEffect(() => {
    if (!idRef.current) idRef.current = visitorId();
    const path = stripLocale(pathname);
    let stop = false;
    const beat = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ v: idRef.current, p: path }),
          keepalive: true,
        });
        if (!res.ok || stop) return;
        const d = (await res.json()) as { site: number | null; othersOnPage: number | null };
        setSite(d.site);
        setOthers(d.othersOnPage);
      } catch {
        // offline: show nothing
      }
    };
    beat();
    const id = setInterval(beat, 30_000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [pathname]);

  // Recent real purchases, shown one at a time.
  useEffect(() => {
    fetch("/api/social-proof")
      .then((r) => (r.ok ? r.json() : { sales: [] }))
      .then((d: { sales: Sale[] }) => setSales(d.sales ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (sales.length === 0 || closed) return;
    let i = 0;
    let shown = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      if (shown >= 3 || document.visibilityState !== "visible") return;
      const sale = sales[i % sales.length];
      setToast({ ...sale, ago: agoText(sale.at, locale) });
      i += 1;
      shown += 1;
      hideTimer = setTimeout(() => setToast(null), 6500);
    };
    const first = setTimeout(show, 12_000);
    const every = setInterval(show, 40_000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [sales, closed, locale]);

  if (pathname.startsWith("/admin")) return null;

  const onProduct = /\/product\//.test(pathname);
  const pill =
    onProduct && others != null && others >= 1
      ? t("viewers", { count: others })
      : site != null && site >= 2
        ? t("visitors", { count: site })
        : null;

  const hidden = avoid ? "pointer-events-none opacity-0 translate-y-3" : "opacity-100";

  return (
    <>
      {pill && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-gold-bright/50 bg-ink/90 px-3.5 py-1.5 text-[11px] tracking-wide text-paper shadow-lg backdrop-blur transition-all duration-500 ${hidden}`}
        >
          <span className="me-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 align-middle" aria-hidden />
          {pill}
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-20 start-4 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-gold-soft bg-paper p-3 pe-8 text-start text-ink shadow-[0_14px_34px_-18px_rgba(0,0,0,0.45)] transition-all duration-500 sm:bottom-24 ${hidden}`}
        >
          <button
            type="button"
            onClick={() => {
              setToast(null);
              setClosed(true);
            }}
            aria-label={t("close")}
            className="absolute end-1 top-1 flex h-8 w-8 items-center justify-center text-ink/40 hover:text-ink"
          >
            ×
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">✓ {t("verified")}</p>
          <p className="mt-1 text-sm">{t("purchasedFrom", { city: toast.city })}</p>
          <p className="truncate text-sm font-medium">{toast.product}</p>
          <p className="mt-0.5 text-[11px] text-ink/50">{toast.ago}</p>
        </div>
      )}
    </>
  );
}
