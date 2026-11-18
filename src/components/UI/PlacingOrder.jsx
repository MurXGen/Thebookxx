"use client";

import { useEffect } from "react";
import { Home } from "lucide-react";

/**
 * Full-screen "Placing order to …" loader: a green progress ring sweeping
 * around a little map, a bouncing home pin that sends out "tap" ripples (with
 * a light haptic buzz on each of the first few), then where the order is going.
 */
export default function PlacingOrder({
  title = "Placing order to",
  label = "Home",
  address = "",
  sub = "",
}) {
  // Feel it: a short buzz in step with the first three ripples.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    const buzz = () => {
      try {
        navigator.vibrate(n === 0 ? [14, 40, 14] : 12);
      } catch {}
      n += 1;
    };
    buzz();
    const id = setInterval(() => {
      if (n >= 3) return clearInterval(id);
      buzz();
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="po-wrap po2" role="status" aria-live="polite">
      <div className="po-ring">
        <span className="po-halo" aria-hidden="true" />
        <svg className="po-arc" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="56" className="po-track" />
          <circle cx="60" cy="60" r="56" className="po-sweep" />
        </svg>
        <div className="po-map" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <rect width="100" height="100" fill="#eef2f0" />
            <path
              d="M-5 30 L105 22 M-5 64 L105 70 M24 -5 L30 105 M62 -5 L56 105 M80 -5 L88 105 M8 46 L44 48 M66 40 L100 44"
              stroke="#fff"
              strokeWidth="5"
              fill="none"
            />
            <path d="M36 74 h14 v12 h-14z M66 12 h16 v10 h-16z M6 80 h12 v14 h-12z" fill="#dfe7e3" />
            <path d="M70 52 q8 -4 14 2 q-2 8 -12 6z" fill="#cfe9dc" />
          </svg>
          {/* Tap ripples spreading from where the pin lands */}
          <span className="po-ripple" />
          <span className="po-ripple d2" />
          <span className="po-ripple d3" />
          <span className="po-shadow" />
          <span className="po-pin2">
            <svg viewBox="0 0 48 60" className="po-pin2-shape" aria-hidden="true">
              <defs>
                <linearGradient id="poPinG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22c55e" />
                  <stop offset="1" stopColor="#15803d" />
                </linearGradient>
              </defs>
              <path
                d="M24 2C12.4 2 3 11.2 3 22.6 3 37.4 24 58 24 58s21-20.6 21-35.4C45 11.2 35.6 2 24 2z"
                fill="url(#poPinG)"
                stroke="#fff"
                strokeWidth="2.5"
              />
            </svg>
            <span className="po-pin2-ic">
              <Home size={18} strokeWidth={2.6} />
            </span>
          </span>
        </div>
      </div>
      <p className="po-title">
        {title}
        <span className="po-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
      {label && <p className="po-label">{label}</p>}
      {address && <p className="po-addr">{address}</p>}
      {sub && <p className="po-sub">{sub}</p>}
    </div>
  );
}
