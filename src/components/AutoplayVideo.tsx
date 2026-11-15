"use client";

import { useEffect, useRef, useState } from "react";

// Plain `autoPlay` on a <video> is not reliable once the element starts
// below the fold — some mobile browsers (and this was reproducible in
// testing, not just theoretical) load the video fully (readyState 4) but
// never actually start playback, leaving a blank frame with no poster to
// fall back to. Driving playback explicitly once the element scrolls into
// view fixes that without depending on the browser's own autoplay heuristics.
//
// The file itself is only attached when the video comes near the screen, so
// the home page no longer downloads ~10 MB of video before anything else.
// Several clips can be on screen at once (the ring gallery shows five side by side).
// Decoding them all together is what made the bottom of the home page stutter, so at
// most MAX_PLAYING play at a time: the ones most in view win, the rest hold their
// poster frame until there is room.
const MAX_PLAYING = 2;
const seen = new Map<HTMLVideoElement, number>();

function rebalance() {
  const ranked = [...seen.entries()].filter(([, r]) => r > 0).sort((a, b) => b[1] - a[1]);
  const allowed = new Set(ranked.slice(0, MAX_PLAYING).map(([el]) => el));
  for (const el of seen.keys()) {
    if (allowed.has(el)) {
      if (el.paused) el.play().catch(() => {});
    } else if (!el.paused) {
      el.pause();
    }
  }
}

export function AutoplayVideo({
  className,
  poster,
  src,
  ...props
}: React.VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Autoplay can still be refused (e.g. iOS low-power mode) — the poster
        // frame remains visible in that case.
        seen.set(el, entry.isIntersecting ? entry.intersectionRatio : 0);
        rebalance();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      seen.delete(el);
      rebalance();
    };
  }, [near]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      src={near ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      {...props}
    />
  );
}
