// UPI orders whose shopper tapped "I've paid, verify status" before we
// confirmed the payment. The status still contains "Unconfirmed", so every
// existing check keeps treating the order as unpaid until the team marks it
// (Telegram Passed → Processing, Failed → "Unconfirmed (Payment Failed)").
export const PAYMENT_PENDING_STATUS = "Unconfirmed (Payment Pending)";
export const isPaymentPending = (status) => /payment\s*pending/i.test(String(status || ""));

// "Pending payment" (set from Manage Orders): the customer still has to pay.
// Different from the above, where they say they paid and we're verifying.
export const PENDING_PAYMENT_STATUS = "Pending payment";
export const isPaymentDue = (status) => {
  const s = String(status || "");
  return /pending\s*payment/i.test(s) && !/unconfirmed/i.test(s);
};

// After this long without confirmation the order page offers WhatsApp.
export const PENDING_NUDGE_MS = 15 * 60 * 1000;

const KEY = "tbx_pay_pending"; // { [orderId]: msSinceEpoch }

export function markPaymentPending(orderId) {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    if (!m[orderId]) m[orderId] = Date.now();
    // keep the last 20
    const keep = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(keep)));
  } catch {
    /* ignore */
  }
}

// When this device marked the order pending (ms), or 0.
export function pendingSince(orderId) {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    return Number(m[orderId] || 0);
  } catch {
    return 0;
  }
}
