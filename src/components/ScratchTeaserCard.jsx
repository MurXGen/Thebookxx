"use client";

// Decorative scratch-card teaser shown in the hero (below Join community) for
// not-logged-in shoppers. Two brand-coloured cards fanned in 3D, looking planted
// in the ground, with a "Scratch to win" caption. Tapping it fires a window
// event that PincodeModal listens for to open the phone-number flow.
export default function ScratchTeaserCard() {
  // The teaser is a decorative entry point to the scratch flow — always shown.
  // Whether a reward is actually granted is decided downstream (wallet cap +
  // the one-time `tbx_scratch_claimed` guard in PincodeModal), so returning
  // shoppers still see the animation but can't farm rewards.

  const open = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tbx:open-scratch"));
    }
  };

  return (
    <div
      className="st-teaser"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
      aria-label="Scratch to win cashback"
    >
      <div className="st-stage">
        <div className="st-card st-left">
          <span className="st-shine" />
          <span className="st-emoji">🎁</span>
        </div>
        <div className="st-card st-right">
          <span className="st-shine" />
          <span className="st-coin">₹</span>
        </div>
        {/* ground the cards look planted into */}
        <span className="st-ground" />
      </div>

      <span className="st-caption">Scratch to win cashbacks</span>

      <style jsx>{`
        .st-teaser {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin: 18px auto 4px;
          cursor: pointer;
          user-select: none;
          width: fit-content;
        }
        .st-stage {
          position: relative;
          width: 170px;
          height: 116px;
        }
        .st-card {
          position: absolute;
          bottom: 14px;
          left: 50%;
          width: 74px;
          height: 92px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #fff;
          box-shadow:
            0 14px 22px rgba(251, 133, 0, 0.32),
            inset 0 0 0 2px rgba(255, 255, 255, 0.4);
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1.4px),
            linear-gradient(150deg, #ffb14d, #fb8500 60%, #e06f00);
          background-size:
            8px 8px,
            100% 100%;
          transition: transform 0.22s ease;
        }
        .st-left {
          transform: translateX(-72%) rotate(-11deg);
          z-index: 1;
        }
        .st-right {
          transform: translateX(-28%) rotate(11deg);
          z-index: 2;
        }
        .st-teaser:hover .st-left {
          transform: translateX(-80%) rotate(-14deg) translateY(-4px);
        }
        .st-teaser:hover .st-right {
          transform: translateX(-20%) rotate(14deg) translateY(-4px);
        }
        .st-emoji {
          font-size: 30px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
        }
        .st-coin {
          font-size: 34px;
          font-weight: 900;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
        }
        .st-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 45%,
            transparent 62%
          );
          transform: translateX(-120%);
          animation: stShine 3.2s ease-in-out infinite;
        }
        .st-right .st-shine {
          animation-delay: 0.6s;
        }
        @keyframes stShine {
          0%,
          62% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        /* Ground: soft mound + shadow so the cards look stuck into it */
        .st-ground {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 150px;
          height: 30px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(251, 133, 0, 0.22) 0%,
            rgba(251, 133, 0, 0.1) 45%,
            transparent 72%
          );
          z-index: 3;
        }
        .st-ground::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 6px;
          width: 118px;
          height: 16px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: linear-gradient(#f3ede3, #e7ddcd);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        .st-caption {
          font-size: 13px;
          font-weight: 700;
          color: var(--foreground, #1a1a1a);
        }
        .st-caption b {
          color: var(--tertiary, #fb8500);
        }
        @media (prefers-reduced-motion: reduce) {
          .st-shine {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
