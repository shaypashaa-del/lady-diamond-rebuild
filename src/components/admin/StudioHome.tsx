"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Kpi = { label: string; value: number; suffix?: string; decimals?: number; href: string; tone?: "gold" | "alert" };
type Tile = { href: string; label: string; hint: string; icon: keyof typeof ICONS };
type Group = { title: string; tiles: Tile[] };
type RecentOrder = { id: string; number: string; total: string; status: string; when: string };

// Thin, precise line icons (24px grid), drawn inline so they need no extra requests.
const ICONS = {
  plus: "M12 5v14M5 12h14",
  tag: "M4 12V5h7l9 9-7 7-9-9ZM8.5 8.5h.01",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  bag: "M6 8h12l1 12H5L6 8ZM9 8a3 3 0 0 1 6 0",
  ticket: "M4 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h16v-2a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6H4Z",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-3 3-5 6-5s6 2 6 5M17 11a2.5 2.5 0 1 0 0-5M16 14c3 0 5 2 5 5",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z",
  coins: "M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5",
  chat: "M4 5h16v11H9l-5 4V5Z",
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

export function StudioHome({
  name,
  kpis,
  groups,
  recent,
}: {
  name: string;
  kpis: Kpi[];
  groups: Group[];
  recent: RecentOrder[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      // Header: gold line draws, greeting rises.
      gsap.from(".st-line", { scaleX: 0, transformOrigin: "50% 50%", duration: 1.1, ease: "power3.out" });
      gsap.from(".st-greet", { y: 14, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
      // KPIs and tiles: staggered rise.
      gsap.from(".st-kpi", { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.2 });
      gsap.from(".st-tile", { y: 22, opacity: 0, scale: 0.97, duration: 0.7, stagger: { each: 0.045, from: "start" }, ease: "power3.out", delay: 0.35 });
      gsap.from(".st-recent", { y: 14, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power2.out", delay: 0.6 });
      // Count-up numbers.
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((node) => {
        const to = Number(node.dataset.count);
        const decimals = Number(node.dataset.decimals ?? 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: to,
          duration: 1.4,
          ease: "power2.out",
          delay: 0.3,
          onUpdate: () => {
            node.textContent = obj.v.toLocaleString("he-IL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
          },
        });
      });
      // Slow gold sheen across the header.
      gsap.fromTo(".st-sheen", { xPercent: -120 }, { xPercent: 220, duration: 2.6, ease: "power2.inOut", repeat: -1, repeatDelay: 5 });
    }, el);

    // Tactile press feedback on tiles.
    const press = (e: Event, scale: number) => {
      const t = (e.currentTarget as HTMLElement);
      gsap.to(t, { scale, duration: 0.18, ease: "power2.out" });
    };
    const tiles = Array.from(el.querySelectorAll<HTMLElement>(".st-tile"));
    const down = (e: Event) => press(e, 0.96);
    const up = (e: Event) => press(e, 1);
    tiles.forEach((t) => {
      t.addEventListener("pointerdown", down);
      t.addEventListener("pointerup", up);
      t.addEventListener("pointerleave", up);
      t.addEventListener("pointercancel", up);
    });
    return () => {
      tiles.forEach((t) => {
        t.removeEventListener("pointerdown", down);
        t.removeEventListener("pointerup", up);
        t.removeEventListener("pointerleave", up);
        t.removeEventListener("pointercancel", up);
      });
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className="mx-auto max-w-3xl">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] px-5 py-6 text-[#f4ecd8] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)]">
        <div className="st-sheen pointer-events-none absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#d7b46a]/15 to-transparent" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#d7b46a]">LADY DIAMOND</p>
        <h1 className="st-greet mt-2 text-2xl font-light tracking-wide">שלום, {name}</h1>
        <p className="st-greet mt-1 text-xs text-[#cdbf9c]">מה נערוך היום?</p>
        <span className="st-line mt-4 block h-px w-full bg-gradient-to-r from-transparent via-[#d7b46a] to-transparent" />
      </section>

      {/* KPIs */}
      <section className="mt-4 grid grid-cols-3 gap-2">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`st-kpi block rounded-xl border p-3 text-center ${
              k.tone === "alert" && k.value > 0 ? "border-rose-300 bg-rose-50" : "border-[#e8dcc0] bg-[#fbf8f0]"
            }`}
          >
            <p className="text-2xl font-light text-neutral-900">
              <span data-count={k.value} data-decimals={k.decimals ?? 0}>
                {k.value.toLocaleString("he-IL", { minimumFractionDigits: k.decimals ?? 0, maximumFractionDigits: k.decimals ?? 0 })}
              </span>
              {k.suffix && <span className="ms-0.5 text-sm text-neutral-500">{k.suffix}</span>}
            </p>
            <p className="mt-1 text-[11px] leading-tight text-neutral-500">{k.label}</p>
          </Link>
        ))}
      </section>

      {/* Tiles */}
      {groups.map((g) => (
        <section key={g.title} className="mt-6">
          <h2 className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            <span>{g.title}</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d7b46a]/60" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {g.tiles.map((t) => (
              <Link
                key={t.href + t.label}
                href={t.href}
                className="st-tile group relative flex min-h-28 flex-col justify-between overflow-hidden rounded-2xl border border-[#e8dcc0] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.35)] transition-colors active:bg-[#fbf8f0]"
              >
                <span className="text-[#b08d3c] transition-transform duration-500 group-hover:-translate-y-0.5">
                  <Icon name={t.icon} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-neutral-900">{t.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">{t.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Recent orders */}
      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          <span>הזמנות אחרונות</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d7b46a]/60" />
        </h2>
        <div className="space-y-2">
          {recent.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="st-recent flex items-center justify-between rounded-xl border border-[#e8dcc0] bg-white px-4 py-3">
              <span>
                <span className="block text-sm font-medium" dir="ltr">{o.number}</span>
                <span className="block text-[11px] text-neutral-500">{o.when} · {o.status}</span>
              </span>
              <span className="text-sm font-semibold">{o.total} ₪</span>
            </Link>
          ))}
          {recent.length === 0 && <p className="rounded-xl border border-dashed border-neutral-300 p-4 text-center text-xs text-neutral-400">אין הזמנות עדיין.</p>}
        </div>
      </section>
    </div>
  );
}

export type { Kpi, Group, RecentOrder };
