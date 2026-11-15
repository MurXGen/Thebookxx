// Coupon picked in the bag (e.g. WELCOME10 from the welcome popup). Stored
// locally so checkout picks it up; checkout re-checks the rule and the Coupons
// sheet is only touched when the order is placed (redeem).

export const BAG_COUPON_KEY = "tbx_bag_coupon";
export const BAG_COUPON_EVENT = "tbx:bag-coupon";
export const WELCOME_CODE = "WELCOME10";

export function readBagCoupon() {
  try {
    const c = JSON.parse(localStorage.getItem(BAG_COUPON_KEY) || "null");
    return c && c.code ? c : null;
  } catch {
    return null;
  }
}

export function saveBagCoupon(c) {
  try {
    if (c) localStorage.setItem(BAG_COUPON_KEY, JSON.stringify(c));
    else localStorage.removeItem(BAG_COUPON_KEY);
    window.dispatchEvent(new Event(BAG_COUPON_EVENT));
  } catch {
    /* storage blocked */
  }
}

// Discount a coupon rule gives on `base` (same maths as checkout).
// `eligibleValue` is the item value checked against the minimum order.
export function bagCouponOff(c, base, eligibleValue) {
  if (!c) return { off: 0, short: 0 };
  const min = Number(c.minOrder) || 0;
  if (min > 0 && eligibleValue < min) return { off: 0, short: Math.ceil(min - eligibleValue) };
  const b = Math.max(0, base);
  let d = c.type === "flat" ? Math.min(c.value || 0, b) : Math.round((b * (c.value || 0)) / 100);
  if (c.type === "percent" && c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
  return { off: Math.max(0, Math.min(d, b)), short: 0 };
}
