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
  // ── FASTER / priority delivery (value-based fallback; checkout may override
  //    with a weight-based price). Kept for both ₹1 and non-₹1 carts. ──
  if (isFasterDelivery) {
    if (orderAmount >= 799) {
      const fasterCharge = Math.min(Math.round(orderAmount * 0.15), 1000);
      // ₹1-book carts keep a small base handling on bulk orders.
      return hasOneRupeeItem ? fasterCharge + 100 : fasterCharge;
    }
    return 119;
  }

  // ── STANDARD delivery ──
  // FREE for every order of ₹199 or more — applies whether or not a ₹1 book is
  // in the cart. No handling/bulk fee above the threshold.
  if (orderAmount >= 199) return 0;

  // Below ₹199 a small delivery fee applies. ₹1-book carts have a ₹199 minimum
  // checkout, so in practice only regular carts ever reach this branch.
  return 69;
};

export const getDeliveryLabel = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  if (isFasterDelivery) {
    return orderAmount >= 799 ? "Priority Express" : "Express Delivery";
  }
  // Standard delivery — free at/above ₹199 for every cart.
  return orderAmount >= 199 ? "Free Delivery" : "Standard Delivery";
};

// Get delivery description
export const getDeliveryDescription = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  if (isFasterDelivery) {
    return "Get your order delivered in 2-5 business days";
  }
  // Standard delivery — free at/above ₹199 for every cart.
  return orderAmount >= 199
    ? "Complimentary shipping on orders above ₹199"
    : "₹69 delivery fee · free on orders above ₹199";
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
