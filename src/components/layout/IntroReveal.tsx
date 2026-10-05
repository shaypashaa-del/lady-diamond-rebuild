"use client";

import { useEffect, useRef, useState } from "react";

// Timeline, in ms.
const HOLD_MS = 5000; // the full portrait holds, untouched, before fading
const MOBILE_HOLD_MS = 1500;
const MOBILE_FADE_MS = 700;
const FADE_MS = 1800; // the whole photo dissolving away as one, in one motion

// A full-screen entrance: Diana's portrait (her signature is already baked
// into this photo) holds intact for a beat, then the entire image fades
// away as a single smooth dissolve (no tiles, no cuts, no visible seam) to
// reveal the site underneath. Plays on the first page load of each
// browser session only, and is skipped entirely under prefers-reduced-motion.
export function IntroReveal() {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [fadeMs, setFadeMs] = useState(FADE_MS);
  const startedRef = useRef(false);

  useEffect(() => {
    // Guards against React dev-mode's mount -> cleanup -> mount double
    // invoke, which would otherwise cancel the one real timeline on its
    // first pass and refuse to reschedule it on the second.
    if (startedRef.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only the first entry of a visit: once seen in this browser session, later
    // page loads go straight to the site. (Storage can be blocked: then it plays.)
    try {
      if (window.sessionStorage.getItem("ld_intro_seen") === "1") return;
      window.sessionStorage.setItem("ld_intro_seen", "1");
    } catch {
      // ignore
    }
    startedRef.current = true;

    document.body.style.overflow = "hidden";
    // `mounted` must start false to match SSR output, then flip true only
    // once we're sure this effect actually runs (see the StrictMode guard
    // above) — there's no lazy-initializer alternative for "did we mount".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Phones get a much shorter intro: people there are waiting on mobile data.
    const phone = window.matchMedia("(max-width: 639px)").matches;
    const hold = phone ? MOBILE_HOLD_MS : HOLD_MS;
    const fade = phone ? MOBILE_FADE_MS : FADE_MS;
    setFadeMs(fade);

    setTimeout(() => setFading(true), hold);
    setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = "";
    }, hold + fade);
  }, []);

  if (!mounted || hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[10000] bg-white transition-opacity ease-in-out"
      style={{
        opacity: fading ? 0 : 1,
        transitionDuration: `${fadeMs}ms`,
        // Once the fade starts, this overlay must stop intercepting clicks —
        // it's still mounted (and painted, mid-fade) for the full FADE_MS,
        // and without this a click during that window lands on the overlay
        // instead of whatever is underneath (e.g. a product card link).
        pointerEvents: fading ? "none" : "auto",
      }}
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
