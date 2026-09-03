"use client";

// Small IndexedDB cache for the profile page. It stores each phone's last
// successful profile snapshot (orders, wallet, name, pending) plus a rolling
// list of load timestamps. When a shopper reloads / refreshes the profile more
// than the allowed number of times within a minute, the page serves this cached
// snapshot instead of calling the order / wallet APIs again — protecting the
// Google Sheet backend from rapid repeat reads.

const DB_NAME = "tbx_profile";
const STORE = "profile";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "phone" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const key = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

// Read the cached snapshot for a phone (or null).
export async function readProfileCache(phone) {
  const k = key(phone);
  if (k.length !== 10) return null;
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(k);
      req.onsuccess = () => {
        resolve(req.result || null);
        db.close();
      };
      req.onerror = () => {
        resolve(null);
        db.close();
      };
    });
  } catch {
    return null;
  }
}

async function putRecord(rec) {
  try {
    const db = await openDB();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(rec);
      tx.oncomplete = () => {
        resolve();
        db.close();
      };
      tx.onerror = () => {
        resolve();
        db.close();
      };
    });
  } catch {
    /* ignore — cache is best-effort */
  }
}

// Persist a fresh profile snapshot, preserving the existing load timestamps.
export async function saveProfileData(phone, data) {
  const k = key(phone);
  if (k.length !== 10) return;
  const prev = await readProfileCache(k);
  await putRecord({
    phone: k,
    loads: prev?.loads || [],
    ...data,
    savedAt: Date.now(),
  });
}

// Record a load attempt and return how many loads have happened within the
// trailing `windowMs` (including this one). Old timestamps are pruned.
export async function recordLoad(phone, windowMs = 60000) {
  const k = key(phone);
  if (k.length !== 10) return 0;
  const prev = await readProfileCache(k);
  const now = Date.now();
  const loads = [
    ...((prev?.loads || []).filter((t) => now - t < windowMs)),
    now,
  ];
  await putRecord({ phone: k, ...(prev || {}), loads });
  return loads.length;
}
