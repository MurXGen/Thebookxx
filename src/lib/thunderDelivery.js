// Thunder delivery — India Post's 24 / 48 Speed Post, which only runs in six
// metros. Shown as a third delivery option (after Standard and Faster) only
// when the delivery pincode is in one of these cities.
//
//  • Booked before 4 PM (India time) → "Thunder 1-day delivery", arrives
//    tomorrow. After 4 PM → "Thunder 2-day delivery", arrives the day after.
//  • Price: India Post charged ₹224 for a 2,900 g parcel, so Thunder costs
//    Standard + (cart weight × ₹224 / 2,900 g), rounded UP to the next
//    rupee amount ending in 9 (₹38.6 → ₹39, ₹40 → ₹49).
//  • Online payment only (pay in full, or ₹99 now + rest at delivery). Full
//    Cash on Delivery ships by Standard.

const IST_OFFSET_MIN = 330; // UTC+5:30
const DAY = 86400000;

export const THUNDER_CUTOFF_HOUR = 16; // 4 PM IST

// Metro pincode ranges covered by 24 / 48 Speed Post (inclusive).
export const THUNDER_CITIES = [
  { city: "Delhi", from: 110001, to: 110099 },
  { city: "Mumbai", from: 400001, to: 400104 },
  { city: "Kolkata", from: 700001, to: 700162 },
  { city: "Chennai", from: 600001, to: 600130 },
  { city: "Bengaluru", from: 560001, to: 560300 },
  { city: "Hyderabad", from: 500001, to: 500100 },
];

// Reference parcel: ₹224 for 2,900 g.
export const THUNDER_REF_RUPEES = 224;
export const THUNDER_REF_GRAMS = 2900;
const FALLBACK_BOOK_GRAMS = 250;

export function thunderCity(pincode) {
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length !== 6) return "";
  const n = Number(pin);
  return THUNDER_CITIES.find((c) => n >= c.from && n <= c.to)?.city || "";
}

export const isThunderPincode = (pincode) => !!thunderCity(pincode);

// Smallest whole rupee amount ≥ n that ends in 9.
export function roundUpTo9(n) {
  const c = Math.ceil(Math.max(0, Number(n) || 0));
  return c + ((9 - (c % 10) + 10) % 10);
}

// Parcel weight (g) of the physical books in a cart.
export function cartWeightGrams(items = []) {
  return (items || []).reduce((g, b) => {
    const q = Number(b?.qty ?? b?.quantity ?? 1) || 1;
    return g + (Number(b?.weight) || FALLBACK_BOOK_GRAMS) * q;
  }, 0);
}

// The Thunder fee on top of Standard delivery.
export function thunderFee(grams) {
  if (!grams) return 0;
  return roundUpTo9((grams * THUNDER_REF_RUPEES) / THUNDER_REF_GRAMS);
}

// Full Thunder delivery charge (Standard charge + Thunder fee).
export const thunderCharge = (standardCharge, items) =>
  (Number(standardCharge) || 0) + thunderFee(cartWeightGrams(items));

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// { days: 1 | 2, date (India-time Date, read with getUTC*), dateText "Tue 25 Nov",
//   name "Thunder 1-day delivery", short "1-day", msToCutoff (0 after 4 PM) }
export function thunderEta(now = Date.now()) {
  const ist = new Date(now + IST_OFFSET_MIN * 60000);
  const today = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  const cutoff = today + THUNDER_CUTOFF_HOUR * 3600000;
  const before = ist.getTime() < cutoff;
  const days = before ? 1 : 2;
  const date = new Date(today + days * DAY);
  return {
    days,
    date,
    dateText: `${WD[date.getUTCDay()]} ${date.getUTCDate()} ${MO[date.getUTCMonth()]}`,
    name: `Thunder ${days}-day delivery`,
    short: `${days}-day`,
    msToCutoff: before ? cutoff - ist.getTime() : 0,
  };
}

// Text saved in the order's "Delivery Type" column. Keeps the word "Faster"
// so manage-orders, shipping and order pages treat it as a priority order.
export const thunderDeliveryType = (eta = thunderEta()) =>
  `Thunder ${eta.short} · Faster Delivery (Speed Post · by ${eta.dateText})`;
