import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-neutral-100 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Since 2010</p>
      <h1 className="mt-4 max-w-2xl px-4 text-3xl font-semibold uppercase tracking-[0.15em] sm:text-5xl">
        Fine Jewelry, Made for Everyday
      </h1>
      <p className="mt-4 max-w-md px-4 text-sm text-neutral-500">
        Gold and silver pieces designed in-house, crafted to be worn every day and passed on.
      </p>
      <Link
        href="/category/all"
        className="mt-8 border border-neutral-900 px-10 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
      >
        Shop the Collection
      </Link>
    </section>
  );
}
