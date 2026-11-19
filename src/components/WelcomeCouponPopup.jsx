"use client";

// Swiggy-style "Congratulations!" coupon popup for the bag. One clear rupee
// saving, one button, and a 5-second bar draining underneath. When the bar
// runs out the popup closes without applying (the code stays in the coupon list).

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BadgePercent, Bookmark, Truck, Check, Gift } from "lucide-react";

const DURATION = 5000;
const GIFT_DURATION = 10000; // the free delivery + bookmarks card stays longer

// variant "coupon" (WELCOME10) or "bookmark" (below the coupon's minimum:
// a free bookmark the shopper can claim in one tap).
export default function WelcomeCouponPopup({
  open,
  code,
  save,
  short = 0,
  onApply,
  onClose,
  variant = "coupon",
  freeBookmarks = 2,
  deliveryFree = false,
  deliveryShort = 0,
  freeAt = 149,
}) {
  const bm = variant === "bookmark";
  const duration = bm ? GIFT_DURATION : DURATION;
  // Keep the latest onClose without restarting the 5s timer on re-renders.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration]);

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
          {bm ? <Gift size={30} strokeWidth={2.2} /> : <BadgePercent size={30} strokeWidth={2.2} />}
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} className="wcp-conf" style={{ "--i": i }} />
          ))}
        </div>
        {bm ? (
          <>
            <p className="wcp-k">2 gifts unlocked for you!</p>
            <h2 id="wcp-h" className="wcp-h">
              Free delivery <span className="wcp-plus">+</span> free bookmarks
            </h2>
            <div className="wcg-row">
              <div className="wcg-tile del on">
                <span className="wcg-ic">
                  <Truck size={22} strokeWidth={2.2} className="wcg-truck" />
                </span>
                <b>FREE delivery</b>
                <span className="wcg-st ok">
                  <Check size={12} strokeWidth={3.2} /> Unlocked
                </span>
                <small>On orders from ₹{freeAt}</small>
              </div>
              <div className="wcg-tile bm on">
                <span className="wcg-ic">
                  <Bookmark size={22} strokeWidth={2.2} className="wcg-bmk" />
                </span>
                <b>
                  {freeBookmarks} FREE bookmark{freeBookmarks > 1 ? "s" : ""}
                </b>
                <span className="wcg-st ok">
                  <Check size={12} strokeWidth={3.2} /> Yours to claim
                </span>
                <small>Collectible, ships with your books</small>
              </div>
            </div>
            <button type="button" className="bg-paybar-btn wcp-btn" onClick={onApply}>
              Claim my free gifts
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
        <span className="wcp-bar" style={{ "--d": `${duration}ms` }} aria-hidden="true" />
      </div>
    </div>,
    document.body,
  );
}
