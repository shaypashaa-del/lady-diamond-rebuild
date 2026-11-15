"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { GemAccent } from "@/components/gem/GemAccent";

// The moment an order is placed: a live diamond and one burst of gold sparks.
export function Celebrate() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sparks = el.querySelectorAll<HTMLElement>(".spark");
    const ctx = gsap.context(() => {
      sparks.forEach((s, i) => {
        const a = (i / sparks.length) * Math.PI * 2 + Math.random() * 0.4;
        const r = 70 + Math.random() * 90;
        gsap.fromTo(
          s,
          { x: 0, y: 0, scale: 0, opacity: 1 },
          { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 0.6 + Math.random(), opacity: 0, duration: 1.4 + Math.random() * 0.8, ease: "power3.out", delay: 0.25 + Math.random() * 0.15 }
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={box} className="relative mx-auto h-36 w-36">
      <GemAccent className="relative z-10 h-full w-full" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
        {Array.from({ length: 26 }, (_, i) => (
          <span key={i} className="spark" />
        ))}
      </div>
    </div>
  );
}
