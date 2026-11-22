// SERVER-ONLY. What the daily 12 PM push says to each reader:
//  • their latest open order (status + live Track91 link once shipped)
//  • one nudge: books waiting in the bag, else a saved (wishlist) book
// Copy rotates by day so it never reads the same twice in a row.

import { books } from "@/utils/book";
import { slugify } from "@/lib/bookSeo";
import { trackingUrl, isPostTrackingId } from "@/utils/trackingLink";
import { parseSheetTime } from "@/lib/sheetTime";

const SITE = "https://www.thebookx.in";
const byId = new Map(books.map((b) => [String(b.id).toLowerCase(), b]));
const rupee = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const first = (name) => String(name || "").replace(/\(.*?\)/g, "").trim().split(/\s+/)[0] || "";
const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
const daySeed = (d = new Date()) => Math.floor((d.getTime() + 330 * 60000) / 86400000);
const abs = (u) => (/^https?:/.test(u) ? u : `${SITE}${u}`);

function parseIds(list) {
  return String(list || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^(.*?)(?:x(\d+))?$/i);
      return { book: byId.get(String(m[1]).toLowerCase()), qty: Number(m[2] || 1) };
    })
    .filter((x) => x.book && Number(x.book.stock ?? 1) > 0);
}

const CLOSED = /deliver|cancel|return|refund|rto|lost/i;

// Latest order per phone from all order rows (later rows win).
export function latestOrderByPhone(rows) {
  const map = new Map();
  for (const r of rows) {
    const p = String(r["Phone Number"] ?? "").replace(/\D/g, "").slice(-10);
    if (p.length === 10 && r["Order ID"]) map.set(p, r);
  }
  return map;
}

export function orderPush(order, name) {
  if (!order) return null;
  const status = String(order["Order Status"] || "Order placed").trim();
  if (CLOSED.test(status)) return null;
  const oid = String(order["Order ID"]);
  const phone = String(order["Phone Number"] ?? "").replace(/\D/g, "").slice(-10);
  const orderUrl = `${SITE}/profile/${phone}/orders/${encodeURIComponent(oid)}`;
  const sid = String(order["Shipping ID"] || "").trim();
  const hi = first(name || order["Customer Name"]);
  if (sid && isPostTrackingId(sid)) {
    const live = trackingUrl(sid);
    return {
      title: `📦 ${status} · ${oid}`,
      body: `${hi ? `${hi}, your` : "Your"} books are on the way. Tap to see exactly where your parcel is right now.`,
      url: live,
      tag: `order-${oid}`,
      actions: [
        { action: "track", title: "Track live", url: live },
        { action: "order", title: "Order details", url: orderUrl },
      ],
    };
  }
  return {
    title: `📦 ${status} · ${oid}`,
    body: `${hi ? `${hi}, we're` : "We're"} getting your books ready. Tap to see your order and delivery dates.`,
    url: orderUrl,
    tag: `order-${oid}`,
  };
}

export function cartPush(row, seed = daySeed()) {
  const items = parseIds(row.Cart);
  if (!items.length) return null;
  const count = items.reduce((s, x) => s + x.qty, 0);
  const total = items.reduce((s, x) => s + x.book.discountedPrice * x.qty, 0);
  const mrp = items.reduce((s, x) => s + (x.book.originalPrice || x.book.discountedPrice) * x.qty, 0);
  const save = Math.max(0, mrp - total);
  const top = items[0].book;
  const more = count > 1 ? ` + ${count - 1} more` : "";
  const hi = first(row.Name);
  const lines = [
    {
      title: `📚 ${top.name}${more} ${count > 1 ? "are" : "is"} waiting in your bag`,
      body: `${save > 0 ? `You save ${rupee(save)} today.` : `Only ${rupee(total)}.`} Checkout takes under a minute — before someone else grabs the last copy.`,
    },
    {
      title: `${hi ? `${hi}, your` : "Your"} reading list is one tap away`,
      body: `${count} book${count > 1 ? "s" : ""} for ${rupee(total)}${save > 0 ? ` (${rupee(save)} off)` : ""}. Check out now and we'll pack it in the next dispatch.`,
    },
    {
      title: `Still thinking about ${top.name}?`,
      body: `Stock is limited and prices can change. Grab ${count > 1 ? "them" : "it"} now for ${rupee(total)}.`,
    },
  ];
  return { ...pick(lines, seed), url: abs("/bag"), image: top.image ? abs(top.image) : undefined, tag: "bag" };
}

export function wishlistPush(row, seed = daySeed()) {
  const items = parseIds(row.Wishlist);
  if (!items.length) return null;
  const b = items[Math.abs(seed) % items.length].book;
  const off = b.originalPrice > b.discountedPrice ? Math.round(((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100) : 0;
  const url = abs(`/books/${slugify(b.name)}`);
  const lines = [
    { title: `❤️ ${b.name} is still on your wishlist`, body: `${off ? `${off}% off right now — ` : ""}just ${rupee(b.discountedPrice)}. Make today the day you start it.` },
    { title: `Your saved book is waiting`, body: `${b.name} for ${rupee(b.discountedPrice)}${off ? ` (${off}% off)` : ""}. Add it to your bag before the deal moves on.` },
  ];
  return { ...pick(lines, seed), url, image: b.image ? abs(b.image) : undefined, tag: "wishlist" };
}

// ── When each kind goes out (IST) ──────────────────────────────────────────
//  orders   09:30 — after the night's India Post scans, when people check
//                   their phone in the morning ("where's my parcel?").
//  contact  11:00 — missing email / alternate number on the latest order,
//                   days 1, 3, 6 after it was placed (mid-morning, settled in).
//  bag      13:00 — lunch break, the most common time to finish a purchase.
//  wishlist 20:30 — evening wind-down, browsing/reading mood.
//  offers / arrivals (broadcasts) — send 19:00–21:00; blocked 22:00–08:00.
// Reminders are spaced out from the day the bag / wishlist last changed and
// then stop, so nobody gets the same nudge every day. At most one nudge a
// day: on a bag day the wishlist slot stays quiet.
export const PUSH_SLOTS = { orders: "09:30", contact: "11:00", bag: "13:00", wishlist: "20:30" };
export const BAG_DAYS = [1, 2, 4, 7];
export const WISHLIST_DAYS = [2, 5, 9, 14, 21, 28];

const istDay = (t) => Math.floor((t + 330 * 60000) / 86400000);
export function daysSince(value, now = Date.now()) {
  const t = Date.parse(String(value || ""));
  if (!Number.isFinite(t)) return -1;
  return istDay(now) - istDay(t);
}
export const bagDue = (row, now = Date.now()) =>
  !!String(row.Cart || "").trim() && BAG_DAYS.includes(daysSince(row["Cart Updated"] || row["Updated At"], now));
export const wishlistDue = (row, now = Date.now()) =>
  !!String(row.Wishlist || "").trim() &&
  WISHLIST_DAYS.includes(daysSince(row["Wishlist Updated"] || row["Updated At"], now));

// Quiet hours for broadcasts: 22:00–08:00 IST.
export function inQuietHours(now = Date.now()) {
  const h = new Date(now + 330 * 60000).getUTCHours();
  return h >= 22 || h < 8;
}

// ── "Add your email / alternate number" (11:00 IST) ────────────────────────
// For the reader's latest order: if its row has no valid email or no
// alternate number, ask on days 1, 3 and 6 after it was placed (the order
// success screen already asked on day 0), then stop. The link opens the order
// page with the add-details form (?add=contact), which saves to that row.
export const CONTACT_DAYS = [1, 3, 6];
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function contactPush(order, name, now = Date.now()) {
  if (!order || /cancel|return|refund|rto/i.test(String(order["Order Status"] || ""))) return null;
  const needEmail = !EMAIL_OK.test(String(order.Email || "").trim());
  const alt = String(order["Alternate number"] ?? "").replace(/\D/g, "").slice(-10);
  const phone = String(order["Phone Number"] ?? "").replace(/\D/g, "").slice(-10);
  const needAlt = alt.length !== 10 || alt === phone;
  if (!needEmail && !needAlt) return null;
  const placed = parseSheetTime(order["Timestamp (D)"] || order.Timestamp || order["Timestamp(D)"]);
  if (!placed || !CONTACT_DAYS.includes(istDay(now) - istDay(placed))) return null;
  const oid = String(order["Order ID"]);
  const hi = first(name || order["Customer Name"]);
  const what = needEmail && needAlt ? "your email and a backup number" : needEmail ? "your email" : "a backup number";
  return {
    title: `${hi ? `${hi}, add` : "Add"} ${what} for order ${oid}`,
    body: needAlt
      ? "So the courier can still reach you if your main number is busy — it takes 10 seconds."
      : "Get your invoice and delivery updates by email too — it takes 10 seconds.",
    url: `${SITE}/profile/${phone}/orders/${encodeURIComponent(oid)}?add=contact`,
    tag: `contact-${oid}`,
  };
}
