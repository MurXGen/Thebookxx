// Refund statuses set from Manage Orders (More → Process refund / Mark refund
// done) and shown on the customer's order page.
export const REFUND_IN_PROCESS = "Refund in process";
export const REFUND_DONE = "Refund done";
export const isRefundInProcess = (s) => /refund\s*in\s*process/i.test(String(s || ""));
export const isRefundDone = (s) => /refund\s*(done|sent|completed)/i.test(String(s || ""));
export const isRefundStatus = (s) => isRefundInProcess(s) || isRefundDone(s);

// Refund promised within 48–72 h; after this the order page offers WhatsApp.
export const REFUND_LATE_MS = 72 * 60 * 60 * 1000;
