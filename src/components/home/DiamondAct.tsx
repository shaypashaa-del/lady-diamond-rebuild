"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createGem } from "./diamond/gem";

// The peak of the home page: a real-time diamond the visitor turns with the scroll,
// spins with a finger (it keeps the throw's momentum) and lights with the pointer.
// The section is tall and its stage is sticky, so "pinning" is the browser's own
// scrolling: nothing is hijacked and nothing can stutter against the scroll thread.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Visible between `a` and `b`, easing in and out over `e`.
const windowed = (p: number, a: number, b: number, e = 0.07) => smooth(a, a + e, p) * (1 - smooth(b - e, b, p));

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
};
const wantsStill = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("a11y-stop-animations");

const PROFILE = 0.34; // radians: a three-quarter view, crown up
const FACE_UP = 1.38; // nearly table-on, where the arrows pattern shows

export function DiamondAct() {
  const t = useTranslations("Home");
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const stoneRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const cueRefs = useRef<(HTMLDivElement | null)[]>([]);
  // "live" once the WebGL stone is drawing; until then (and when WebGL is missing)
  // a rendered still of the same stone stands in and the lines still follow the scroll.
  const [live, setLive] = useState(false);
  // Reduced motion: no pinning at all, one calm screen.
  const still = useSyncExternalStore(subscribeMotion, wantsStill, () => false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || still) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let gem = createGem(canvas, !coarse);

    const dpr = window.devicePixelRatio || 1;
    // Supersample a little on 1x desktop screens (cheap edge smoothing); cap phones.
    const liftBy = window.innerWidth >= 1100 ? window.innerHeight * 0.11 : window.innerHeight * 0.03;
    let scale = coarse ? Math.min(dpr, 1.6) : Math.min(Math.max(dpr, 1.5), 2);
    const minScale = scale * 0.45;

    let visible = false;
    let raf = 0;
    let last = 0;
    let p = 0; // scroll progress through the act, smoothed
    let target = 0;
    let spin = 0; // yaw added by dragging
    let spinV = 0; // its velocity, rad/s
    let drift = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let hinted = false;
    const light: [number, number, number] = [0.2, 0.55, 0.81];
    const lightTarget: [number, number, number] = [0.2, 0.55, 0.81];
    let slow = 0;
    let frames = 0;
    let dirty = true;

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      target = span > 0 ? clamp01(-r.top / span) : 0;
    };

    const paintCues = () => {
      const shows = [windowed(p, 0.03, 0.34), windowed(p, 0.38, 0.66), smooth(0.7, 0.78, p)];
      cueRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = shows[i];
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - o) * 26).toFixed(1)}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      if (glowRef.current) glowRef.current.style.opacity = (0.55 + 0.45 * smooth(0.3, 0.8, p)).toFixed(3);
      if (hintRef.current) hintRef.current.style.opacity = hinted ? "0" : windowed(p, 0.06, 0.6, 0.05).toFixed(3);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;

      measure();
      const k = 1 - Math.exp(-dt * 10);
      const before = p;
      p += (target - p) * k;
      if (Math.abs(target - p) < 0.0004) p = target;

      if (!dragging) {
        spin += spinV * dt;
        spinV *= Math.exp(-dt * 2.6); // a thrown stone coasts, then settles
        if (Math.abs(spinV) < 0.002) spinV = 0;
      }
      drift += dt * 0.11;
      for (let i = 0; i < 3; i++) light[i] += (lightTarget[i] - light[i]) * (1 - Math.exp(-dt * 6));

      const yaw = p * Math.PI * 2.5 + spin + drift;
      const pitch = PROFILE + (FACE_UP - PROFILE) * smooth(0.4, 0.86, p);
      const zoom = 0.92 + 0.16 * smooth(0, 0.5, p) - 0.15 * smooth(0.66, 0.8, p);
      // Make room for the last line: the stone lifts as it turns face-up.
      const lift = smooth(0.66, 0.8, p);
      if (stoneRef.current) stoneRef.current.style.transform = `translate3d(0, ${(-lift * liftBy).toFixed(1)}px, 0)`;

      if (gem) {
        if (gem.resize(scale)) dirty = true;
        gem.draw(yaw, pitch, light, zoom);
      }
      if (before !== p || dirty) paintCues();
      dirty = false;

      // If this device cannot hold the frame rate, trade resolution for smoothness.
      frames++;
      if (frames > 20) {
        if (dt > 0.026) slow++;
        else slow = Math.max(0, slow - 1);
        if (slow > 24) {
          slow = 0;
          if (scale > minScale) scale = Math.max(minScale, scale * 0.8);
          else gem?.lighten();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    // Pay for the shader's first compile now, on a 2px buffer, so the first real
    // frame does not land as a hitch in the middle of a scroll.
    const warm = window.setTimeout(() => {
      if (!gem || visible) return;
      canvas.width = 2;
      canvas.height = 2;
      gem.draw(0, FACE_UP, light, 1);
    }, 700);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting && document.visibilityState === "visible";
        if (visible) {
          if (gem) setLive(true);
          wake();
        }
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(wrap);
    const onVis = () => {
      const r = wrap.getBoundingClientRect();
      visible = document.visibilityState === "visible" && r.bottom > -120 && r.top < window.innerHeight + 120;
      wake();
    };
    document.addEventListener("visibilitychange", onVis);

    // Light follows the pointer across the stage.
    const stage = canvas.parentElement?.parentElement ?? wrap;
    const aim = (x: number, y: number) => {
      const r = stage.getBoundingClientRect();
      const nx = ((x - r.left) / r.width) * 2 - 1;
      const ny = 1 - ((y - r.top) / r.height) * 2;
      const v = [nx * 0.85, ny * 0.6 + 0.35, 0.75];
      const len = Math.hypot(v[0], v[1], v[2]);
      lightTarget[0] = v[0] / len;
      lightTarget[1] = v[1] / len;
      lightTarget[2] = v[2] / len;
    };
    const onMove = (e: PointerEvent) => aim(e.clientX, e.clientY);
    stage.addEventListener("pointermove", onMove, { passive: true });

    // Drag to spin: 1:1 under the finger, and the release keeps the throw's speed.
    const down = (e: PointerEvent) => {
      dragging = true;
      spinV = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
      canvas.setPointerCapture(e.pointerId);
      hinted = true;
      dirty = true;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dtm = Math.max(1, e.timeStamp - lastT) / 1000;
      const dyaw = (dx / Math.max(160, canvas.clientWidth)) * 3.4;
      spin += dyaw;
      spinV = spinV * 0.6 + (dyaw / dtm) * 0.4;
      lastX = e.clientX;
      lastT = e.timeStamp;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (e.timeStamp - lastT > 90) spinV = 0; // held still before letting go: no throw
      spinV = Math.max(-14, Math.min(14, spinV));
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const lost = (e: Event) => {
      e.preventDefault();
      gem = null;
      setLive(false);
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(warm);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("webglcontextlost", lost);
      gem?.destroy();
    };
  }, [still]);

  const cue = (i: number, pos: string, title: string, body: string, extra?: React.ReactNode) => (
    <div
      ref={(el) => {
        cueRefs.current[i] = el;
      }}
      className={`diamond-cue absolute ${pos}`}
      style={still ? undefined : { opacity: i === 0 ? 1 : 0 }}
    >
      <h3 className="diamond-title">{title}</h3>
      <p className="mt-3 max-w-[22rem] text-[15px] leading-relaxed text-paper/70 sm:mt-4 sm:text-base">{body}</p>
      {extra}
    </div>
  );

  const cta = (
    <Link href="/category/all" className="glass-pill glass-pill-gold mt-6 inline-flex">
      {t("diamondCta")}
    </Link>
  );

  // Reduced motion or no WebGL: one calm screen, the still stone and all three lines.
  if (still) {
    return (
      <section ref={wrapRef} className="diamond-act relative overflow-hidden text-paper" aria-label={t("diamondKicker")}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:grid-cols-2 sm:px-10 sm:py-28">
          <Image src="/brand/diamond-still.webp" alt="" width={900} height={900} className="mx-auto w-[min(70vw,26rem)]" sizes="(min-width: 640px) 26rem, 70vw" />
          <div className="space-y-9 text-start">
            <p className="text-xs uppercase tracking-[0.35em] text-gold-bright">{t("diamondKicker")}</p>
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <h3 className="diamond-title">{t(`diamondCue${n}Title` as "diamondCue1Title")}</h3>
                <p className="mt-3 max-w-[24rem] text-base leading-relaxed text-paper/70">
                  {n === 3 ? t("diamondCue3BodyStill") : t(`diamondCue${n}Body` as "diamondCue1Body")}
                </p>
              </div>
            ))}
            {cta}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </section>
    );
  }

  return (
    <section ref={wrapRef} className="diamond-act relative h-[300svh] text-paper sm:h-[340vh]" aria-label={t("diamondKicker")}>
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div ref={glowRef} className="diamond-glow pointer-events-none absolute inset-0" aria-hidden />
        <p className="pointer-events-none absolute inset-x-0 top-[128px] text-center text-[11px] uppercase tracking-[0.38em] text-gold-bright">
          {t("diamondKicker")}
        </p>

        <div ref={stoneRef} className="diamond-stone relative">
          {!live && <Image src="/brand/diamond-still.webp" alt="" fill sizes="(min-width: 640px) 60vh, 84vw" className="object-contain" priority={false} />}
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing" aria-hidden />
        </div>

        <p ref={hintRef} className="pointer-events-none absolute inset-x-0 bottom-[5svh] text-center text-[11px] tracking-[0.2em] text-paper/45 opacity-0 sm:bottom-[6vh]">
          {t("diamondHint")}
        </p>

        <div className="pointer-events-none absolute inset-0">
          {cue(0, "diamond-cue-a", t("diamondCue1Title"), t("diamondCue1Body"))}
          {cue(1, "diamond-cue-b", t("diamondCue2Title"), t("diamondCue2Body"))}
          {cue(2, "diamond-cue-c pointer-events-auto", t("diamondCue3Title"), t("diamondCue3Body"), cta)}
        </div>
      </div>
    </section>
  );
}
