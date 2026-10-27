import type { Viewport } from "next";
import "../[locale]/globals.css";

// The admin is a light interface: never let a phone in dark mode turn it black.
export const viewport: Viewport = { colorScheme: "light", width: "device-width", initialScale: 1 };

// Admin reads/writes live data on every request — never statically cache it.
export const dynamic = "force-dynamic";

// Admin dashboard is always Hebrew, independent of the storefront's locale switcher
// (per project spec: "בנה Admin Dashboard בעברית"). The auth guard and sidebar live
// in the (dashboard) route group's layout so the login page itself stays unguarded.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" style={{ colorScheme: "light" }}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
