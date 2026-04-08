"use client";

import { CART_OFFERS } from "@/utils/cartOffers";
import { Percent, Sparkles, Truck, Gift, Star, Flame } from "lucide-react";

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
  let highlightAmount = null;
  let highlightFeature = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerLabel = `₹${appliedOffer.value} OFF availed`;
      highlightAmount = `₹${appliedOffer.value}`;
      highlightFeature = "Flat Discount";
    }

    if (appliedOffer.type === "percentage") {
      offerLabel = `${appliedOffer.value}% discount availed`;
      highlightAmount = `${appliedOffer.value}%`;
      highlightFeature = "Percentage Discount";
    }

    if (appliedOffer.type === "free_shipping") {
      offerLabel = "Free delivery availed";
      highlightFeature = "Free Shipping";
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
            <span className="progress-offer-message">
              {progressOffer.message.split("{remaining}")[0]}
              <strong className="highlight-amount">{remaining}</strong>
              {progressOffer.message.split("{remaining}")[1]}
            </span>
          ) : appliedOffer ? (
            <>
              {appliedOffer.type === "free_shipping" ? (
                <Truck size={16} className="highlight-icon" />
              ) : (
                <Sparkles
                  className="sparkle-animate highlight-icon"
                  size={16}
                />
              )}
              <span className="applied-offer-message">
                <span className="highlight-feature">{highlightFeature}</span>
                {highlightAmount && (
                  <>
                    <strong className="highlight-amount">
                      {highlightAmount}
                    </strong>
                  </>
                )}
                {" " +
                  offerLabel
                    ?.replace(highlightAmount || "", "")
                    .replace(highlightFeature || "", "")}
              </span>
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
