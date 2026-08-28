"use client";

import { useEffect, useRef, useState } from "react";

// Janmashtami / Gokulashtami celebration decor for the homepage.
// Active in the run-up to Krishna Janmashtami (2026 ≈ 4–5 Sep). A flat, festive
// banner: a peacock-feather medallion, a Krishna greeting, and a Dahi-Handi pot
// (matka) that pops out of the ground and sinks back in as you scroll — tap it
// to open the scratch-card reward (same "tbx:open-scratch" event as before).
const BLUE = "#2b3a8f"; // Krishna blue
const TEAL = "#0f8a7e"; // peacock teal
const GOLD = "#e6a83c";
const MAROON = "#7c2d12";
const SAFFRON = "#ff8c42";
const CREAM = "#fff7e6";

function isActive() {
  const now = new Date();
  // ~20 Aug → 10 Sep window (covers Janmashtami + Dahi Handi).
  const start = new Date(now.getFullYear(), 7, 20, 0, 0, 0);
  const end = new Date(now.getFullYear(), 8, 10, 23, 59, 59);
  return now >= start && now <= end;
}

export default function JanmashtamiDecor({ banner = true }) {
  const [active, setActive] = useState(false);
  const [sink, setSink] = useState(0); // 0 = popped up, 1 = in the ground
  const bannerRef = useRef(null);

  useEffect(() => {
    setActive(isActive());
  }, []);

  // Scroll drives the pot in/out of the ground, anchored to the banner's own
  // position in the viewport so it's popped up whenever the banner is in view.
  useEffect(() => {
    if (!active || !banner) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = bannerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const s = (vh * 0.55 - rect.top) / 320;
        setSink(Math.max(0, Math.min(s, 1)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, banner]);

  if (!active || !banner) return null;

  const openScratch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tbx:open-scratch"));
    }
  };

  return (
    <div className="jn">
      <div className="jn-banner" ref={bannerRef}>
        {/* Peacock-feather medallion pinned centre-top */}
        <span className="jn-crown" aria-hidden="true">
          <svg viewBox="0 0 48 60" width="52" height="64" className="jn-feather">
            {/* stem */}
            <rect x="22.6" y="30" width="2.8" height="28" rx="1.4" fill="#4b7f3f" />
            {/* barbs */}
            {[-26, -13, 0, 13, 26].map((a, i) => (
              <ellipse
                key={i}
                cx="24"
                cy="18"
                rx="3.4"
                ry="15"
                fill={i % 2 === 0 ? TEAL : "#2f9e8f"}
                opacity="0.9"
                transform={`rotate(${a} 24 33)`}
              />
            ))}
            {/* eye */}
            <ellipse cx="24" cy="14" rx="8.5" ry="11" fill="#1f6f66" />
            <ellipse cx="24" cy="15" rx="6" ry="8" fill={BLUE} />
            <ellipse cx="24" cy="16.5" rx="3.4" ry="4.6" fill={GOLD} />
            <circle cx="24" cy="16.5" r="1.8" fill={MAROON} />
          </svg>
        </span>

        <div className="jn-banner-content">
          <strong className="jn-title">Happy Janmashtami!</strong>
          <span className="jn-sub">
            Celebrate the birth of Lord Krishna — Gokulashtami 2026 🦚
          </span>
        </div>

        {/* Dahi Handi (matka) popping out of the ground */}
        <button
          type="button"
          className="jn-handi"
          onClick={openScratch}
          aria-label="Scratch the Dahi Handi to win cashback"
        >
          <span className="jn-stage">
            <span
              className="jn-pot-wrap"
              style={{
                transform: `translateY(${sink * 98}px)`,
                opacity: 1 - sink * 0.85,
              }}
            >
              <span className="jn-pot-inner">
                {/* hanging rope */}
                <span className="jn-rope" />
                <svg viewBox="0 0 90 96" width="90" height="96" className="jn-pot">
                  {/* marigold garland */}
                  <ellipse cx="45" cy="34" rx="30" ry="8" fill="#f59e0b" opacity="0.9" />
                  {[12, 24, 36, 48, 60, 72].map((x, i) => (
                    <circle key={i} cx={x} cy="34" r="3.4" fill={i % 2 ? "#f97316" : "#fbbf24"} />
                  ))}
                  {/* pot body */}
                  <path
                    d="M20 40 Q10 60 20 78 Q45 96 70 78 Q80 60 70 40 Q45 30 20 40 Z"
                    fill="#b5651d"
                    stroke={MAROON}
                    strokeWidth="1.5"
                  />
                  {/* rim */}
                  <ellipse cx="45" cy="40" rx="25" ry="7" fill="#c9782e" stroke={MAROON} strokeWidth="1.5" />
                  <ellipse cx="45" cy="39" rx="20" ry="4.5" fill="#8a4a12" />
                  {/* dahi drip */}
                  <path d="M32 42 q3 10 0 16 M45 43 q3 12 0 20 M58 42 q-3 10 0 16" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.95" />
                  {/* ₹ token on the belly */}
                  <circle cx="45" cy="62" r="10" fill={GOLD} stroke="#fff" strokeWidth="1.5" />
                  <text x="45" y="67" textAnchor="middle" fontSize="13" fontWeight="900" fill={MAROON}>
                    ₹
                  </text>
                </svg>
              </span>
            </span>
            {/* Cracked ground the pot rises through (in front) */}
            <svg
              className="jn-ground"
              viewBox="0 0 158 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="jnSoil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e2c9a2" />
                  <stop offset="1" stopColor="#a5855b" />
                </linearGradient>
              </defs>
              <ellipse cx="79" cy="15" rx="46" ry="6" fill="rgba(0,0,0,0.16)" />
              <ellipse cx="79" cy="24" rx="78" ry="11" fill="url(#jnSoil)" />
              <ellipse cx="79" cy="20" rx="74" ry="6" fill="#efd9b6" opacity="0.9" />
              <path
                d="M40 10 L52 5 L61 10 L71 4 L79 10 L87 4 L97 10 L106 5 L118 10 L109 15 L94 11 L79 16 L64 11 L49 15 Z"
                fill="#2c1a0e"
              />
              <path
                d="M40 10 L52 5 L61 10 L71 4 L79 10 L87 4 L97 10 L106 5 L118 10"
                fill="none"
                stroke="#f0dcbb"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <style jsx>{`
        .jn {
          position: relative;
          z-index: 5;
        }
        /* Banner — transparent, bordered; content left, handi absolute right */
        .jn-banner {
          position: relative;
          text-align: left;
          margin: 34px 8px 0;
          padding: 20px 172px 20px 22px;
          border-radius: 18px;
          background: linear-gradient(135deg, ${CREAM}, #fffdf9);
          border: 1.5px dashed ${GOLD};
          overflow: visible;
        }
        .jn-banner-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          min-width: 0;
        }
        .jn-crown {
          position: absolute;
          top: -46px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          z-index: 12;
        }
        .jn-feather {
          display: block;
          filter: drop-shadow(0 2px 3px rgba(15, 118, 110, 0.3));
          transform-origin: bottom center;
          animation: jnSway 4.5s ease-in-out infinite;
        }
        @keyframes jnSway {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        .jn-title {
          font-size: 19px;
          font-weight: 800;
          color: ${BLUE};
          letter-spacing: -0.01em;
        }
        .jn-sub {
          font-size: 13px;
          color: ${MAROON};
          max-width: 460px;
        }

        /* Dahi Handi scratch button */
        .jn-handi {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }
        .jn-stage {
          position: relative;
          width: 158px;
          height: 128px;
          display: block;
          overflow: hidden;
          perspective: 480px;
        }
        .jn-pot-wrap {
          position: absolute;
          left: 0;
          right: 0;
          top: 2px;
          height: 108px;
          will-change: transform, opacity;
          transition: transform 0.12s linear, opacity 0.12s linear;
          display: flex;
          justify-content: center;
        }
        .jn-pot-inner {
          position: relative;
          animation: jnPop 0.7s cubic-bezier(0.2, 1.3, 0.4, 1) both,
            jnFloat 3.4s ease-in-out 0.7s infinite;
        }
        @keyframes jnFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes jnPop {
          0% {
            transform: translateY(52px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .jn-rope {
          position: absolute;
          top: -14px;
          left: 50%;
          width: 3px;
          height: 16px;
          transform: translateX(-50%);
          background: repeating-linear-gradient(
            180deg,
            ${MAROON} 0 3px,
            ${GOLD} 3px 6px
          );
          border-radius: 2px;
        }
        .jn-pot {
          display: block;
          filter: drop-shadow(0 10px 14px rgba(90, 40, 10, 0.4));
        }
        .jn-handi:hover .jn-pot-inner {
          transform: translateY(-6px) scale(1.04);
        }
        .jn-ground {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 158px;
          height: 36px;
          transform: translateX(-50%);
          z-index: 3;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        }

        @media (max-width: 600px) {
          .jn-banner {
            margin: 30px 8px 0;
            padding: 18px 120px 18px 16px;
          }
          .jn-handi {
            right: -6px;
            transform: translateY(-50%) scale(0.78);
            transform-origin: right center;
          }
          .jn-title {
            font-size: 16px;
          }
          .jn-sub {
            font-size: 12px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .jn-feather,
          .jn-pot-inner {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
