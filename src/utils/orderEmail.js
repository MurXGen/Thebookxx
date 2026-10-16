// Client helpers for TheBookX order emails. They POST to our own
// /api/order-email proxy (which forwards to the journalx mail service). The
// email body carries the full order + bill breakdown; a PNG invoice is
// attached when `invoiceBase64` is supplied.

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// Build the normalised `order` object the email templates expect from a sheet
// order row (used by manage-orders). Reads the itemised billing columns.
export function orderEmailFromRow(row, items) {
  const advancePaid = /^\s*yes/i.test(String(row["Advance Paid"] || ""));
  const grand = num(row["Total Amount"]);
  const advanceAmount = advancePaid ? num(row["Advance Amount"]) || 99 : 0;
  const isCOD =
    /cash on delivery|\bcod\b|advance/i.test(String(row["Payment Type"] || "")) ||
    advancePaid;
  const phone = String(row["Phone Number"] || "").replace(/\D/g, "").slice(-10);
  const oid = String(row["Order ID"] || "");
  return {
    orderId: oid,
    name: String(row["Customer Name"] || "").replace(/\(unconfirmed\)/i, "").trim(),
    items: items || [],
    isCOD,
    paymentType: String(row["Payment Type"] || ""),
    deliveryType: String(row["Delivery Type"] || ""),
    trackUrl: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
    orderUrl:
      phone.length === 10
        ? `https://www.thebookx.in/profile/${phone}/orders/${encodeURIComponent(oid)}`
        : "",
    bill: {
      mrp: num(row["Total MRP"]),
      itemDiscount: num(row["Item Discount"]),
      subtotal: num(row["Subtotal"]),
      delivery: num(row["Delivery Charge"]),
      giftWrap: num(row["Gift Wrap Charge"]),
      bookmarks: num(row["Bookmark Charge"]),
      quickReads: num(row["QuickReads Total"]),
      offerDiscount: num(row["Offer Discount"]),
      couponDiscount: num(row["Coupon Discount"]),
      wallet: num(row["Wallet Applied"]),
      codFee: num(row["COD Fee"]),
      grand,
      advanceAmount,
      payOnDelivery: num(row["COD Collectible"]) || Math.max(0, grand - advanceAmount),
    },
  };
}

async function post(payload) {
  try {
    const res = await fetch("/api/order-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    return !!json.success;
  } catch {
    return false;
  }
}

export function sendOrderConfirmationEmail({ to, order, invoiceBase64 }) {
  if (!to || !order) return Promise.resolve(false);
  return post({ type: "confirmation", to, order, invoiceBase64 });
}

export function sendOrderStatusEmail({ to, order, status, tracking, invoiceBase64 }) {
  if (!to || !order) return Promise.resolve(false);
  return post({ type: "status", to, order, status, tracking, invoiceBase64 });
}
