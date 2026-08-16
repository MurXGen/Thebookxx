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
    <div className="rb" aria-hidden="true">
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
          {/* Rakhi medallion (flower design), absolutely centred at the top */}
          <span className="rb-rakhi" aria-hidden="true">
            <span className="rb-tail rb-tail-l" />
            <span className="rb-tail rb-tail-r" />
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

          <strong className="rb-title">Happy Raksha Bandhan!</strong>
          <span className="rb-sub">
            Celebrate the bond, gift a book to someone you love 🎁
          </span>

          {/* Scratch card popping out of the ground */}
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
              <svg
                className="rb-ground"
                viewBox="0 0 158 30"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* soil mound */}
                <ellipse cx="79" cy="21" rx="76" ry="9" fill="#cdb492" />
                {/* jagged dark opening the card rises through */}
                <path
                  d="M38 7 L50 3 L59 7 L69 2 L79 7 L89 2 L99 7 L108 3 L120 7 L111 12 L96 8 L79 13 L62 8 L47 12 Z"
                  fill="#3a2416"
                />
                {/* crack lines radiating from the opening */}
                <path
                  d="M38 9 L24 15 M120 9 L134 15 M50 11 L44 21 M108 11 L114 21"
                  stroke="#8a6b4a"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* loose dirt clumps */}
                <circle cx="32" cy="10" r="2.4" fill="#b89e78" />
                <circle cx="126" cy="10" r="2.4" fill="#b89e78" />
              </svg>
            </span>
            <span className="rb-scratch-cap">
              Scratch &amp; win up to <b>₹50</b>
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
          height: 16px;
          overflow: hidden;
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

        /* ── Banner (transparent, bordered) ── */
        .rb-banner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          margin: 40px 16px 0;
          padding: 44px 18px 22px;
          border-radius: 18px;
          background: transparent;
          border: 1.5px dashed ${GOLD};
        }

        /* Rakhi flower medallion pinned centre-top */
        .rb-rakhi {
          position: absolute;
          top: -32px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 92px;
          height: 60px;
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
        .rb-tail {
          position: absolute;
          top: 50%;
          width: 26px;
          height: 6px;
          border-radius: 3px;
          background: repeating-linear-gradient(
            90deg,
            ${RED} 0 4px,
            ${GOLD} 4px 8px
          );
          z-index: -1;
        }
        .rb-tail-l {
          left: -6px;
          transform: translateY(-50%) rotate(-14deg);
          animation: rbFlutterL 2.4s ease-in-out infinite;
        }
        .rb-tail-r {
          right: -6px;
          transform: translateY(-50%) rotate(14deg);
          animation: rbFlutterR 2.4s ease-in-out infinite;
        }
        @keyframes rbFlutterL {
          0%,
          100% {
            transform: translateY(-50%) rotate(-14deg);
          }
          50% {
            transform: translateY(-62%) rotate(-22deg);
          }
        }
        @keyframes rbFlutterR {
          0%,
          100% {
            transform: translateY(-50%) rotate(14deg);
          }
          50% {
            transform: translateY(-38%) rotate(22deg);
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }
        .rb-stage {
          position: relative;
          width: 158px;
          height: 122px;
          display: block;
          overflow: hidden; /* card sinks INTO the ground */
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
          animation: rbPop 0.7s cubic-bezier(0.2, 1.3, 0.4, 1) both;
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
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.45);
          transition: transform 0.22s ease;
        }
        .rb-sc-l {
          background: ${RED};
          transform: translateX(-78%) rotate(-11deg);
          z-index: 1;
        }
        .rb-sc-r {
          background: ${MAROON};
          transform: translateX(-22%) rotate(11deg);
          z-index: 2;
        }
        .rb-scratch:hover .rb-sc-l {
          transform: translateX(-86%) rotate(-14deg) translateY(-4px);
        }
        .rb-scratch:hover .rb-sc-r {
          transform: translateX(-14%) rotate(14deg) translateY(-4px);
        }
        .rb-sc-emoji {
          font-size: 30px;
        }
        .rb-sc-coin {
          font-size: 36px;
          font-weight: 900;
        }
        /* Cracked ground: sits in front so the card bursts up through the slit */
        .rb-ground {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 158px;
          height: 30px;
          transform: translateX(-50%);
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.12));
          z-index: 3;
        }
        .rb-scratch-cap {
          font-size: 12.5px;
          font-weight: 700;
          color: ${MAROON};
          white-space: nowrap;
        }
        .rb-scratch-cap b {
          color: ${RED};
        }

        @media (prefers-reduced-motion: reduce) {
          .rb-petal,
          .rb-thread,
          .rb-beads,
          .rb-flower,
          .rb-tail-l,
          .rb-tail-r,
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
