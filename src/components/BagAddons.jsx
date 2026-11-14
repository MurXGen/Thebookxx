"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Truck, Zap, Check } from "lucide-react";
import { showToast } from "@/context/ToastContext";

export const BAG_ADDONS_KEY = "tbx_bag_addons";
export const MAX_BAG_BOOKMARKS = 2; // checkout trims to 1 on Cash on Delivery

const buzz = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {}
};

// Ribbon bookmark with a notched tail and a little tassel — drawn, not an icon font.
function BookmarkArt({ count }) {
  return (
    <span className="bga-bm-art" aria-hidden="true">
      <svg viewBox="0 0 36 44" width="30" height="37">
        <defs>
          <linearGradient id="bgaBm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb547" />
            <stop offset="1" stopColor="#f07a00" />
          </linearGradient>
        </defs>
        <path d="M6 2h20a3 3 0 0 1 3 3v35l-13-8-13 8V5a3 3 0 0 1 3-3z" fill="url(#bgaBm)" />
        <path d="M9 7h14" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 12h9" stroke="#fff" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 9c3.5 1.2 4.5 4 4 8" stroke="#c2410c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="33" cy="18.5" r="2" fill="#c2410c" />
      </svg>
      <AnimatePresence>
        {count > 0 && (
          <motion.b
            key={count}
            className="bga-bm-count"
            initial={{ scale: 0.3, y: 4, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 18 }}
          >
            {count}
          </motion.b>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * Add-ons chosen right in the bag (Swiggy-style, inside the items card):
 * free bookmarks and Standard / Faster delivery. The checkout opens with the
 * same choices.
 */
export default function BagAddons({
  bookmarks,
  onBookmarks,
  freeBookmarks = 2,
  faster,
  onFaster,
  standardFee = 0,
  fasterFee = 0,
  standardEta = "4–9 days",
  fasterEta = "1–6 days",
}) {
  const fasterExtra = Math.max(0, fasterFee - standardFee);
  const inc = () => {
    if (bookmarks >= MAX_BAG_BOOKMARKS) {
      showToast(`Up to ${MAX_BAG_BOOKMARKS} bookmarks per order`, "info");
      return;
    }
    buzz(10);
    onBookmarks(bookmarks + 1);
  };
  const dec = () => {
    if (bookmarks <= 0) return;
    buzz(6);
    onBookmarks(bookmarks - 1);
  };

  return (
    <div className="bga" aria-label="Add-ons for this order">
      <span className="bga-head">Add-ons for this order</span>

      <div className={`bga-row bga-bm${bookmarks > 0 ? " on" : ""}`}>
        <BookmarkArt count={bookmarks} />
        <span className="bga-txt">
          <b>Bookmarks</b>
          <small>
            {bookmarks > 0 ? (
              <>
                <Check size={11} strokeWidth={3} /> {bookmarks} added · free
              </>
            ) : (
              `Up to ${Math.min(freeBookmarks, MAX_BAG_BOOKMARKS)} free · tap +`
            )}
          </small>
        </span>
        <span className="bga-stepper" role="group" aria-label="Bookmarks">
          <button type="button" onClick={dec} disabled={bookmarks <= 0} aria-label="Remove a bookmark">
            −
          </button>
          <motion.span
            key={bookmarks}
            className="bga-step-n"
            initial={{ scale: 1.6, color: "#fb8500" }}
            animate={{ scale: 1, color: "#1c1814" }}
            transition={{ type: "spring", stiffness: 500, damping: 16 }}
            aria-live="polite"
          >
            {bookmarks}
          </motion.span>
          <button
            type="button"
            onClick={inc}
            aria-disabled={bookmarks >= MAX_BAG_BOOKMARKS}
            aria-label="Add a bookmark"
          >
            +
          </button>
        </span>
      </div>

      <div className="bga-deliv" role="radiogroup" aria-label="Delivery speed">
        <button
          type="button"
          role="radio"
          aria-checked={!faster}
          className={`bga-opt${!faster ? " on" : ""}`}
          onClick={() => onFaster(false)}
        >
          <span className="bga-opt-top">
            <Truck size={15} /> Standard
            <em>{standardFee > 0 ? `₹${standardFee}` : "FREE"}</em>
          </span>
          <small>Arrives in {standardEta}</small>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={faster}
          className={`bga-opt bga-opt-fast${faster ? " on" : ""}`}
          onClick={() => {
            buzz(10);
            onFaster(true);
          }}
        >
          <span className="bga-opt-top">
            <Zap size={15} /> Faster
            <em>+₹{fasterExtra}</em>
          </span>
          <small>Arrives in {fasterEta} · by air</small>
        </button>
      </div>
      {faster && <p className="bga-note">Faster ships with online or two-part payment.</p>}
    </div>
  );
}
