"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { CART_OFFERS } from "@/utils/cartOffers";
import { useRouter } from "next/navigation";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import LoadingButton from "./UI/LoadingButton";
import SearchMain from "./UI/SearchMain";
import { motion, AnimatePresence } from "framer-motion";
import InstallPWA from "./InstallPWA";

export default function CartBar() {
  const { cart } = useStore();
  const router = useRouter();

  // ❌ Do NOT return null → we want search always visible
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

  return (
    <div className="cart-bar">
      {/* 🎁 OFFER STRIP */}
      <AnimatePresence>
        {hasCart && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CartOfferStrip discountedAmount={discountedAmount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛒 CART CTA */}
      <AnimatePresence>
        {hasCart && (
          <motion.div
            key="cart"
            className="cart-bar-main flex flex-row gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="flex flex-col width100 gap-4">
              <div className="flex flex-row justify-between items-center">
                <span className="font-14">Total amount</span>

                <div className="flex flex-col">
                  <div className="cart-price flex flex-row gap-8 justify-end items-center">
                    {appliedOffer && offerDiscount > 0 && (
                      <span className="original strike">
                        ₹{discountedAmount}
                      </span>
                    )}
                    <span className="final weight-600">₹{finalPayable}</span>
                  </div>

                  {appliedOffer && (
                    <span className="font-14 green weight-600">
                      {offerLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <LoadingButton
              className="pri-big-btn"
              onClick={() => router.push("/bag")}
            >
              Checkout
            </LoadingButton>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallPWA />
    </div>
  );
}
