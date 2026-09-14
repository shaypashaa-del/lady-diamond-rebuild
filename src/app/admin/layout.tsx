import "../[locale]/globals.css";

// Admin reads/writes live data on every request — never statically cache it.
export const dynamic = "force-dynamic";

// Admin dashboard is always Hebrew, independent of the storefront's locale switcher
// (per project spec: "בנה Admin Dashboard בעברית"). The auth guard and sidebar live
// in the (dashboard) route group's layout so the login page itself stays unguarded.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
