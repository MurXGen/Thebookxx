"use client";

import { CART_OFFERS } from "@/utils/cartOffers";
import { Percent, Sparkles, Truck } from "lucide-react";

export default function CartOfferStrip({ discountedAmount }) {
  if (!discountedAmount) return null;

  /* 🔄 Offer in progress */
  const progressOffer = CART_OFFERS.find(
    (o) => discountedAmount >= o.min && discountedAmount < o.target,
  );

  /* 🎉 Applied offer */
  const appliedOffer =
    [...CART_OFFERS].reverse().find((o) => discountedAmount >= o.target) ||
    null;

  /* 💸 Discount label */
  let offerLabel = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerLabel = `₹${appliedOffer.value} OFF availed`;
    }

    if (appliedOffer.type === "percentage") {
      offerLabel = `${appliedOffer.value}% discount availed`;
    }

    if (appliedOffer.type === "free_shipping") {
      offerLabel = "Free delivery availed";
    }
  }

  const progressPercent = progressOffer
    ? Math.min((discountedAmount / progressOffer.target) * 100, 100)
    : 100;

  const remaining = progressOffer
    ? Math.max(progressOffer.target - discountedAmount, 0)
    : 0;

  return (
    <div className="cart-offer flex flex-row gap-12">
      <div className="greenbox">
        <Percent size={16} />
      </div>

      <div className="width100">
        <div className="offer-text">
          {progressOffer ? (
            <span>
              {progressOffer.message.replace("{remaining}", `₹${remaining}`)}
            </span>
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
    </div>
  );
}
