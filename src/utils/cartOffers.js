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
  // If ₹1 items are in cart - charge ₹100 handling fee (instead of free)
  if (hasOneRupeeItem) {
    // Below 499 - Charge ₹100 handling fee + faster delivery if selected
    if (orderAmount < 499) {
      if (isFasterDelivery) {
        return 119; // ₹219 total
      }
      return 100; // ₹100 handling fee
    }

    // Between 499 and 599 - Free delivery, faster delivery extra
    if (orderAmount >= 499 && orderAmount < 599) {
      if (isFasterDelivery) {
        return 119; // ₹219 total
      }
      return 0; // ₹100 handling fee
    }

    // Between 599 and 799 - Charge ₹100 + ₹49 handling fee
    if (orderAmount >= 599 && orderAmount < 799) {
      if (isFasterDelivery) {
        return 119; // ₹219 total
      }
      return 49; // ₹149 total
    }

    // Above 799 - Bulk order handling fees + ₹100 base
    if (orderAmount >= 799) {
      const baseCharge = orderAmount * 0.2; // 20% base
      if (isFasterDelivery) {
        const fasterCharge = orderAmount * 0.15;
        return Math.min(Math.round(fasterCharge), 1000) + 100;
      }
      const standardCharge = orderAmount * 0.1;
      return Math.min(Math.round(standardCharge), 800) + 100;
    }

    return 0; // Default handling fee
  }

  // No ₹1 items - Free delivery for eligible orders
  else {
    // Below 199 - checkout allowed, but a small ₹69 delivery fee applies
    if (orderAmount < 199) {
      if (isFasterDelivery) {
        return 119;
      }
      return 69;
    }

    // Between 199 and 399 - Free standard, faster 119
    if (orderAmount >= 199 && orderAmount < 399) {
      if (isFasterDelivery) {
        return 119;
      }
      return 0;
    }

    // Between 399 and 599 - Free standard, faster 119
    if (orderAmount >= 399 && orderAmount < 599) {
      if (isFasterDelivery) {
        return 119;
      }
      return 0;
    }

    // Between 599 and 799 - Small handling fee ₹49 for standard
    if (orderAmount >= 599 && orderAmount < 799) {
      if (isFasterDelivery) {
        return 119;
      }
      return 49;
    }

    // Above 799 - Bulk order handling fees
    if (orderAmount >= 799) {
      const baseCharge = orderAmount * 0.2;
      if (isFasterDelivery) {
        const fasterCharge = orderAmount * 0.15;
        return Math.min(Math.round(fasterCharge), 1000);
      }
      const standardCharge = orderAmount * 0.1;
      return Math.min(Math.round(standardCharge), 800);
    }

    return 0;
  }
};

export const getDeliveryLabel = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  if (hasOneRupeeItem) {
    if (isFasterDelivery) {
      if (orderAmount >= 799) {
        return "Priority Express";
      }
      return "Express Delivery";
    } else {
      if (orderAmount >= 799) {
        return "Bulk Order (10% + ₹100)";
      }
      if (orderAmount >= 599 && orderAmount < 799) {
        return "Small Handling Fee ";
      }
      return "";
    }
  } else {
    // Original labels for orders without ₹1 items
    if (isFasterDelivery) {
      if (orderAmount >= 799) {
        return "Priority Express (15% of order)";
      }
      return "Express Delivery";
    } else {
      if (orderAmount >= 799) {
        return "Bulk Order Handling (small fee)";
      }
      if (orderAmount >= 599 && orderAmount < 799) {
        return "Small Handling Fee";
      }
      if (orderAmount >= 399 && orderAmount < 599) {
        return "Free Delivery";
      }
      if (orderAmount >= 199 && orderAmount < 399) {
        return "Free Delivery";
      }
      return "Standard Delivery";
    }
  }
};

// Get delivery description
export const getDeliveryDescription = (
  orderAmount,
  isFasterDelivery = false,
  hasOneRupeeItem = false,
) => {
  if (hasOneRupeeItem) {
    if (isFasterDelivery) {
      if (orderAmount >= 799) {
        return "Priority handling for bulk orders";
      }
      return "Get your order delivered in 2-5 business days";
    } else {
      if (orderAmount >= 799) {
        return "Special handling fee for large book collections";
      }
      if (orderAmount >= 599 && orderAmount < 799) {
        return "Small handling fee";
      }
      return "";
    }
  } else {
    // Original descriptions for orders without ₹1 items
    if (isFasterDelivery) {
      if (orderAmount >= 799) {
        return "Priority handling for bulk orders";
      }
      return "Get your order delivered in 2-5 business days";
    } else {
      if (orderAmount >= 799) {
        return "Special handling fee for large book collections";
      }
      if (orderAmount >= 599 && orderAmount < 799) {
        return "Small handling fee for order processing";
      }
      if (orderAmount >= 399 && orderAmount < 599) {
        return "Complimentary shipping on orders above ₹399";
      }
      if (orderAmount >= 199 && orderAmount < 399) {
        return "Complimentary shipping on orders above ₹199";
      }
      return "₹69 delivery fee · free on orders above ₹199";
    }
  }
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
