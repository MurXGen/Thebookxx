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
    target: 300,
    type: "percentage",
    value: 0,
    message: "Add ₹{remaining} more to get free shipping",
    icon: "sparkle",
  },
  {
    min: 300,
    target: 500,
    type: "flat",
    value: 100,
    message: "Add ₹{remaining} more & get flat ₹100 OFF",
    icon: "sparkle",
  },
  {
    min: 500,
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
