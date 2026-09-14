import Link from "next/link";

export function NewCollection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-8">
      <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">New Collection</h2>
      <p className="mt-2 text-sm uppercase tracking-[0.3em] text-neutral-400">Elsa Paretty Jewelry</p>
      <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-500">
        A capsule of rounded, sculptural pieces cast in recycled gold —
        designed to be worn together or alone.
      </p>
      <Link
        href="/category/all"
        className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
      >
        Shop Now
      </Link>
    </section>
  );
}

export function EuphoriaSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 text-center sm:px-8">
      <div className="border border-neutral-200 bg-neutral-50 px-6 py-16">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.3em]">Euphoria</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
          Our warmest edit yet — brushed gold rings and hoops made for
          everyday stacking.
        </p>
        <Link
          href="/category/rings"
          className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
        >
          Shop More
        </Link>
      </div>
    </section>
  );
}
