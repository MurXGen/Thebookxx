// utils/googleFormOrder.js

const GOOGLE_FORM_ORDER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3dUHr_S01ODuvQpok_8n0tG0ezfUPD5NLK0M_tyms25I-eQ/formResponse";

// Google Apps Script web-app (/exec) that writes directly to the orders sheet.
// New orders are appended through this (action=append) instead of the Google
// Form, because the Form silently rejects the whole submission whenever a
// question is toggled Required — which was dropping live orders. Must match the
// SHEET_EDIT_API_URL deployed for the manage-orders dashboard.
const SHEET_EDIT_API_URL =
  "https://script.google.com/macros/s/AKfycbzHQ2gs25qh7stuSdWWV_g4r3Im_6HUgUxxcbahkyWsY6d-VjO0ppwgiezokxHd5fqzKA/exec";

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

  // Preferred path: append straight to the sheet via Apps Script.
  if (SHEET_EDIT_API_URL) {
    try {
      const body = new URLSearchParams({
        action: "append",
        data: JSON.stringify(data),
      });
      await fetch(SHEET_EDIT_API_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });
      console.log("Appended order to sheet via Apps Script:", orderData);
      return { success: true };
    } catch (error) {
      console.error("Apps Script append failed, trying Google Form:", error);
      // fall through to the Form as a last resort
    }
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
const WALLET_SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const WALLET_FIELD_ID = "entry.1030338596"; // "Wallet" column on the form
const PHONE_FIELD_ID = "entry.1941153221";
const TIMESTAMP_FIELD_ID = "entry.509242940";

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
    const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json`;
    const res = await fetch(url);
    const text = await res.text();
    const data = JSON.parse(text.substring(47, text.length - 2));
    const headers = data.table.cols.map((c) => c.label);
    let bal = 0;
    data.table.rows.forEach((row) => {
      const o = {};
      row.c.forEach((cell, i) => {
        let v = cell?.v;
        if (v && typeof v === "object" && v.value !== undefined) v = v.value;
        o[headers[i]] = v;
      });
      const rowPhone = String(o["Phone Number"] ?? "").replace(/\D/g, "");
      if (rowPhone.slice(-10) === digits) {
        const w = parseFloat(o["Wallet"] ?? o["wallet"] ?? 0);
        if (!isNaN(w)) bal += w;
      }
    });
    return Math.max(0, Math.round(bal));
  } catch (e) {
    console.error("Wallet balance read failed:", e);
    return 0;
  }
};

// Credit `reward` to the shopper's wallet as a POSITIVE ledger entry (phone +
// wallet + timestamp only). The balance is the sum of all entries.
export const creditWalletReward = async (phone, reward) => {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10 || !reward) return { success: false };
  try {
    const params = new URLSearchParams();
    params.append(PHONE_FIELD_ID, digits);
    params.append(WALLET_FIELD_ID, String(Math.round(reward)));
    params.append(TIMESTAMP_FIELD_ID, fmtSheetTs(new Date()));
    await fetch(GOOGLE_FORM_ORDER_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    return { success: true, reward };
  } catch (e) {
    console.error("Wallet credit failed:", e);
    return { success: false };
  }
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
const formatBooksList = (cartBooks) => {
  if (!cartBooks || cartBooks.length === 0) return "";
  return cartBooks
    .map(
      (book, index) =>
        `${index + 1}. ${book.name} | Qty: ${book.qty} | ₹${book.discountedPrice} each | Total: ₹${book.discountedPrice * book.qty}`,
    )
    .join("\n");
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
  const formattedBooksList = formatBooksList(cartBooks);

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
    // Record wallet spent on this order as a NEGATIVE ledger entry so the
    // shopper's balance nets down. Blank when no wallet was used.
    wallet: walletUsed > 0 ? -Math.round(walletUsed) : "",
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
  // Hand the order id back so the caller can poll this exact row.
  return formData.orderId;
};

// ── Tracking tab ────────────────────────────────────────────────────────
// A separate "Tracking" tab in the same spreadsheet holds courier tracking
// (AWB / consignment) numbers, populated in bulk from the manage-orders
// dashboard. The customer profile reads it to show a live tracking ID without
// re-pushing the whole order row. Columns: Order ID | Customer Name |
// Phone Number | Tracking ID | Timestamp.
export const TRACKING_SHEET_NAME = "Tracking";

// Read the Tracking tab and return a lookup keyed by BOTH Order ID and phone
// (last 10 digits), each → { trackingId, name, phone, orderId }. Latest row
// wins so re-pasting an updated tracking ID overrides the older value.
export const fetchTrackingMap = async () => {
  const out = { byOrderId: {}, byPhone: {} };
  try {
    const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
      TRACKING_SHEET_NAME,
    )}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    const data = JSON.parse(text.substring(47, text.length - 2));
    if (!data.table || !data.table.rows) return out;
    const headers = data.table.cols.map((c) => c.label);
    const pick = (o, ...names) => {
      for (const n of names) {
        const hit = Object.keys(o).find(
          (k) => k.toLowerCase().replace(/\s+/g, "") === n,
        );
        if (hit && String(o[hit] ?? "").trim() !== "") return String(o[hit]);
      }
      return "";
    };
    data.table.rows.forEach((row) => {
      const o = {};
      (row.c || []).forEach((cell, i) => {
        let v = cell?.v;
        if (v && typeof v === "object" && v.value !== undefined) v = v.value;
        o[headers[i]] = v;
      });
      const orderId = pick(o, "orderid").trim();
      const trackingId = pick(o, "trackingid", "shippingid", "awb").trim();
      if (!trackingId) return;
      const name = pick(o, "customername", "name").trim();
      const phone = pick(o, "phonenumber", "phone", "mobile")
        .replace(/\D/g, "")
        .slice(-10);
      const entry = { trackingId, name, phone, orderId };
      if (orderId) out.byOrderId[orderId] = entry;
      if (phone.length === 10) out.byPhone[phone] = entry;
    });
    return out;
  } catch (e) {
    console.error("Tracking map read failed:", e);
    return out;
  }
};

// Poll helper — reads the orders sheet and reports whether the row for this
// Order ID has been CONFIRMED (i.e. the "(unconfirmed)" tag was removed from
// the customer name by the admin after verifying the UPI payment).
export const fetchOrderStatusById = async (orderId) => {
  const id = String(orderId || "").trim();
  if (!id) return { found: false, confirmed: false };
  try {
    const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    const data = JSON.parse(text.substring(47, text.length - 2));
    const headers = data.table.cols.map((c) => c.label);
    let found = false;
    let confirmed = false;
    data.table.rows.forEach((row) => {
      const o = {};
      row.c.forEach((cell, i) => {
        let v = cell?.v;
        if (v && typeof v === "object" && v.value !== undefined) v = v.value;
        o[headers[i]] = v;
      });
      if (String(o["Order ID"] ?? "").trim() === id) {
        found = true;
        const nm = String(o["Customer Name"] ?? "");
        const st = String(o["Order Status"] ?? "");
        // Confirmed once the "(unconfirmed)" marker is gone from the name
        // (or an explicit confirmed/received status is set by the admin).
        if (
          !/unconfirmed/i.test(nm) ||
          /received|confirmed|paid/i.test(st)
        ) {
          confirmed = true;
        }
      }
    });
    return { found, confirmed };
  } catch (e) {
    console.error("Order status read failed:", e);
    return { found: false, confirmed: false };
  }
};

// Fetch the full latest row for an Order ID (used by the merchant confirm page).
export const fetchOrderById = async (orderId) => {
  const id = String(orderId || "").trim();
  if (!id) return null;
  try {
    const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    const data = JSON.parse(text.substring(47, text.length - 2));
    const headers = data.table.cols.map((c) => c.label);
    let match = null;
    data.table.rows.forEach((row) => {
      const o = {};
      row.c.forEach((cell, i) => {
        let v = cell?.v;
        if (v && typeof v === "object" && v.value !== undefined) v = v.value;
        o[headers[i]] = v;
      });
      if (String(o["Order ID"] ?? "").trim() === id) match = o; // keep last
    });
    return match;
  } catch (e) {
    console.error("Order fetch failed:", e);
    return null;
  }
};

// Push a CONFIRMED order (merchant-confirmed) from a fetched row: strips the
// "(unconfirmed)" tag and records the wallet debit on the same row.
export const submitConfirmedOrder = async (row, { walletUsed = 0 } = {}) => {
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
    wallet: walletUsed > 0 ? -Math.round(walletUsed) : "",
    timestamp: fmtSheetTs(new Date()),
  };
  const ok = await submitOrderToGoogleForm(orderData);
  return { success: !!ok, orderData };
};
