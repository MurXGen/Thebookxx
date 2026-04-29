// utils/cartOffers.js
export const CART_OFFERS = [
  {
    id: 1,
    min: 0,
    target: 151,
    type: "free_shipping",
    value: 0,
    message: "Add ₹{remaining} to checkout",
    icon: "gift",
  },
  {
    id: 2,
    min: 151,
    target: 599,
    type: "percentage",
    value: 0,
    message: "Add ₹{remaining} more to get free delivery",
    icon: "sparkle",
  },
  {
    id: 3,
    min: 599,
    target: 999,
    type: "flat",
    value: 100,
    message: "Add ₹{remaining} more & get flat ₹100 OFF",
    icon: "sparkle",
  },
  {
    id: 4,
    min: 999,
    target: 1899,
    type: "flat",
    value: 250,
    message: "Add ₹{remaining} more & get ₹250 OFF",
    icon: "sparkle",
  },
  {
    id: 5,
    min: 1800,
    target: 4000,
    type: "flat",
    value: 500,
    message: "Add ₹{remaining} more & get ₹500 OFF",
    icon: "sparkle",
  },
];

// Get extra delivery charge based on order amount
export const getExtraDeliveryCharge = (orderAmount) => {
  if (orderAmount >= 400) return 0;
  return 100;
};

// Calculate offer discount based on applied offer
export const calculateOfferDiscount = (orderAmount, appliedOffer) => {
  if (!appliedOffer) return 0;

  if (appliedOffer.type === "flat") {
    return appliedOffer.value;
  }

  if (appliedOffer.type === "percentage") {
    return Math.round((orderAmount * appliedOffer.value) / 100);
  }

  return 0;
};
