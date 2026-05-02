"use client";

import { useEffect, useMemo, useState } from "react";
import { CART_OFFERS } from "@/utils/cartOffers";
import { motion, animate } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book"; // 👈 needed to map id → image
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CartOfferStrip({ discountedAmount }) {
  const { cart } = useStore(); // ✅ FIX: real cart connection
  const pathname = usePathname();

  const isBagPage = pathname === "/bag";

  if (discountedAmount === null || discountedAmount === undefined) return null;

  /* 🛒 Merge cart with book data */
  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const book = books.find((b) => b.id === item.id);
      return {
        ...item,
        image: book?.image,
      };
    });
  }, [cart]);

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

  /* 🧠 Message */
  const message = useMemo(() => {
    /* 🎉 Applied offer (final state) */
    if (!progressOffer && appliedOffer) {
      if (appliedOffer.type === "free_shipping") {
        return (
          <>
            <span className="success-text">Free Delivery</span> availed 🎉
          </>
        );
      }

      if (appliedOffer.type === "flat") {
        return (
          <>
            <span className="success-text">₹{appliedOffer.value} OFF</span>{" "}
            availed 🎉
          </>
        );
      }

      if (appliedOffer.type === "percentage") {
        return (
          <>
            <span className="success-text">{appliedOffer.value}% OFF</span>{" "}
            availed 🎉
          </>
        );
      }
    }

    /* 🚀 Progress state (USE CONFIG MESSAGE) */
    if (!progressOffer) return "";

    const parts = progressOffer.message.split("{remaining}");

    /* Extract reward (upto ₹250 OFF etc.) */
    const rewardMatch = progressOffer.message.match(/₹\d+ OFF|free delivery/i);

    const rewardText = rewardMatch ? rewardMatch[0] : "";

    return (
      <>
        {parts[0]}
        <span className="highlight-amount">₹{remaining}</span>
        {parts[1].replace(rewardText, "")}

        {rewardText && <span className="highlight-reward">{rewardText}</span>}
      </>
    );
  }, [progressOffer, appliedOffer, remaining]);

  /* 🖼️ Preview cards */
  const previewItems = cartItems.slice(0, 3);

  return (
    <div className="offer-strip">
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
        {!isBagPage && (
          <Link
            href="/bag"
            className="cart-cta flex flex-row gap-4 items-center"
          >
            <ArrowRight size={24} />
          </Link>
        )}
      </div>

      {showConfetti && <div className="confetti" />}
    </div>
  );
}
