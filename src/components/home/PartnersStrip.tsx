const partners = ["Vogue", "Elle", "L'Officiel", "Marie Claire", "Glamour"];

export function PartnersStrip() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
        As Seen In
      </p>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4">
        {partners.map((p) => (
          <span key={p} className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
