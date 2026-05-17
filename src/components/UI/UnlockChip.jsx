// components/UnlockChip.jsx
"use client";

import { useState, useEffect } from "react";
import { Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRemainingOfferTime, getOneRupeeOfferData } from "@/utils/book";
import UnlockModal from "@/components/UnlockModal";

export default function UnlockChip() {
  const [showModal, setShowModal] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPermanentlyUnlocked, setIsPermanentlyUnlocked] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const offerData = getOneRupeeOfferData();
      const remaining = getRemainingOfferTime();

      setIsPermanentlyUnlocked(offerData?.permanentUnlocked || false);
      setIsTimerActive(
        offerData?.timerUnlocked && !offerData?.timerExpired && remaining > 0,
      );
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Don't show if permanently unlocked
  if (isPermanentlyUnlocked) return null;

  // Don't show if timer is active (show nothing)
  if (isTimerActive) return null;

  return (
    <>
      <motion.button
        className="mobile-offer-strip width100"
        onClick={() => setShowModal(true)}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Lock size={16} />
        <span>Unlock ₹1 Books</span>
        <span className="unlock-chip-badge">Limited Time</span>
      </motion.button>

      <UnlockModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
