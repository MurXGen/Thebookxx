"use client";

import { useEffect, useMemo, useState } from "react";

// Independence Day celebration decor for the homepage.
// Auto-activates through 17 Aug (inclusive) and disappears on its own after.
// Full-celebration: a waving tricolor ribbon, falling tricolor confetti, and a
// festive "Freedom Sale" banner — all pointer-events-safe and lightweight.
const SAFFRON = "#FF9933";
const GREEN = "#138808";
const CHAKRA = "#0a3d91";

// Active window: now … 17 Aug 23:59 of the current year.
function isActive() {
  const now = new Date();
  const end = new Date(now.getFullYear(), 7, 17, 23, 59, 59); // Aug = month 7
  const start = new Date(now.getFullYear(), 7, 1, 0, 0, 0); // from 1 Aug
  return now >= start && now <= end;
}

export default function IndependenceDayDecor({
  ribbon = true,
  confetti = true,
  banner = true,
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isActive());
  }, []);

  // Pre-compute confetti pieces once (kept modest for performance).
  const pieces = useMemo(() => {
    const colors = [SAFFRON, "#ffffff", GREEN, CHAKRA];
    return Array.from({ length: 34 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: -Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 6 + Math.random() * 7,
      color: colors[i % colors.length],
      round: Math.random() > 0.5,
      sway: 12 + Math.random() * 26,
    }));
  }, []);

  if (!active) return null;

  // India became independent in 1947, so this is the (year − 1947)th one.
  const years = new Date().getFullYear() - 1947;
  const ord =
    years % 10 === 1 && years % 100 !== 11
      ? "st"
      : years % 10 === 2 && years % 100 !== 12
        ? "nd"
        : years % 10 === 3 && years % 100 !== 13
          ? "rd"
          : "th";

  return (
    <div className="iday" aria-hidden="true">
      {/* Waving tricolor ribbon */}
      {ribbon && (
        <div className="iday-ribbon">
          <span className="iday-ribbon-band saffron" />
          <span className="iday-ribbon-band white">
            <span className="iday-chakra" />
          </span>
          <span className="iday-ribbon-band green" />
        </div>
      )}

      {/* Falling tricolor confetti (top area only, non-interactive) */}
      {confetti && (
      <div className="iday-confetti">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="iday-piece"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              borderRadius: p.round ? "50%" : "2px",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--sway": `${p.sway}px`,
            }}
          />
        ))}
      </div>
      )}

      {/* Festive banner with a hand-built waving tricolor flag */}
      {banner && (
      <div className="iday-banner">
        <span className="iday-flagwrap" aria-hidden="true">
          <span className="iday-pole" />
          <span className="iday-flag2">
            <span className="iday-band iday-s" />
            <span className="iday-band iday-w">
              <span className="iday-chakra2" />
            </span>
            <span className="iday-band iday-g" />
          </span>
        </span>
        <div className="iday-banner-text">
          <strong>
            Happy {years}
            {ord} Independence Day!
          </strong>
          <span>Celebrating {years} years of freedom</span>
        </div>
      </div>
      )}

      <style jsx>{`
        .iday {
          position: relative;
          z-index: 5;
        }
        /* ── Ribbon ── */
        .iday-ribbon {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 8px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
        }
        .iday-ribbon-band {
          position: relative;
          flex: 1;
          transform-origin: center;
          animation: idayWave 3.4s ease-in-out infinite;
        }
        .iday-ribbon-band.saffron {
          background: ${SAFFRON};
        }
        .iday-ribbon-band.white {
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          animation-delay: 0.15s;
        }
        .iday-ribbon-band.green {
          background: ${GREEN};
          animation-delay: 0.3s;
        }
        .iday-chakra {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          border: 1px solid ${CHAKRA};
        }
        @keyframes idayWave {
          0%,
          100% {
            transform: translateX(0) skewX(0deg);
          }
          50% {
            transform: translateX(2px) skewX(-4deg);
          }
        }

        /* ── Confetti ── */
        .iday-confetti {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 46vh;
          pointer-events: none;
          overflow: hidden;
          z-index: 60;
        }
        .iday-piece {
          position: absolute;
          top: -14px;
          display: block;
          opacity: 0.9;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
          animation-name: idayFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes idayFall {
          0% {
            transform: translate(0, -20px) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.95;
          }
          100% {
            transform: translate(var(--sway), 48vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* ── Banner ── */
        .iday-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 12px 16px 0;
          padding: 12px 16px;
          border-radius: 16px;
          color: #3a2a00;
          background: linear-gradient(
            90deg,
            rgba(255, 153, 51, 0.22) 0%,
            rgba(255, 255, 255, 0.65) 50%,
            rgba(19, 136, 8, 0.2) 100%
          );
          border: 1px solid rgba(255, 153, 51, 0.4);
          box-shadow: 0 6px 20px rgba(255, 153, 51, 0.14);
          position: relative;
          overflow: hidden;
        }
        .iday-banner::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.5) 45%,
            transparent 60%
          );
          transform: translateX(-120%);
          animation: idayShine 4.5s ease-in-out infinite;
        }
        @keyframes idayShine {
          0%,
          65% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        /* ── Hand-built waving tricolor flag ── */
        .iday-flagwrap {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
          height: 40px;
          flex-shrink: 0;
        }
        .iday-pole {
          width: 3px;
          height: 40px;
          border-radius: 2px;
          background: linear-gradient(#b8863b, #8a6428);
        }
        .iday-flag2 {
          display: flex;
          flex-direction: column;
          width: 40px;
          height: 27px;
          margin-top: 1px;
          border-radius: 0 2px 2px 0;
          overflow: hidden;
          transform-origin: left center;
          box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.12);
          animation: idayWaveFlag 1.6s ease-in-out infinite;
        }
        .iday-band {
          flex: 1;
          width: 100%;
        }
        .iday-s {
          background: ${SAFFRON};
        }
        .iday-w {
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .iday-g {
          background: ${GREEN};
        }
        .iday-chakra2 {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 1.4px solid ${CHAKRA};
          animation: idaySpin 5s linear infinite;
        }
        @keyframes idaySpin {
          to {
            transform: rotate(360deg);
          }
        }
        /* Cloth-like ripple using a skew + slight vertical bob */
        @keyframes idayWaveFlag {
          0%,
          100% {
            transform: skewY(0deg) translateY(0);
          }
          25% {
            transform: skewY(-3deg) translateY(-1px);
          }
          50% {
            transform: skewY(0deg) translateY(0);
          }
          75% {
            transform: skewY(3deg) translateY(1px);
          }
        }
        .iday-banner-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 1;
          text-align: center;
        }
        .iday-banner-text strong {
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(90deg, ${SAFFRON}, ${CHAKRA}, ${GREEN});
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .iday-banner-text span {
          font-size: 12.5px;
          color: #5b4a2a;
        }
        .iday-spark {
          margin-left: auto;
          color: ${SAFFRON};
          font-size: 18px;
          z-index: 1;
          animation: idayFlag 2.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .iday-piece,
          .iday-ribbon-band,
          .iday-banner::after,
          .iday-flag2,
          .iday-chakra2,
          .iday-spark {
            animation: none !important;
          }
          .iday-confetti {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
