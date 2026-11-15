"use client";

// Swiggy-style "Congratulations!" coupon popup for the bag. One clear rupee
// saving, one button, and a 5-second bar draining underneath. When the bar
// runs out the popup closes without applying (the code stays in the coupon list).

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BadgePercent, Bookmark } from "lucide-react";

const DURATION = 5000;

// variant "coupon" (WELCOME10) or "bookmark" (below the coupon's minimum:
// a free bookmark the shopper can claim in one tap).
export default function WelcomeCouponPopup({ open, code, save, short = 0, onApply, onClose, variant = "coupon" }) {
  const bm = variant === "bookmark";
  // Keep the latest onClose without restarting the 5s timer on re-renders.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current?.(), DURATION);
    return () => clearTimeout(t);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="wcp-back" role="presentation" onClick={onClose}>
      <div
        className={`wcp${bm ? " wcp-bm" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wcp-h"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wcp-badge" aria-hidden="true">
          <span className="wcp-burst" />
          {bm ? <Bookmark size={30} strokeWidth={2.2} /> : <BadgePercent size={30} strokeWidth={2.2} />}
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} className="wcp-conf" style={{ "--i": i }} />
          ))}
        </div>
        {bm ? (
          <>
            <p className="wcp-k">A gift for you!</p>
            <h2 id="wcp-h" className="wcp-h">Get a free bookmark</h2>
            <p className="wcp-sub">A collectible bookmark ships with your books · free with this order</p>
            <button type="button" className="bg-paybar-btn wcp-btn" onClick={onApply}>
              Avail free bookmark
            </button>
          </>
        ) : (
          <>
            <p className="wcp-k">Congratulations!</p>
            <h2 id="wcp-h" className="wcp-h">
              {save > 0 ? <>Save ₹{save} on this bag</> : <>Extra 10% off your books</>}
            </h2>
            <p className="wcp-sub">
              Use code <b>{code}</b> for 10% off
              {short > 0 ? ` · add ₹${short} more to unlock it` : " · applied instantly"}
            </p>
            <button type="button" className="bg-paybar-btn wcp-btn" onClick={onApply}>
              YAY! Apply {code}
            </button>
          </>
        )}
        <button type="button" className="wcp-skip" onClick={onClose}>
          Maybe later
        </button>
        <span className="wcp-bar" style={{ "--d": `${DURATION}ms` }} aria-hidden="true" />
      </div>
    </div>,
    document.body,
  );
}
