// TheBookX Exclusive (Pro) membership — client helpers.
// Reads/writes go through /api/pro (server reads the "Pro Plan" sheet tab).

export const PRO_PRICE = 99;
export const PRO_VALID_DAYS = 30;

const CACHE_KEY = "tbx_pro_status";

// Pro benefit constants (applied at checkout only for active members).
export const PRO_DISCOUNT = 0.2; // flat 20% off (best-of vs cart tier)
export const PRO_FREE_DELIVERY_MIN = 400; // free delivery on orders above ₹400
export const PRO_HANDLING_OFF = 0.5; // 50% off the handling & care fee

const norm = (p) => String(p || "").replace(/\D/g, "").slice(-10);

// Fetch live membership status for a phone.
export async function fetchProStatus(phone) {
  const digits = norm(phone);
  if (digits.length !== 10)
    return { active: false, status: "none", daysLeft: 0 };
  try {
    const res = await fetch(`/api/pro?phone=${digits}`);
    const json = await res.json();
    const out = {
      active: !!json.active,
      status: json.status || "none",
      expiresAt: json.expiresAt || null,
      daysLeft: json.daysLeft || 0,
    };
    // Cache the last known status per phone (so the cart can render instantly).
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ phone: digits, ...out, at: Date.now() }),
      );
    } catch {}
    return out;
  } catch {
    return { active: false, status: "none", daysLeft: 0 };
  }
}

// Last cached status for a phone (instant paint; always re-verify with fetch).
export function cachedProStatus(phone) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (norm(phone) && c.phone !== norm(phone)) return null;
    return c;
  } catch {
    return null;
  }
}

// Write a ₹99 "Unconfirmed" membership row → admin flips to Paid.
export async function startProPayment(phone) {
  const digits = norm(phone);
  if (digits.length !== 10) return { success: false };
  try {
    const res = await fetch("/api/pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: digits }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
