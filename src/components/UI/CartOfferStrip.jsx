"use client";

import { useEffect, useMemo, useState } from "react";
import { getCartOffers } from "@/utils/cartOffers";
import { motion, animate } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book"; // 👈 needed to map id → image
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CartOfferStrip({ discountedAmount }) {
  const { cart } = useStore(); // ✅ FIX: real cart connection
  const pathname = usePathname();

  const isBagPage = pathname === "/bag";
  const isHomePage = pathname === "/";

  if (discountedAmount === null || discountedAmount === undefined) return null;

  /* 🛒 Merge cart with book data and check for ₹1 items */
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

  /* ✅ Check if cart has any ₹1 book */
  const hasOneRupeeItem = cartItems.some((item) => item.discountedPrice === 1);

  /* ✅ Get dynamic offers based on ₹1 item presence */
  const CART_OFFERS = getCartOffers(hasOneRupeeItem);

  /* ✅ Correct cart count */
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  /* 🎯 Offer Logic */
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

  /* ✅ What the shopper has ALREADY unlocked (shown below the bar) */
  const freeDeliveryAvailed = hasOneRupeeItem
    ? discountedAmount >= 399
    : discountedAmount >= 151;
  const flatAvailed = [...CART_OFFERS]
    .reverse()
    .find((o) => o.type === "flat" && discountedAmount >= o.target);
  const availedChips = [];
  if (freeDeliveryAvailed) availedChips.push("Free delivery");
  if (flatAvailed) availedChips.push(flatAvailed.reward);

  /* 🎬 Smooth progress */
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

  /* 🎉 Confetti */
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (appliedOffer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }, [appliedOffer]);

  /* 🧠 Message — always point to the NEXT target to drive AOV */
  const message = useMemo(() => {
    /* 🎉 Everything unlocked (only at the very top of the ladder) */
    if (!progressOffer) {
      return (
        <>
          <span className="highlight-reward">🎉 You've unlocked every offer!</span>
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
      return "Add more to unlock offers →";
    }
    return "Continue shopping →";
  };

  /* Get the correct link based on cart state */
  const getCTALink = () => {
    if (hasOneRupeeItem && discountedAmount < 151) {
      return "/books"; // Send to books page to add more
    }
    return "/"; // Send to home page
  };

  /* 🖼️ Preview cards */
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

  /* 🧱 The card content stays identical whether wrapped in Link or div */
  const stripContent = (
    <>
      {/* LEFT */}
      <div className="offer-left">
        <div className="offer-message">{message}</div>

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

        {availedChips.length > 0 && (
          <div className="offer-availed">
            {availedChips.map((chip, i) => (
              <span key={i} className="offer-availed-chip">
                <Check size={12} strokeWidth={3} /> {chip}
              </span>
            ))}
          </div>
        )}
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

      {showConfetti && <div className="confetti" />}
    </>
  );

  /* Wrap the whole strip in a Link when not already on home */
  if (isHomePage) {
    return <div className="offer-strip">{stripContent}</div>;
  }

  return (
    <Link
      href={getCTALink()}
      className="offer-strip"
      style={{ textDecoration: "none", display: "flex" }}
    >
      {stripContent}
    </Link>
  );
}
