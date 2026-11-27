export const GA_MEASUREMENT_ID = "G-VZX7GSTR9Z";

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.gtag === "function";

/**
 * Track book view
 */
export const trackViewBook = (book) => {
  if (!isBrowser()) return;

  window.gtag("event", "view_item", {
    currency: "INR",
    value: book.discountedPrice,
    items: [
      {
        item_id: book.id,
        item_name: book.name,
        price: book.discountedPrice,
        item_category: book.catalogue?.[0] || "Books",
      },
    ],
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = ({ book, qty = 1 }) => {
  if (!isBrowser()) return;

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

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (cartItems, totalAmount) => {
  if (!isBrowser()) return;

  window.gtag("event", "begin_checkout", {
    currency: "INR",
    value: totalAmount,
    items: cartItems.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.discountedPrice,
      quantity: Number(item.qty ?? item.quantity) || 1,
      item_category: item.catalogue?.[0] || "Books",
    })),
  });
};

/**
 * Track payment button click
 */
export const trackPayClick = (totalAmount) => {
  if (!isBrowser()) return;

  window.gtag("event", "pay_click", {
    value: totalAmount,
    currency: "INR",
  });
};

/**
 * Track purchase success
 */
// `paymentId` is the order ID (ORD…), so GA de-duplicates and matches the
// sheet. Each order ID is sent once per browser even if a flow calls this twice.
export const trackPurchase = ({ cartItems, totalAmount, paymentId }) => {
  if (!isBrowser()) return;
  const txId = String(paymentId || "").trim();
  if (!txId) return;
  try {
    const sent = JSON.parse(localStorage.getItem("ga_tx_sent") || "[]");
    if (sent.includes(txId)) return;
    localStorage.setItem("ga_tx_sent", JSON.stringify([...sent, txId].slice(-50)));
  } catch (_) {}

  window.gtag("event", "purchase", {
    transaction_id: txId,
    currency: "INR",
    value: totalAmount,
    items: cartItems.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.discountedPrice,
      quantity: Number(item.qty ?? item.quantity) || 1,
      item_category: item.catalogue?.[0] || "Books",
    })),
  });
};

/**
 * Track pincode submission
 */
export const trackPincodeSubmitted = (pincode, location, timestamp) => {
  if (!isBrowser()) return;

  window.gtag("event", "pincode_submitted", {
    event_category: "engagement",
    event_label: "pincode_submission",
    pincode: pincode,
    city: location?.city || "Unknown",
    state: location?.state || "Unknown",
    timestamp: timestamp || new Date().toISOString(),
  });
};

/**
 * Track pincode skip
 */
export const trackPincodeSkipped = (timestamp) => {
  if (!isBrowser()) return;

  window.gtag("event", "pincode_skipped", {
    event_category: "engagement",
    event_label: "pincode_skip",
    timestamp: timestamp || new Date().toISOString(),
  });
};

/**
 * Track pincode modal view (impression)
 */
export const trackPincodeModalView = () => {
  if (!isBrowser()) return;

  window.gtag("event", "pincode_modal_viewed", {
    event_category: "engagement",
    event_label: "pincode_modal",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Generic event
 */
export const trackEvent = (event, params = {}) => {
  if (!isBrowser()) return;
  window.gtag("event", event, params);
};
