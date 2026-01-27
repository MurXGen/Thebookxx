"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { CART_OFFERS } from "@/utils/cartOffers";
import { useRouter } from "next/navigation";
import CartOfferStrip from "@/components/UI/CartOfferStrip";

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

  const discountedAmount = cartBooks.reduce((s, b) => s + b.discountedTotal, 0);

  /* 🎉 Applied offer (needed for pricing only) */
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
      <CartOfferStrip discountedAmount={discountedAmount} />

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
        </div>

        <button className="pri-big-btn" onClick={() => router.push("/bag")}>
          Checkout
        </button>
      </div>
    </div>
  );
}
