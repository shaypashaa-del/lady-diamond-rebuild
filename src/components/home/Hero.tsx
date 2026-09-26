"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { Link } from "@/i18n/navigation";

// The reference site's homepage hero is a Revolution Slider that rotates
// through several images rather than showing one static photo. This
// reproduces that behavior: a fixed set of real brand photos crossfading
// on a timer, driven by GSAP instead of a jQuery slider plugin.
const SLIDES: { src: string; altKey: "heroSlideAlt1" | "heroSlideAlt2" | "heroSlideAlt3" | "heroSlideAlt4" }[] = [
  { src: "/brand/hero-heartstone.jpeg", altKey: "heroSlideAlt1" },
  { src: "/brand/hero-slide-necklace.jpeg", altKey: "heroSlideAlt2" },
  { src: "/brand/hero-slide-earring.jpeg", altKey: "heroSlideAlt3" },
  { src: "/brand/hero-slide-choker.jpeg", altKey: "heroSlideAlt4" },
];
const SLIDE_DURATION_MS = 5500;

export function Hero({
  kicker,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
} = {}) {
  const t = useTranslations("Home");
  const [active, setActive] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: i === active ? 1 : 0,
        duration: 1.1,
        ease: "power2.inOut",
      });
    });
  }, [active]);

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink text-paper">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          ref={(el) => {
            imageRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={t(slide.altKey)}
            fill
            priority={i === 0}
            sizes="100vw"
            quality={95}
            className="object-cover"
          />
        </div>
      ))}
      {/* These source photos are lower-resolution than the full-bleed hero
          renders them at, which shows as softness on large screens. A
          faint film-grain layer (a standard editorial-photography trick)
          masks that softness with texture rather than leaving it looking
          like a blurry upscale. */}
      <div className="hero-grain pointer-events-none absolute inset-0 z-[1]" />
      <div className="hero-scrim absolute inset-0" />

      {SLIDES.length > 1 && (
        <div className="absolute bottom-6 start-1/2 z-10 flex -translate-x-1/2 gap-2 rtl:translate-x-1/2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              aria-label={`${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1 transition-all ${
                i === active ? "w-8 bg-gold-bright" : "w-3 bg-paper/40"
              }`}
            />
          ))}
        </div>
      )}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-8">
        <div className="max-w-lg">
          <p className="rise-in text-xs uppercase tracking-[0.4em] text-gold-bright" style={{ animationDuration: "1.4s" }}>
            {kicker ?? t("heroKicker")}
          </p>
          <span className="gold-rule-start rise-in mt-4" style={{ animationDuration: "1.4s", animationDelay: "0.1s" }} />
          <h1
            className="rise-in mt-6 text-5xl font-semibold leading-[1.1] sm:text-7xl"
            style={{ animationDuration: "1.4s", animationDelay: "0.2s" }}
          >
            {title ?? t("heroTitle")}
          </h1>
          <p className="rise-in mt-5 max-w-md text-sm leading-relaxed text-paper/80" style={{ animationDuration: "1.4s", animationDelay: "0.3s" }}>
            {subtitle ?? t("heroSubtitle")}
          </p>
          <Link
            href={ctaHref ?? "/category/all"}
            className="rise-in link-underline mt-9 inline-block border border-gold-bright px-10 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-gold-bright hover:text-ink"
            style={{ animationDuration: "1.4s", animationDelay: "0.4s" }}
          >
            {ctaLabel ?? t("heroCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
