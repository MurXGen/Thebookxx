"use client";

import { useStore } from "@/context/StoreContext";
import {
  books,
  getOneRupeeOfferData,
  getRemainingOfferTime,
} from "@/utils/book";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OneRupeeModal from "./OneRupeeModal";

/**
 * OneRupeeHero, celebratory home page section promoting ₹1 books.
 * Short height (~160px), animated background, opens OneRupeeModal on click.
 */
export default function OneRupeeHero() {
  const { cartTotal } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [liveRemainingTime, setLiveRemainingTime] = useState(0);

  // Count ₹1 books available
  const oneRupeeCount = useMemo(
    () =>
      books.filter((b) => b.discountedPrice === 1 && (b.stock || 0) > 0).length,
    [],
  );

  // Determine unlock state (same logic as CartBar)
  const offerData = getOneRupeeOfferData();
  const isPermanentlyUnlocked = offerData?.permanentUnlocked === true;
  const isTimerActive =
    offerData?.timerUnlocked === true &&
    !offerData?.timerExpired &&
    (Date.now() - (offerData?.unlockTime || 0)) / 1000 / 60 <= 10;
  const shouldBeEnabled = cartTotal >= 299;
  const remainingForUnlock = Math.max(0, 299 - cartTotal);

  let uiState = "locked";
  if (isPermanentlyUnlocked && shouldBeEnabled) uiState = "permanentUnlocked";
  else if (isTimerActive) uiState = "timerActive";

  // Live timer sync
  useEffect(() => {
    if (!isTimerActive) {
      setLiveRemainingTime(0);
      return;
    }
    const update = () => setLiveRemainingTime(getRemainingOfferTime());
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [isTimerActive]);

  // A couple of ₹1 book covers to "pop out" of the gift box
  const popCovers = useMemo(
    () =>
      books
        .filter((b) => b.discountedPrice === 1 && b.image)
        .slice(0, 2)
        .map((b) => b.image),
    [],
  );
  const srcOf = (c) => (typeof c === "string" ? c : c?.src);

  return (
    <>
      {/* Floating gift box (bottom-right). Shakes, pops ₹1 books, opens modal. */}
      <div className="gift-fab-wrap">
        {popCovers.map((c, idx) => (
          <motion.img
            key={idx}
            className="gift-pop"
            src={srcOf(c)}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, y: 8, scale: 0.5 }}
            animate={{
              y: [8, -34, -34],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.85],
              rotate: idx ? 16 : -16,
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 1.4,
              delay: idx * 0.55,
              ease: "easeOut",
            }}
            style={{ left: idx ? "auto" : "8px", right: idx ? "8px" : "auto" }}
          />
        ))}

        <button
          className="gift-fab"
          onClick={() => setShowModal(true)}
          aria-label="Open ₹1 book deals"
        >
          <motion.span
            className="gift-fab-icon"
            animate={{ rotate: [0, -10, 10, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.2 }}
          >
            <Gift size={28} />
          </motion.span>
          <span className="gift-fab-badge">₹1</span>
          <span className="gift-fab-pulse" aria-hidden="true" />
        </button>

        <span className="gift-fab-label">
          {uiState === "timerActive"
            ? `${Math.floor(liveRemainingTime / 60)}:${(liveRemainingTime % 60).toString().padStart(2, "0")} left`
            : `Books at ₹1`}
        </span>
      </div>

      {/* Modal */}
      <OneRupeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={uiState}
        remainingForUnlock={remainingForUnlock}
        liveRemainingTime={liveRemainingTime}
      />
    </>
  );
}
