// Per-device "added to bag" counts by where the add happened:
//   detail — the book page (main Add button, stepper, bundle)
//   card   — a book card / grid / search result anywhere else
// Totals live in localStorage and are sent (debounced, as absolute numbers, so
// a lost or repeated request never double-counts) to this device's row in the
// Timers tab: "Detail Adds" and "Card Adds".

import { deviceId } from "@/lib/offerTimer";

const KEY = "tbx_adds"; // { detail, card }
const SENT_KEY = "tbx_adds_sent"; // "detail:card" last accepted by the sheet

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    return { detail: Number(v.detail) || 0, card: Number(v.card) || 0 };
  } catch {
    return { detail: 0, card: 0 };
  }
}

let timer = null;

export function trackAddSource(source) {
  if (source !== "detail" && source !== "card") return;
  try {
    const t = read();
    t[source] += 1;
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    return;
  }
  scheduleAddsSync();
}

export function scheduleAddsSync(delay = 4000) {
  if (typeof window === "undefined") return;
  clearTimeout(timer);
  timer = setTimeout(syncAdds, delay);
}

// Send the totals if they changed since the sheet last accepted them. Devices
// without a Timers row yet (no book page opened) are skipped by the server and
// retried later (after the timer row is created, or on the next visit).
export async function syncAdds() {
  try {
    const t = read();
    if (!t.detail && !t.card) return;
    const sig = `${t.detail}:${t.card}`;
    if (localStorage.getItem(SENT_KEY) === sig) return;
    const id = deviceId();
    if (!id) return;
    const r = await fetch("/api/timers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ action: "adds", deviceId: id, detail: t.detail, card: t.card }),
    });
    const d = await r.json().catch(() => null);
    if (d?.success && !d?.skipped) localStorage.setItem(SENT_KEY, sig);
  } catch {
    /* retried on the next add / visit */
  }
}
