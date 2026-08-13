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
        target: 499,
        type: "free_shipping",
        reward: "Free delivery",
        message: "Add ₹{remaining} more to unlock Free delivery",
        icon: "gift",
      },
      {
        min: 499,
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
    // ₹1-book carts always carry a handling & care fee.
    // Below ₹499 → flat ₹99; ₹499 and above → 20% of the order.
    standard = amt < 499 ? 99 : round(amt * 0.2);
  } else {
    // Normal carts: delivery is FREE above ₹200; the amounts above ₹200 are
    // handling & care fees.
    if (amt < 200) {
      standard = 79; // ₹79 delivery below ₹200
    } else if (amt <= 500) {
      standard = 134; // ₹200–500 → ₹134 handling & care
    } else if (amt <= 1000) {
      standard = round(amt * 0.2); // ₹500–1000 → 20%
    } else {
      standard = round(amt * 0.3); // above ₹1000 → 30%
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
    // ₹1-book carts always show a handling & care fee.
    return "Handling & Care" + express;
  }

  // Normal carts: below ₹200 it's a delivery charge; ₹200+ delivery is free
  // and any amount is a handling & care fee.
  if (amt < 200) return "Delivery" + express;
  return "Handling & Care" + express;
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
    if (amt < 499)
      return "Handling & care fee for the ₹1 book offer." + fast;
    return "Handling & care — 20% of the order value." + fast;
  }

  if (amt < 200) return "₹79 delivery — free on orders above ₹200." + fast;
  return "Delivery is free above ₹200; a handling & care fee applies." + fast;
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
