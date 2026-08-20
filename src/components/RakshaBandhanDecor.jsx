"use client";

import { useEffect, useMemo, useState } from "react";

// Raksha Bandhan celebration decor for the homepage.
// Active in the run-up to Rakhi (2026 = 28 Aug). Flat, solid-colour festive
// banner: a rakhi medallion pinned centre-top, a centred greeting, and a 3D
// scratch card that pops out of the ground and sinks back in as you scroll.
const RED = "#c0223b";
const GOLD = "#e6a83c";
const MAROON = "#8a1c34";
const SAFFRON = "#ff8c42";
const PINK = "#e5638a";

function isActive() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 7, 15, 0, 0, 0);
  const end = new Date(now.getFullYear(), 7, 30, 23, 59, 59);
  return now >= start && now <= end;
}

export default function RakshaBandhanDecor({
  ribbon = true,
  confetti = true,
  banner = true,
}) {
  const [active, setActive] = useState(false);
  const [sink, setSink] = useState(0); // 0 = popped up, 1 = in the ground

  useEffect(() => {
    setActive(isActive());
  }, []);

  // Scroll drives the card in/out of the ground.
  useEffect(() => {
    if (!active || !banner) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = typeof window !== "undefined" ? window.scrollY || 0 : 0;
        setSink(Math.min(y / 320, 1));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, banner]);

  const pieces = useMemo(() => {
    const colors = [GOLD, SAFFRON, RED, PINK, "#ffd36b"];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: -Math.random() * 8,
      duration: 7 + Math.random() * 6,
      size: 7 + Math.random() * 8,
      color: colors[i % colors.length],
      petal: Math.random() > 0.4,
      sway: 14 + Math.random() * 28,
    }));
  }, []);

  if (!active) return null;

  const openScratch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tbx:open-scratch"));
    }
  };

  return (
    <div className="rb">
      {/* Rakhi-thread ribbon with moving circular beads */}
      {ribbon && (
        <div className="rb-ribbon">
          <span className="rb-thread" />
          <span className="rb-beads" />
        </div>
      )}

      {/* Falling marigold petals */}
      {confetti && (
        <div className="rb-petals">
          {pieces.map((p) => (
            <span
              key={p.id}
              className={`rb-petal${p.petal ? " leaf" : " dot"}`}
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--sway": `${p.sway}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Centred banner: rakhi (absolute) → heading → scratch card */}
      {banner && (
        <div className="rb-banner">
          {/* Rakhi thread — behind the section, only the flower sits in front */}
          <svg
            className="rb-threads"
            viewBox="0 0 210 66"
            width="210"
            height="66"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="rb-rope"
              d="M105 10 C 86 5, 76 32, 54 33 S 24 48, 12 56"
            />
            <path
              className="rb-rope"
              d="M105 10 C 124 5, 134 32, 156 33 S 186 48, 198 56"
            />
            <path
              className="rb-rope-tw"
              d="M105 10 C 86 5, 76 32, 54 33 S 24 48, 12 56"
            />
            <path
              className="rb-rope-tw"
              d="M105 10 C 124 5, 134 32, 156 33 S 186 48, 198 56"
            />
          </svg>

          {/* Rakhi medallion (flower design), absolutely centred at the top */}
          <span className="rb-rakhi" aria-hidden="true">
            <svg className="rb-flower" viewBox="0 0 48 48" width="60" height="60">
              {/* Outer petal ring (marigold) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                (a, i) => (
                  <ellipse
                    key={`o${a}`}
                    cx="24"
                    cy="7.5"
                    rx="3.6"
                    ry="7.5"
                    fill={i % 2 === 0 ? RED : SAFFRON}
                    transform={`rotate(${a} 24 24)`}
                  />
                ),
              )}
              {/* Inner petal ring (gold) */}
              {[15, 60, 105, 150, 195, 240, 285, 330].map((a) => (
                <ellipse
                  key={`i${a}`}
                  cx="24"
                  cy="13"
                  rx="3"
                  ry="5.5"
                  fill={GOLD}
                  transform={`rotate(${a} 24 24)`}
                />
              ))}
              {/* Centre disc + dotted ring + jewel */}
              <circle
                cx="24"
                cy="24"
                r="9"
                fill={GOLD}
                stroke={MAROON}
                strokeWidth="1.6"
              />
              <circle
                cx="24"
                cy="24"
                r="6.4"
                fill="none"
                stroke={MAROON}
                strokeWidth="1"
                strokeDasharray="1.4 2.4"
                opacity="0.65"
              />
              <circle
                cx="24"
                cy="24"
                r="3.6"
                fill={RED}
                stroke="#fff"
                strokeWidth="1"
              />
            </svg>
          </span>

          <div className="rb-banner-content">
            <strong className="rb-title">Happy Raksha Bandhan!</strong>
            <span className="rb-sub">
              Celebrate the bond, gift a book to someone you love 🎁
            </span>
          </div>

          {/* Scratch card popping out of the right edge of the section */}
          <button
            type="button"
            className="rb-scratch"
            onClick={openScratch}
            aria-label="Scratch to win cashback"
          >
            <span className="rb-stage">
              <span
                className="rb-cards"
                style={{
                  transform: `translateY(${sink * 98}px)`,
                  opacity: 1 - sink * 0.85,
                }}
              >
                <span className="rb-cards-inner">
                  <span className="rb-sc rb-sc-l">
                    <span className="rb-sc-emoji">🎁</span>
                  </span>
                  <span className="rb-sc rb-sc-r">
                    <span className="rb-sc-coin">₹</span>
                  </span>
                </span>
              </span>
              {/* Cracked ground the cards burst up through (in front) */}
              <svg
                className="rb-ground"
                viewBox="0 0 158 36"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="rbSoil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e2c9a2" />
                    <stop offset="1" stopColor="#a5855b" />
                  </linearGradient>
                </defs>
                {/* soft cast shadow of the cards on the soil */}
                <ellipse cx="79" cy="15" rx="46" ry="6" fill="rgba(0,0,0,0.16)" />
                {/* soil mound with a lit top rim for depth */}
                <ellipse cx="79" cy="24" rx="78" ry="11" fill="url(#rbSoil)" />
                <ellipse cx="79" cy="20" rx="74" ry="6" fill="#efd9b6" opacity="0.9" />
                {/* dark jagged slit the card rises out of */}
                <path
                  d="M40 10 L52 5 L61 10 L71 4 L79 10 L87 4 L97 10 L106 5 L118 10 L109 15 L94 11 L79 16 L64 11 L49 15 Z"
                  fill="#2c1a0e"
                />
                {/* raised dirt lips catching light */}
                <path
                  d="M40 10 L52 5 L61 10 L71 4 L79 10 L87 4 L97 10 L106 5 L118 10"
                  fill="none"
                  stroke="#f0dcbb"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* crack lines + loose clumps */}
                <path
                  d="M40 12 L26 18 M118 12 L132 18 M52 14 L46 24 M106 14 L112 24"
                  stroke="#7d6042"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="30" cy="13" r="2.6" fill="#c2a87f" />
                <circle cx="128" cy="13" r="2.6" fill="#c2a87f" />
              </svg>
            </span>
          </button>
        </div>
      )}

      <style jsx>{`
        .rb {
          position: relative;
          z-index: 5;
        }

        /* ── Ribbon with circular beads (flat colour bands) ── */
        .rb-ribbon {
          position: relative;
          width: 100%;
          height: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(138, 28, 52, 0.18);
        }
        .rb-thread,
        .rb-beads {
          position: absolute;
          inset: 0;
        }
        .rb-thread {
          background: repeating-linear-gradient(
            90deg,
            ${RED} 0px,
            ${RED} 10px,
            ${GOLD} 10px,
            ${GOLD} 20px,
            ${MAROON} 20px,
            ${MAROON} 30px
          );
          background-size: 30px 100%;
          animation: rbSlide 3.2s linear infinite;
        }
        .rb-beads {
          background-image: radial-gradient(
            circle,
            #fff3cf 2px,
            ${GOLD} 3px,
            ${MAROON} 4.2px,
            transparent 4.8px
          );
          background-size: 26px 100%;
          background-position: 13px center;
          animation: rbSlideBeads 3.2s linear infinite;
        }
        @keyframes rbSlide {
          to {
            background-position: 30px 0;
          }
        }
        @keyframes rbSlideBeads {
          to {
            background-position: 39px center;
          }
        }

        /* ── Falling petals (solid colours) ── */
        .rb-petals {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 46vh;
          pointer-events: none;
          overflow: hidden;
          z-index: 60;
        }
        .rb-petal {
          position: absolute;
          top: -16px;
          display: block;
          opacity: 0.92;
          animation-name: rbFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .rb-petal.dot {
          border-radius: 50%;
        }
        .rb-petal.leaf {
          border-radius: 50% 0 50% 50%;
        }
        @keyframes rbFall {
          0% {
            transform: translate(0, -20px) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.95;
          }
          100% {
            transform: translate(var(--sway), 48vh) rotate(320deg);
            opacity: 0;
          }
        }

        /* ── Banner (transparent, bordered) — content left, scratch absolute
           on the right so the card hugs its content height ── */
        .rb-banner {
          position: relative;
          text-align: left;
          margin: 34px 8px 0;
          /* right padding reserves room for the absolute scratch card */
          padding: 20px 168px 20px 22px;
          border-radius: 18px;
          background: transparent;
          border: 1.5px dashed ${GOLD};
          overflow: visible;
        }
        .rb-banner-content {
          position: relative;
          z-index: 1; /* above the rope threads */
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          min-width: 0;
        }

        /* Rakhi flower medallion pinned centre-top */
        .rb-rakhi {
          position: absolute;
          top: -50px;
          left: 50%;
          right: auto;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 92px;
          height: 60px;
          z-index: 12;
        }
        /* Curvy rakhi thread (real rope feel: gold cord + red twist) */
        .rb-threads {
          position: absolute;
          top: -30px; /* starts at the flower, droops onto the section top */
          left: 50%;
          transform: translateX(-50%);
          width: 210px;
          height: 66px;
          overflow: visible;
          z-index: 0; /* behind the content + scratch card */
        }
        .rb-rope {
          fill: none;
          stroke: ${GOLD};
          stroke-width: 3.5;
          stroke-linecap: round;
        }
        .rb-rope-tw {
          fill: none;
          stroke: ${RED};
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-dasharray: 2 6;
        }
        .rb-flower {
          display: block;
          filter: drop-shadow(0 2px 3px rgba(138, 28, 52, 0.25));
          animation: rbSpin 26s linear infinite;
        }
        @keyframes rbSpin {
          to {
            transform: rotate(360deg);
          }
        }
        .rb-title {
          font-size: 18px;
          font-weight: 800;
          color: ${MAROON};
        }
        .rb-sub {
          font-size: 13px;
          color: #6b3040;
          max-width: 460px;
        }

        /* ── Scratch card popping out of the ground ── */
        .rb-scratch {
          position: absolute;
          right: -16px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2; /* above the rope threads */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }
        .rb-stage {
          position: relative;
          width: 158px;
          height: 120px;
          display: block;
          overflow: hidden; /* card body is clipped below the soil line */
          perspective: 480px; /* gives the emerging cards real depth */
        }
        .rb-cards {
          position: absolute;
          left: 0;
          right: 0;
          top: 6px;
          height: 100px;
          will-change: transform, opacity;
          transition: transform 0.12s linear, opacity 0.12s linear;
        }
        .rb-cards-inner {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: rbPop 0.7s cubic-bezier(0.2, 1.3, 0.4, 1) both,
            rbFloat 3.4s ease-in-out 0.7s infinite;
        }
        @keyframes rbFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes rbPop {
          0% {
            transform: translateY(48px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .rb-sc {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 72px;
          height: 92px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.45),
            0 12px 18px -6px rgba(90, 10, 25, 0.5);
          transition: transform 0.22s ease;
        }
        .rb-sc-l {
          background: ${RED};
          transform: translateX(-78%) rotate(-11deg) rotateX(10deg);
          z-index: 1;
        }
        .rb-sc-r {
          background: ${MAROON};
          transform: translateX(-22%) rotate(11deg) rotateX(10deg);
          z-index: 2;
        }
        .rb-scratch:hover .rb-sc-l {
          transform: translateX(-86%) rotate(-14deg) rotateX(10deg)
            translateY(-6px);
        }
        .rb-scratch:hover .rb-sc-r {
          transform: translateX(-14%) rotate(14deg) rotateX(10deg)
            translateY(-6px);
        }
        .rb-sc-emoji {
          font-size: 30px;
        }
        .rb-sc-coin {
          font-size: 36px;
          font-weight: 900;
        }
        /* Cracked ground the cards rise through — sits in front (z-index) */
        .rb-ground {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 158px;
          height: 36px;
          transform: translateX(-50%);
          z-index: 3;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        }

        /* Narrow screens — keep the same horizontal layout, scaled to fit */
        @media (max-width: 600px) {
          .rb-banner {
            margin: 30px 8px 0;
            padding: 18px 116px 18px 16px;
          }
          .rb-scratch {
            right: -8px;
            transform: translateY(-50%) scale(0.76);
            transform-origin: right center;
          }
          .rb-title {
            font-size: 16px;
          }
          .rb-sub {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rb-petal,
          .rb-thread,
          .rb-beads,
          .rb-flower,
          .rb-threads,
          .rb-cards-inner {
            animation: none !important;
          }
          .rb-petals {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
