"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AutoplayVideo } from "@/components/AutoplayVideo";

// Five real 360° product clips (the brand's own WhatsApp-shared footage,
// same provenance as BrandVideoSection's showcase clip) — a small looping
// gallery rather than one static video, so motion carries through more of
// the homepage instead of a single isolated moment.
const CLIPS = [
  "/brand/videos/ring-halo-solitaire-rotate.mp4",
  "/brand/videos/ring-eternity-pave-rotate.mp4",
  "/brand/videos/ring-halo-pave-rotate.mp4",
  "/brand/videos/ring-two-tone-pave-rotate.mp4",
  "/brand/videos/ring-wide-band-pave-rotate.mp4",
];

export function RingMotionGallery() {
  const t = useTranslations("Home");

  return (
    <section className="bg-paper-soft py-16">
      <ScrollReveal className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-deep">{t("motionKicker")}</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{t("motionTitle")}</h2>
        <span className="gold-rule mt-4" />
      </ScrollReveal>

      <ScrollReveal delay={0.15} className="mt-10 px-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
          {CLIPS.map((src) => (
            <div
              key={src}
              className="aspect-square w-36 shrink-0 overflow-hidden border border-gold-soft bg-ink shadow-[0_14px_32px_-18px_rgba(0,0,0,0.3)] sm:w-auto"
            >
              <AutoplayVideo className="h-full w-full object-cover" src={src} />
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
