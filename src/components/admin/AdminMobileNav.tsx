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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold tracking-wide">LADY DIAMOND</p>
          <p className="text-[11px] text-neutral-400">ניהול החנות</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתיחת תפריט"
          className="flex h-11 w-11 items-center justify-center rounded border border-neutral-300"
        >
          <span aria-hidden className="space-y-1">
            <span className="block h-0.5 w-5 bg-neutral-800" />
            <span className="block h-0.5 w-5 bg-neutral-800" />
            <span className="block h-0.5 w-5 bg-neutral-800" />
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
                className={`rounded px-3 py-3 text-sm ${active(item.href) ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
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
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        {bottom.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className={`flex min-h-14 items-center justify-center px-1 text-center text-xs font-medium ${
              active(b.href) && b.href !== "/admin/products/new" ? "text-neutral-900 underline underline-offset-4" : "text-neutral-600"
            } ${b.href === "/admin/products/new" ? "bg-neutral-900 text-white" : ""}`}
          >
            {b.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
