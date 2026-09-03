"use client";

// Stale-while-revalidate cache for the profile page. The last successful
// snapshot (orders, pending, wallet, name) is stored in localStorage keyed by
// phone so a returning shopper sees their profile instantly on boot, while a
// fresh copy is fetched in the background and swapped in. localStorage is
// synchronous, so the cached read happens the moment the page mounts — no long
// skeleton wait.

const keyFor = (phone) =>
  `tbx_profile_cache_${String(phone || "").replace(/\D/g, "").slice(-10)}`;

const isValidPhone = (phone) =>
  String(phone || "").replace(/\D/g, "").slice(-10).length === 10;

// Read a cached snapshot for a phone (or null).
export function readProfileCache(phone) {
  if (typeof window === "undefined" || !isValidPhone(phone)) return null;
  try {
    const raw = localStorage.getItem(keyFor(phone));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && Array.isArray(data.orders) ? data : null;
  } catch {
    return null;
  }
}

// Persist a fresh snapshot (stamped with savedAt).
export function saveProfileCache(phone, data) {
  if (typeof window === "undefined" || !isValidPhone(phone)) return;
  try {
    localStorage.setItem(
      keyFor(phone),
      JSON.stringify({ ...data, savedAt: Date.now() }),
    );
  } catch {
    /* quota / disabled storage — cache is best-effort */
  }
}

// Drop a phone's snapshot (on logout / switching numbers).
export function clearProfileCache(phone) {
  if (typeof window === "undefined" || !isValidPhone(phone)) return;
  try {
    localStorage.removeItem(keyFor(phone));
  } catch {
    /* ignore */
  }
}
