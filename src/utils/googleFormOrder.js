// utils/googleFormOrder.js

const GOOGLE_FORM_ORDER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3dUHr_S01ODuvQpok_8n0tG0ezfUPD5NLK0M_tyms25I-eQ/formResponse";

// Order writes go through our server route (/api/order-write), which forwards
// to the Apps Script web app. The /exec URL lives server-side only.

// Internal orderData keys → the sheet's actual column headers. The Apps Script
// append maps each value into the matching header column.
const SHEET_HEADERS = {
  orderId: "Order ID",
  customerName: "Customer Name",
  phone: "Phone Number",
  pincode: "Pincode",
  city: "City",
  state: "State",
  address: "Address",
  booksList: "Books List",
  totalAmount: "Total Amount",
  wallet: "Wallet",
  paymentType: "Payment Type",
  deliveryType: "Delivery Type",
  deliveryCharge: "Delivery Charge",
  giftWrap: "Gift Wrap",
  giftWrapCharge: "Gift Wrap Charge",
  offerApplied: "Offer Applied",
  tinyUrl: "TinyURL",
  orderStatus: "Order Status",
  advancePaid: "Advance Paid",
  timestamp: "Timestamp",
  userAgent: "User Agent",
  shippingId: "Shipping ID",
};

// Field IDs from your Google Form URL
const FORM_FIELD_IDS = {
  orderId: "entry.1840449230",
  customerName: "entry.669641354",
  phone: "entry.1941153221",
  pincode: "entry.778741327",
  city: "entry.1428299588",
  state: "entry.1558326929",
  address: "entry.733437133",
  booksList: "entry.473272273",
  totalAmount: "entry.1597483561",
  paymentType: "entry.1012308641",
  deliveryType: "entry.1881073537",
  deliveryCharge: "entry.979604882",
  giftWrap: "entry.10443444",
  giftWrapCharge: "entry.713637223",
  offerApplied: "entry.1246399200",
  tinyUrl: "entry.76337166",
  orderStatus: "entry.1458161030",
  advancePaid: "entry.392734436",
  timestamp: "entry.509242940",
  userAgent: "entry.2060171385",
  // "Wallet" column — a ledger entry: negative when wallet balance is spent on
  // this order, positive when a reward is credited (see creditWalletReward).
  wallet: "entry.1030338596",
};

// Helper function to get delivery charge (you may need to import or define this)
const getDeliveryChargeValue = (totalDiscounted, isFasterDelivery) => {
  // This should match your existing delivery charge logic
  // For now, returning a default - you can replace with your actual function
  if (isFasterDelivery) return 119;
  if (totalDiscounted < 399) return 100;
  if (totalDiscounted < 599) return 0;
  if (totalDiscounted < 799) return 49;
  return Math.min(Math.round(totalDiscounted * 0.1), 500);
};

// Helper function to get delivery label
const getDeliveryLabelValue = (totalDiscounted, isFasterDelivery) => {
  if (isFasterDelivery) {
    if (totalDiscounted >= 799) return "Priority Express";
    return "Express Delivery";
  }
  if (totalDiscounted >= 799) return "Bulk Order Handling";
  if (totalDiscounted >= 599) return "Small Handling Fee";
  if (totalDiscounted >= 399) return "Free Delivery";
  return "Standard Delivery";
};

// Update an existing order row in place, keyed by Order ID, via the Apps Script
// web app (action=update). `fields` is keyed by the sheet's column headers,
// e.g. { "Order Comment": "leave at door", "Delivery Type": "Faster" }.
export const updateOrderRow = async (orderId, fields) => {
  if (!orderId) return { success: false };
  try {
    // Server route forwards to the Apps Script; the /exec URL stays off-client.
    await fetch("/api/order-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", orderId, data: fields || {} }),
    });
    return { success: true };
  } catch (error) {
    console.error("updateOrderRow failed:", error);
    return { success: false, error };
  }
};

// Submit a new order by APPENDING a row via the Apps Script web app. This
// replaces the Google Form POST, which rejects the whole submission whenever a
// form question is toggled Required (State, Wallet, etc.) and was silently
// dropping live COD/UPI orders. Falls back to the Google Form if the Apps
// Script endpoint isn't configured.
export const submitOrderToGoogleForm = async (orderData) => {
  // Build a payload keyed by the sheet's real column headers.
  const data = {};
  Object.keys(orderData).forEach((key) => {
    const header = SHEET_HEADERS[key];
    if (!header) return;
    const val = orderData[key];
    if (val === undefined || val === null) return;
    data[header] = String(val);
  });

  // Preferred path: append straight to the sheet via our server route (which
  // forwards to the Apps Script; the /exec URL stays off the client).
  try {
    const res = await fetch("/api/order-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "append", data }),
    });
    if (res.ok) {
      return { success: true };
    }
    // non-OK → fall through to the Form as a last resort
  } catch (error) {
    console.error("Append via server route failed, trying Google Form:", error);
    // fall through to the Form as a last resort
  }

  // Fallback: original Google Form submission.
  try {
    const params = new URLSearchParams();
    Object.keys(orderData).forEach((key) => {
      if (
        FORM_FIELD_IDS[key] &&
        orderData[key] !== undefined &&
        orderData[key] !== null &&
        orderData[key] !== ""
      ) {
        params.append(FORM_FIELD_IDS[key], String(orderData[key]));
      }
    });
    await fetch(GOOGLE_FORM_ORDER_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    console.log("Submitted order to Google Form (fallback):", orderData);
    return { success: true };
  } catch (error) {
    console.error("Error submitting order:", error);
    return { success: false, error };
  }
};

// ── Wallet rewards ──────────────────────────────────────────────────────
// Same orders sheet holds the "Wallet" column; the profile reads a shopper's
// balance as the MAX Wallet value across their rows (by phone). To credit a
// scratch-card reward we read their current balance and write a fresh row with
// only phone + new cumulative wallet + timestamp, so the profile reflects it.
const fmtSheetTs = (date) => {
  const d = new Date(date);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// Read the current wallet balance = SUM of all Wallet ledger entries for the
// phone (rewards are positive, wallet spent on orders is negative).
export const fetchWalletBalance = async (phone) => {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return 0;
  try {
    // Server route reads the sheet + returns only this phone's ledger entries.
    const res = await fetch(`/api/wallet?phone=${digits}`);
    const json = await res.json();
    const entries = Array.isArray(json.entries) ? json.entries : [];
    const bal = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return Math.max(0, Math.round(bal));
  } catch (e) {
    console.error("Wallet balance read failed:", e);
    return 0;
  }
};

// Append one wallet transaction row to the dedicated Wallet tab
// (Timestamp | Phone Number | Amount | Type | Reason | Order ID). `amount` is
// signed: positive = credit, negative = debit. Written via the server route so
// no sheet/Apps Script URL is exposed to the browser.
export const appendWalletTx = async (
  phone,
  { amount, type, reason = "", orderId = "" },
) => {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  const amt = Math.round(Number(amount) || 0);
  if (digits.length !== 10 || !amt) return { success: false };
  try {
    const data = {
      Timestamp: fmtSheetTs(new Date()),
      "Phone Number": digits,
      Amount: String(amt),
      Type: type || (amt >= 0 ? "Credit" : "Debit"),
      Reason: reason,
      "Order ID": orderId ? String(orderId) : "",
    };
    await fetch("/api/order-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "append", data, target: "wallet" }),
    });
    return { success: true };
  } catch (e) {
    console.error("Wallet transaction write failed:", e);
    return { success: false };
  }
};

// Credit `reward` to the shopper's wallet (positive transaction). When earned
// by scratching a specific order, pass that order's id so the row is tagged —
// letting us remove the reward automatically if that order is later deleted.
export const creditWalletReward = async (
  phone,
  reward,
  orderId = "",
  reason = "Scratch card reward",
) => {
  const amt = Math.round(Number(reward) || 0);
  if (amt <= 0) return { success: false };
  const res = await appendWalletTx(phone, {
    amount: Math.abs(amt),
    type: "Credit",
    reason,
    orderId,
  });
  return res.success ? { success: true, reward: amt } : { success: false };
};

// Debit `amount` from the shopper's wallet (negative transaction) — used when
// wallet balance is spent on an order.
export const debitWallet = async (
  phone,
  amount,
  orderId = "",
  reason = "Used on order",
) => {
  const amt = Math.round(Number(amount) || 0);
  if (amt <= 0) return { success: false };
  return appendWalletTx(phone, {
    amount: -Math.abs(amt),
    type: "Debit",
    reason: orderId ? `${reason} ${orderId}` : reason,
    orderId,
  });
};

// A random scratch-card reward between ₹20 and ₹29 (inclusive).
export const randomWalletReward = () => 20 + Math.floor(Math.random() * 10);

// Order-value based reward tiers for the checkout scratch card.
//   ₹151–300  → ₹11–15
//   ₹300–500  → ₹15–30
//   ₹500–800  → ₹30–35
//   ₹800–1600 → ₹35–60
//   > ₹1600   → ₹60–100
export const orderWalletReward = (orderValue) => {
  const v = Number(orderValue) || 0;
  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  if (v >= 1600) return rand(60, 100);
  if (v >= 800) return rand(35, 60);
  if (v >= 500) return rand(30, 35);
  if (v >= 300) return rand(15, 30);
  return rand(11, 15);
};

// Format books list for Google Form
const QUICKREAD_LINE_PRICE = 19;
const formatBooksList = (cartBooks, quickReadItems = []) => {
  const lines = [];
  (cartBooks || []).forEach((book) => {
    lines.push(
      `${lines.length + 1}. ${book.name} | Qty: ${book.qty} | ₹${book.discountedPrice} each | Total: ₹${book.discountedPrice * book.qty}`,
    );
  });
  // QuickReads ride on the same order — one copy each, ₹19, tagged so they can
  // be told apart from physical books when parsed back.
  (quickReadItems || []).forEach((qr) => {
    lines.push(
      `${lines.length + 1}. ${qr.name} (QuickRead) | Qty: 1 | ₹${QUICKREAD_LINE_PRICE} each | Total: ₹${QUICKREAD_LINE_PRICE}`,
    );
  });
  return lines.join("\n");
};

// Track order to Google Form
export const trackOrderToGoogleForm = async (orderDetails) => {
  const {
    addressData,
    paymentType,
    fasterDeliveryChoice,
    giftWrapSelected,
    shortLink,
    totalWithDelivery,
    finalPayable,
    totalDiscounted,
    offerDiscount,
    offerLabel,
    walletUsed = 0,
    walletPhone = "",
    cartBooks,
    // QuickReads riding on this same order — appended to the Books List so they
    // show up in the order detail / summaries / sheet (₹19 each).
    quickReadItems = [],
    // Accurate amounts computed at checkout — prefer these over recomputing.
    deliveryCharge: deliveryChargeIn,
    giftWrapCharge: giftWrapChargeIn,
    // Chargeable bookmark add-on (no dedicated sheet column — noted in offer field).
    bookmarkSelected = false,
    bookmarkCharge: bookmarkChargeIn = 0,
    // Optional caller-supplied order id so the client can poll this exact row.
    orderId: orderIdIn,
    // Optional exact payment-source label (e.g. "PhonePe", "Credit Card ·
    // Gift card: XXXX", "Amazon Gift Voucher · XXXX"). Overrides the default
    // COD/WhatsApp/UPI mapping so the sheet records the real method chosen.
    paymentLabel = "",
  } = orderDetails;

  // Use the real charge the customer was shown; only fall back to the
  // estimate if it wasn't provided. Free delivery correctly records 0.
  const deliveryCharge = Number.isFinite(deliveryChargeIn)
    ? deliveryChargeIn
    : getDeliveryChargeValue(totalDiscounted, fasterDeliveryChoice);
  const deliveryLabel = getDeliveryLabelValue(
    totalDiscounted,
    fasterDeliveryChoice,
  );
  const formattedBooksList = formatBooksList(cartBooks, quickReadItems);

  const now = new Date();
  const formattedTimestamp = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const orderId = orderIdIn || `ORD${Date.now()}`;
  // Store the customer's own order link (opens the printed invoice for this
  // order) rather than a view-bag link. The manage-orders card reads this.
  const orderLink = `https://thebookx.in?orderID=${encodeURIComponent(orderId)}`;

  const formData = {
    orderId,
    customerName: addressData.name || "",
    phone: addressData.phone || "",
    pincode: addressData.pincode || "",
    city: addressData.city || "",
    state: addressData.state || "",
    address: addressData.address || "",
    booksList: formattedBooksList,
    totalAmount: totalWithDelivery || finalPayable,
    paymentType:
      paymentLabel ||
      (paymentType === "COD"
        ? "Cash on Delivery"
        : paymentType === "WhatsApp"
          ? "WhatsApp"
          : "UPI Payment"),
    deliveryType: fasterDeliveryChoice
      ? `Faster Delivery (${deliveryLabel})`
      : `Standard Delivery (${deliveryLabel})`,
    deliveryCharge: deliveryCharge || 0,
    // Gift-wrap column records both gift wrap and the free bookmark, e.g.
    // "No", "No-Bookmark", "Yes", "Yes-Bookmark".
    giftWrap: `${giftWrapSelected ? "Yes" : "No"}${
      bookmarkSelected ? "-Bookmark" : ""
    }`,
    giftWrapCharge: giftWrapSelected
      ? Number.isFinite(giftWrapChargeIn)
        ? giftWrapChargeIn
        : 25
      : 0,
    offerApplied:
      (offerDiscount > 0 ? `${offerLabel} (₹${offerDiscount} OFF)` : "None") +
      (walletUsed > 0
        ? ` · Wallet used ₹${walletUsed}${walletPhone ? ` (${walletPhone})` : ""}`
        : ""),
    tinyUrl: orderLink,
    orderStatus: "Processing",
    // Wallet spent is now recorded in the dedicated Wallet tab (see the debit
    // write below), not on the order row.
    wallet: "",
    timestamp: formattedTimestamp,
    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.substring(0, 500)
        : "",
  };

  // Send to GA as well
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "order_google_form", {
      event_category: "order",
      order_id: formData.orderId,
      total_amount: formData.totalAmount,
      payment_type: formData.paymentType,
    });
  }

  await submitOrderToGoogleForm(formData);
  // Record any wallet spent as a debit in the dedicated Wallet tab.
  if (walletUsed > 0) {
    debitWallet(walletPhone || addressData.phone, walletUsed, orderId).catch(
      () => {},
    );
  }
  // Hand the order id back so the caller can poll this exact row.
  return formData.orderId;
};

// ── Tracking tab ────────────────────────────────────────────────────────
// Poll helper — asks our server route whether the row for this Order ID has
// been CONFIRMED (i.e. the "(unconfirmed)" tag was removed by the admin after
// verifying the UPI payment). The sheet is read server-side.
export const fetchOrderStatusById = async (orderId) => {
  const id = String(orderId || "").trim();
  if (!id) return { found: false, confirmed: false };
  try {
    const res = await fetch(`/api/order?orderId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    return { found: !!json.found, confirmed: !!json.confirmed };
  } catch (e) {
    console.error("Order status read failed:", e);
    return { found: false, confirmed: false };
  }
};

// Fetch the full latest row for an Order ID (used by the merchant confirm page),
// via our server route so the sheet URL stays off the client.
export const fetchOrderById = async (orderId) => {
  const id = String(orderId || "").trim();
  if (!id) return null;
  try {
    const res = await fetch(`/api/order?orderId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.order || null;
  } catch (e) {
    console.error("Order fetch failed:", e);
    return null;
  }
};

// Push a CONFIRMED order (merchant-confirmed) from a fetched row: strips the
// "(unconfirmed)" tag and records the wallet debit on the same row.
export const submitConfirmedOrder = async (
  row,
  { walletUsed = 0, overrides = {} } = {},
) => {
  if (!row) return { success: false };
  const cleanName = String(row["Customer Name"] || "")
    .replace(/\s*\(unconfirmed\)\s*/i, "")
    .trim();
  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };
  const confirmedId = String(row["Order ID"] || `ORD${Date.now()}`);
  const orderData = {
    orderId: confirmedId,
    customerName: cleanName,
    phone: String(row["Phone Number"] || ""),
    pincode: String(row["Pincode"] || ""),
    city: String(row["City"] || ""),
    state: String(row["State"] || ""),
    address: String(row["Address"] || ""),
    booksList: String(row["Books List"] || ""),
    totalAmount: String(row["Total Amount"] || ""),
    paymentType: String(row["Payment Type"] || "UPI Payment"),
    deliveryType: String(row["Delivery Type"] || ""),
    deliveryCharge: num(row["Delivery Charge"]),
    giftWrap: String(row["Gift Wrap"] || "No"),
    giftWrapCharge: num(row["Gift Wrap Charge"]),
    offerApplied:
      String(row["Offer Applied"] || "") +
      (walletUsed > 0 ? ` · Wallet used ₹${walletUsed}` : ""),
    tinyUrl:
      String(row["TinyURL"] || "") ||
      `https://thebookx.in?orderID=${encodeURIComponent(confirmedId)}`,
    orderStatus: "Processing",
    // Wallet spent is recorded in the dedicated Wallet tab (debit below).
    wallet: "",
    timestamp: fmtSheetTs(new Date()),
  };

  // Merchant conversion (e.g. a WhatsApp order turned into COD or Online):
  // override the payment type + recomputed charges so the confirmed row bills
  // exactly like a normal checkout of that type.
  if (overrides.paymentType) orderData.paymentType = overrides.paymentType;
  if (overrides.deliveryType) orderData.deliveryType = overrides.deliveryType;
  if (overrides.deliveryCharge != null)
    orderData.deliveryCharge = num(overrides.deliveryCharge);
  if (overrides.totalAmount != null)
    orderData.totalAmount = String(overrides.totalAmount);
  if (overrides.offerApplied) {
    orderData.offerApplied = orderData.offerApplied
      ? `${orderData.offerApplied} · ${overrides.offerApplied}`
      : overrides.offerApplied;
  }

  const ok = await submitOrderToGoogleForm(orderData);
  if (ok && walletUsed > 0) {
    debitWallet(orderData.phone, walletUsed, confirmedId).catch(() => {});
  }
  return { success: !!ok, orderData };
};
