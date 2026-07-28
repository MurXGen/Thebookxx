// Single source of truth for the shopper's phone across the app. It is set on
// the profile/track page (track_orders_phone), at pincode capture (user_pincode)
// and at checkout (checkoutAddress) — this reads whichever is available so the
// wallet, header and profile all know who the user is.

export function getSavedPhone() {
  if (typeof window === "undefined") return "";
  const clean = (v) => String(v || "").replace(/\D/g, "").slice(-10);
  try {
    const direct = clean(localStorage.getItem("track_orders_phone"));
    if (direct.length === 10) return direct;
  } catch (_) {}
  try {
    const pin = JSON.parse(localStorage.getItem("user_pincode") || "null");
    const p = clean(pin?.phone);
    if (p.length === 10) return p;
  } catch (_) {}
  try {
    const addr = JSON.parse(localStorage.getItem("checkoutAddress") || "null");
    const p = clean(addr?.phone);
    if (p.length === 10) return p;
  } catch (_) {}
  return "";
}

// True once the shopper is "known" (entered a number anywhere).
export function isPhoneKnown() {
  return getSavedPhone().length === 10;
}
