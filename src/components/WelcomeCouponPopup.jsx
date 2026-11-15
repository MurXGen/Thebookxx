"use client";

// Swiggy-style "Congratulations!" coupon popup for the bag. One clear rupee
// saving, one button, and a 5-second bar draining underneath. When the bar
// runs out the popup closes without applying (the code stays in the coupon list).

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BadgePercent } from "lucide-react";

const DURATION = 5000;

export default function WelcomeCouponPopup({ open, code, save, short = 0, onApply, onClose }) {
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
        className="wcp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wcp-h"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wcp-badge" aria-hidden="true">
          <span className="wcp-burst" />
          <BadgePercent size={30} strokeWidth={2.2} />
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} className="wcp-conf" style={{ "--i": i }} />
          ))}
        </div>
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
        <button type="button" className="wcp-skip" onClick={onClose}>
          Maybe later
        </button>
        <span className="wcp-bar" style={{ "--d": `${DURATION}ms` }} aria-hidden="true" />
      </div>
    </div>,
    document.body,
  );
}
