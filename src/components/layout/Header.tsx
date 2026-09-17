"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
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
    <header className="relative z-40 border-b border-gold-soft bg-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-display text-xl tracking-[0.15em] text-ink">{t("brand")}</span>
          <span className="mt-1 text-[10px] tracking-[0.3em] text-gold">{t("since")}</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            aria-label={t("search")}
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden sm:inline-flex text-neutral-700 hover:text-black"
          >
            <Search size={18} />
          </button>
          <Link href="/account" aria-label={t("account")} className="hidden sm:inline-flex text-neutral-700 hover:text-black">
            <User size={18} />
          </Link>
          <Link href="/wishlist" aria-label={tProduct("wishlist")} className="relative hidden sm:inline-flex text-neutral-700 hover:text-black">
            <Heart size={18} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label={t("cart")} className="relative hidden sm:inline-flex text-neutral-700 hover:text-black">
            <ShoppingBag size={18} />
            {mounted && itemCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            aria-label={t("openMenu")}
            onClick={() => setOpen(true)}
            className="text-neutral-800 hover:text-black"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:px-8">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tSearch("placeholder")}
              className="flex-1 border border-neutral-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="border border-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white">
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
          <nav className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <LocaleSwitcher />
              <button
                aria-label={t("closeMenu")}
                onClick={() => setOpen(false)}
                className="text-neutral-700 hover:text-black"
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
                    className="font-medium uppercase text-neutral-900"
                  >
                    {tNav(item.key)}
                  </Link>
                  {"mega" in item && item.mega && (
                    <ul className="mt-3 space-y-2 border-s border-neutral-200 ps-4 text-neutral-500">
                      {item.mega.map((cat) => (
                        <li key={cat.key}>
                          <Link href={cat.href} onClick={() => setOpen(false)}>
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
              className="mt-auto flex gap-2 border-t border-neutral-200 pt-6 sm:hidden"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tSearch("placeholder")}
                className="flex-1 border border-neutral-300 px-3 py-2 text-sm"
              />
              <button type="submit" aria-label={t("search")} className="border border-neutral-900 px-3">
                <Search size={16} />
              </button>
            </form>

            <div className="flex items-center gap-4 border-t border-neutral-200 pt-6 sm:hidden">
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm">
                <User size={16} /> {tNav("account")}
              </Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm">
                <Heart size={16} /> {tProduct("wishlist")}
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm">
                <ShoppingBag size={16} /> {tNav("cart")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
