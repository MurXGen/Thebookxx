// One shared, cached India Post pincode lookup for the delivery stripe and
// checkout. Each pincode is fetched at most once per browser: results are kept
// in localStorage, and simultaneous lookups of the same pincode share one
// request.

const CACHE_KEY = "tbx_pin_cache";
const MAX_ENTRIES = 30;
const inflight = new Map();

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeCache(pin, entry) {
  try {
    const cache = readCache();
    cache[pin] = { ...entry, t: Date.now() };
    const keys = Object.keys(cache);
    if (keys.length > MAX_ENTRIES) {
      keys
        .sort((a, b) => (cache[a].t || 0) - (cache[b].t || 0))
        .slice(0, keys.length - MAX_ENTRIES)
        .forEach((k) => delete cache[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full / blocked: still works, just uncached */
  }
}

// Cached result for a pincode, or null if it hasn't been looked up yet.
export function cachedPincode(pin) {
  const p = String(pin || "");
  if (!/^\d{6}$/.test(p)) return null;
  return readCache()[p] || null;
}

// { ok: true, city, district, area, state } for a real pincode,
// { ok: false } when India Post doesn't know it,
// { ok: null } when the lookup failed (offline / API down; not cached).
export function lookupPincode(pin) {
  const p = String(pin || "");
  if (!/^\d{6}$/.test(p)) return Promise.resolve({ ok: false });
  const hit = cachedPincode(p);
  if (hit) return Promise.resolve(hit);
  if (inflight.has(p)) return inflight.get(p);

  const req = fetch(`https://api.postalpincode.in/pincode/${p}`)
    .then((r) => r.json())
    .then((d) => {
      let entry;
      if (d?.[0]?.Status === "Success") {
        const po = d[0].PostOffice?.[0] || {};
        entry = {
          ok: true,
          city: po.District || "",
          district: po.District || "",
          area: po.Name || "",
          state: po.State || "",
        };
      } else {
        entry = { ok: false };
      }
      writeCache(p, entry);
      return entry;
    })
    .catch(() => ({ ok: null }))
    .finally(() => inflight.delete(p));

  inflight.set(p, req);
  return req;
}

// The pincode the shopper saved in the delivery stripe under the navbar.
export function stripePincode() {
  try {
    const p = String(localStorage.getItem("delivery_pincode") || "").replace(/\D/g, "");
    return p.length === 6 ? p : "";
  } catch {
    return "";
  }
}
