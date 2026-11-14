"use client";

import { Home } from "lucide-react";

/**
 * Full-screen "Placing order to …" loader: a progress ring sweeping around a
 * little map with a pulsing home pin, then where the order is going.
 */
export default function PlacingOrder({
  title = "Placing order to",
  label = "Home",
  address = "",
  sub = "",
}) {
  return (
    <div className="po-wrap" role="status" aria-live="polite">
      <div className="po-ring">
        <svg className="po-arc" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="56" className="po-track" />
          <circle cx="60" cy="60" r="56" className="po-sweep" />
        </svg>
        <div className="po-map" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <rect width="100" height="100" fill="#eceef1" />
            <path
              d="M-5 30 L105 22 M-5 64 L105 70 M24 -5 L30 105 M62 -5 L56 105 M80 -5 L88 105 M8 46 L44 48 M66 40 L100 44"
              stroke="#fff"
              strokeWidth="5"
              fill="none"
            />
            <path d="M36 74 h14 v12 h-14z M66 12 h16 v10 h-16z M6 80 h12 v14 h-12z" fill="#e2e5ea" />
          </svg>
          <span className="po-glow" />
          <span className="po-pin">
            <Home size={20} strokeWidth={2.4} />
          </span>
          <span className="po-dot" />
        </div>
      </div>
      <p className="po-title">{title}</p>
      {label && <p className="po-label">{label}</p>}
      {address && <p className="po-addr">{address}</p>}
      {sub && <p className="po-sub">{sub}</p>}
    </div>
  );
}
