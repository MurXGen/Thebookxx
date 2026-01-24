export const GA_MEASUREMENT_ID = "G-VZX7GSTR9Z";

export const trackAddToCart = ({ book, qty = 1 }) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "add_to_cart", {
    currency: "INR",
    value: book.discountedPrice * qty,
    items: [
      {
        item_id: book.id,
        item_name: book.name,
        price: book.discountedPrice,
        quantity: qty,
        item_category: book.catalogue?.[0] || "Books",
      },
    ],
  });
};
