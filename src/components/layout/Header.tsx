"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { primaryNav } from "@/lib/nav-data";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header() {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const itemCount = useCartStore((s) => s.totalItems());

  return (
    <header className="relative z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="text-lg font-semibold tracking-[0.2em]">{t("brand")}</span>
          <span className="text-[10px] tracking-[0.3em] text-neutral-500">{t("since")}</span>
        </Link>

        <div className="flex items-center gap-4">
          <button aria-label={t("search")} className="hidden sm:inline-flex text-neutral-700 hover:text-black">
            <Search size={18} />
          </button>
          <Link href="/account" aria-label={t("account")} className="hidden sm:inline-flex text-neutral-700 hover:text-black">
            <User size={18} />
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

            <div className="mt-auto flex items-center gap-4 border-t border-neutral-200 pt-6 sm:hidden">
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm">
                <User size={16} /> {tNav("account")}
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
