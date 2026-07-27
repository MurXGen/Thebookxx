"use client";

import { useEffect, useRef } from "react";

/**
 * Monsoon rain over the top of the page, stretching from the very top down to
 * the bottom of the bestseller section, where drops land on a water surface
 * and spawn ripples. Anchored to the document top (absolute), so it covers the
 * hero + bestseller area and scrolls away after — no rain lower down.
 * Non-interactive, DPR-aware, pauses off-screen, disabled for reduced motion.
 */
export default function RainEffect({ density = 1, opacity = 0.75 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = 0;
    let h = 0;
    let surfaceY = 0;
    let dpr = 1;
    let raf = 0;
    let drops = [];
    let ripples = [];
    let running = true;
    let onScreen = true;

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeDrop = (fromAnywhere = false) => ({
      x: rand(0, w + 60) - 30,
      y: fromAnywhere ? rand(-h, surfaceY) : rand(-80, -6),
      len: rand(10, 24),
      speed: rand(4, 8.5), // slower monsoon fall
      thick: rand(0.9, 1.9),
      slant: rand(0.6, 1.3),
    });

    // Height stretches to the bottom of the bestseller section.
    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = window.innerWidth;
      const el = document.querySelector(".bestseller-stage");
      let target = window.innerHeight * 0.85;
      if (el) {
        const rect = el.getBoundingClientRect();
        target = rect.bottom + window.scrollY;
      }
      h = Math.round(Math.min(Math.max(target, 260), 1500));
      surfaceY = h - 14;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(Math.min(190, w / 6) * density);
      drops = Array.from({ length: count }, () => makeDrop(true));
    };

    const step = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // Water surface near the bottom (bestseller boundary) — soft/light.
      const grad = ctx.createLinearGradient(0, surfaceY - 12, 0, h);
      grad.addColorStop(0, "rgba(160, 185, 215, 0)");
      grad.addColorStop(1, `rgba(160, 185, 215, ${opacity * 0.25})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, surfaceY - 12, w, h - (surfaceY - 12));
      ctx.strokeStyle = `rgba(160, 185, 215, ${opacity * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, surfaceY);
      ctx.lineTo(w, surfaceY);
      ctx.stroke();

      // Raindrops — light gradient streaks (transparent at top, soft blue at
      // the tip) so they read as gentle, light rain rather than dark lines.
      for (const d of drops) {
        const g = ctx.createLinearGradient(
          d.x,
          d.y,
          d.x + d.slant,
          d.y + d.len,
        );
        g.addColorStop(0, "rgba(165, 188, 216, 0)");
        g.addColorStop(1, `rgba(165, 188, 216, ${opacity})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = d.thick;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.slant, d.y + d.len);
        ctx.stroke();

        d.y += d.speed;
        d.x += d.slant * 0.25;

        if (d.y + d.len >= surfaceY) {
          if (Math.random() < 0.6) {
            ripples.push({ x: d.x + d.slant, rx: 1, ry: 0.5, a: 0.5 });
          }
          Object.assign(d, makeDrop(false));
        }
      }

      // Ripples on the surface — expanding flat ellipses that fade out (light).
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.rx += 0.7;
        r.ry += 0.26;
        r.a -= 0.018;
        if (r.a <= 0 || r.rx > 24) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(180, 200, 226, ${Math.max(0, r.a) * (opacity + 0.15)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(r.x, surfaceY, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    layout();
    // Re-measure after layout settles (fonts/images can shift the section).
    const t1 = setTimeout(layout, 600);
    const t2 = setTimeout(layout, 1600);

    window.addEventListener("resize", layout);

    // Pause when the rain band scrolls out of view or the tab is hidden.
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener("visibilitychange", onVis);

    raf = requestAnimationFrame(step);

    return () => {
      stop();
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", layout);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, [density, opacity]);

  return <canvas ref={canvasRef} className="rain-canvas" aria-hidden="true" />;
}
