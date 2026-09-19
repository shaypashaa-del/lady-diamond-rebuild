"use client";

import { useEffect, useRef, useState } from "react";

// Timeline, in ms.
const HOLD_MS = 5000; // the full portrait holds, untouched, before fading
const FADE_MS = 1800; // the whole photo dissolving away as one, in one motion

// A full-screen entrance: Diana's portrait (her signature is already baked
// into this photo) holds intact for a beat, then the entire image fades
// away as a single smooth dissolve (no tiles, no cuts, no visible seam) to
// reveal the site underneath. Plays on every full page load (not just
// once per session — a one-time-per-tab gate here proved confusing during
// testing, since revisiting the same tab silently skipped it) and is
// skipped entirely under prefers-reduced-motion.
export function IntroReveal() {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    // Guards against React dev-mode's mount -> cleanup -> mount double
    // invoke, which would otherwise cancel the one real timeline on its
    // first pass and refuse to reschedule it on the second.
    if (startedRef.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startedRef.current = true;

    document.body.style.overflow = "hidden";
    setMounted(true);

    setTimeout(() => setFading(true), HOLD_MS);
    setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = "";
    }, HOLD_MS + FADE_MS);
  }, []);

  if (!mounted || hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[10000] bg-white transition-opacity ease-in-out"
      style={{ opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Desktop (>= sm): full-screen, edge-to-edge, same technique as
          mobile — object-fit: cover fills the entire screen. This photo's
          wide landscape crop and generous plain background mean the crop
          only trims empty margin, not her. */}
      <div className="absolute inset-0 hidden sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/diana-intro-desktop.jpg"
          alt="Diana"
          className="h-full w-full"
          style={{ objectFit: "cover", objectPosition: "center", display: "block" }}
        />
      </div>

      {/* Mobile (< sm): full-screen, edge-to-edge — object-fit: cover
          fills the phone screen completely, with a separate signature
          overlay in the corner (this photo doesn't have one baked in). */}
      <div className="absolute inset-0 block sm:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/diana-intro-mobile.jpg"
          alt="Diana"
          className="h-full w-full"
          style={{ objectFit: "cover", objectPosition: "center 15%", display: "block" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/diana-signature.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-8 h-auto w-32 mix-blend-multiply"
        />
      </div>
    </div>
  );
}
