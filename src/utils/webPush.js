"use client";

// Browser push notifications (order tracking with a live link, new arrivals,
// offers, bag + wishlist reminders). The subscription and the reader's choices
// are saved per device in the "Web Push" sheet tab via /api/push/subscribe;
// the daily 12 PM job and broadcasts send from there.

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const PREFS_KEY = "tbx_push_prefs";
const ON_KEY = "tbx_push_on";
const ROW_KEY = "tbx_push_row";
const SNAP_KEY = "tbx_push_snap";
export const PUSH_ASKED_KEY = "tbx_push_asked_at";

export const PUSH_TOPICS = [
  { key: "orders", label: "Order & tracking updates", hint: "Status changes with a live tracking link" },
  { key: "arrivals", label: "New book arrivals", hint: "Fresh titles the day they land" },
  { key: "offers", label: "Offers & price drops", hint: "Sales, coupons and limited deals" },
  { key: "cart", label: "Bag reminders", hint: "When books are waiting in your bag" },
  { key: "wishlist", label: "Wishlist alerts", hint: "Deals on books you saved" },
];
const DEFAULT_PREFS = { orders: true, arrivals: true, offers: true, cart: true, wishlist: true };

export function pushSupported() {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!VAPID;
}

// iPhone/iPad only allow web push for sites added to the Home Screen (iOS 16.4+).
export function isIosBrowser() {
  if (typeof navigator === "undefined") return false;
  if (/android/i.test(navigator.userAgent)) return false;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone;
  return ios && !standalone;
}

export function pushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export function isPushOn() {
  try {
    return pushPermission() === "granted" && localStorage.getItem(ON_KEY) === "1";
  } catch {
    return false;
  }
}

export function getPushPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function getDeviceId() {
  try {
    let id = localStorage.getItem("tbx_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem("tbx_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

function who() {
  let phone = "";
  let name = "";
  try {
    phone = String(localStorage.getItem("track_orders_phone") || "").replace(/\D/g, "").slice(-10);
    name = String(localStorage.getItem("track_orders_name") || "").trim();
  } catch {}
  return { deviceId: getDeviceId(), phone, name };
}

// Bag + wishlist as book ids, plus when each last changed (the 13:00 bag and
// 20:30 wishlist reminders are spaced from that day).
function snapshot() {
  const ids = (k, pick) => {
    try {
      const v = JSON.parse(localStorage.getItem(k) || "[]");
      return Array.isArray(v) ? v.map(pick).filter(Boolean) : [];
    } catch {
      return [];
    }
  };
  const cart = ids("cart", (c) => (c?.id ? `${c.id}${c.qty > 1 ? `x${c.qty}` : ""}` : "")).join(",");
  const wishlist = ids("wishlist", (w) => (typeof w === "string" ? w : w?.id || "")).join(",");
  let prev = {};
  try {
    prev = JSON.parse(localStorage.getItem(SNAP_KEY) || "{}") || {};
  } catch {}
  const now = new Date().toISOString();
  const out = { cart, wishlist };
  if (cart !== prev.cart) out.cartAt = now;
  if (wishlist !== prev.wishlist) out.wishlistAt = now;
  return out;
}
function rememberSnapshot(s) {
  try {
    localStorage.setItem(SNAP_KEY, JSON.stringify({ cart: s.cart, wishlist: s.wishlist }));
  } catch {}
}

function changed() {
  try {
    window.dispatchEvent(new Event("tbx:push-changed"));
  } catch {}
}

async function post(body) {
  let known = false;
  try {
    known = localStorage.getItem(ROW_KEY) === body.deviceId;
  } catch {}
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ ...body, known }),
    });
    const json = await res.json().catch(() => ({}));
    if (json?.ok) {
      try {
        localStorage.setItem(ROW_KEY, body.deviceId);
      } catch {}
    }
    return !!json?.ok;
  } catch {
    return false;
  }
}

function urlB64ToUint8(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  if (!existing) await navigator.serviceWorker.register("/service-worker.js");
  return navigator.serviceWorker.ready;
}

// Must be called from a tap (browsers only show the prompt on a user gesture).
// Returns "granted" | "denied" | "default" | "unsupported" | "ios-install" | "error".
export async function enablePush(prefs = getPushPrefs()) {
  if (isIosBrowser() && !("PushManager" in window)) return "ios-install";
  if (!pushSupported()) return "unsupported";
  let perm = Notification.permission;
  if (perm === "default") {
    try {
      perm = await Notification.requestPermission();
    } catch {
      perm = Notification.permission;
    }
  }
  if (perm !== "granted") {
    changed();
    return perm;
  }
  try {
    const reg = await getRegistration();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(VAPID) });
    }
    const next = { ...DEFAULT_PREFS, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    localStorage.setItem(ON_KEY, "1");
    const snap = snapshot();
    if (await post({ action: "subscribe", ...who(), subscription: sub.toJSON(), prefs: next, ...snap })) rememberSnapshot(snap);
    changed();
    return "granted";
  } catch {
    changed();
    return "error";
  }
}

export async function disablePush() {
  try {
    localStorage.setItem(ON_KEY, "0");
  } catch {}
  changed();
  await post({ action: "prefs", ...who(), enabled: false });
}

export async function savePushPrefs(prefs) {
  const next = { ...getPushPrefs(), ...prefs };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {}
  changed();
  if (isPushOn()) await post({ action: "prefs", ...who(), enabled: true, prefs: next });
  return next;
}

// Keep the bag / wishlist snapshot fresh for the timed reminders (only for
// readers who turned notifications on; debounced so edits batch up).
let snapTimer = null;
let lastSnap = "";
export function syncPushSnapshot() {
  if (typeof window === "undefined" || !isPushOn()) return;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    const s = snapshot();
    const id = who();
    const sig = `${s.cart}|${s.wishlist}|${id.phone}`;
    if (sig === lastSnap) return;
    lastSnap = sig;
    post({ action: "snapshot", ...id, ...s }).then((ok) => ok && rememberSnapshot(s));
  }, 4000);
}
