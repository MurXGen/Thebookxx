// Same coupon API + rules as the website checkout (src/app/api/coupons, AddressModal):
// a coupon REPLACES the cart offer (flat reward + combo) instead of stacking,
// works on books + delivery + add-ons, and is only used when it saves more.
import { API } from "@/theme";

export type Coupon = { code: string; title: string; type: "flat" | "percent"; value: number; maxDiscount: number; minOrder: number; status?: string; usable?: boolean; reason?: string };

export async function fetchCoupons(cartValue: number): Promise<Coupon[]> {
  try {
    const r = await fetch(`${API}/api/coupons?cartValue=${Math.round(cartValue)}`);
    const j = await r.json();
    return Array.isArray(j.coupons) ? j.coupons : [];
  } catch {
    return [];
  }
}

export async function validateCoupon(code: string, cartValue: number): Promise<{ ok: boolean; coupon?: Coupon; reason?: string }> {
  try {
    const r = await fetch(`${API}/api/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate", code: code.trim().toUpperCase(), cartValue: Math.round(cartValue) }),
    });
    const j = await r.json();
    if (j.ok && j.discount > 0) return { ok: true, coupon: { code: j.code, title: j.title, type: j.type, value: j.value, maxDiscount: j.maxDiscount || 0, minOrder: j.minOrder || 0 } };
    return { ok: false, reason: j.reason || "This code can’t be used" };
  } catch {
    return { ok: false, reason: "Couldn’t check the code. Try again." };
  }
}

export const redeemCoupon = (code: string) =>
  fetch(`${API}/api/coupons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "redeem", code }) }).catch(() => {});

// Discount on a bill base (books + delivery + add-ons, before offers).
export function couponOff(c: Coupon | null, base: number, itemsAfterOffers: number) {
  if (!c) return { off: 0, short: 0 };
  if (c.minOrder > 0 && itemsAfterOffers < c.minOrder) return { off: 0, short: c.minOrder - itemsAfterOffers };
  let d = c.type === "flat" ? Math.min(c.value, base) : Math.round((base * c.value) / 100);
  if (c.type === "percent" && c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
  return { off: Math.max(0, Math.min(d, base)), short: 0 };
}

export const couponAmt = (c: Coupon) => (c.type === "percent" ? `${c.value}%` : `₹${c.value}`);
