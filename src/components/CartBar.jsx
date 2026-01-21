"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { CART_OFFERS } from "@/utils/cartOffers";
import { Gift, Sparkles, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartBar() {
  const { cart } = useStore();
  const router = useRouter();

  if (!cart.length) return null;

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

  const originalAmount = cartBooks.reduce((s, b) => s + b.originalTotal, 0);
  const discountedAmount = cartBooks.reduce((s, b) => s + b.discountedTotal, 0);

  /* 🔄 Offer in progress */
  const progressOffer = CART_OFFERS.find(
    (o) => discountedAmount >= o.min && discountedAmount < o.target,
  );

  /* 🎉 Applied offer */
  const appliedOffer =
    [...CART_OFFERS].reverse().find((o) => discountedAmount >= o.target) ||
    null;

  /* 💸 Discount calculation */
  let offerDiscount = 0;
  let offerLabel = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscount = appliedOffer.value;
      offerLabel = `₹${appliedOffer.value} OFF availed`;
    }

    if (appliedOffer.type === "percentage") {
      offerDiscount = Math.round((discountedAmount * appliedOffer.value) / 100);
      offerLabel = `${appliedOffer.value}% discount availed`;
    }

    if (appliedOffer.type === "free_shipping") {
      offerLabel = "Free delivery availed";
    }
  }

  const finalPayable = discountedAmount - offerDiscount;

  const progressPercent = progressOffer
    ? Math.min((discountedAmount / progressOffer.target) * 100, 100)
    : 100;

  const remaining = progressOffer
    ? Math.max(progressOffer.target - discountedAmount, 0)
    : 0;

  return (
    <div className="cart-bar">
      {/* 🎁 OFFER STRIP */}
      <div className="cart-offer">
        <div className="offer-text">
          {progressOffer ? (
            <>
              {progressOffer.icon === "gift" ? (
                <Gift size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              <span>
                {progressOffer.message.replace("{remaining}", `₹${remaining}`)}
              </span>
            </>
          ) : appliedOffer ? (
            <>
              {appliedOffer.type === "free_shipping" ? (
                <Truck size={16} />
              ) : (
                <Sparkles className="sparkle-animate" size={16} />
              )}
              <span>{offerLabel}</span>
            </>
          ) : null}
        </div>

        <div className="offer-progress">
          <div
            className="offer-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 🛒 CART CTA */}
      <div className="cart-bar-main flex flex-row gap-12">
        <div className="flex flex-col width100 gap-4">
          <div className="flex flex-row justify-between items-center">
            <span className="font-14">Total amount</span>

            <div className="flex flex-col">
              <div className="cart-price flex flex-row gap-8 justify-end items-center">
                {appliedOffer && offerDiscount > 0 && (
                  <span className="original strike">₹{discountedAmount}</span>
                )}
                <span className="final weight-600">₹{finalPayable}</span>
              </div>
              {appliedOffer && (
                <span className="font-14 green weight-600">{offerLabel}</span>
              )}
            </div>
          </div>

          {/* ✅ Discount helper text */}
        </div>

        <button className="pri-big-btn" onClick={() => router.push("/bag")}>
          Checkout
        </button>
      </div>
    </div>
  );
}
