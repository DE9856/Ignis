"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A microgravity flame, drawn: without buoyancy a flame has no plume, so it
 * burns as a dim blue sphere around a warm soot core. Soft warm blobs drift
 * behind it. Original artwork, not a photograph of any experiment.
 *
 * Canvas 2D, capped at 2x pixel ratio, paused off screen. With reduced motion
 * it draws a single still frame.
 */

const BLOBS = [
  { rgb: "240,180,76", orbit: 0.62, speed: 0.11, size: 1.05, phase: 0 },
  { rgb: "236,112,84", orbit: 0.74, speed: -0.08, size: 0.85, phase: 2.1 },
  { rgb: "255,224,128", orbit: 0.5, speed: 0.14, size: 0.6, phase: 4.2 },
  { rgb: "236,112,84", orbit: 0.9, speed: 0.06, size: 0.7, phase: 5.3 },
];

export function FlameCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (seconds: number) => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.26;

      ctx.globalCompositeOperation = "lighter";
      for (const blob of BLOBS) {
        const angle = seconds * blob.speed * Math.PI * 2 * 0.25 + blob.phase;
        const x = cx + Math.cos(angle) * radius * blob.orbit;
        const y = cy + Math.sin(angle * 1.3) * radius * blob.orbit * 0.8;
        const r = radius * blob.size * 1.4;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${blob.rgb},0.22)`);
        g.addColorStop(1, `rgba(${blob.rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      // Blue reaction shell. A slow, small flicker in radius and brightness.
      const flicker = 1 + Math.sin(seconds * 2.3) * 0.012 + Math.sin(seconds * 5.1) * 0.006;
      const shell = radius * 0.78 * flicker;
      const s = ctx.createRadialGradient(cx, cy, shell * 0.7, cx, cy, shell * 1.18);
      s.addColorStop(0, "rgba(90,140,255,0)");
      s.addColorStop(0.55, `rgba(110,160,255,${0.34 + Math.sin(seconds * 1.7) * 0.04})`);
      s.addColorStop(0.72, "rgba(150,190,255,0.16)");
      s.addColorStop(1, "rgba(90,140,255,0)");
      ctx.fillStyle = s;
      ctx.beginPath();
      ctx.arc(cx, cy, shell * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Warm soot core and the fuel droplet at the centre.
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, shell * 0.62);
      core.addColorStop(0, "rgba(255,214,140,0.55)");
      core.addColorStop(0.35, "rgba(240,150,70,0.22)");
      core.addColorStop(1, "rgba(240,120,60,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, shell * 0.62, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,240,215,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1.5, radius * 0.025), 0, Math.PI * 2);
      ctx.fill();

      // Vignette: fade the edges to transparent so the page shows through.
      const outer = Math.min(width, height) * 0.5;
      const v = ctx.createRadialGradient(cx, cy, radius * 1.05, cx, cy, outer);
      v.addColorStop(0, "rgba(0,0,0,1)");
      v.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(still ? 1.2 : (performance.now() - start) / 1000);
    };

    const loop = (now: number) => {
      draw((now - start) / 1000);
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !still && frame === 0) frame = requestAnimationFrame(loop);
    });
    visibility.observe(canvas);
    if (!still) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={cn("block size-full", className)} />;
}
