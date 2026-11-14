"use client";

import { useEffect, useRef } from "react";

// A photograph that leans toward the pointer and catches a moving highlight, like a
// jewel turned under a lamp. Mouse only: on touch screens there is no hover, so nothing
// is attached. The lean follows the pointer continuously and eases home when it leaves.
export function useTilt<T extends HTMLElement>(max = 5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let over = false;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (!over && Math.abs(x) + Math.abs(y) < 0.02) {
        el.style.transform = "";
        raf = 0;
        return;
      }
      el.style.transform = `perspective(900px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg) scale(${over ? 1.015 : 1})`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      tx = (nx - 0.5) * 2 * max;
      ty = -(ny - 0.5) * 2 * max;
      el.style.setProperty("--gx", `${(nx * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(ny * 100).toFixed(1)}%`);
      if (!over) {
        over = true;
        el.style.setProperty("--go", "1");
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      over = false;
      tx = 0;
      ty = 0;
      el.style.setProperty("--go", "0");
      if (!raf) raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);

  return ref;
}
