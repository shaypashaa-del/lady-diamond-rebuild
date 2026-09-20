"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ScrollReveal";

// A real branded showcase clip (ruby & diamond chandelier earrings, from the
// brand's own real Instagram/WhatsApp content). The source file is only
// 480x848 — WhatsApp compresses video heavily before sending — so the
// display width is capped well below the old ultra-wide 21:9 crop; going
// wider than this upscales a small source file and looks visibly soft.
// Swap in a higher-resolution source (the original camera-roll file, before
// WhatsApp compression) if one becomes available, rather than stretching
// this one further.
export function BrandVideoSection() {
  const t = useTranslations("Home");

  return (
    <section className="bg-paper-soft py-16">
      <ScrollReveal className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-deep">{t("videoKicker")}</p>
        <h2 className="font-display mt-3 text-4xl font-normal sm:text-5xl">{t("videoTitle")}</h2>
        <span className="gold-rule mt-4" />
      </ScrollReveal>

      <ScrollReveal delay={0.15} className="mt-10 px-4 sm:px-8">
        <div className="mx-auto w-full max-w-2xl overflow-hidden border border-gold-soft bg-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
          <video
            className="aspect-[9/16] w-full object-cover sm:aspect-[4/3]"
            src="/video/brand-showcase.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
