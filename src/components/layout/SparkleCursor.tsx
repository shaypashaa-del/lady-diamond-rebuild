"use client";

import { useEffect, useRef } from "react";

type Sparkle = { x: number; y: number; size: number; life: number; maxLife: number; angle: number };
type TrailPoint = { x: number; y: number };

const TRAIL_LENGTH = 34;

// A soft glowing white-gold light that follows the pointer (mouse or
// finger), leaving a long, smooth gold comet trail with twinkling sparkles
// riding along it. Pure canvas + rAF (no DOM node churn), pointer-events:
// none throughout so it never intercepts clicks, and fully disabled under
// prefers-reduced-motion.
export function SparkleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("sparkle-cursor-active");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const sparkles: Sparkle[] = [];
    const trail: TrailPoint[] = [];
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    let idleFrames = 0;

    function spawnSparkle(x: number, y: number) {
      if (Math.random() > 0.55) return;
      sparkles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        size: 1.6 + Math.random() * 2.2,
        life: 0,
        maxLife: 34 + Math.random() * 18,
        angle: Math.random() * Math.PI * 2,
      });
    }

    function onMove(x: number, y: number) {
      pointer = { x, y };
      trail.push({ x, y });
      if (trail.length > TRAIL_LENGTH) trail.shift();
      spawnSparkle(x, y);
      idleFrames = 0;
    }
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", onResize);

    function tick() {
      ctx!.clearRect(0, 0, width, height);

      // Let the trail settle and fade away once the pointer stops moving,
      // rather than freezing in place indefinitely.
      idleFrames++;
      if (idleFrames > 2 && trail.length > 0) {
        trail.shift();
      }

      // The long comet tail: a smooth stroked path, tapering in width and
      // opacity from the pointer back to the oldest trail point.
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const t = i / trail.length; // 0 (oldest) -> 1 (newest)
          const prev = trail[i - 1];
          const curr = trail[i];
          ctx!.beginPath();
          ctx!.moveTo(prev.x, prev.y);
          ctx!.lineTo(curr.x, curr.y);
          ctx!.strokeStyle = `rgba(221, 170, 93, ${t * 0.55})`;
          ctx!.lineWidth = 0.5 + t * 3.5;
          ctx!.lineCap = "round";
          ctx!.shadowColor = "rgba(221, 170, 93, 0.6)";
          ctx!.shadowBlur = 6 * t;
          ctx!.stroke();
        }
        ctx!.shadowBlur = 0;
      }

      if (pointer) {
        // Bright white-hot core, softening into a gold halo at the edge —
        // the core itself stays pure white, gold lives only in the halo,
        // trail, and sparkles.
        const glow = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 20);
        glow.addColorStop(0, "rgba(255, 255, 255, 1)");
        glow.addColorStop(0.25, "rgba(255, 255, 255, 0.85)");
        glow.addColorStop(0.55, "rgba(221, 170, 93, 0.35)");
        glow.addColorStop(1, "rgba(221, 170, 93, 0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(pointer.x, pointer.y, 20, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.save();
        ctx!.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx!.shadowBlur = 6;
        ctx!.fillStyle = "rgba(255, 255, 255, 1)";
        ctx!.beginPath();
        ctx!.arc(pointer.x, pointer.y, 2.5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life++;
        if (s.life >= s.maxLife) {
          sparkles.splice(i, 1);
          continue;
        }
        const t = s.life / s.maxLife;
        const alpha = 1 - t;
        const size = s.size * (1 - t * 0.6);
        const drift = t * 10;

        const sx = s.x + Math.cos(s.angle) * drift;
        const sy = s.y + Math.sin(s.angle) * drift - t * 8;

        ctx!.save();
        ctx!.translate(sx, sy);
        ctx!.rotate(s.angle);
        ctx!.shadowColor = "rgba(221, 170, 93, 0.8)";
        ctx!.shadowBlur = 4;
        ctx!.fillStyle = `rgba(221, 170, 93, ${alpha})`;
        // Classic four-point twinkle: two crossed elongated diamonds.
        ctx!.beginPath();
        ctx!.moveTo(0, -size * 2.4);
        ctx!.lineTo(size * 0.35, 0);
        ctx!.lineTo(0, size * 2.4);
        ctx!.lineTo(-size * 0.35, 0);
        ctx!.closePath();
        ctx!.moveTo(-size * 2.4, 0);
        ctx!.lineTo(0, -size * 0.35);
        ctx!.lineTo(size * 2.4, 0);
        ctx!.lineTo(0, size * 0.35);
        ctx!.closePath();
        ctx!.fill();
        ctx!.restore();
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("sparkle-cursor-active");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="sparkle-canvas pointer-events-none fixed inset-0 z-[9999]"
    />
  );
}
