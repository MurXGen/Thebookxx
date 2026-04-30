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
    target: 399,
    type: "percentage",
    value: 0,
    message: "Add ₹{remaining} more to get free delivery",
    icon: "sparkle",
  },
  {
    id: 3,
    min: 399,
    target: 899,
    type: "flat",
    value: 100,
    message: "Add ₹{remaining} more & get upto ₹250 OFF",
    icon: "sparkle",
  },
  {
    id: 4,
    min: 899,
    target: 1599,
    type: "flat",
    value: 250,
    message: "Add ₹{remaining} more & get upto ₹500 OFF",
    icon: "sparkle",
  },
  {
    id: 5,
    min: 1599,
    target: 3999,
    type: "flat",
    value: 500,
    message: "Add ₹{remaining} more & get upto ₹1000 OFF",
    icon: "sparkle",
  },
];

// Get extra delivery charge based on order amount
export const getExtraDeliveryCharge = (orderAmount) => {
  if (orderAmount >= 399) return 0;
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
