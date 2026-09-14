const testimonials = [
  { name: "Noa L.", quote: "The circle necklace is so light I forget I'm wearing it — exactly what I wanted." },
  { name: "Maya K.", quote: "Ordered the simple ring in silver, sizing was spot on and it arrived beautifully packed." },
  { name: "Dana R.", quote: "Bought the heart bracelet as a gift — the quality feels much higher than the price." },
];

export function Testimonials() {
  return (
    <section className="border-t border-neutral-200 bg-neutral-50 py-14">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-8">
        <h2 className="mb-8 text-xl font-semibold uppercase tracking-[0.2em]">Kind Words</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name}>
              <p className="text-sm italic text-neutral-600">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
