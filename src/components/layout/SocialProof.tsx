"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useFloatingAvoid } from "@/lib/use-floating-avoid";
import { visitorId } from "@/lib/track-activity";

type Sale = { city: string; product: string; at: string };
type Notice = { kind: "sale" | "cart"; city?: string; product: string; at: string };

// Real-activity social proof: live visitor count, other people on this product right
// now, today's visits, a product's real views and cart/wishlist adds, recent real
// purchases (city + product, never names) and recent real cart adds (anonymous).
// Everything comes from the server's real data; when there is none, nothing is shown.
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
  const demoRef = useRef(false);
  const [site, setSite] = useState<number | null>(null);
  const [others, setOthers] = useState<number | null>(null);
  const [stats, setStats] = useState<{ visitsToday: number | null; views24h: number | null; interested7d: number | null }>({
    visitsToday: null,
    views24h: null,
    interested7d: null,
  });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [toast, setToast] = useState<(Notice & { ago: string }) | null>(null);
  const [closed, setClosed] = useState(false);
  // Staff preview (?sp_demo=1, logged-in admin only): sample numbers, clearly labelled.
  const [demo, setDemo] = useState<string[] | null>(null);

  useEffect(() => {
    let flag = false;
    try {
      const q = new URLSearchParams(window.location.search).get("sp_demo");
      if (q === "1") window.sessionStorage.setItem("sp_demo", "1");
      if (q === "0") window.sessionStorage.removeItem("sp_demo");
      flag = window.sessionStorage.getItem("sp_demo") === "1";
    } catch {
      flag = false;
    }
    if (!flag) return;
    fetch(`/api/social-proof/demo?l=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok: boolean; products: string[] } | null) => {
        if (d?.ok) setDemo(d.products.length ? d.products : ["LADY DIAMOND"]);
      })
      .catch(() => undefined);
  }, [locale]);

  useEffect(() => {
    demoRef.current = demo != null;
    if (!demo) return;
    const cities = ["תל אביב", "חיפה", "ירושלים", "ראשון לציון", "נתניה", "באר שבע"];
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    let n = 30 + Math.floor(Math.random() * 121);
    const tick = () => {
      n = Math.min(150, Math.max(30, n + Math.floor(Math.random() * 11) - 5));
      setSite(n);
      setOthers(1 + Math.floor(Math.random() * 5));
      setStats({ visitsToday: null, views24h: 20 + Math.floor(Math.random() * 40), interested7d: 3 + Math.floor(Math.random() * 8) });
    };
    tick();
    const every = setInterval(tick, 5000);
    const notice = () => {
      const sale = Math.random() < 0.4;
      const mins = 1 + Math.floor(Math.random() * 50);
      const at = new Date(Date.now() - mins * 60_000).toISOString();
      setToast({ kind: sale ? "sale" : "cart", city: sale ? pick(cities) : undefined, product: pick(demo), at, ago: agoText(at, locale) });
      setTimeout(() => setToast(null), 6000);
    };
    const first = setTimeout(notice, 3000);
    const toasts = setInterval(notice, 12_000);
    return () => {
      clearInterval(every);
      clearTimeout(first);
      clearInterval(toasts);
    };
  }, [demo, locale]);

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
        const d = (await res.json()) as {
          site: number | null;
          othersOnPage: number | null;
          visitsToday?: number | null;
          views24h?: number | null;
          interested7d?: number | null;
        };
        if (demoRef.current) return;
        setSite(d.site);
        setOthers(d.othersOnPage);
        setStats({ visitsToday: d.visitsToday ?? null, views24h: d.views24h ?? null, interested7d: d.interested7d ?? null });
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

  // Recent real purchases and cart adds, newest first, shown one at a time.
  useEffect(() => {
    fetch(`/api/social-proof?l=${locale}`)
      .then((r) => (r.ok ? r.json() : { sales: [], interest: [] }))
      .then((d: { sales?: Sale[]; interest?: { product: string; at: string }[] }) => {
        const all: Notice[] = [
          ...(d.sales ?? []).map((s) => ({ kind: "sale" as const, ...s })),
          ...(d.interest ?? []).map((c) => ({ kind: "cart" as const, ...c })),
        ];
        all.sort((x, y) => (x.at < y.at ? 1 : -1));
        setNotices(all);
      })
      .catch(() => undefined);
  }, [locale]);

  useEffect(() => {
    if (notices.length === 0 || closed || demo) return;
    let i = 0;
    let shown = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      if (shown >= 3 || document.visibilityState !== "visible") return;
      const n = notices[i % notices.length];
      setToast({ ...n, ago: agoText(n.at, locale) });
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
  }, [notices, closed, locale, demo]);

  if (pathname.startsWith("/admin")) return null;

  const onProduct = /\/product\//.test(pathname);
  // On the home page the live counter is always shown (it is the real number, you included).
  const isHome = stripLocale(pathname) === "/";
  const { visitsToday, views24h, interested7d } = stats;
  const pill = onProduct
    ? others != null && others >= 1
      ? t("viewers", { count: others })
      : interested7d != null && interested7d >= 2
        ? t("interested", { count: interested7d })
        : views24h != null && views24h >= 3
          ? t("views24h", { count: views24h })
          : site != null && site >= 2
            ? t("visitors", { count: site })
            : null
    : isHome && visitsToday != null && visitsToday >= 10
      ? t("visitsToday", { count: visitsToday })
      : site != null && (site >= 2 || (isHome && site >= 1))
        ? t("visitors", { count: site })
        : null;

  const hidden = avoid ? "pointer-events-none opacity-0 translate-y-3" : "opacity-100";

  return (
    <>
      {demo && (
        <a
          href="?sp_demo=0"
          className="fixed top-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-ink shadow"
        >
          תצוגה לדוגמה לצוות · מספרים לא אמיתיים · יציאה ✕
        </a>
      )}
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
            {toast.kind === "sale" ? `✓ ${t("verified")}` : t("interestTitle")}
          </p>
          <p className="mt-1 text-sm">{toast.kind === "sale" ? t("purchasedFrom", { city: toast.city ?? "" }) : t("addedToCart")}</p>
          <p className="truncate text-sm font-medium">{toast.product}</p>
          <p className="mt-0.5 text-[11px] text-ink/50">{toast.ago}</p>
        </div>
      )}
    </>
  );
}
