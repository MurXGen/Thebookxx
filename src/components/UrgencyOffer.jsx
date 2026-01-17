"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarsIcon } from "lucide-react";
import { FaMoneyBill } from "react-icons/fa";

const FIVE_MINUTES = 5 * 60 * 1000;

export default function UrgencyOffer() {
  const [phase, setPhase] = useState("delivery");
  const [timeLeft, setTimeLeft] = useState(FIVE_MINUTES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const startKey = `${phase}_start`;

    let startTime = localStorage.getItem(startKey);
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(startKey, startTime);
    }

    setIsReady(true);

    const interval = setInterval(() => {
      const elapsed = Date.now() - Number(startTime);
      const remaining = FIVE_MINUTES - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);

        const nextPhase = phase === "delivery" ? "discount" : "delivery";
        localStorage.setItem(`${nextPhase}_start`, Date.now());
        setPhase(nextPhase);
        setTimeLeft(FIVE_MINUTES);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <AnimatePresence mode="wait">
      <div className="section-1200">
        {!isReady ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="urgency-card skeleton"
          >
            <div className="skeleton-left">
              <div className="skeleton-icon shimmer" />
              <div className="skeleton-text">
                <div className="skeleton-line shimmer" />
                <div className="skeleton-line small shimmer" />
              </div>
            </div>
            <div className="skeleton-timer shimmer" />
          </motion.div>
        ) : (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="urgency-card grid-2 items-center"
          >
            {/* DELIVERY */}
            {phase === "delivery" && (
              <div className="flex flex-row items-center gap-12">
                <StarsIcon size={24} color="#ffb703" />
                <div className="flex flex-col gap-4">
                  <h4 className="urgency-title">Free Delivery Ending Soon</h4>
                  <span className="urgency-desc">
                    Free delivery ends soon | <strong>Order now</strong>
                  </span>
                </div>
              </div>
            )}

            {/* DISCOUNT */}
            {phase === "discount" && (
              <div className="flex flex-row items-center gap-12">
                <FaMoneyBill size={24} color="#ffb703" />
                <div className="flex flex-col">
                  <h4 className="urgency-title">Flat ₹100 OFF</h4>
                  <span className="urgency-desc">
                    Limited-time savings — <strong>Don’t miss out</strong>
                  </span>
                </div>
              </div>
            )}

            {/* TIMER */}
            <div className="sec-mid-btn urgency-timer">
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
