export const CART_OFFERS = [
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

// Dynamic delivery charge based on order value
export const getDeliveryCharge = (orderAmount, isFasterDelivery = false) => {
  // Below 399 - Normal flow
  if (orderAmount < 399) {
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
    return 0; // Free delivery
  }

  // Between 599 and 799 - Small handling fee ₹49 for standard
  if (orderAmount >= 599 && orderAmount < 799) {
    if (isFasterDelivery) {
      return 119;
    }
    return 49; // Small handling fee
  }

  // Above 799 - Bulk order handling fees (20% base, with discounts)
  if (orderAmount >= 799) {
    const baseCharge = orderAmount * 0.2; // 20% base
    if (isFasterDelivery) {
      // Faster delivery: 15% of total (discounted from 20%)
      const fasterCharge = orderAmount * 0.15;
      return Math.min(Math.round(fasterCharge), 1000);
    }
    // Standard delivery: 10% of total (discounted from 20%)
    const standardCharge = orderAmount * 0.1;
    return Math.min(Math.round(standardCharge), 800);
  }

  return 0;
};

// Get delivery label based on order value
export const getDeliveryLabel = (orderAmount, isFasterDelivery = false) => {
  if (isFasterDelivery) {
    if (orderAmount >= 799) {
      return "Priority Express (15% of order)";
    }
    return "Express Delivery";
  } else {
    if (orderAmount >= 799) {
      return "Bulk Order Handling (10% fee)";
    }
    if (orderAmount >= 599 && orderAmount < 799) {
      return "Small Handling Fee";
    }
    if (orderAmount >= 399 && orderAmount < 599) {
      return "Free Delivery";
    }
    return "Standard Delivery";
  }
};

// Get delivery description for UI
export const getDeliveryDescription = (
  orderAmount,
  isFasterDelivery = false,
) => {
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
    return "Get your order delivered in 5-7 business days";
  }
};

// Get original charge before discount (for display)
export const getOriginalCharge = (orderAmount, isFasterDelivery = false) => {
  if (orderAmount >= 799) {
    const baseCharge = orderAmount * 0.2;
    return Math.min(Math.round(baseCharge), 1500);
  }
  return null;
};
