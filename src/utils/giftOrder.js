// Helpers for gift-wrap orders (manage-orders + order detail page).
import { parseAddonsField } from "./addonsField";

// A gift order = the Gift Wrap add-on is on (parsed from the "Gift Wrap" column).
export function isGiftOrder(order) {
  try {
    return parseAddonsField(order?.["Gift Wrap"]).giftOn;
  } catch {
    return false;
  }
}

// Strip reseller / margin lines from a note before showing it to the operator.
// The checkout reseller flow writes lines like
//   "Reseller: preferred final ₹X · margin ₹Y" into the order Comment.
export function cleanNote(text) {
  if (!text) return "";
  return String(text)
    .split(/\r?\n|·|\|/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s &&
        !/resell/i.test(s) &&
        !/margin/i.test(s) &&
        !/preferred\s*final/i.test(s),
    )
    .join(" · ")
    .trim();
}

// The surprise message for a gift order = its note (reseller stripped).
export function giftMessageFor(order, localNote) {
  const raw =
    (localNote && String(localNote)) ||
    order?.["Order Comment"] ||
    order?.["Comment"] ||
    "";
  return cleanNote(raw);
}

// The customer's order link + a ?gift=<message> param, so scanning the QR opens
// the order page and reveals the surprise message with confetti.
export function giftLink(
  order,
  origin = "https://www.thebookx.in",
  message = "",
) {
  const phone = String(order?.["Phone Number"] || "")
    .replace(/\D/g, "")
    .slice(-10);
  const oid = order?.["Order ID"] || "";
  const base =
    phone.length === 10 && oid
      ? `${origin}/profile/${phone}/orders/${encodeURIComponent(oid)}`
      : `${origin}/?orderID=${encodeURIComponent(oid)}`;
  const msg = (
    message || "A little surprise is on its way to you — enjoy! 🎁"
  ).slice(0, 280);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}gift=${encodeURIComponent(msg)}`;
}
