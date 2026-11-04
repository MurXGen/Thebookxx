// Client-side cache + rate limiter for the customer's profile/order data.
//
// Goal: stop the profile pages from re-hitting the orders API (a serverless
// function + Google Sheet read) every time the user opens or refreshes them.
// Fresh results are cached for a short TTL, and loads are capped to LIMIT per
// rolling WINDOW so rapid refreshes fall back to the cache with a countdown.
//
// Tunable knobs:
//   LIMIT  – how many live loads are allowed inside the window
//   WINDOW – the rolling window / cooldown length (the "2-minute counter")
//   TTL    – how long a cached payload is considered fresh (no refetch)
export const RATE_LIMIT = 2;
export const RATE_WINDOW_MS = 120000; // 2 minutes
export const CACHE_TTL_MS = 120000; // 2 minutes

const cacheKey = (phone) => `tbx_orders_cache_${phone}`;
const rateKey = (phone) => `tbx_orders_loads_${phone}`;

const safeParse = (raw, fallback) => {
  try {
    const v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
};

// ---- Cache (sessionStorage; raw API rows so processing stays client-side) ----
export function getCachedOrders(phone) {
  if (typeof window === "undefined") return null;
  try {
    const entry = safeParse(sessionStorage.getItem(cacheKey(phone)), null);
    if (!entry || !Array.isArray(entry.rows)) return null;
    const age = Date.now() - (entry.ts || 0);
    return { rows: entry.rows, ts: entry.ts || 0, fresh: age < CACHE_TTL_MS };
  } catch {
    return null;
  }
}

export function setCachedOrders(phone, rows) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      cacheKey(phone),
      JSON.stringify({ ts: Date.now(), rows: Array.isArray(rows) ? rows : [] }),
    );
  } catch {}
}

// ---- Rate limiter (rolling window of load timestamps) ----
function readLoads(phone) {
  if (typeof window === "undefined") return [];
  const now = Date.now();
  const list = safeParse(sessionStorage.getItem(rateKey(phone)), []);
  return (Array.isArray(list) ? list : []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
}

// Can we do a live load right now? Returns { allowed, waitSec }.
// waitSec = whole seconds until a slot frees up (for the countdown toast).
export function canLoad(phone) {
  const loads = readLoads(phone);
  if (loads.length < RATE_LIMIT) return { allowed: true, waitSec: 0 };
  const oldest = Math.min(...loads);
  const waitMs = Math.max(0, RATE_WINDOW_MS - (Date.now() - oldest));
  return { allowed: false, waitSec: Math.ceil(waitMs / 1000) };
}

// Record that a live load just happened.
export function recordLoad(phone) {
  if (typeof window === "undefined") return;
  try {
    const loads = readLoads(phone);
    loads.push(Date.now());
    sessionStorage.setItem(rateKey(phone), JSON.stringify(loads));
  } catch {}
}
