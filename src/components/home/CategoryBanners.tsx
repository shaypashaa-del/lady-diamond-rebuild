import Link from "next/link";

const banners = [
  {
    title: "Sophisticated",
    copy: "Fine chains and pendants built for layering, in gold and silver.",
    href: "/category/necklaces",
  },
  {
    title: "Beauty Bracelets",
    copy: "Delicate bracelets that stack well and wear every day.",
    href: "/category/bracelets",
  },
];

export function CategoryBanners() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:px-8">
      {banners.map((b) => (
        <div key={b.title} className="relative flex aspect-[4/3] flex-col items-center justify-center border border-neutral-200 bg-neutral-50 text-center">
          <h3 className="text-lg font-semibold uppercase tracking-[0.2em]">{b.title}</h3>
          <p className="mt-2 max-w-xs px-6 text-sm text-neutral-500">{b.copy}</p>
          <Link href={b.href} className="mt-4 text-xs font-semibold uppercase tracking-wide underline underline-offset-4">
            Find More
          </Link>
        </div>
      ))}
    </section>
  );
}
