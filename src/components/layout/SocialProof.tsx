"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
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

  const isAdmin = pathname.startsWith("/admin");
  const pillRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(12);
  const shown = !isAdmin && pill != null;

  // Dock just under the header, then stay at the top of the screen while scrolling.
  useEffect(() => {
    if (isAdmin) return;
    let raf = 0;
    const place = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const header = document.querySelector("header");
        const bottom = header ? header.getBoundingClientRect().bottom : 0;
        setTop(Math.max(12, Math.round(bottom + 12)));
      });
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [isAdmin, pathname]);

  const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Capsule: 3D flip-in from above, then a slow gold sheen.
  useEffect(() => {
    const el = pillRef.current;
    if (!shown || !el || still()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { rotateX: -95, y: -18, opacity: 0, transformPerspective: 700, transformOrigin: "50% 0%" },
        { rotateX: 0, y: 0, opacity: 1, duration: 1.1, ease: "back.out(1.7)" }
      );
      if (sheenRef.current) {
        gsap.fromTo(sheenRef.current, { xPercent: -160 }, { xPercent: 260, duration: 2.2, ease: "power2.inOut", repeat: -1, repeatDelay: 3.5, delay: 1.2 });
      }
    });
    return () => ctx.revert();
  }, [shown]);

  // Every new number rolls over like a flip clock.
  useEffect(() => {
    const el = textRef.current;
    if (!el || still()) return;
    gsap.fromTo(el, { rotateX: 90, opacity: 0, transformPerspective: 400 }, { rotateX: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
  }, [pill]);

  // Notice card: swings in on a 3D hinge, follows the pointer, swings away.
  useEffect(() => {
    const el = cardRef.current;
    if (!toast || !el) return;
    if (still()) return;
    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { rotateX: -70, rotateY: 18, z: -160, y: -24, opacity: 0, transformPerspective: 900, transformOrigin: "50% 0%" },
      { rotateX: 0, rotateY: 0, z: 0, y: 0, opacity: 1, duration: 1, ease: "expo.out" }
    ).to(el, { rotateX: 55, y: -16, opacity: 0, duration: 0.55, ease: "power2.in" }, "+=4.3");
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: dx * 14, rotateX: -dy * 12, duration: 0.4, ease: "power2.out" });
    };
    const leave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      tl.kill();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [toast]);

  if (isAdmin) return null;

  return (
    <>
      {demo && (
        <a
          href="?sp_demo=0"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-ink shadow"
        >
          תצוגה לדוגמה לצוות · מספרים לא אמיתיים · יציאה ✕
        </a>
      )}
      {pill && (
        <div
          ref={pillRef}
          role="status"
          style={{
            top,
            background: "linear-gradient(135deg, rgba(12,11,10,0.94) 0%, rgba(38,30,18,0.94) 100%)",
            boxShadow: "0 18px 40px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(212,175,95,0.55)",
          }}
          className="pointer-events-none fixed left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 overflow-hidden rounded-full px-4 py-2 text-[12px] tracking-[0.06em] text-paper backdrop-blur-md transition-[top] duration-300 ease-out"
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="h-3 w-px bg-gold-bright/50" aria-hidden />
          <span ref={textRef} key={pill} className="inline-block whitespace-nowrap">
            {pill}
          </span>
          <span
            ref={sheenRef}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12"
            style={{ background: "linear-gradient(90deg, transparent, rgba(240,214,150,0.28), transparent)" }}
          />
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{ top: top + 52, perspective: 900 }}
          className="fixed start-1/2 z-30 w-[min(21rem,calc(100vw-2rem))] -translate-x-1/2 rtl:translate-x-1/2 transition-[top] duration-300 ease-out sm:start-auto sm:end-5 sm:translate-x-0 sm:rtl:translate-x-0"
        >
          <div
            ref={cardRef}
            className="rounded-xl p-px [transform-style:preserve-3d]"
            style={{
              background: "linear-gradient(135deg, #f0d696 0%, #b8893b 45%, #f6e7bf 70%, #9c7430 100%)",
              boxShadow: "0 30px 60px -28px rgba(0,0,0,0.55), 0 10px 22px -16px rgba(156,116,48,0.6)",
            }}
          >
            <div className="relative flex items-center gap-3 rounded-[11px] bg-paper p-3 pe-9 text-start text-ink">
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-paper"
                style={{ background: "radial-gradient(circle at 30% 25%, #f6e7bf, #b8893b 55%, #6e5020)" }}
              >
                {toast.kind === "sale" ? "◆" : "✦"}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                  {toast.kind === "sale" ? `✓ ${t("verified")}` : t("interestTitle")}
                </p>
                <p className="mt-0.5 text-[13px] text-ink/80">
                  {toast.kind === "sale" ? t("purchasedFrom", { city: toast.city ?? "" }) : t("addedToCart")}
                </p>
                <p className="truncate font-serif text-[15px] leading-snug">{toast.product}</p>
                <p className="mt-0.5 text-[11px] text-ink/45">{toast.ago}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  setClosed(true);
                }}
                aria-label={t("close")}
                className="absolute end-1 top-1 flex h-8 w-8 items-center justify-center text-ink/35 hover:text-ink"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
