// Per-device launch offer: the first time a shopper opens a book page, a
// 2-hour offer starts on that device. When it ends, every book (except ₹1
// deals) costs a flat ₹20 more on that device. The rise is REAL — it applies to
// book pages, cards, search, the bag, checkout and the order row — so the
// countdown is truthful.
//
// The prices are raised by adjusting the shared `books` list once in the
// browser (see <OfferPricing/>), so every module reads the same number.
// Server-rendered surfaces (feeds, schema, AI APIs) keep the base price,
// which is what new visitors see.

export const OFFER_MINUTES = 120;
export const PRICE_RISE = 20; // ₹ added per book after the offer ends
const START_KEY = "tbx_offer_start";
const END_KEY = "tbx_offer_end"; // set from the sheet when you extend/shorten
const SYNC_KEY = "tbx_offer_sync";
export const WA_NUMBER = "917710892108";
const LOGGED_KEY = "tbx_offer_logged"; // "start" | "expired"
export const PRICES_EVENT = "tbx:prices-changed";

const OFFER_MS = OFFER_MINUTES * 60 * 1000;

export function deviceId() {
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

// { started, endsAt, expired } for this device (nothing started → started=false)
export function offerState(now = Date.now()) {
  try {
    const start = Number(localStorage.getItem(START_KEY) || 0);
    if (!start) return { started: false, endsAt: 0, expired: false };
    const endsAt = Number(localStorage.getItem(END_KEY) || 0) || start + OFFER_MS;
    return { started: true, endsAt, expired: now >= endsAt };
  } catch {
    return { started: false, endsAt: 0, expired: false };
  }
}

// Send an event to the Timers tab. Resolves true only when the server says the
// sheet accepted it.
function log(action, extra = {}) {
  try {
    return fetch("/api/timers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ action, deviceId: deviceId(), ...extra }),
    })
      .then((r) => r.json())
      .then((d) => !!d?.success)
      .catch(() => false);
  } catch {
    return Promise.resolve(false);
  }
}

const LOGGED_OK_KEY = "tbx_offer_row"; // "1" once the sheet has this device's row

const START_SENT_KEY = "tbx_offer_start_sent"; // when "start" was last sent

function logStart(start, end, book, page) {
  try {
    localStorage.setItem(START_SENT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  return log("start", { startedAt: start, endsAt: end, book, page }).then((ok) => {
    try {
      if (ok) localStorage.setItem(LOGGED_OK_KEY, "1");
    } catch {
      /* ignore */
    }
    return ok;
  });
}

// Called from a book page: starts the clock on first visit. Returns the state.
export function startOffer(book) {
  const s = offerState();
  if (s.started) return s;
  try {
    const start = Date.now();
    localStorage.setItem(START_KEY, String(start));
    localStorage.setItem(END_KEY, String(start + OFFER_MS));
    localStorage.setItem(LOGGED_KEY, "start");
    try {
      localStorage.setItem("tbx_offer_first", JSON.stringify({ book: book?.name || "", page: window.location.pathname }));
    } catch {
      /* ignore */
    }
    logStart(start, start + OFFER_MS, book?.name || "", window.location.pathname);
    window.dispatchEvent(new Event("tbx:offer-started"));
    return { started: true, endsAt: start + OFFER_MS, expired: false };
  } catch {
    return s;
  }
}

// Mark the sheet row Expired once per device.
export function logExpiredOnce() {
  try {
    if (localStorage.getItem(LOGGED_KEY) === "expired") return;
    localStorage.setItem(LOGGED_KEY, "expired");
    log("expired");
  } catch {
    /* ignore */
  }
}

// Pull this device's "Ends At" from the Timers sheet (you can edit it there to
// extend or shorten the offer). Throttled; returns true if the end changed.
export async function syncOfferFromSheet({ force = false } = {}) {
  try {
    if (!localStorage.getItem(START_KEY)) return false;
    const last = Number(localStorage.getItem(SYNC_KEY) || 0);
    if (!force && Date.now() - last < 60 * 1000) return false;
    localStorage.setItem(SYNC_KEY, String(Date.now()));
    const r = await fetch(`/api/timers?deviceId=${encodeURIComponent(deviceId())}`, { cache: "no-store" });
    const d = await r.json();
    const end = Number(d?.endsAt || 0);
    // Self-heal: the device's timer is running but the sheet has no row (the
    // first "start" was lost) → send it again. The server ignores duplicates.
    // Skip when a start went out in the last 2 minutes: on the first book
    // page the start POST and this check race, and both would append a row.
    if (!d?.found) {
      const sentAt = Number(localStorage.getItem(START_SENT_KEY) || 0);
      if (localStorage.getItem(LOGGED_OK_KEY) === "1" || Date.now() - sentAt < 2 * 60 * 1000) return false;
      const s0 = Number(localStorage.getItem(START_KEY) || 0);
      let first = {};
      try {
        first = JSON.parse(localStorage.getItem("tbx_offer_first") || "{}") || {};
      } catch {
        /* ignore */
      }
      if (s0) logStart(s0, offerState().endsAt, first.book || "", first.page || window.location.pathname);
      return false;
    }
    try {
      localStorage.setItem(LOGGED_OK_KEY, "1");
    } catch {
      /* ignore */
    }
    if (!end) return false;
    const cur = offerState().endsAt;
    if (Math.abs(end - cur) < 30 * 1000) return false;
    const wasExpired = Date.now() >= cur;
    localStorage.setItem(END_KEY, String(end));
    if (wasExpired && Date.now() < end) {
      localStorage.setItem(LOGGED_KEY, "start"); // a later end can be logged again
      log("resumed", { endsAt: end });
    }
    return true;
  } catch {
    return false;
  }
}

// "Extend offer for me": note it in the sheet and open WhatsApp with the
// device ID so the team can find the row and move its "Ends At".
export function requestExtension() {
  const id = deviceId();
  log("extend-request");
  try {
    localStorage.setItem(SYNC_KEY, "0"); // check the sheet again on return
  } catch {
    /* ignore */
  }
  // A short ID (the device ID's last 6 characters): find it in the Timers tab
  // with Ctrl+F on the Device ID column.
  const shortId = id.slice(-6);
  const text = `Hi TheBookX, please extend my offer price timer.\nMy ID: ${shortId}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

let raised = false;
export const pricesRaised = () => raised;

// Undo the rise (offer extended from the sheet).
export function revertPriceRise(list) {
  for (const b of list) if (b._basePrice != null) b.discountedPrice = b._basePrice;
  raised = false;
}

// Raise prices in place (idempotent). ₹1 deals stay ₹1; never above MRP.
export function applyPriceRise(list) {
  raised = true;
  for (const b of list) {
    if (b._basePrice == null) b._basePrice = b.discountedPrice;
    const base = Number(b._basePrice);
    if (!(base > 1)) continue;
    const mrp = Number(b.originalPrice) || Infinity;
    b.discountedPrice = Math.min(base + PRICE_RISE, mrp);
  }
}

export const priceMode = () => (offerState().expired ? `+₹${PRICE_RISE}` : "Offer");
