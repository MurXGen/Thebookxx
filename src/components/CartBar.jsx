"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { CART_OFFERS } from "@/utils/cartOffers";
import { useRouter } from "next/navigation";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import LoadingButton from "./UI/LoadingButton";
import { motion, AnimatePresence } from "framer-motion";
import InstallPWA from "./InstallPWA";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { ArrowRight, Zap, Clock, Gift, Lock, Sparkles } from "lucide-react";
import { getRemainingOfferTime, getOneRupeeOfferData } from "@/utils/book";
import { useEffect, useState } from "react";

export default function CartBar() {
  const { cart, cartTotal } = useStore();
  const router = useRouter();
  const [liveRemainingTime, setLiveRemainingTime] = useState(0);

  const hasCart = cart.length > 0;

  const cartBooks = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.id);
      if (!book) return null;

      return {
        ...book,
        qty: item.qty,
        originalTotal: book.originalPrice * item.qty,
        discountedTotal: book.discountedPrice * item.qty,
      };
    })
    .filter(Boolean);

  const discountedAmount = cartBooks.reduce((s, b) => s + b.discountedTotal, 0);

  const appliedOffer =
    [...CART_OFFERS].reverse().find((o) => discountedAmount >= o.target) ||
    null;

  let offerDiscount = 0;
  let offerLabel = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscount = appliedOffer.value;
      offerLabel = `₹${appliedOffer.value} OFF availed`;
    }

    if (appliedOffer.type === "percentage") {
      offerDiscount = Math.round((discountedAmount * appliedOffer.value) / 100);
      offerLabel = `Free shipping availed`;
    }
  }

  const finalPayable = discountedAmount - offerDiscount;

  // In CartBar.jsx, update the isUnlocked logic:
  const offerData = getOneRupeeOfferData();

  // Check if user has permanently unlocked
  const isPermanentlyUnlocked = offerData?.permanentUnlocked === true;

  // Check if timer is active (user clicked unlock button and timer not expired)
  const isTimerActive =
    offerData?.timerUnlocked === true &&
    !offerData?.timerExpired &&
    (Date.now() - (offerData?.unlockTime || 0)) / 1000 / 60 <= 10;

  // Only show unlocked UI if either permanently unlocked OR timer active
  const shouldShowUnlockedUI = isPermanentlyUnlocked || isTimerActive;

  // Real-time counter effect
  useEffect(() => {
    if (!isTimerActive) {
      setLiveRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getRemainingOfferTime();
      setLiveRemainingTime(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const remainingForUnlock = Math.max(0, 299 - cartTotal);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="cart-bar" style={{ maxWidth: "980px", margin: "0 auto" }}>
      {/* ₹1 Book Unlock Status Card */}

      {/* 🎁 OFFER STRIP */}
      <AnimatePresence mode="wait">
        {hasCart && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ margin: "16px 12px" }}
          >
            <CartOfferStrip discountedAmount={discountedAmount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛒 CART CTA */}
      <AnimatePresence mode="wait">
        {hasCart && (
          <motion.div
            key="cart"
            className="cart-bar-main flex flex-row gap-12"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="flex flex-col width100 gap-4">
              <div className="flex flex-row justify-between items-center">
                <span className="font-14">Total amount</span>

                <div className="flex flex-col">
                  <div className="cart-price flex flex-row gap-8 justify-end items-center">
                    {appliedOffer && offerDiscount > 0 && (
                      <motion.span
                        className="original strike"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                      >
                        ₹{discountedAmount}
                      </motion.span>
                    )}
                    <motion.span
                      className="final weight-600"
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      ₹{finalPayable}
                    </motion.span>
                  </div>

                  {appliedOffer && (
                    <motion.span
                      className="font-14 green weight-600"
                      initial={{ opacity: 0, y: -5, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {offerLabel}
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              className="pri-big-btn"
              onClick={() => router.push("/bag")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <span>Checkout</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key="mobile-offer-strip"
          initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {shouldShowUnlockedUI ? (
            // Only show unlocked UI when timer is active OR permanently unlocked
            offerData?.permanentUnlocked ? (
              // Permanently Unlocked State
              <div className="mobile-offer-strip permanent">
                <div className="rupee-offer-content">
                  <span className="rupee-offer-title">
                    Unlock ₹1 books by adding more than ₹2 books
                  </span>
                </div>
              </div>
            ) : (
              // Timer Active State (unlocked but not permanent)
              <div className="mobile-offer-strip unlocked flex flex-row justify-between items-center">
                <div className="flex flex-row gap-4">
                  {" "}
                  <div className="rupee-offer-icon">
                    <Zap size={18} color="orange" />
                  </div>{" "}
                  <div className="rupee-offer-content flex flex-row justify-between">
                    <span className="rupee-offer-desc">
                      Grab your ₹1 books before time runs out
                    </span>
                  </div>
                </div>

                {liveRemainingTime > 0 && (
                  <div className="sec-mid-btn" style={{ color: "white" }}>
                    <Clock size={12} />
                    <span>
                      {Math.floor(liveRemainingTime / 60)}:
                      {(liveRemainingTime % 60).toString().padStart(2, "0")}{" "}
                      remaining
                    </span>
                  </div>
                )}
              </div>
            )
          ) : remainingForUnlock > 0 ? (
            // Locked State - Show unlock progress (only when timer was never started)
            <div
              className="mobile-offer-strip locked flex flex-row justify-between"
              style={{ justifyContent: "none" }}
            >
              <div className="flex flex-row gap-4 items-center">
                <div className="rupee-offer-icon">
                  <Lock size={18} />
                </div>
                <div className="rupee-offer-content">
                  <span className="rupee-offer-desc">
                    Add ₹{remainingForUnlock} more to unlock special ₹1 book
                    deals
                  </span>
                </div>
              </div>
              <button
                className="sec-mid-btn"
                style={{ color: "white" }}
                onClick={() => {
                  const booksSection =
                    document.querySelector(".catalogue-section");
                  booksSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ₹{cartTotal} / ₹299
              </button>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
