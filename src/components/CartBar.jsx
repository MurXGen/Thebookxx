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
import { useEffect, useState, useRef } from "react";
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";

export default function CartBar() {
  const { cart, cartTotal } = useStore();
  const router = useRouter();
  const [liveRemainingTime, setLiveRemainingTime] = useState(0);
  const prevCartTotalRef = useRef(cartTotal);
  const hasTrackedMilestonesRef = useRef({});

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

  // Get ₹1 book unlock status
  const offerData = getOneRupeeOfferData();

  // Check if user has permanently unlocked in localStorage
  const isPermanentlyUnlocked = offerData?.permanentUnlocked === true;

  // Check if timer is active (user clicked unlock button and timer not expired)
  const isTimerActive =
    offerData?.timerUnlocked === true &&
    !offerData?.timerExpired &&
    (Date.now() - (offerData?.unlockTime || 0)) / 1000 / 60 <= 10;

  // Check if ₹1 books should be visually enabled (based on cart total)
  const shouldBeEnabled = cartTotal >= 299;

  // Determine which UI to show
  let uiState = "locked"; // locked, timerActive, permanentUnlocked

  if (isPermanentlyUnlocked) {
    if (shouldBeEnabled) {
      uiState = "permanentUnlocked";
    } else {
      uiState = "locked"; // Show locked state even though permanently unlocked in storage
    }
  } else if (isTimerActive) {
    uiState = "timerActive";
  } else {
    uiState = "locked";
  }

  // Track cart value changes and milestones
  useEffect(() => {
    const prevTotal = prevCartTotalRef.current;

    // Track cart value update event
    if (prevTotal !== cartTotal) {
      trackFunnelEvent(EVENTS.CART_VALUE_UPDATED, {
        cart_total: cartTotal,
        previous_total: prevTotal,
        item_count: cart.length,
        has_one_rupee_book: cartBooks.some((b) => b.discountedPrice === 1),
        user_unlock_status: uiState,
      });
    }

    // Track milestone achievements
    const milestones = [151, 299, 400, 599, 799, 1000];
    for (const milestone of milestones) {
      if (
        prevTotal < milestone &&
        cartTotal >= milestone &&
        !hasTrackedMilestonesRef.current[milestone]
      ) {
        hasTrackedMilestonesRef.current[milestone] = true;
        trackFunnelEvent(EVENTS.CART_TOTAL_MILESTONE, {
          threshold: milestone,
          cart_total: cartTotal,
          milestone_type:
            milestone === 151
              ? "checkout_eligible"
              : milestone === 299
                ? "unlock_threshold"
                : milestone === 400
                  ? "free_delivery"
                  : milestone === 599
                    ? "handling_fee_discount"
                    : milestone === 799
                      ? "bulk_order_threshold"
                      : "high_value",
          user_unlock_status: uiState,
        });
      }
    }

    prevCartTotalRef.current = cartTotal;
  }, [cartTotal, cart.length, cartBooks, uiState]);

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

  // Track unlock progress view when in locked state
  useEffect(() => {
    if (uiState === "locked" && remainingForUnlock > 0) {
      trackFunnelEvent(EVENTS.UNLOCK_PROGRESS_VIEWED, {
        current_total: cartTotal,
        remaining_needed: remainingForUnlock,
        progress_percentage: Math.min((cartTotal / 299) * 100, 100),
        has_permanent_unlock_in_storage: isPermanentlyUnlocked,
      });
    }
  }, [uiState, cartTotal, remainingForUnlock, isPermanentlyUnlocked]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Track checkout button click
  const handleCheckoutClick = () => {
    trackFunnelEvent(EVENTS.CHECKOUT_BUTTON_CLICKED, {
      cart_total: cartTotal,
      item_count: cart.length,
      has_one_rupee_book: cartBooks.some((b) => b.discountedPrice === 1),
      user_unlock_status: uiState,
      has_applied_offer: !!appliedOffer,
      offer_discount: offerDiscount,
    });
    router.push("/bag");
  };

  // Track "Add Books" button click
  const handleAddBooksClick = () => {
    trackFunnelEvent("add_books_button_clicked", {
      cart_total: cartTotal,
      remaining_needed: remainingForUnlock,
      source: "cart_bar",
    });
    const booksSection = document.querySelector(".catalogue-section");
    booksSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="cart-bar" style={{ maxWidth: "980px", margin: "0 auto" }}>
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
              onClick={handleCheckoutClick}
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
          {uiState === "timerActive" ? (
            // Timer Active State (unlocked but not permanent)
            <div className="mobile-offer-strip unlocked flex flex-row justify-between items-center">
              <div className="flex flex-row gap-4">
                <div className="rupee-offer-icon">
                  <Zap size={18} color="orange" />
                </div>
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
          ) : uiState === "permanentUnlocked" ? (
            // Permanently Unlocked State (cart total >= 299)
            <div className="mobile-offer-strip permanent">
              <div className="rupee-offer-content">
                Grab your <span className="highlight-reward">₹1 Books</span>{" "}
                right away
              </div>
            </div>
          ) : remainingForUnlock > 0 ? (
            // Locked State - Show unlock progress
            <div className="mobile-offer-strip locked flex flex-row justify-between">
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
                onClick={handleAddBooksClick}
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
