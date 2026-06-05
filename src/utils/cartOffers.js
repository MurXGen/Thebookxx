// utils/cartOffers.js

// Get base offers based on whether ₹1 items are present
export const getCartOffers = (hasOneRupeeItem = false) => {
  if (hasOneRupeeItem) {
    return [
      {
        min: 0,
        target: 399,
        type: "free_shipping",
        message: "Add ₹{remaining} more for checkout & Free Delivery",
        icon: "gift",
      },
      {
        min: 399,
        target: 400,
        type: "percentage",
        value: 0,
        message: "Add ₹{remaining} more to get Free Delivery",
        icon: "sparkle",
      },
      {
        min: 400,
        target: 650,
        type: "flat",
        value: 100,
        message: "Add ₹{remaining} more & get flat ₹100 OFF",
        icon: "sparkle",
      },
      {
        min: 650,
        target: 1000,
        type: "flat",
        value: 250,
        message: "Add ₹{remaining} more & get ₹250 OFF",
        icon: "sparkle",
      },
      {
        min: 1000,
        target: 2000,
        type: "flat",
        value: 500,
        message: "Add ₹{remaining} more & get ₹500 OFF",
        icon: "sparkle",
      },
    ];
  } else {
    return [
      {
        min: 0,
        target: 151,
        type: "free_shipping",
        message: "Add ₹{remaining} more for checkout",
        icon: "gift",
      },
      {
        min: 300,
        target: 600,
        type: "percentage",
        value: 0,
        message: "Add ₹{remaining} more & get flat ₹100 OFF",
        icon: "sparkle",
      },
      {
        min: 400,
        target: 650,
        type: "flat",
        value: 100,
        message: "Add ₹{remaining} more & get flat ₹100 OFF",
        icon: "sparkle",
      },
      {
        min: 650,
        target: 1000,
        type: "flat",
        value: 250,
        message: "Add ₹{remaining} more & get ₹250 OFF",
        icon: "sparkle",
      },
      {
        min: 1000,
        target: 2000,
        type: "flat",
        value: 500,
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
    // Below 399 - Charge ₹100 handling fee + faster delivery if selected
    if (orderAmount < 399) {
      if (isFasterDelivery) {
        return 119; // ₹219 total
      }
      return 100; // ₹100 handling fee
    }

    // Between 399 and 599 - Charge ₹100 handling fee, faster delivery extra
    if (orderAmount >= 399 && orderAmount < 599) {
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
    // Below 151 - Cannot checkout (will be handled by checkout minimum)
    if (orderAmount < 151) {
      if (isFasterDelivery) {
        return 119;
      }
      return 0;
    }

    // Between 151 and 399 - Free standard, faster 119
    if (orderAmount >= 151 && orderAmount < 399) {
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
      if (orderAmount >= 151 && orderAmount < 399) {
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
      if (orderAmount >= 151 && orderAmount < 399) {
        return "Complimentary shipping on orders above ₹151";
      }
      return "Get your order delivered in 5-7 business days";
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

// Helper to get minimum checkout amount based on ₹1 items
export const getMinCheckoutAmount = (hasOneRupeeItem = false) => {
  return hasOneRupeeItem ? 399 : 151;
};

export const CART_OFFERS = (() => {
  console.warn(
    "CART_OFFERS is deprecated. Use getCartOffers(hasOneRupeeItem) instead.",
  );
  return getCartOffers(false); // Default to false (no ₹1 items)
})();
