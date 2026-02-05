// utils/offers.js
import { FiTag, FiTruck, FiGift } from "react-icons/fi";
import { CART_OFFERS } from "./cartOffers";

export const offers = CART_OFFERS.map((offer) => {
  switch (offer.type) {
    case "free_shipping":
      return {
        id: offer.type,
        icon: FiTruck,
        title: "Free Delivery",
        description: `On orders above ₹300`,
      };

    case "flat":
      return {
        id: `${offer.type}-${offer.value}`,
        icon: FiGift,
        title: `₹${offer.value} OFF`,
        description: `On orders above ₹${offer.target}`,
      };

    default:
      return null;
  }
}).filter(Boolean);
