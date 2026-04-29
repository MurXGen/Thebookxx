// utils/cartOffers.js
export const CART_OFFERS = [
  {
    min: 0,
    target: 151,
    type: "free_shipping",
    message: "Add ₹{remaining} more for checkout",
    icon: "gift",
  },
  {
    min: 151,
    target: 599,
    type: "percentage",
    value: 0,
    message: "Add ₹{remaining} more to avoid delivery charges",
    icon: "sparkle",
  },
  {
    min: 599,
    target: 999,
    type: "flat",
    value: 100,
    message: "Add ₹{remaining} more & get flat ₹100 OFF",
    icon: "sparkle",
  },
  {
    min: 999,
    target: 1899,
    type: "flat",
    value: 250,
    message: "Add ₹{remaining} more & get ₹250 OFF",
    icon: "sparkle",
  },
  {
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
