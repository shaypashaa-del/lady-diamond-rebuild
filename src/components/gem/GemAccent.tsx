"use client";

import { useEffect, useRef } from "react";
import { createGem } from "@/components/home/diamond/gem";

// A small live gemstone: the same ray-traced cut as the home page's diamond, as an
// accent. It turns slowly, turns faster with the page scroll, and can be spun with a
// finger. It only draws while on screen; with reduced motion it draws one still frame.

export const STONES = {
  diamond: { absorb: [0, 0, 0], stretch: 1 },
  sapphire: { absorb: [1.5, 0.75, 0.06], stretch: 1 },
  emerald: { absorb: [1.25, 0.1, 0.85], stretch: 1.28 },
  ruby: { absorb: [0.06, 1.7, 1.25], stretch: 1.14 },
} as const satisfies Record<string, { absorb: [number, number, number]; stretch: number }>;
export type Stone = keyof typeof STONES;

export function GemAccent({
  stone = "diamond",
  pitch = 1.05,
  className,
}: {
  stone?: Stone;
  /** 0.34 is a side view, 1.38 is face-up. */
  pitch?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const gem = createGem(canvas, false, { ...STONES[stone], bounces: 4 });
    if (!gem) return;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("a11y-stop-animations");
    const scale = Math.min(window.devicePixelRatio || 1, coarse ? 1.3 : 1.5);
    const light: [number, number, number] = [0.25, 0.55, 0.8];

    if (reduced) {
      gem.resize(scale);
      gem.draw(0.6, pitch, light, 1.05);
      return () => gem.destroy();
    }

    // Compile the shader ahead of time on a 2px buffer, so the stone's first real
    // frame is not a hitch in the middle of a scroll.
    const warm = window.setTimeout(() => {
      if (visible) return;
      canvas.width = 2;
      canvas.height = 2;
      gem.draw(0, pitch, light, 1);
    }, 900 + Math.random() * 600);

    let raf = 0;
    let visible = false;
    let last = 0;
    let yaw = Math.random() * 6;
    let spinV = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let lastScroll = window.scrollY;

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      // The page's own scroll nudges the stone round, like turning it in the hand.
      const sy = window.scrollY;
      yaw += (sy - lastScroll) * 0.004;
      lastScroll = sy;
      if (!dragging) {
        yaw += (0.22 + spinV) * dt;
        spinV *= Math.exp(-dt * 2.6);
      }
      gem.resize(scale);
      gem.draw(yaw, pitch, light, 1.05);
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && visible) {
        last = 0;
        lastScroll = window.scrollY;
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && document.visibilityState === "visible";
      wake();
    });
    io.observe(canvas);
    const onVis = () => {
      const r = canvas.getBoundingClientRect();
      visible = document.visibilityState === "visible" && r.bottom > 0 && r.top < window.innerHeight;
      wake();
    };
    document.addEventListener("visibilitychange", onVis);

    const down = (e: PointerEvent) => {
      dragging = true;
      spinV = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dyaw = ((e.clientX - lastX) / Math.max(120, canvas.clientWidth)) * 3.4;
      const dtm = Math.max(1, e.timeStamp - lastT) / 1000;
      yaw += dyaw;
      spinV = spinV * 0.6 + (dyaw / dtm) * 0.4;
      lastX = e.clientX;
      lastT = e.timeStamp;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (e.timeStamp - lastT > 90) spinV = 0;
      spinV = Math.max(-12, Math.min(12, spinV));
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(warm);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      gem.destroy();
    };
  }, [stone, pitch]);

  return <canvas ref={ref} aria-hidden className={`aspect-square cursor-grab touch-pan-y active:cursor-grabbing ${className ?? ""}`} />;
}
