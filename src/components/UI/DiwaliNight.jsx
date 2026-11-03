"use client";

import { Great_Vibes } from "next/font/google";

const script = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap" });

// Diwali night layer for the home hero: twinkling stars, a slowly turning
// rangoli behind the headline, swinging paper lanterns (kandil) and a row of
// flickering clay diyas. Pure SVG + CSS motion — no images, all aria-hidden.

// Deterministic star field (same markup on server and client).
const STARS = Array.from({ length: 34 }).map((_, i) => ({
  i,
  left: (i * 61 + 7) % 100,
  top: (i * 37 + 11) % 62,
  size: 1 + (i % 3) * 0.8,
  delay: ((i * 29) % 40) / 10,
}));

const LANTERNS = [
  { side: "l", pos: 3, len: 34, scale: 1, delay: 0, hue: "o" },
  { side: "l", pos: 17, len: 64, scale: 0.72, delay: 0.8, hue: "r" },
  { side: "r", pos: 17, len: 56, scale: 0.72, delay: 0.4, hue: "r" },
  { side: "r", pos: 3, len: 30, scale: 1, delay: 1.2, hue: "o" },
];

const DIYAS = [0, 1, 2, 3, 4];

export function Kandil({ hue = "o" }) {
  const id = `kd-${hue}`;
  return (
    <svg viewBox="0 0 60 120" className="dn-kandil-svg">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor={hue === "o" ? "#c2410c" : "#9f1239"} />
          <stop offset="0.5" stopColor={hue === "o" ? "#fb923c" : "#f43f5e"} />
          <stop offset="1" stopColor={hue === "o" ? "#c2410c" : "#9f1239"} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* cap */}
      <rect x="22" y="0" width="16" height="6" rx="2" fill="#facc15" />
      <path d="M14 10 L46 10 L38 4 L22 4 Z" fill="#eab308" />
      {/* body */}
      <path
        d="M14 10 Q2 34 14 58 L46 58 Q58 34 46 10 Z"
        fill={`url(#${id}-body)`}
      />
      <ellipse cx="30" cy="34" rx="12" ry="16" fill={`url(#${id}-glow)`} />
      {/* star cut-out */}
      <path
        d="M30 22 L33 30 L41 30 L35 35 L37 43 L30 38 L23 43 L25 35 L19 30 L27 30 Z"
        fill="#fff7d6"
        opacity="0.9"
      />
      <path d="M14 10 Q8 34 14 58" stroke="#fde68a" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M46 10 Q52 34 46 58" stroke="#fde68a" strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* base + tassels */}
      <rect x="16" y="58" width="28" height="5" rx="2" fill="#facc15" />
      {[19, 24, 29, 34, 39].map((x, k) => (
        <rect
          key={x}
          x={x}
          y="63"
          width="2.2"
          height={k % 2 ? 40 : 50}
          rx="1"
          fill={k % 2 ? "#fde68a" : hue === "o" ? "#fb923c" : "#fb7185"}
          className="dn-tassel"
          style={{ animationDelay: `${k * 0.15}s` }}
        />
      ))}
    </svg>
  );
}

export function Diya({ i = 0 }) {
  const id = `dy-${i}`;
  return (
    <svg viewBox="0 0 80 64" className="dn-diya-svg">
      <defs>
        <linearGradient id={`${id}-clay`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="0.55" stopColor="#c2410c" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}-flame`} cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.35" stopColor="#fde047" />
          <stop offset="0.75" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* flame halo + flame */}
      <circle cx="40" cy="20" r="18" className="dn-halo" />
      <g className="dn-flame" style={{ animationDelay: `${i * 0.27}s` }}>
        <path
          d="M40 2 C46 12 50 20 46 28 C44 32 36 32 34 28 C30 20 34 12 40 2 Z"
          fill={`url(#${id}-flame)`}
        />
        <path d="M40 14 C42 19 43 23 41 27 C40 28.5 39 28.5 38.5 27 C37.5 23 38.5 19 40 14 Z" fill="#fffef5" />
      </g>
      {/* wick */}
      <rect x="39" y="28" width="2" height="5" rx="1" fill="#3f1d0b" />
      {/* clay bowl with spout */}
      <path
        d="M6 34 Q40 30 74 34 Q72 56 40 58 Q8 56 6 34 Z"
        fill={`url(#${id}-clay)`}
      />
      <path d="M6 34 Q40 40 74 34" stroke="#fdba74" strokeWidth="1.6" fill="none" />
      {[16, 28, 40, 52, 64].map((x) => (
        <circle key={x} cx={x} cy="46" r="1.8" fill="#fde68a" opacity="0.9" />
      ))}
      <path d="M14 50 Q40 56 66 50" stroke="#fde68a" strokeWidth="1" fill="none" opacity="0.6" strokeDasharray="2 3" />
    </svg>
  );
}

export function Rangoli() {
  const petals = Array.from({ length: 12 });
  const inner = Array.from({ length: 8 });
  return (
    <svg viewBox="-100 -100 200 200" className="dn-rangoli-svg">
      <circle r="96" fill="none" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="2 5" />
      {petals.map((_, k) => (
        <ellipse
          key={`p${k}`}
          rx="14"
          ry="44"
          cy="-46"
          transform={`rotate(${k * 30})`}
          fill="none"
          stroke={k % 2 ? "#f472b6" : "#fb923c"}
          strokeWidth="1.4"
        />
      ))}
      {inner.map((_, k) => (
        <path
          key={`i${k}`}
          d="M0 -12 Q10 -30 0 -48 Q-10 -30 0 -12 Z"
          transform={`rotate(${k * 45 + 22.5})`}
          fill="#facc15"
          opacity="0.55"
        />
      ))}
      {petals.map((_, k) => (
        <circle
          key={`d${k}`}
          r="2.6"
          cy="-88"
          transform={`rotate(${k * 30 + 15})`}
          fill="#fde68a"
        />
      ))}
      <circle r="12" fill="none" stroke="#fde68a" strokeWidth="1.5" />
      <circle r="5" fill="#fb923c" />
    </svg>
  );
}

export default function DiwaliNight() {
  return (
    <div className="dn-layer" aria-hidden="true">
      <div className="dn-stars">
        {STARS.map((s) => (
          <span
            key={s.i}
            className="dn-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="dn-rangoli">
        <Rangoli />
      </div>

      {LANTERNS.map((l, k) => (
        <span
          key={k}
          className={`dn-kandil dn-kandil-${l.side}`}
          style={{
            [l.side === "l" ? "left" : "right"]: `${l.pos}%`,
            "--len": `${l.len}px`,
            "--sc": l.scale,
            animationDelay: `${l.delay}s`,
          }}
        >
          <span className="dn-string" />
          <Kandil hue={l.hue} />
        </span>
      ))}
    </div>
  );
}

// Small gold flourish used either side of the greeting.
function Flourish({ flip = false }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={`dn-flourish${flip ? " flip" : ""}`}
      aria-hidden="true"
    >
      <path
        d="M118 12 H70 C60 12 56 4 48 4 C40 4 38 12 44 14 C50 16 52 8 46 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M70 12 C62 12 58 20 50 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="30" cy="12" r="2.2" fill="currentColor" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M38 12 l4 -4 l4 4 l-4 4 z" fill="currentColor" />
    </svg>
  );
}

// Row of lit diyas on a warm glowing ledge, with the Diwali greeting below.
export function DiyaRow() {
  return (
    <div className="dn-foot">
      <div className="dn-diya-row" aria-hidden="true">
        {DIYAS.map((i) => (
          <span key={i} className="dn-diya" style={{ "--i": i }}>
            <Diya i={i} />
          </span>
        ))}
      </div>
    </div>
  );
}

// "Happy Diwali" greeting with gold flourishes — sits under the sale card.
export function DiwaliGreeting() {
  return (
    <div className="dn-greet-wrap">
      <div className="dn-greet">
        <Flourish />
        <p className={`dn-greet-txt ${script.className}`}>Happy Diwali</p>
        <Flourish flip />
      </div>
      <p className="dn-greet-sub">
        <span aria-hidden="true">✦</span> May your shelves be full and your
        days bright <span aria-hidden="true">✦</span>
      </p>
    </div>
  );
}
