import "../[locale]/globals.css";

// Admin dashboard is always Hebrew, independent of the storefront's locale switcher
// (per project spec: "בנה Admin Dashboard בעברית").
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-neutral-50 antialiased">{children}</body>
    </html>
  );
}
