"use client";

import { useEffect, useRef } from "react";

// Christmas decor shared by the homepage hero and the book page:
// continuous canvas snowfall, a pine garland with baubles, and a tree.

// Soft round flake drawn once, then stamped with drawImage (smooth + cheap).
function makeSprite(size, ink = false) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.95)");
  // "ink" bakes a soft blue-grey rim in, so flakes read on light pages
  // without an expensive CSS filter on the canvas.
  grad.addColorStop(0.62, ink ? "rgba(214,226,242,0.95)" : "rgba(205,220,240,0.7)");
  grad.addColorStop(0.82, ink ? "rgba(140,165,200,0.45)" : "rgba(205,220,240,0.35)");
  grad.addColorStop(1, "rgba(150,170,200,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * Continuous snowfall on a canvas. Flakes loop forever with a slow sway and a
 * gentle wind shift. Pauses off-screen / in a hidden tab; static under
 * prefers-reduced-motion. `density` scales the flake count.
 */
export function XmasSnow({ density = 1, max = 140, ink = false, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const sprite = makeSprite(32, ink);
    let w = 0,
      h = 0,
      flakes = [],
      raf = 0,
      visible = true,
      last = 0,
      t = 0;

    const make = (anyY) => {
      const z = Math.random() ** 1.6; // more small, far flakes
      return {
        x: Math.random() * w,
        y: anyY ? Math.random() * h : -12 - Math.random() * 30,
        s: 3 + z * 7, // drawn size px
        vy: 14 + z * 30, // px/s — slow, floaty
        sway: 6 + Math.random() * 14,
        ph: Math.random() * Math.PI * 2,
        sp: 0.35 + Math.random() * 0.55,
        a: 0.55 + z * 0.45,
      };
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // soft flakes need no more
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(
        Math.min(max, Math.max(Math.min(28, max), ((w * h) / 6000) * density)),
      );
      while (flakes.length < target) flakes.push(make(true));
      flakes.length = target;
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        ctx.globalAlpha = f.a;
        ctx.drawImage(sprite, f.x - f.s / 2, f.y - f.s / 2, f.s, f.s);
      }
      ctx.globalAlpha = 1;
    };
    let dtAvg = 1 / 60;
    const step = (now) => {
      raf = 0;
      if (!visible) return;
      const raw = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      dtAvg += (raw - dtAvg) * 0.2; // smooth out frame jitter
      const dt = dtAvg;
      t += dt;
      const wind = Math.sin(t * 0.12) * 10 + Math.sin(t * 0.37) * 3;
      for (const f of flakes) {
        f.ph += f.sp * dt;
        f.y += f.vy * dt;
        f.x += (Math.sin(f.ph) * f.sway + wind * (0.5 + f.a / 2)) * dt;
        if (f.y > h + 8) Object.assign(f, make(false));
        if (f.x > w + 8) f.x = -8;
        else if (f.x < -8) f.x = w + 8;
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (!raf && visible && !reduce) {
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      start();
    });
    io.observe(canvas);
    const onVis = () => {
      visible = !document.hidden;
      start();
    };
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, max, ink]);
  return (
    <canvas ref={ref} className={`hx-snowcanvas ${className}`} aria-hidden="true" />
  );
}

const BULB_TOPS = [13, 19, 22, 19, 13, 10, 12, 17, 22, 19, 13, 10, 12, 17, 22, 19, 13, 9];
const DEFAULT_BAUBLES = [
  { l: 5, len: 16, c: "red", d: 0 },
  { l: 14, len: 30, c: "gold", d: 0.5 },
  { l: 24, len: 20, c: "red", d: 0.2 },
  { l: 34, len: 38, c: "red", d: 0.8 },
  { l: 66, len: 34, c: "red", d: 0.4 },
  { l: 76, len: 18, c: "gold", d: 0.9 },
  { l: 86, len: 32, c: "red", d: 0.1 },
  { l: 95, len: 14, c: "red", d: 0.6 },
];

/** Pine garland with twinkling lights and swinging baubles along a top edge. */
export function XmasGarland({ baubles = DEFAULT_BAUBLES, className = "" }) {
  return (
    <div className={`hx-garland ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 46" preserveAspectRatio="none" className="hx-garland-svg">
        <path className="hx-pine" d="M-10 6 Q50 34 100 12 T200 12 T300 12 T410 6" />
        <path className="hx-pine-hi" d="M-10 6 Q50 34 100 12 T200 12 T300 12 T410 6" />
      </svg>
      {BULB_TOPS.map((top, i) => (
        <span
          key={i}
          className={`hx-bulb c${i % 4}`}
          style={{ left: `${3 + i * 5.5}%`, top: `${top}px`, animationDelay: `${(i % 6) * 0.35}s` }}
        />
      ))}
      {baubles.map((b) => (
        <span
          key={b.l}
          className={`hx-bauble ${b.c}`}
          style={{ left: `${b.l}%`, "--len": `${b.len}px`, animationDelay: `${b.d}s` }}
        >
          <i />
        </span>
      ))}
    </div>
  );
}

/** Christmas tree that grows in, with a glowing star and twinkling ornaments. */
export function XmasTree({ size = 120, gifts = true, className = "" }) {
  const orn = [
    [50, 40, "#e11d2e", 0],
    [40, 55, "#fbbf24", 0.4],
    [61, 58, "#e11d2e", 0.8],
    [33, 74, "#e11d2e", 1.2],
    [52, 72, "#fbbf24", 0.2],
    [70, 78, "#fbbf24", 0.6],
    [44, 88, "#fbbf24", 1],
    [62, 92, "#e11d2e", 1.4],
    [27, 96, "#fbbf24", 0.9],
    [76, 98, "#e11d2e", 0.3],
  ];
  return (
    <span className={`xt ${className}`} style={{ "--xt": `${size}px` }} aria-hidden="true">
      <svg viewBox="0 0 100 130" width={size * (100 / 130)} height={size}>
        <defs>
          <linearGradient id="xtG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f8a4c" />
            <stop offset="1" stopColor="#0d4f2c" />
          </linearGradient>
        </defs>
        <rect x="45" y="104" width="10" height="12" rx="2" fill="#7c4a24" />
        <g className="xt-body">
          <path d="M50 14 L80 56 H63 L88 86 H68 L94 112 H6 L32 86 H12 L37 56 H20 Z" fill="url(#xtG)" />
          <path d="M50 14 L37 56 H45 Z M50 14 L32 86 H40 Z" fill="#fff" fillOpacity=".08" />
          {/* snow on the tips */}
          <path d="M20 56 Q28 52 37 56 M63 56 Q72 52 80 56 M12 86 Q22 81 32 86 M68 86 Q78 81 88 86 M6 112 Q20 106 34 111 M66 111 Q80 106 94 112" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M26 66 Q50 78 72 64 M20 96 Q50 108 82 94" stroke="#fbbf24" strokeWidth="1.6" fill="none" strokeDasharray="1 3" strokeLinecap="round" />
          {/* snow piled on the branches */}
          <path d="M43 25 Q50 12 57 25 Q54 29 51 26 Q48 30 45 27 Z" fill="#fff" />
          <path d="M28 48 Q36 44 41 48 Q38 51 34 50 Q31 52 28 48 Z M58 47 Q66 43 72 48 Q68 51 65 49 Q61 51 58 47 Z" fill="#fff" fillOpacity=".95" />
          <path d="M22 78 Q31 73 38 78 Q34 81 30 80 Q26 82 22 78 Z M60 77 Q69 72 78 78 Q74 81 70 79 Q65 82 60 77 Z M42 70 Q48 67 53 70 Q50 72 47 71 Q44 73 42 70 Z" fill="#fff" fillOpacity=".95" />
          <path d="M16 104 Q26 99 35 104 Q31 107 26 106 Q21 108 16 104 Z M64 103 Q75 98 86 104 Q81 107 76 105 Q70 108 64 103 Z M40 98 Q48 95 56 98 Q52 101 48 100 Q44 102 40 98 Z" fill="#fff" fillOpacity=".95" />
          <circle cx="24" cy="89" r="1.6" fill="#fff" /><circle cx="76" cy="88" r="1.6" fill="#fff" /><circle cx="16" cy="114" r="1.8" fill="#fff" /><circle cx="85" cy="114" r="1.8" fill="#fff" />
          {orn.map(([x, y, c, d], i) => (
            <circle key={i} className="xt-orn" cx={x} cy={y} r="3.4" fill={c} style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
        <g className="xt-star">
          <path d="M50 2 L53.5 10.5 L62 11 L55.5 16.5 L57.5 25 L50 20.5 L42.5 25 L44.5 16.5 L38 11 L46.5 10.5 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        </g>
        {gifts && (
          <g className="xt-gifts">
            <rect x="14" y="110" width="20" height="16" rx="2" fill="#dc2626" />
            <rect x="22" y="110" width="4" height="16" fill="#fbbf24" />
            <rect x="64" y="113" width="16" height="13" rx="2" fill="#fbbf24" />
            <rect x="70" y="113" width="4" height="13" fill="#dc2626" />
            <rect x="38" y="116" width="14" height="10" rx="2" fill="#16a34a" />
            <rect x="44" y="116" width="3" height="10" fill="#fff" />
          </g>
        )}
      </svg>
    </span>
  );
}
