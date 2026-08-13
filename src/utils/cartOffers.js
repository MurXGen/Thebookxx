// utils/cartOffers.js

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
    // No ₹1 books → orders below ₹199 carry a small ₹69 delivery fee; reaching
    // ₹199 unlocks FREE delivery, then the goals push toward flat discounts.
    return [
      {
        min: 0,
        target: 199,
        type: "free_shipping",
        reward: "FREE delivery",
        message: "Add ₹{remaining} more for FREE delivery",
        icon: "gift",
      },
      {
        min: 199,
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

export const getDeliveryCharge = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  const amt = Number(orderAmount) || 0;
  const round = (n) => Math.round(n);

  // Compute the STANDARD charge first, then express = standard × 1.5.
  let standard;

  if (hasOneRupeeItem) {
    // ₹1-book carts:
    //   below ₹399 → flat ₹100 delivery
    //   ₹399–499  → FREE delivery
    //   above ₹499 → handling & care fee = 20% of the order, capped at ₹159
    //                (mirrors the weight bands: ~₹100 around ₹500, ₹159 by ~₹800+)
    if (amt < 399) {
      standard = 100;
    } else if (amt <= 499) {
      standard = 0;
    } else {
      standard = Math.min(round(amt * 0.2), 159);
    }
  } else {
    // Normal carts:
    //   below ₹199 → ₹69 delivery
    //   ₹199–499  → FREE delivery
    //   above ₹499 → handling & care fee = 20% of the order
    if (amt < 199) {
      standard = 69;
    } else if (amt <= 499) {
      standard = 0;
    } else {
      standard = round(amt * 0.2);
    }
  }

  // Express = standard + 50% of standard.
  return isFasterDelivery ? round(standard * 1.5) : standard;
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

  if (hasOneRupeeItem) {
    if (amt < 399) return "Delivery" + express; // ₹100 flat
    if (amt <= 499) return "Free Delivery" + express;
    return "Handling & Care" + express; // 20% capped ₹159
  }

  // Normal carts
  if (amt < 199) return "Delivery" + express; // ₹69
  if (amt <= 499) return "Free Delivery" + express;
  return "Handling & Care" + express; // 20%
};

// Get delivery description
export const getDeliveryDescription = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  const amt = Number(orderAmount) || 0;
  const fast = isFasterDelivery
    ? " Express adds 50% for 2–5 day priority handling."
    : "";

  if (hasOneRupeeItem) {
    if (amt < 399)
      return "₹100 delivery — free on orders above ₹399." + fast;
    if (amt <= 499) return "Free delivery on this order." + fast;
    return "Handling & care fee — 20% of the order (max ₹159)." + fast;
  }

  if (amt < 199) return "₹69 delivery — free on orders above ₹199." + fast;
  if (amt <= 499) return "Free delivery on this order." + fast;
  return "Handling & care fee — 20% of the order value." + fast;
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
// now check out below ₹199 (a ₹69 delivery fee applies); ₹1-book carts keep
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
