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
        if (entry.isIntersecting) {
          el.play().catch(() => {
            // Autoplay can still be refused (e.g. iOS low-power mode) —
            // the poster frame remains visible in that case.
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
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
