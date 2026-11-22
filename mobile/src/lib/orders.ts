// Order writes/reads go through the website's own API routes, so an app order
// lands in the same sheet row format as a website order and shows up in
// Manage Orders, the customer's profile and Telegram exactly the same way.
// Ported from src/utils/googleFormOrder.js (trackOrderToGoogleForm).
import Constants from "expo-constants";
import type { Book } from "@/lib/catalog";
import type { Profile } from "@/lib/store";
import { redeemCoupon } from "@/lib/coupons";
import { API, SITE } from "@/theme";

export const UPI_ID = "7977960242-1@okbizaxis";
export const PAYMENT_PENDING_STATUS = "Unconfirmed (Payment Pending)";
const TELEGRAM_URL = "https://api.journalx.app/api/bookxTelegram/order";

// UPI = pay online in full · ADV = ₹99 now online + rest at delivery · COD.
export type PayMethod = "UPI" | "ADV" | "COD";
export const ADVANCE_AMOUNT = 99;
export type OrderLine = { book: Book; qty: number };
export type Bill = {
  mrp: number;
  subtotal: number;
  offerDiscount: number;
  offerLabel: string;
  delivery: number;
  deliveryLabel: string;
  codFee: number;
  bookmarks: number;
  bookmarkFree: number;
  bookmarkCharge: number;
  gift: boolean;
  giftNote: string;
  giftCharge: number;
  addonsField: string; // "Gift Wrap" column value, e.g. "No-Bookmark 1-2"
  coupon: string; // applied code ("" if none / beaten by the cart offer)
  couponDiscount: number;
  total: number;
};
export type OrderRow = Record<string, string>;

const n0 = (v: unknown) => Math.round(Number(v) || 0);
const p2 = (n: number) => String(n).padStart(2, "0");

// "22/11/2026, 01:05:22 pm" — matches the website's en-IN timestamp.
function istTimestamp(d = new Date()) {
  const h = d.getHours();
  const h12 = h % 12 || 12;
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}, ${p2(h12)}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${h < 12 ? "am" : "pm"}`;
}

// App orders start with "M" (MORD…) so they stand out from website orders (ORD…).
export const newOrderId = () => `MORD${Date.now()}`;

export const booksListText = (lines: OrderLine[]) =>
  lines.map((l, i) => `${i + 1}. ${l.book.name} | Qty: ${l.qty} | ₹${l.book.price} each | Total: ₹${l.book.price * l.qty}`).join("\n");

async function orderWrite(body: object) {
  const res = await fetch(`${API}/api/order-write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j?.success === false) throw new Error(j?.error || `HTTP ${res.status}`);
  return j;
}

export async function placeOrder({
  orderId,
  profile,
  lines,
  bill,
  payment,
  faster,
  altPhone = "",
  paymentLabel = "",
}: {
  orderId: string;
  profile: Profile;
  altPhone?: string;
  paymentLabel?: string; // e.g. "Google Pay (UPI)" — website records the chosen app
  lines: OrderLine[];
  bill: Bill;
  payment: PayMethod;
  faster: boolean;
}) {
  const phone10 = profile.phone.replace(/\D/g, "").slice(-10);
  const isCod = payment === "COD";
  const isAdv = payment === "ADV";
  const data: Record<string, string> = {
    "Order ID": orderId,
    "Customer Name": profile.name.trim(),
    "Phone Number": phone10,
    ...(/^\d{10}$/.test(altPhone) ? { "Alternate number": altPhone } : {}),
    ...(profile.email.trim() ? { Email: profile.email.trim() } : {}),
    Pincode: profile.pincode,
    City: profile.city,
    State: profile.state,
    Address: profile.address.trim(),
    "Books List": booksListText(lines),
    "Total Amount": String(bill.total),
    "Payment Type": isCod
      ? "Cash on Delivery"
      : isAdv
        ? paymentLabel
          ? `${paymentLabel.replace(/ \(UPI\)$/, "")} · ₹${ADVANCE_AMOUNT} advance (COD)`
          : `COD · ₹${ADVANCE_AMOUNT} advance`
        : paymentLabel || "UPI Payment",
    ...(isAdv ? { "Advance Paid": "Yes", "Advance Amount": String(ADVANCE_AMOUNT) } : {}),
    "Delivery Type": `${faster ? "Faster" : "Standard"} Delivery (${bill.deliveryLabel})`,
    "Delivery Charge": String(bill.delivery),
    "Gift Wrap": bill.addonsField,
    "Gift Wrap Charge": String(bill.gift ? bill.giftCharge : 0),
    "Bookmark Qty": String(bill.bookmarks),
    "Bookmark Charge": String(bill.bookmarkCharge),
    "Offer Applied":
      (bill.offerDiscount > 0 ? `${bill.offerLabel} (₹${bill.offerDiscount} OFF)` : "None") +
      (bill.coupon ? ` · Coupon ${bill.coupon}${bill.couponDiscount ? ` (₹${bill.couponDiscount} OFF)` : ""}` : ""),
    ...(bill.coupon ? { Coupon: bill.coupon } : {}),
    TinyURL: `${SITE}/profile/${phone10}/orders/${encodeURIComponent(orderId)}`,
    // COD is a completed checkout; UPI stays Unconfirmed until the team verifies.
    "Order Status": isCod ? "Processing" : "Unconfirmed",
    "Order Comment": "Placed from Android app",
    Wallet: "",
    "Total MRP": String(n0(bill.mrp)),
    "Item Discount": String(Math.max(0, n0(bill.mrp) - n0(bill.subtotal))),
    Subtotal: String(n0(bill.subtotal)),
    "Offer Discount": String(n0(bill.offerDiscount)),
    "Coupon Discount": String(n0(bill.couponDiscount)),
    "Wallet Applied": "0",
    "COD Fee": String(n0(bill.codFee)),
    "Handling & Care": /handling/i.test(bill.deliveryLabel) ? String(n0(bill.delivery)) : "0",
    "COD Collectible": String(isCod ? n0(bill.total) : isAdv ? Math.max(0, n0(bill.total) - ADVANCE_AMOUNT) : 0),
    Timestamp: istTimestamp(),
    "User Agent": `TheBookX Android app ${Constants.expoConfig?.version || ""}`,
  };
  await orderWrite({ action: "append", data });
  if (bill.coupon && bill.couponDiscount > 0) redeemCoupon(bill.coupon);
  notifyTeam({ orderId, profile, altPhone, lines, bill, payment, faster }).catch(() => {});
  return orderId;
}

// Same Telegram post the website sends; UPI orders get Passed/Failed buttons
// so the team's tap confirms the payment (the pay screen polls for it).
async function notifyTeam({ orderId, profile, altPhone, lines, bill, payment, faster }: { orderId: string; profile: Profile; altPhone: string; lines: OrderLine[]; bill: Bill; payment: PayMethod; faster: boolean }) {
  const items = lines.map((l, i) => `${i + 1}. ${l.book.name} ×${l.qty} — ₹${l.book.price * l.qty}`).join("\n");
  const addr = [profile.address, profile.city, profile.pincode].filter(Boolean).join(", ");
  const msg = `🛒 *New order · TheBookX (Android app)*

👤 *${profile.name || "Customer"}*  ·  ${payment === "COD" ? `💵 COD${bill.codFee ? ` · +₹${bill.codFee} fee` : ""}` : payment === "ADV" ? `💳 ₹${ADVANCE_AMOUNT} advance (UPI) · 💵 collect ₹${Math.max(0, bill.total - ADVANCE_AMOUNT)} at door` : "💳 Online (UPI)"}
📞 ${profile.phone}${altPhone ? ` · Alt ${altPhone}` : ""}
📍 ${addr}

📚 *Items (${lines.reduce((n, l) => n + l.qty, 0)})*
${items}

🧾 Subtotal ₹${bill.subtotal}${bill.offerDiscount ? ` · Offer -₹${bill.offerDiscount}` : ""}${bill.couponDiscount ? ` · Coupon ${bill.coupon} -₹${bill.couponDiscount}` : ""} · Delivery ₹${bill.delivery}${bill.gift ? ` · Gift +₹${bill.giftCharge}` : ""}${bill.bookmarks ? ` · 🔖 ${bill.bookmarks}${bill.bookmarkCharge ? ` (+₹${bill.bookmarkCharge})` : " free"}` : ""}${bill.codFee ? ` · COD +₹${bill.codFee}` : ""}
💰 *Total: ₹${bill.total}*
🚚 ${faster ? "Faster" : "Standard"} · ${bill.deliveryLabel}

🆔 ${orderId}`;
  await fetch(TELEGRAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderDetails: msg,
      customerName: profile.name,
      customerPhone: profile.phone,
      totalAmount: bill.total,
      paymentMethod: payment,
      codHandlingFee: bill.codFee,
      ...(payment !== "COD" ? { actionButtons: "verify", orderId } : {}),
    }),
  });
}

export const upiLink = (amount: number, orderId: string) =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("TheBookX")}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`TheBookX ${orderId}`)}`;

export async function orderStatus(orderId: string) {
  try {
    const r = await fetch(`${API}/api/order?orderId=${encodeURIComponent(orderId)}`);
    const j = await r.json();
    return { found: !!j.found, confirmed: !!j.confirmed, failed: !!j.failed };
  } catch {
    return { found: false, confirmed: false, failed: false };
  }
}

export const markPaymentPending = (orderId: string) =>
  orderWrite({ action: "update", orderId, data: { "Order Status": PAYMENT_PENDING_STATUS } }).catch(() => {});

export const resetToUnconfirmed = (orderId: string) =>
  orderWrite({ action: "update", orderId, data: { "Order Status": "Unconfirmed" } }).catch(() => {});

// ── Reading a reader's orders (by phone, like the website's profile) ───────
export async function fetchOrders(phone: string): Promise<OrderRow[]> {
  const p = phone.replace(/\D/g, "").slice(-10);
  const r = await fetch(`${API}/api/orders?phone=${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const rows: OrderRow[] = (j.orders || []).filter((o: OrderRow) => String(o["Order ID"] || "").trim() && String(o["Books List"] || "").trim());
  // Latest row per Order ID, newest first.
  const byId = new Map<string, OrderRow>();
  rows.forEach((o) => byId.set(String(o["Order ID"]).trim(), o));
  return [...byId.values()].sort((a, b) => orderTime(b) - orderTime(a));
}

export async function fetchOrder(orderId: string, phone: string): Promise<OrderRow | null> {
  const p = phone.replace(/\D/g, "").slice(-10);
  const r = await fetch(`${API}/api/order?orderId=${encodeURIComponent(orderId)}&phone=${p}`);
  const j = await r.json().catch(() => ({}));
  return j?.order || null;
}

export function orderTime(o: OrderRow) {
  const id = String(o["Order ID"] || "");
  const m = id.match(/(\d{12,})/);
  if (m) return Number(m[1]);
  const t = String(o.Timestamp || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return t ? new Date(Number(t[3]), Number(t[2]) - 1, Number(t[1])).getTime() : 0;
}

export const fmtOrderDate = (o: OrderRow) => {
  const t = orderTime(o);
  if (!t) return String(o.Timestamp || "").split(",")[0];
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export function parseBooks(list: string) {
  return String(list || "")
    .split("\n")
    .map((line) => {
      const m = line.match(/^\s*\d+\.\s*(.+?)\s*\|\s*Qty:\s*(\d+)\s*\|\s*₹\s*([\d.]+)\s*each/i);
      if (!m) return null;
      return { name: m[1].replace(/\s*\(QuickRead\)\s*$/i, ""), qty: Number(m[2]), price: Number(m[3]) };
    })
    .filter((x): x is { name: string; qty: number; price: number } => !!x);
}

// Status → where it sits on the timeline.
export const STEPS = ["Placed", "Confirmed", "Shipped", "Out for delivery", "Delivered"] as const;
export function statusInfo(o: OrderRow) {
  const st = String(o["Order Status"] || "").trim();
  const sid = String(o["Shipping ID"] || "").trim();
  if (/cancel/i.test(st)) return { label: "Cancelled", step: -1, tone: "red" as const };
  if (/return/i.test(st)) return { label: st || "Returned", step: -1, tone: "red" as const };
  if (/fail/i.test(st)) return { label: "Payment failed", step: 0, tone: "red" as const };
  if (/payment\s*pending/i.test(st)) return { label: "Verifying payment", step: 0, tone: "amber" as const };
  if (/unconfirmed/i.test(st)) return { label: "Awaiting payment", step: 0, tone: "amber" as const };
  if (/delivered/i.test(st)) return { label: "Delivered", step: 4, tone: "green" as const };
  if (/out for delivery/i.test(st)) return { label: "Out for delivery", step: 3, tone: "blue" as const };
  if (/shipped|transit|dispatch/i.test(st) || sid) return { label: "Shipped", step: 2, tone: "blue" as const };
  return { label: "Confirmed", step: 1, tone: "blue" as const };
}

// UPI screen → "Pay on delivery instead": the same order row becomes a
// confirmed COD order (Standard delivery, COD fee added), like the website.
export async function switchToCod({ orderId, total, codFee: fee, delivery, deliveryLabel: label, name, phone }: { orderId: string; total: number; codFee: number; delivery: number; deliveryLabel: string; name: string; phone: string }) {
  await orderWrite({
    action: "update",
    orderId,
    data: {
      "Payment Type": "Cash on Delivery",
      "Order Status": "Processing",
      "Total Amount": String(total),
      "COD Fee": String(fee),
      "COD Collectible": String(total),
      "Delivery Charge": String(delivery),
      "Delivery Type": `Standard Delivery (${label})`,
    },
  });
  fetch(TELEGRAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderDetails: `🔁 *Switched to COD · TheBookX (Android app)*\n\n👤 *${name}*\n📞 ${phone}\n💰 *Total: ₹${total}* (incl. ₹${fee} COD fee)\n💵 Collect at door: ₹${total}\n\n🆔 ${orderId}`,
      customerName: name,
      customerPhone: phone,
      totalAmount: total,
      paymentMethod: "COD",
      codHandlingFee: fee,
    }),
  }).catch(() => {});
}

export const confirmUpiOrder = (orderId: string) =>
  orderWrite({ action: "update", orderId, data: { "Order Status": "Processing" } }).catch(() => {});
