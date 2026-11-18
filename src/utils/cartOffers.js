// utils/cartOffers.js

// Free standard delivery (carts WITHOUT a ₹1 book) is from ₹249 by default.
// Claiming the bag's "Free delivery + free bookmarks" gift lowers it to ₹149
// for that browser session (sessionStorage flag set by the bag). ₹1-book carts
// keep their own ₹399 threshold.
export const FREE_DELIVERY_BASE_AT = 249;
export const FREE_DELIVERY_OFFER_AT = 149;
export const FREE_DELIVERY_AT = FREE_DELIVERY_BASE_AT; // default, for static copy
export const FREE_DELIVERY_AT_ONE_RUPEE = 399;
export const GIFTS_CLAIMED_KEY = "tbx_gifts_claimed";
export const freeDeliveryOfferOn = () => {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(GIFTS_CLAIMED_KEY) === "1";
  } catch {
    return false;
  }
};
// The threshold that applies right now (₹149 once the gift is claimed).
export const freeDeliveryAt = () =>
  freeDeliveryOfferOn() ? FREE_DELIVERY_OFFER_AT : FREE_DELIVERY_BASE_AT;
// Like the other cart offers, the ₹149 offer doesn't stack with a coupon:
// with a coupon applied, ₹149–₹248 orders pay the normal ₹69 again.
export const BELOW_FREE_FEE = 69;
export const couponDeliveryFee = (orderAmount = 0, hasOneRupeeItem = false) => {
  const amt = Number(orderAmount) || 0;
  if (hasOneRupeeItem || !freeDeliveryOfferOn()) return 0;
  return amt >= FREE_DELIVERY_OFFER_AT && amt < FREE_DELIVERY_BASE_AT ? BELOW_FREE_FEE : 0;
};

// Get base offers based on whether ₹1 items are present
export const getCartOffers = (hasOneRupeeItem = false) => {
  if (hasOneRupeeItem) {
    // ₹1 books present → first goal is reaching ₹499 to unlock free delivery,
    // then progressively bigger flat discounts. Bands are contiguous so the
    // strip always shows the NEXT target (never a dead-end "unlocked").
    return [
      {
        min: 0,
        target: 399,
        type: "free_shipping",
        reward: "Free delivery",
        message: "Add ₹{remaining} more to unlock Free delivery",
        icon: "gift",
      },
      {
        min: 399,
        target: 650,
        type: "flat",
        value: 100,
        reward: "₹100 OFF",
        message: "Add ₹{remaining} more & get flat ₹100 OFF",
        icon: "sparkle",
      },
      {
        min: 650,
        target: 1000,
        type: "flat",
        value: 250,
        reward: "₹250 OFF",
        message: "Add ₹{remaining} more & get ₹250 OFF",
        icon: "sparkle",
      },
      {
        min: 1000,
        target: 2000,
        type: "flat",
        value: 500,
        reward: "₹500 OFF",
        message: "Add ₹{remaining} more & get ₹500 OFF",
        icon: "sparkle",
      },
    ];
  } else {
    // No ₹1 books → orders below ₹149 carry a small ₹69 delivery fee; reaching
    // ₹149 unlocks FREE delivery, then the goals push toward flat discounts.
    return [
      {
        min: 0,
        target: freeDeliveryAt(),
        type: "free_shipping",
        reward: "FREE delivery",
        message: "Add ₹{remaining} more for FREE delivery",
        icon: "gift",
      },
      {
        min: freeDeliveryAt(),
        target: 450,
        type: "flat",
        value: 50,
        reward: "₹50 OFF",
        message: "Add ₹{remaining} more & get flat ₹50 OFF",
        icon: "sparkle",
      },
      {
        min: 450,
        target: 650,
        type: "flat",
        value: 100,
        reward: "₹100 OFF",
        message: "Add ₹{remaining} more & get flat ₹100 OFF",
        icon: "sparkle",
      },
      {
        min: 650,
        target: 1000,
        type: "flat",
        value: 250,
        reward: "₹250 OFF",
        message: "Add ₹{remaining} more & get ₹250 OFF",
        icon: "sparkle",
      },
      {
        min: 1000,
        target: 2000,
        type: "flat",
        value: 500,
        reward: "₹500 OFF",
        message: "Add ₹{remaining} more & get ₹500 OFF",
        icon: "sparkle",
      },
    ];
  }
};

// Dynamic delivery charge based on order value and ₹1 item presence

// ── Manual-apply cart rewards ──────────────────────────────────────────────
// Flat ₹-off rewards are UNLOCKED by cart value but only count once the shopper
// taps Apply. The applied reward is remembered by its value (e.g. 250) and
// stays valid only while the cart still qualifies for it.
export const getUnlockedFlatOffers = (amount = 0, hasOneRupeeItem = false) =>
  getCartOffers(hasOneRupeeItem).filter(
    (o) => o.type === "flat" && Number(amount) >= o.target,
  );
export const getBestUnlockedFlat = (amount = 0, hasOneRupeeItem = false) => {
  const list = getUnlockedFlatOffers(amount, hasOneRupeeItem);
  return list.length ? list[list.length - 1] : null;
};
export const resolveAppliedOffer = (
  amount = 0,
  hasOneRupeeItem = false,
  appliedValue = 0,
) => {
  if (!appliedValue) return null;
  return (
    getUnlockedFlatOffers(amount, hasOneRupeeItem).find(
      (o) => o.value === Number(appliedValue),
    ) || null
  );
};

export const getDeliveryCharge = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  const amt = Number(orderAmount) || 0;
  const round = (n) => Math.round(n);

  // Standard delivery charge:
  //   ₹1-book carts: below ₹399 → ₹100 · ₹399–₹1000 → FREE
  //   Normal carts : below ₹149 → ₹69  · ₹149–₹1000 → FREE
  //   Above ₹1000 (either) → "Handling & Care" fee = 5% of the order
  //   Above ₹2000 (either) → "Handling & Care" fee = 10% of the order
  //                          (capped at ₹159 for ₹1-book carts)
  let standard;
  if (amt > 1000) {
    // Lowered from a flat 20% so bigger orders aren't penalised.
    const rate = amt > 2000 ? 0.1 : 0.05;
    standard = hasOneRupeeItem ? Math.min(round(amt * rate), 159) : round(amt * rate);
  } else if (hasOneRupeeItem) {
    standard = amt < 399 ? 100 : 0;
  } else {
    standard = amt < freeDeliveryAt() ? 69 : 0;
  }

  // Faster / Express = the standard charge (incl. any Handling & Care) PLUS a
  // priority fee by order value: ₹49 below ₹499, ₹99 up to ₹1000, ₹149 up to
  // ₹2000, ₹199 above ₹2000. Faster never costs less than Standard.
  if (isFasterDelivery) {
    const priority = amt >= 2000 ? 199 : amt >= 1000 ? 149 : amt >= 499 ? 99 : 49;
    return standard + priority;
  }
  return standard;
};

// COD fee charged to the customer: ₹29 up to ₹300, else 6% rounded (no paise).
export const getCodFee = (orderAmount = 0) => {
  const amt = Number(orderAmount) || 0;
  if (amt <= 300) return 29;
  return Math.round(amt * 0.06);
};

export const getDeliveryLabel = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  const amt = Number(orderAmount) || 0;
  const express = isFasterDelivery ? " · Express" : "";

  if (amt > 1000) return "Handling & Care" + express; // 5% (10% above ₹2000; cap ₹159 for ₹1)
  if (hasOneRupeeItem) {
    if (amt < 399) return "Delivery" + express; // ₹100 flat
    return "Free Delivery" + express;
  }
  // Normal carts
  if (amt < freeDeliveryAt()) return "Delivery" + express; // ₹69
  return "Free Delivery" + express;
};

// Get delivery description
export const getDeliveryDescription = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  const amt = Number(orderAmount) || 0;
  // Faster = priority dispatch, delivered in 1–6 days. Standard = 5–9 days.
  if (isFasterDelivery) {
    return "Priority dispatch — delivered within 1–6 days.";
  }

  const eta = " Delivered within 5–9 days.";

  if (amt > 1000) {
    return hasOneRupeeItem
      ? `Handling & care fee — ${amt > 2000 ? "10" : "5"}% of the order (max ₹159).` + eta
      : `Handling & care fee — ${amt > 2000 ? "10" : "5"}% of the order value.` + eta;
  }
  if (hasOneRupeeItem) {
    if (amt < 399) return "₹100 delivery — free on orders above ₹399." + eta;
    return "Free delivery on this order." + eta;
  }
  if (amt < freeDeliveryAt())
    return `₹69 delivery — free on orders above ₹${freeDeliveryAt()}.` + eta;
  return "Free delivery on this order." + eta;
};

// Get original charge before discount
export const getOriginalCharge = (orderAmount, isFasterDelivery = false) => {
  if (orderAmount >= 799) {
    const baseCharge = orderAmount * 0.2;
    return Math.min(Math.round(baseCharge), 1500);
  }
  return null;
};

// Helper to get minimum checkout amount based on ₹1 items. Normal carts can
// now check out below ₹149 (a ₹69 delivery fee applies); ₹1-book carts keep
// the higher ₹499 threshold.
export const getMinCheckoutAmount = (hasOneRupeeItem = false) => {
  return hasOneRupeeItem ? 199 : 99;
};

export const CART_OFFERS = (() => {
  console.warn(
    "CART_OFFERS is deprecated. Use getCartOffers(hasOneRupeeItem) instead.",
  );
  return getCartOffers(false); // Default to false (no ₹1 items)
})();
