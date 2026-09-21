// Recompute an order's bill from a (possibly edited) set of books, mirroring
// the checkout pricing: subtotal → delivery (free-delivery threshold) → best
// flat offer → gift wrap → COD fee. Used by the manage-orders "Replace a book"
// flow so a swap re-evaluates the whole bill, not just the line difference.

import {
  getDeliveryCharge,
  getCartOffers,
  getCodFee,
} from "@/utils/cartOffers";

// The effective online advance already paid on an order. Prefers an explicit
// "Advance Amount" column; falls back to the legacy ₹99 flag.
export function effectiveAdvance(order) {
  const explicit = Math.round(
    Number(String(order?.["Advance Amount"] ?? "").replace(/[^\d.]/g, "")) || 0,
  );
  if (explicit > 0) return explicit;
  const advPaid = /^\s*yes/i.test(String(order?.["Advance Paid"] || ""));
  return advPaid ? 99 : 0;
}

// Build the sheet "Books List" cell from a book set.
export function formatBooksListLines(books) {
  return (books || [])
    .map((b, i) => {
      const qty = Number(b.qty) || 1;
      const price = Math.round(Number(b.price) || 0);
      return `${i + 1}. ${b.name} | Qty: ${qty} | ₹${price} each | Total: ₹${price * qty}`;
    })
    .join("\n");
}

// Recompute the full bill for a set of books on an existing order.
//   books: [{ name, qty, price }]  (price = selling / discounted price)
// Returns absolute rupee amounts + the flags used, so the UI can show a clear
// old-vs-new breakdown before the operator confirms.
export function recomputeOrderBill(order, books, opts = {}) {
  const list = (books || []).map((b) => ({
    name: b.name,
    qty: Number(b.qty) || 1,
    price: Math.round(Number(b.price) || 0),
  }));
  const sub = list.reduce((s, b) => s + b.price * b.qty, 0);
  const hasOneRupee = list.some((b) => b.price === 1);
  // When `ignoreOneRupeeThreshold` is set, the cart is priced as a NORMAL cart
  // (free delivery from ₹199) — i.e. the ₹1-book ₹399 free-delivery threshold
  // is waived so a swap never adds the below-₹399 ₹100 handling fee.
  const effOneRupee = opts.ignoreOneRupeeThreshold ? false : hasOneRupee;
  const isFaster = /faster|express/i.test(String(order?.["Delivery Type"] || ""));
  const isCOD = /cash on delivery|cod/i.test(
    String(order?.["Payment Type"] || ""),
  );

  const delivery = getDeliveryCharge(sub, isFaster, effOneRupee);

  // Best flat offer whose target the new subtotal reaches.
  const offers = getCartOffers(effOneRupee).filter((o) => o.type === "flat");
  const bestOffer = [...offers]
    .sort((a, b) => b.target - a.target)
    .find((o) => sub >= o.target);
  const offer = bestOffer ? Number(bestOffer.value) || 0 : 0;

  // Keep the order's existing gift-wrap charge when gift wrap was chosen.
  const giftFee = /yes/i.test(String(order?.["Gift Wrap"] || ""))
    ? Math.round(Number(order?.["Gift Wrap Charge"]) || 0)
    : 0;

  const preFee = Math.max(0, sub + delivery + giftFee - offer);
  const codFee = isCOD ? getCodFee(preFee) : 0;
  const grand = preFee + codFee;

  return {
    sub,
    delivery,
    offer,
    giftFee,
    codFee,
    grand,
    hasOneRupee,
    isFaster,
    isCOD,
    booksList: formatBooksListLines(list),
  };
}
