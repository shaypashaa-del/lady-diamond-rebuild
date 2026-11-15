"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Stone } from "./GemAccentInner";

export { STONES, type Stone } from "./GemAccentInner";

// The stone's code (and its shader) is a separate chunk that is fetched, and the
// canvas created, only when the spot is about to scroll into view and the browser
// is idle — so the gems never compete with the page's own content or navigation.
const Inner = dynamic(() => import("./GemAccentInner").then((m) => m.GemAccentInner), { ssr: false });

export function GemAccent({ stone = "diamond", pitch = 1.05, className }: { stone?: Stone; pitch?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let idle = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const go = () => setOn(true);
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
        idle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 600 }) : window.setTimeout(go, 120);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (idle) { window.clearTimeout(idle); (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(idle); }
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {on ? <Inner stone={stone} pitch={pitch} className="w-full" /> : <div style={{ aspectRatio: "1" }} />}
    </div>
  );
}
