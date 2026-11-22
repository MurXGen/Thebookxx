// One place for the parcel-tracking link. India Post has no working deep link
// to a single consignment, so we use Track91, which opens straight onto the
// parcel's timeline and lets the customer turn on email / push / Telegram
// alerts. Only real article numbers (Speed "E…" / Contractual "C…", e.g.
// EM212310773IN) get the deep link; anything else falls back to India Post.

export const INDIA_POST_HOME = "https://www.indiapost.gov.in/";

export function cleanTrackingId(id) {
  return String(id || "").trim().replace(/\s+/g, "").toUpperCase();
}

export function isPostTrackingId(id) {
  return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(cleanTrackingId(id));
}

export function trackingUrl(id) {
  const n = cleanTrackingId(id);
  if (!isPostTrackingId(n)) return INDIA_POST_HOME;
  return `https://track91.com/india-post/track?n=${encodeURIComponent(n)}`;
}
