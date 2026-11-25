"use client";

// Manage-orders read cache in IndexedDB. Sheet / API reads are reused for a
// few minutes (the operator picks how long) instead of being fetched again on
// every page load — fewer Google Sheets + API calls. The refresh button and
// any write clears it, so edits never show stale data.

const DB_NAME = "tbx-mo-cache";
const STORE = "kv";
export const CACHE_MIN_KEY = "mo_cache_min";
export const CACHE_OPTIONS = [0, 1, 2, 5, 10, 15, 30]; // minutes; 0 = off
const DEFAULT_MIN = 5;

let dbP = null;
function db() {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("no idb"));
  if (!dbP) {
    dbP = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch((e) => {
      dbP = null;
      throw e;
    });
  }
  return dbP;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
const idbGet = (k) => tx("readonly", (s) => s.get(k));
const idbSet = (k, v) => tx("readwrite", (s) => s.put(v, k));

export function cacheMinutes() {
  try {
    const raw = localStorage.getItem(CACHE_MIN_KEY);
    if (raw === null) return DEFAULT_MIN;
    const n = Number(raw);
    return CACHE_OPTIONS.includes(n) ? n : DEFAULT_MIN;
  } catch {
    return DEFAULT_MIN;
  }
}
export function setCacheMinutes(n) {
  try {
    localStorage.setItem(CACHE_MIN_KEY, String(n));
  } catch {}
  if (!n) invalidateCache();
}

// GET `url` as text, reusing a copy younger than the chosen minutes.
// → { text, at (ms it was fetched), cached (true = served from IndexedDB) }
export async function cachedText(key, url, { force = false, init } = {}) {
  const ttl = cacheMinutes() * 60000;
  if (!force && ttl > 0) {
    try {
      const hit = await idbGet(key);
      if (hit && typeof hit.text === "string" && Date.now() - hit.at < ttl) {
        return { text: hit.text, at: hit.at, cached: true };
      }
    } catch {}
  }
  // Time's up (or forced): clear the old copy — and any other expired ones —
  // before the fresh copy is stored.
  await purgeExpired(ttl, key);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const at = Date.now();
  if (ttl > 0) idbSet(key, { at, text }).catch(() => {});
  return { text, at, cached: false };
}
export async function cachedJson(key, url, opts) {
  const r = await cachedText(key, url, opts);
  return { ...r, json: JSON.parse(r.text) };
}

// Delete `key` plus every entry older than `ttl` ms (all of them when off).
async function purgeExpired(ttl, key) {
  try {
    const d = await db();
    await new Promise((resolve) => {
      const t = d.transaction(STORE, "readwrite");
      const st = t.objectStore(STORE);
      if (key) st.delete(key);
      const cur = st.openCursor();
      cur.onsuccess = () => {
        const c = cur.result;
        if (!c) return;
        if (!ttl || !c.value?.at || Date.now() - c.value.at >= ttl) c.delete();
        c.continue();
      };
      t.oncomplete = resolve;
      t.onerror = resolve;
      t.onabort = resolve;
    });
  } catch {}
}

// Drop cached entries (all when no keys) — after a write or a manual refresh.
export function invalidateCache(...keys) {
  return tx("readwrite", (s) => (keys.length ? keys.forEach((k) => s.delete(k)) : s.clear())).catch(() => {});
}
