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
 * OneRupeeHero — celebratory home page section promoting ₹1 books.
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

  // Confetti dots — generated once
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
      <section className="onerupee-hero">
        {/* Animated gradient background */}
        <div className="onerupee-hero-bg" aria-hidden="true" />

        {/* Floating confetti dots */}
        <div className="onerupee-hero-confetti" aria-hidden="true">
          {confettiDots.map((dot) => (
            <motion.span
              key={dot.id}
              className="onerupee-hero-dot"
              style={{
                left: `${dot.left}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                background: dot.color,
              }}
              initial={{ y: -10, opacity: 0 }}
              animate={{
                y: ["0%", "200%"],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: dot.duration,
                delay: dot.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Content row */}
        <div className="onerupee-hero-content">
          {/* Bouncing coin badge */}
          <motion.div
            className="onerupee-hero-coin"
            animate={{
              y: [0, -6, 0],
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="onerupee-hero-coin-rupee">₹</span>
            <span className="onerupee-hero-coin-num">1</span>
          </motion.div>

          {/* Headline + sub */}
          <div className="onerupee-hero-text">
            <motion.div
              className="onerupee-hero-badge"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles size={12} />
              <span>Hot deal</span>
            </motion.div>
            <h2 className="onerupee-hero-title">
              Books for just <span className="onerupee-hero-emoji">₹1</span>{" "}
              each
            </h2>
            <p className="onerupee-hero-subtitle">
              {uiState === "permanentUnlocked"
                ? `Unlocked — ${oneRupeeCount} books waiting for you`
                : uiState === "timerActive"
                  ? `Hurry! ${Math.floor(liveRemainingTime / 60)}:${(liveRemainingTime % 60).toString().padStart(2, "0")} left to claim`
                  : ``}
            </p>
          </div>

          {/* CTA */}
          <motion.button
            className="onerupee-hero-cta"
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            aria-label="View ₹1 book deals"
          >
            <span>Claim now</span>
            <ArrowRight size={16} />
          </motion.button>
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
