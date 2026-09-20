"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { primaryNav } from "@/lib/nav-data";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useMounted } from "@/lib/use-mounted";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header() {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const tSearch = useTranslations("Search");
  const tProduct = useTranslations("Product");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mounted = useMounted();
  const itemCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.slugs.length);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="relative z-40 border-b border-gold-soft bg-paper">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8" dir="ltr">
        {/* Small mark: just the logo image (icon + brand text baked into
            the artwork itself) — always physically on the left, in every
            language. No separate live text alongside it. */}
        <Link href="/" className="group relative z-10 flex items-center">
          <Image src="/brand/logo.png" alt="Lady Diamond" width={54} height={44} className="h-12 w-auto transition-transform duration-500 group-hover:scale-105 sm:h-16" priority />
        </Link>

        {/* Large wordmark: "Lady Diamond" + gold rule + "Since 2010" — pinned
            to the true horizontal (and vertical) center of THIS row only
            (not the whole header, which also includes the nav row below —
            centering against the full header height pushed "Since 2010"
            down into the nav bar). A slow gold shimmer sweeps across both
            lines (see .shimmer-text in globals.css). */}
        <Link
          href="/"
          className="group absolute start-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center sm:flex rtl:translate-x-1/2"
          dir="rtl"
        >
          <span className="font-display shimmer-text text-3xl tracking-wide sm:text-4xl" dir="ltr">
            Lady Diamond
          </span>
          <span className="gold-rule mt-2.5 mb-2.5 w-16" />
          <span className="shimmer-text-gold text-xs uppercase tracking-[0.4em] sm:text-sm">{t("since")}</span>
        </Link>

        <div className="relative z-10 flex items-center gap-4">
          <button
            aria-label={t("search")}
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden text-ink/80 transition-colors hover:text-gold-deep lg:inline-flex"
          >
            <Search size={18} />
          </button>
          <div className="hidden lg:inline-flex">
            <LocaleSwitcher />
          </div>
          <Link href="/account" aria-label={t("account")} className="hidden text-ink/80 transition-colors hover:text-gold-deep lg:inline-flex">
            <User size={18} />
          </Link>
          <Link href="/wishlist" aria-label={tProduct("wishlist")} className="relative hidden text-ink/80 transition-colors hover:text-gold-deep lg:inline-flex">
            <Heart size={18} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center border border-gold bg-gold text-[10px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label={t("cart")} className="relative text-ink/80 transition-colors hover:text-gold-deep">
            <ShoppingBag size={18} />
            {mounted && itemCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center border border-gold bg-gold text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            aria-label={t("openMenu")}
            onClick={() => setOpen(true)}
            className="text-ink transition-colors hover:text-gold-deep lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-gold-soft lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-8 py-4">
          {primaryNav.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const hasMega = "mega" in item && item.mega;
            return (
              <li key={item.key} className={hasMega ? "group/mega relative" : undefined}>
                <Link
                  href={item.href}
                  className={`border-b-2 pb-1 text-xs font-semibold tracking-[0.25em] uppercase transition-colors ${
                    isActive ? "border-gold text-gold-deep" : "border-transparent text-ink hover:text-gold-deep"
                  }`}
                >
                  {tNav(item.key)}
                </Link>
                {hasMega && (
                  <div className="invisible absolute start-1/2 top-full z-10 -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-300 group-hover/mega:visible group-hover/mega:translate-y-0 group-hover/mega:opacity-100 rtl:translate-x-1/2">
                    <div className="min-w-[240px] border border-gold-soft bg-paper shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)]">
                      <span className="mx-auto block h-px w-10 translate-y-px bg-gold-bright" />
                      <ul className="py-5">
                        {item.mega.map((cat) => (
                          <li key={cat.key}>
                            <Link
                              href={cat.href}
                              className="link-underline mx-6 block border-b border-gold-soft/60 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-ink/70 transition-colors last:border-b-0 hover:text-gold-deep"
                            >
                              {tNav(cat.key)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {searchOpen && (
        <div className="border-t border-gold-soft bg-paper px-4 py-3 sm:px-8">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tSearch("placeholder")}
              className="flex-1 border border-gold-soft px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
            <button type="submit" className="border border-gold-bright px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink">
              {t("search")}
            </button>
          </form>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end rtl:justify-start">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto bg-paper p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <LocaleSwitcher />
              <button
                aria-label={t("closeMenu")}
                onClick={() => setOpen(false)}
                className="text-ink/70 transition-colors hover:text-gold-deep"
              >
                <X size={22} />
              </button>
            </div>

            <ul className="space-y-6 text-sm tracking-wide">
              {primaryNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="link-underline font-medium uppercase text-ink transition-colors hover:text-gold-deep"
                  >
                    {tNav(item.key)}
                  </Link>
                  {"mega" in item && item.mega && (
                    <ul className="mt-3 space-y-2 border-s border-gold-soft ps-4 text-ink/60">
                      {item.mega.map((cat) => (
                        <li key={cat.key}>
                          <Link href={cat.href} onClick={() => setOpen(false)} className="transition-colors hover:text-gold-deep">
                            {tNav(cat.key)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <form
              onSubmit={(e) => {
                submitSearch(e);
                setOpen(false);
              }}
              className="mt-auto flex gap-2 border-t border-gold-soft pt-6 sm:hidden"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tSearch("placeholder")}
                className="flex-1 border border-gold-soft px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
              />
              <button type="submit" aria-label={t("search")} className="border border-gold-bright px-3 text-ink transition-colors hover:bg-gold-bright">
                <Search size={16} />
              </button>
            </form>

            <div className="flex items-center gap-4 border-t border-gold-soft pt-6 text-ink sm:hidden">
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm transition-colors hover:text-gold-deep">
                <User size={16} /> {tNav("account")}
              </Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm transition-colors hover:text-gold-deep">
                <Heart size={16} /> {tProduct("wishlist")}
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm transition-colors hover:text-gold-deep">
                <ShoppingBag size={16} /> {tNav("cart")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
