"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CartConfetti from "@/components/UI/Confetti";
import {
  getCartOffers,
  getBestUnlockedFlat,
  resolveAppliedOffer,
} from "@/utils/cartOffers";
import OfferTierList from "@/components/UI/OfferTierList";
import { showToast } from "@/context/ToastContext";
import { motion, animate, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book"; // needed to map id image
import Link from "next/link";
import { ArrowRight, Check, Lock, Gift, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CartOfferStrip({ discountedAmount }) {
  const { cart, appliedOfferValue, applyOffer } = useStore(); // FIX: real cart connection
  const pathname = usePathname();

  const isBagPage = pathname === "/bag";
  const isHomePage = pathname === "/";

  /* Merge cart with book data and check for ₹1 items */
  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const book = books.find((b) => b.id === item.id);
      return {
        ...item,
        image: book?.image,
        discountedPrice: book?.discountedPrice,
      };
    });
  }, [cart]);

  /* Check if cart has any ₹1 book */
  const hasOneRupeeItem = cartItems.some((item) => item.discountedPrice === 1);

  /* Get dynamic offers based on ₹1 item presence */
  const CART_OFFERS = getCartOffers(hasOneRupeeItem);

  /* Correct cart count */
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  /* Offer Logic */
  const progressOffer = CART_OFFERS.find(
    (o) => discountedAmount >= o.min && discountedAmount < o.target,
  );

  const appliedOffer =
    [...CART_OFFERS].reverse().find((o) => discountedAmount >= o.target) ||
    null;

  const remaining = progressOffer
    ? Math.max(progressOffer.target - discountedAmount, 0)
    : 0;

  const target = progressOffer?.target || discountedAmount;

  /* What the shopper has ALREADY unlocked (shown below the bar) */
  const freeDeliveryAvailed = hasOneRupeeItem
    ? discountedAmount >= 399
    : discountedAmount >= 151;
  const flatAvailed = [...CART_OFFERS]
    .reverse()
    .find((o) => o.type === "flat" && discountedAmount >= o.target);
  const availedChips = [];
  if (freeDeliveryAvailed) availedChips.push("Free delivery");
  if (flatAvailed) availedChips.push(flatAvailed.reward);

  /* Manual-apply rewards: best unlocked vs the one actually applied */
  const bestUnlocked = getBestUnlockedFlat(discountedAmount, hasOneRupeeItem);
  const appliedFlat = resolveAppliedOffer(
    discountedAmount,
    hasOneRupeeItem,
    appliedOfferValue,
  );
  const canApply =
    bestUnlocked && (!appliedFlat || bestUnlocked.value > appliedFlat.value);
  const freeShipDone = CART_OFFERS.some(
    (o) => o.type === "free_shipping" && discountedAmount >= o.target,
  );

  /* Smooth progress */
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percent = Math.min((discountedAmount / target) * 100, 100);

    const controls = animate(progress, percent, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: setProgress,
    });

    return () => controls.stop();
  }, [discountedAmount, target]);

  /* Confetti — fire ONLY when the shopper crosses into a NEW reward stage
     (free delivery or a bigger discount), not on every render or on mount. */
  const [showConfetti, setShowConfetti] = useState(false);
  const achievedTarget = appliedOffer?.target || 0;
  const lastAchievedRef = useRef(null); // null until initialised

  useEffect(() => {
    // First run → remember the current stage without celebrating.
    if (lastAchievedRef.current === null) {
      lastAchievedRef.current = achievedTarget;
      return;
    }
    if (achievedTarget > lastAchievedRef.current) {
      lastAchievedRef.current = achievedTarget;
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(t);
    }
    lastAchievedRef.current = achievedTarget;
  }, [achievedTarget]);

  /* Offer detail sheet */
  const [showOfferSheet, setShowOfferSheet] = useState(false);

  /* Message — always point to the NEXT target to drive AOV */
  const message = useMemo(() => {
    /* Everything unlocked (only at the very top of the ladder) */
    if (!progressOffer) {
      return (
        <>
          <span className="highlight-reward">
            {" "}
            You&apos;ve unlocked every offer!
          </span>
        </>
      );
    }

    const parts = progressOffer.message.split("{remaining}");
    const rewardText = progressOffer.reward || "";
    const tail = parts[1] ? parts[1].replace(rewardText, "") : "";

    return (
      <>
        {parts[0]}
        <span className="highlight-amount">{remaining}</span>
        {tail}
        {rewardText && <span className="highlight-reward">{rewardText}</span>}
      </>
    );
  }, [progressOffer, remaining]);

  /* Get the target message for the CTA based on ₹1 items */
  const getCTAMessage = () => {
    if (hasOneRupeeItem) {
      return "Add more to unlock offers ";
    }
    return "Continue shopping ";
  };

  /* Get the correct link based on cart state */
  const getCTALink = () => {
    if (hasOneRupeeItem && discountedAmount < 151) {
      return "/books"; // Send to books page to add more
    }
    return "/"; // Send to home page
  };

  /* Preview cards */
  const previewItems = cartItems.slice(0, 3);

  /* Get the appropriate offer text for display */
  const getOfferDisplay = () => {
    if (hasOneRupeeItem && discountedAmount < 399) {
      return {
        title: "₹1 Books in Cart",
        subtitle: `Add ₹${399 - discountedAmount} more to unlock free delivery`,
        progressTarget: 399,
      };
    }
    return null;
  };

  const offerDisplay = getOfferDisplay();

  /* The card content stays identical whether wrapped in Link or div */
  // All hooks are above this line; now it's safe to bail out for an empty amount.
  if (discountedAmount === null || discountedAmount === undefined) return null;

  const stripContent = (
    <>
      {/* LEFT */}
      <div className="offer-left">
        <div className="offer-msg-row">
          <div className="offer-message">{message}</div>
          {/* Achieved reward replaces "See all offers"; tapping the strip
              opens the sheet, where flat rewards are applied by hand. */}
          {canApply ? (
            <span className="offer-see-all offer-see-done">
              <Check size={11} strokeWidth={3} /> Avail {bestUnlocked.reward}
            </span>
          ) : appliedFlat ? (
            <span className="offer-see-all offer-see-done">
              <Check size={11} strokeWidth={3} /> {appliedFlat.reward} applied
            </span>
          ) : freeShipDone ? (
            <span className="offer-see-all offer-see-done">
              <Check size={11} strokeWidth={3} /> Free delivery
            </span>
          ) : (
            <span className="offer-see-all">See all offers</span>
          )}
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />

          <motion.div
            className="progress-dot"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="offer-cart">
        <div className="cart-preview">
          {previewItems.map((item, i) => {
            if (i === 2 && cartItems.length > 3) {
              return (
                <div key="extra" className="cart-card extra">
                  +{cartItems.length - 2}
                </div>
              );
            }

            return (
              <div key={item.id} className="cart-card">
                <img src={item.image} alt="" />
              </div>
            );
          })}
        </div>
      </div>

      <CartConfetti trigger={showConfetti} />
    </>
  );

  return (
    <>
      <div
        className="offer-strip"
        role="button"
        tabIndex={0}
        onClick={() => setShowOfferSheet(true)}
        style={{ cursor: "pointer" }}
      >
        {stripContent}
      </div>

      {/* Offer detail sheet — all reward tiers with progress */}
      <AnimatePresence>
        {showOfferSheet && (
          <motion.div
            className="offer-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOfferSheet(false)}
          >
            <motion.div
              className="offer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="offer-sheet-head">
                <span className="offer-sheet-title">
                  <Gift size={16} /> Unlock more rewards
                </span>
                <button
                  type="button"
                  className="offer-sheet-x"
                  onClick={() => setShowOfferSheet(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="offer-sheet-sub">
                Your cart: <b>₹{discountedAmount}</b>
              </p>
              <OfferTierList
                offers={CART_OFFERS}
                amount={discountedAmount}
                hasOneRupee={hasOneRupeeItem}
              />
              <Link
                href="/books"
                className="pri-big-btn width100 offer-sheet-cta"
              >
                Add more books
                <ArrowRight size={17} strokeWidth={2.5} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
