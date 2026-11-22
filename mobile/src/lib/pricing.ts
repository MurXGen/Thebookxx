// Mirrors the website's src/utils/cartOffers.js so the app's bag, offer stripe
// and checkout bill match what the website charges. Keep these in sync.

export const FREE_DELIVERY_AT = 249;
export const FREE_DELIVERY_AT_ONE_RUPEE = 399;
export const BELOW_FREE_FEE = 69;

export type Offer = {
  min: number;
  target: number;
  type: "free_shipping" | "flat";
  value?: number;
  reward: string;
  short: string;
};

export function getCartOffers(hasOneRupee: boolean): Offer[] {
  if (hasOneRupee)
    return [
      { min: 0, target: 399, type: "free_shipping", reward: "Free delivery", short: "Free delivery" },
      { min: 399, target: 650, type: "flat", value: 100, reward: "₹100 OFF", short: "₹100 off" },
      { min: 650, target: 1000, type: "flat", value: 250, reward: "₹250 OFF", short: "₹250 off" },
      { min: 1000, target: 2000, type: "flat", value: 500, reward: "₹500 OFF", short: "₹500 off" },
    ];
  return [
    { min: 0, target: FREE_DELIVERY_AT, type: "free_shipping", reward: "FREE delivery", short: "Free delivery" },
    { min: FREE_DELIVERY_AT, target: 450, type: "flat", value: 50, reward: "₹50 OFF", short: "₹50 off" },
    { min: 450, target: 650, type: "flat", value: 100, reward: "₹100 OFF", short: "₹100 off" },
    { min: 650, target: 1000, type: "flat", value: 250, reward: "₹250 OFF", short: "₹250 off" },
    { min: 1000, target: 2000, type: "flat", value: 500, reward: "₹500 OFF", short: "₹500 off" },
  ];
}

export const nextOffer = (amount: number, hasOneRupee: boolean) =>
  getCartOffers(hasOneRupee).find((o) => amount >= o.min && amount < o.target) || null;

export const unlockedFlats = (amount: number, hasOneRupee: boolean) =>
  getCartOffers(hasOneRupee).filter((o) => o.type === "flat" && amount >= o.target);

export const bestUnlockedFlat = (amount: number, hasOneRupee: boolean) => {
  const l = unlockedFlats(amount, hasOneRupee);
  return l.length ? l[l.length - 1] : null;
};

// The applied reward only counts while the bag still qualifies for it.
export const resolveApplied = (amount: number, hasOneRupee: boolean, applied: number) =>
  applied ? unlockedFlats(amount, hasOneRupee).find((o) => o.value === applied) || null : null;

export function deliveryCharge(amount: number, faster: boolean, hasOneRupee: boolean) {
  const amt = Number(amount) || 0;
  let standard: number;
  if (amt > 1000) {
    const rate = amt > 2000 ? 0.1 : 0.05;
    standard = hasOneRupee ? Math.min(Math.round(amt * rate), 159) : Math.round(amt * rate);
  } else if (hasOneRupee) standard = amt < FREE_DELIVERY_AT_ONE_RUPEE ? 100 : 0;
  else standard = amt < FREE_DELIVERY_AT ? BELOW_FREE_FEE : 0;
  if (faster) {
    const priority = amt >= 2000 ? 199 : amt >= 1000 ? 149 : amt >= 499 ? 99 : 49;
    return standard + priority;
  }
  return standard;
}

export function deliveryLabel(amount: number, faster: boolean, hasOneRupee: boolean) {
  const express = faster ? " · Express" : "";
  if (amount > 1000) return "Handling & Care" + express;
  if (hasOneRupee) return (amount < FREE_DELIVERY_AT_ONE_RUPEE ? "Delivery" : "Free Delivery") + express;
  return (amount < FREE_DELIVERY_AT ? "Delivery" : "Free Delivery") + express;
}

// Checkout COD rules (src/components/UI/AddressModal.jsx):
// fee = 5.9% of the order (min ₹29); no COD at ₹1,000+; COD + Faster only for 1–2 books.
export const codFee = (amount: number) => Math.max(29, Math.round(amount * 0.059));
export const COD_MAX_ORDER = 1000;
export const COD_FASTER_MAX_BOOKS = 2;

// Add-ons (src/components/BagAddons.jsx + checkout).
export const BOOKMARK_UNIT = 9;
export const MAX_BOOKMARKS = 10;
export const freeBookmarksFor = (subtotal: number) => (subtotal >= 1000 ? 4 : subtotal >= 500 ? 3 : 2);
export const bookmarkCharge = (qty: number, subtotal: number) => Math.max(0, qty - freeBookmarksFor(subtotal)) * BOOKMARK_UNIT;
export const giftWrapCharge = (subtotal: number) => (subtotal > 500 ? 35 : 15);

// "Gift Wrap" sheet column also carries the bookmark split, e.g. "No-Bookmark 1-2".
export function encodeAddons(gift: boolean, bookmarks: number, subtotal: number, note = "") {
  const prefix = gift ? "Yes" : "No";
  const free = Math.min(bookmarks, freeBookmarksFor(subtotal));
  const base = bookmarks > 0 ? `${prefix}-Bookmark ${bookmarks - free}-${free}` : prefix;
  const n = note.trim().replace(/\s+/g, " ");
  return n ? `${base} · Note: ${n}` : base;
}

export const DELIVERY_WINDOWS = { standard: "5–9 days", faster: "1–6 days" };
