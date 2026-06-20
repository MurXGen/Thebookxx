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
import UnlockChip from "./UI/UnlockChip";
import OneRupeeModal from "./OneRupeeModal";

export default function CartBar() {
  const { cart, cartTotal } = useStore();
  const router = useRouter();
  const [liveRemainingTime, setLiveRemainingTime] = useState(0);
  const [showOneRupeeModal, setShowOneRupeeModal] = useState(false);
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

  const hasNeverUnlocked =
    !offerData?.timerUnlocked && !offerData?.permanentUnlocked;

  const isPermanentlyUnlocked = offerData?.permanentUnlocked === true;

  const isTimerActive =
    offerData?.timerUnlocked === true &&
    !offerData?.timerExpired &&
    (Date.now() - (offerData?.unlockTime || 0)) / 1000 / 60 <= 10;

  const isTimerExpired =
    offerData?.timerUnlocked === true && offerData?.timerExpired === true;

  const shouldBeEnabled = cartTotal >= 299;

  let uiState = "locked";

  if (isPermanentlyUnlocked) {
    if (shouldBeEnabled) {
      uiState = "permanentUnlocked";
    } else {
      uiState = "locked";
    }
  } else if (isTimerActive) {
    uiState = "timerActive";
  } else if (isTimerExpired) {
    uiState = "locked";
  } else {
    uiState = "locked";
  }

  // Track cart value changes and milestones
  useEffect(() => {
    const prevTotal = prevCartTotalRef.current;

    if (prevTotal !== cartTotal) {
      trackFunnelEvent(EVENTS.CART_VALUE_UPDATED, {
        cart_total: cartTotal,
        previous_total: prevTotal,
        item_count: cart.length,
        has_one_rupee_book: cartBooks.some((b) => b.discountedPrice === 1),
        user_unlock_status: uiState,
      });
    }

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
    if (uiState === "locked" && remainingForUnlock > 0 && !hasNeverUnlocked) {
      trackFunnelEvent(EVENTS.UNLOCK_PROGRESS_VIEWED, {
        current_total: cartTotal,
        remaining_needed: remainingForUnlock,
        progress_percentage: Math.min((cartTotal / 299) * 100, 100),
        has_permanent_unlock_in_storage: isPermanentlyUnlocked,
      });
    }
  }, [
    uiState,
    cartTotal,
    remainingForUnlock,
    isPermanentlyUnlocked,
    hasNeverUnlocked,
  ]);

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

  // Fallback handler (used inside locked modal CTA, scrolls to catalogue)
  const handleAddBooksClick = () => {
    trackFunnelEvent("add_books_button_clicked", {
      cart_total: cartTotal,
      remaining_needed: remainingForUnlock,
      source: "cart_bar",
    });
    const booksSection = document.querySelector(".catalogue-section");
    booksSection?.scrollIntoView({ behavior: "smooth" });
  };

  // Open the ₹1 modal, replaces the previous scroll-to-catalogue behavior
  const handleOpenOneRupeeModal = () => {
    trackFunnelEvent("one_rupee_modal_opened", {
      cart_total: cartTotal,
      remaining_needed: remainingForUnlock,
      user_unlock_status: uiState,
      source: "cart_bar",
    });
    setShowOneRupeeModal(true);
  };

  const shouldShowUnlockMessage = !hasNeverUnlocked;

  return (
    <div className="cart-bar" style={{ maxWidth: "1700px", margin: "0 auto" }}>
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

      {/* <UnlockChip /> */}

      {/* ₹1 Books Modal */}
      <OneRupeeModal
        isOpen={showOneRupeeModal}
        onClose={() => setShowOneRupeeModal(false)}
        mode={uiState}
        remainingForUnlock={remainingForUnlock}
        liveRemainingTime={liveRemainingTime}
        onAddBooksClick={handleAddBooksClick}
      />
    </div>
  );
}
