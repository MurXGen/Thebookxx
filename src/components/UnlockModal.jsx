"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { X, Sparkles, Gift, Clock } from "lucide-react";
import Image from "next/image";
import {
  startUnlockTimer,
  getRemainingOfferTime,
  expireTimer,
  getOneRupeeOfferData,
} from "@/utils/book";
import confetti from "canvas-confetti";
import { useStore } from "@/context/StoreContext";

// Lazy load CountdownTimer for better performance
const CountdownTimer = lazy(() => import("@/components/UI/CountDownTimer"));

export default function UnlockModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasModalBeenOpened, setHasModalBeenOpened] = useState(false);
  const modalRef = useRef(null);
  const { refreshUnlockStatus } = useStore();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    // Only auto-show if not controlled externally
    if (externalIsOpen !== undefined) return;

    const checkAndShowModal = () => {
      const offerData = getOneRupeeOfferData();

      // Don't show modal if already permanently unlocked
      if (offerData?.permanentUnlocked) return;

      // Don't show modal if timer was ever started (even if expired)
      if (offerData?.timerUnlocked) return;

      // Don't show modal if it has been opened before in this session
      if (hasModalBeenOpened) return;

      // Also check if user has previously closed the modal in this session
      const modalClosed = sessionStorage.getItem("unlock_modal_closed");
      if (modalClosed === "true") return;

      setInternalIsOpen(true);
      setHasModalBeenOpened(true);
    };

    const timer = setTimeout(checkAndShowModal, 7000);
    return () => clearTimeout(timer);
  }, [hasModalBeenOpened, externalIsOpen]);

  const handleUnlock = () => {
    setIsUnlocking(true);

    startUnlockTimer();
    refreshUnlockStatus();

    // Get modal position for confetti
    const modalElement = document.querySelector(".unlock-modal-content");
    const rect = modalElement?.getBoundingClientRect();
    const centerX = rect
      ? (rect.left + rect.width / 2) / window.innerWidth
      : 0.5;
    const topY = rect ? rect.top / window.innerHeight : 0.3;

    // Celebrate with confetti - ABOVE the modal
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: topY - 0.1, x: centerX },
      startVelocity: 15,
      colors: ["#ffb703", "#fb8500", "#22c55e", "#ffffff"],
      gravity: 0.8,
      decay: 0.9,
      ticks: 200,
    });

    // Second burst with slow falling effect
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: topY - 0.05, x: centerX - 0.15 },
        startVelocity: 12,
        colors: ["#ffb703", "#22c55e"],
        gravity: 0.6,
        decay: 0.95,
        ticks: 250,
      });
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: topY - 0.05, x: centerX + 0.15 },
        startVelocity: 12,
        colors: ["#fb8500", "#22c55e"],
        gravity: 0.6,
        decay: 0.95,
        ticks: 250,
      });
    }, 200);

    // Third burst for extra celebration
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: topY - 0.15, x: centerX },
        startVelocity: 20,
        colors: ["#ffb703", "#fb8500", "#22c55e"],
        gravity: 0.5,
        decay: 0.92,
        ticks: 300,
      });
    }, 400);

    setTimeout(() => {
      setIsUnlocking(false);
      setShowTimer(true);
      setTimeLeft(getRemainingOfferTime());
    }, 800);
  };

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    // Mark modal as closed in session storage so it doesn't appear again
    sessionStorage.setItem("unlock_modal_closed", "true");
  };

  const handleExplore = () => {
    handleClose();
    // Smooth scroll to books section
    const booksSection = document.querySelector(".catalogue-section");
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTimerExpire = () => {
    expireTimer();
    setShowTimer(false);
    handleClose();
    refreshUnlockStatus();
  };

  // Handle click outside - closes modal
  const handleOverlayClick = () => {
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="unlock-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          {/* Slide from bottom modal */}
          <motion.div
            ref={modalRef}
            className="unlock-modal-content"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.5,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="unlock-modal-close" onClick={handleClose}>
              <X size={18} />
            </button>

            {/* Animated icon */}
            <motion.div
              className="unlock-modal-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Gift size={48} className="unlock-gift-icon" />
              </motion.div>
            </motion.div>

            {/* Title with fade in */}
            <motion.h2
              className="unlock-modal-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {!showTimer
                ? "🎉 Unlock @1 books with no order limits"
                : "✨ ₹1 Books Activated!"}
            </motion.h2>

            {/* Description with fade in */}
            <motion.p
              className="unlock-modal-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {!showTimer
                ? "Grab any ₹1 book for the next few minutes! This exclusive offer won't last long — start exploring now!"
                : "You've successfully unlocked ₹1 books! Add them to your cart within the next 10 minutes. Happy reading! 📚"}
            </motion.p>

            {/* SVG Image with lazy loading */}
            {!showTimer && (
              <motion.div
                className="unlock-svg-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                {!imageLoaded && (
                  <div className="unlock-svg-placeholder">
                    <div className="loading-spinner-small"></div>
                  </div>
                )}

                <Image
                  src="/unlock-offer.jpeg"
                  alt="Unlock Offer"
                  width={180}
                  height={180}
                  className={`unlock-svg ${imageLoaded ? "loaded" : "hidden"}`}
                  onLoadingComplete={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </motion.div>
            )}

            {/* Button section with animation */}
            <motion.div
              className="unlock-button-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              {!showTimer ? (
                <motion.button
                  className="unlock-btn"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isUnlocking ? (
                    <motion.span
                      className="unlock-loading"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      Unlocking...
                    </motion.span>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Unlock ₹1 Books
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ✨
                      </motion.span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  className="unlock-timer-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense
                    fallback={
                      <div className="timer-loading">
                        <div className="loading-spinner-small"></div>
                      </div>
                    }
                  >
                    <CountdownTimer />
                  </Suspense>

                  <motion.button
                    className="pri-big-btn"
                    onClick={handleExplore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Books
                    <Sparkles size={16} />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
