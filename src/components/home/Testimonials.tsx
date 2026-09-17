import { useTranslations } from "next-intl";

export function Testimonials() {
  const t = useTranslations("Home");
  const testimonials = t.raw("testimonials") as { name: string; quote: string }[];

  return (
    <section className="border-t border-gold-soft bg-paper-soft py-14">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-8">
        <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("kindWords")}</h2>
        <span className="gold-rule mb-8 mt-3" />
        <div className="grid gap-8 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name}>
              <p className="text-sm italic text-neutral-600">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
