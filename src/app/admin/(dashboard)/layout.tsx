import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/guards";
import { logout } from "@/server/actions/auth";

const navItems = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/tags", label: "תגיות" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/coupons", label: "קופונים" },
  { href: "/admin/shipping", label: "משלוחים" },
  { href: "/admin/customers", label: "לקוחות" },
  { href: "/admin/affiliates", label: "שותפים" },
  { href: "/admin/messages", label: "הודעות" },
  { href: "/admin/content", label: "תוכן ועיצוב" },
  { href: "/admin/media", label: "מדיה" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-l border-neutral-200 bg-white">
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
        <div className="mt-auto border-t border-neutral-200 p-3 text-xs text-neutral-500">
          <p className="mb-2 truncate">{session.name}</p>
          <form action={logout}>
            <button type="submit" className="text-rose-600 hover:underline">
              התנתקות
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
