"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

// Phone layout of the admin: a top bar with a menu button that opens the full list,
// and a bottom bar with the screens used most (products, orders, add, media).
export function AdminMobileNav({ items, name, logout }: { items: Item[]; name: string; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu after navigating.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const bottom: Item[] = [
    { href: "/admin/products", label: "מוצרים" },
    { href: "/admin/products/new", label: "+ הוספה" },
    { href: "/admin/orders", label: "הזמנות" },
    { href: "/admin/media", label: "תמונות" },
  ];
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#d7b46a]/40 bg-[#0d0d0d] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-[#f4ecd8]">
        <div>
          <p className="text-sm font-light uppercase tracking-[0.3em] text-[#d7b46a]">LADY DIAMOND</p>
          <p className="text-[11px] text-[#cdbf9c]">ניהול החנות</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתיחת תפריט"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7b46a]/60"
        >
          <span aria-hidden className="space-y-1">
            <span className="block h-px w-5 bg-[#d7b46a]" />
            <span className="block h-px w-5 bg-[#d7b46a]" />
            <span className="block h-px w-5 bg-[#d7b46a]" />
          </span>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button type="button" aria-label="סגירת תפריט" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <nav className="relative ms-auto flex h-full w-[82%] max-w-xs flex-col overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">תפריט</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="סגירה" className="h-11 w-11 text-xl">
                ×
              </button>
            </div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-3 text-sm ${active(item.href) ? "bg-[#0d0d0d] text-[#d7b46a]" : "text-neutral-700 hover:bg-neutral-100"}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto border-t border-neutral-200 pt-3 text-xs text-neutral-500">
              <p className="mb-2 truncate">{name}</p>
              <form action={logout}>
                <button type="submit" className="py-2 text-rose-600">
                  התנתקות
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}

      <nav
        aria-label="ניווט מהיר"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#d7b46a]/40 bg-[#0d0d0d] pb-[env(safe-area-inset-bottom)]"
      >
        {bottom.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className={`flex min-h-14 items-center justify-center px-1 text-center text-xs font-medium ${
              b.href === "/admin/products/new"
                ? "bg-gradient-to-b from-[#d7b46a] to-[#b08d3c] font-semibold text-[#0d0d0d]"
                : active(b.href)
                  ? "text-[#d7b46a] underline underline-offset-4"
                  : "text-[#cdbf9c]"
            }`}
          >
            {b.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
