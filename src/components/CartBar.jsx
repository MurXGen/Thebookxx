"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { CART_OFFERS } from "@/utils/cartOffers";
import { Gift, Sparkles } from "lucide-react";
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

  /* 🔄 Offer in progress (UI only) */
  const progressOffer = CART_OFFERS.find(
    (o) => discountedAmount >= o.min && discountedAmount < o.target,
  );

  /* 🎉 Offer actually applied */
  const appliedOffer =
    [...CART_OFFERS].reverse().find((o) => discountedAmount >= o.target) ||
    null;

  /* 💸 Discount ONLY when target crossed */
  let offerDiscount = 0;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscount = appliedOffer.value;
    }

    if (appliedOffer.type === "percentage") {
      offerDiscount = Math.round((discountedAmount * appliedOffer.value) / 100);
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
          ) : (
            <>
              <Sparkles className="sparkle-animate" size={16} />
              <span>🎉 Offer unlocked! You’re saving ₹{offerDiscount}</span>
            </>
          )}
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
        <div className="flex flex-row gap-12 items-center width100 justify-between">
          <span className="font-14"> Total amount :</span>
          <div className="cart-price flex flex-row gap-4 items-center">
            {appliedOffer && (
              <span className="original strike">₹{discountedAmount}</span>
            )}
            <span className="final weight-600">₹{finalPayable}</span>
          </div>
        </div>

        <button className="pri-big-btn" onClick={() => router.push("/bag")}>
          Checkout
        </button>
      </div>
    </div>
  );
}
