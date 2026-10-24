// Pending checkouts — carts the shopper started checking out (tapped the
// checkout CTA) but didn't finish paying. Stored locally so the bag page can
// show them and let the shopper resume exactly where they left off.
//
// Entry shape:
//   { id, createdAt, cart: [{id, qty}], details: <checkoutAddress snapshot>,
//     total, count, title, cover }

const KEY = "tbx_pending_checkouts";
const MAX = 20;
const EVT = "tbx-pending-changed";

export function readPending() {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

// Add (or replace by id) a pending checkout — newest first.
export function addPending(entry) {
  write([entry, ...readPending().filter((e) => e.id !== entry.id)]);
}

export function updatePending(id, patch) {
  write(readPending().map((e) => (e.id === id ? { ...e, ...patch } : e)));
}

export function removePending(id) {
  write(readPending().filter((e) => e.id !== id));
}

export function clearPending() {
  write([]);
}

export const PENDING_EVENT = EVT;
