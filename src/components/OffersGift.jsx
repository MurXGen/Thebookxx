"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGift, FiX } from "react-icons/fi";
import { offers } from "@/utils/offers";
import confetti from "canvas-confetti";

export default function OffersGift() {
  const [open, setOpen] = useState(false);
  const CONFETTI_KEY = "confetti_last_fired";
  const ONE_HOUR = 60 * 60 * 1000;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  const fireConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.9 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 20,
        spread: 120,
        origin: { y: 0.9 },
      });
    }, 150);
  };

  const handleGiftClick = () => {
    const lastFired = localStorage.getItem(CONFETTI_KEY);
    const now = Date.now();

    if (!lastFired || now - Number(lastFired) > ONE_HOUR) {
      fireConfetti();
      localStorage.setItem(CONFETTI_KEY, now);
    }

    setOpen(true);
  };

  return (
    <>
      {/* 🎁 Gift Button */}
      <button className="gift-fab" onClick={handleGiftClick}>
        <FiGift size={22} />
        <span className="gift-pulse" />
      </button>

      {/* 🌫️ Overlay + Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background blur */}
            <motion.div
              className="offers-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="offers-modal"
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            >
              {/* Header */}
              {/* <div className="offers-header">
                <span className="font-16 weight-600">Available Offers</span>
                <button onClick={() => setOpen(false)}>
                  <FiX size={18} />
                </button>
              </div> */}

              {/* Offers */}
              <div className="offers-list">
                {offers.map((offer, i) => {
                  const Icon = offer.icon;
                  return (
                    <motion.div
                      key={offer.id}
                      className="offer-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                    >
                      <div className="offer-icon">
                        <Icon size={20} />
                      </div>

                      <div className="offer-content">
                        <span className="font-14 weight-600">
                          {offer.title}
                        </span>
                        <span className="font-12 dark-50">
                          {offer.description}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
