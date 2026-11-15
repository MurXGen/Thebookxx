"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Check } from "lucide-react";
import { showToast } from "@/context/ToastContext";

export const BAG_ADDONS_KEY = "tbx_bag_addons";
export const MAX_BAG_BOOKMARKS = 10; // free up to the order tier, then ₹9 each (checkout trims to 1 on Cash on Delivery)
export const BAG_BOOKMARK_UNIT = 9;

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
            {bookmarks > freeBookmarks ? (
              <>
                {freeBookmarks} free + {bookmarks - freeBookmarks} × ₹{BAG_BOOKMARK_UNIT} ={" "}
                <b className="bga-bm-paid">₹{(bookmarks - freeBookmarks) * BAG_BOOKMARK_UNIT}</b>
              </>
            ) : bookmarks > 0 ? (
              <>
                <Check size={11} strokeWidth={3} /> {bookmarks} added · free
                {bookmarks === freeBookmarks ? ` · more ₹${BAG_BOOKMARK_UNIT} each` : ""}
              </>
            ) : (
              `${freeBookmarks} free · then ₹${BAG_BOOKMARK_UNIT} each`
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

      {/* Delivery: Standard is the default, so only Faster is offered as an opt-in */}
      <button
        type="button"
        role="checkbox"
        aria-checked={faster}
        className={`bga-fast${faster ? " on" : ""}`}
        onClick={() => {
          buzz(10);
          onFaster(!faster);
        }}
      >
        <span className="bga-fast-ic" aria-hidden="true">
          <Zap size={18} />
        </span>
        <span className="bga-fast-txt">
          <b>Faster delivery</b>
          <small>Arrives in {fasterEta} · +₹{fasterExtra}</small>
        </span>
        <span className="bga-check" aria-hidden="true">
          {faster && <Check size={13} strokeWidth={3.5} />}
        </span>
      </button>
    </div>
  );
}
