"use client";

import { useEffect, useRef } from "react";

// Plain `autoPlay` on a <video> is not reliable once the element starts
// below the fold — some mobile browsers (and this was reproducible in
// testing, not just theoretical) load the video fully (readyState 4) but
// never actually start playback, leaving a blank frame with no poster to
// fall back to. Driving playback explicitly once the element scrolls into
// view fixes that without depending on the browser's own autoplay heuristics.
export function AutoplayVideo({
  className,
  poster,
  ...props
}: React.VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
            // Autoplay can still be refused (e.g. iOS low-power mode) —
            // the poster frame remains visible in that case, so there's
            // nothing further to recover from here.
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      {...props}
    />
  );
}
