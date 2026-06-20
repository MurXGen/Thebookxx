"use client";

import { useStore } from "@/context/StoreContext";
import {
  books,
  getOneRupeeOfferData,
  getRemainingOfferTime,
} from "@/utils/book";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
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

  // Confetti dots, generated once
  const confettiDots = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 3,
        color: ["#fb8500", "#ffb703", "#ef4444", "#fb8500"][i % 4],
      })),
    [],
  );

  return (
    <>
      <section className="onerupee-strip">
        {/* Content row, minimal, Stripe-style */}
        <div className="onerupee-strip-content">
          {/* ₹1 coin badge */}
          <div className="onerupee-strip-coin">
            <span className="onerupee-strip-coin-rupee">₹</span>
            <span className="onerupee-strip-coin-num">1</span>
          </div>

          {/* Headline + sub */}
          <div className="onerupee-strip-text">
            <h2 className="onerupee-strip-title">
              Books for just <span className="onerupee-strip-accent">₹1</span> each
            </h2>
            <p className="onerupee-strip-subtitle">
              {uiState === "permanentUnlocked"
                ? `Unlocked, ${oneRupeeCount} books waiting for you`
                : uiState === "timerActive"
                  ? `Hurry! ${Math.floor(liveRemainingTime / 60)}:${(liveRemainingTime % 60).toString().padStart(2, "0")} left to claim`
                  : `Grab bestsellers at just ₹1`}
            </p>
          </div>

          {/* CTA */}
          <button
            className="onerupee-strip-cta"
            onClick={() => setShowModal(true)}
            aria-label="View ₹1 book deals"
          >
            <span>Claim now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

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
