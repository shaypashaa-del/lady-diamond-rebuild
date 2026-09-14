import Link from "next/link";
import "../[locale]/globals.css";

// Admin reads/writes live data on every request — never statically cache it.
export const dynamic = "force-dynamic";

// Admin dashboard is always Hebrew, independent of the storefront's locale switcher
// (per project spec: "בנה Admin Dashboard בעברית").
// NOTE: no authentication/authorization is wired yet — this lands in Phase 5
// (accounts + auth). Do not deploy this route publicly until that's in place.

const navItems = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/customers", label: "לקוחות" },
  { href: "/admin/affiliates", label: "שותפים" },
  { href: "/admin/content", label: "תוכן ועיצוב" },
  { href: "/admin/media", label: "מדיה" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="flex min-h-screen">
          <aside className="w-56 shrink-0 border-l border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-5 py-4">
              <p className="text-sm font-semibold tracking-wide">ליידי דיאמונד</p>
              <p className="text-xs text-neutral-400">ניהול החנות</p>
            </div>
            <nav className="flex flex-col gap-1 p-3 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
