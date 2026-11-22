// Delivery windows by region. Fast-lane regions (Gujarat, Maharashtra, Goa,
// Delhi, Hyderabad, Bengaluru) keep the quick windows; everywhere else gets
// the longer ones. Detection uses the state/city text and falls back to the
// pincode prefix, so it works even when only one of them is known.

export const FAST_WINDOWS = { faster: [1, 6], standard: [5, 9] };
export const SLOW_WINDOWS = { faster: [3, 9], standard: [4, 12] };

const STATE_RE = /gujarat|maharashtra|\bgoa\b|delhi/i;
const CITY_RE = /hyderabad|secunderabad|bengaluru|bangalore|delhi/i;
// 36–39 Gujarat · 40–44 Maharashtra (403 = Goa) · 110 Delhi ·
// 500 Hyderabad · 560 Bengaluru
const PIN_RE = /^(3[6-9]|4[0-4]|110|500|560)\d+$/;

export function isFastRegion({ state, city, district, pincode } = {}) {
  if (STATE_RE.test(String(state || ""))) return true;
  if (CITY_RE.test(`${city || ""} ${district || ""}`)) return true;
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length === 6 && PIN_RE.test(pin)) return true;
  return false;
}

export function deliveryWindows(addr) {
  return isFastRegion(addr) ? FAST_WINDOWS : SLOW_WINDOWS;
}

export const windowText = ([a, b]) => `${a}–${b} days`;

// Read the order's address fields (sheet row) into the shape above.
export function addrFromOrder(order = {}) {
  const addr = String(order["Address"] || order["Full Address"] || "");
  const pinMatch = addr.match(/\b\d{6}\b/);
  return {
    state: order["State"] || addr,
    city: order["City"] || addr,
    district: order["District"] || "",
    pincode: order["Pincode"] || order["Pin Code"] || (pinMatch ? pinMatch[0] : ""),
  };
}

// The range a shopper is shown for a pincode (same rules as the bag):
// Maharashtra 1–5, other fast-lane regions 4–9, elsewhere the longer standard
// window; Faster delivery uses the region's faster window.
export function etaRangeFor({ pincode = "", state = "", city = "", faster = false } = {}) {
  const pin = String(pincode || "").replace(/\D/g, "");
  // No pincode yet → the site-wide promise.
  if (pin.length !== 6 && !state && !city) return faster ? [1, 6] : [4, 9];
  const addr = { pincode: pin, state, city };
  const win = deliveryWindows(addr);
  if (faster) return win.faster;
  if (pin.length === 6 && /^4[0-4]/.test(pin) && !pin.startsWith("403")) return [1, 5];
  return isFastRegion(addr) ? [4, 9] : win.standard;
}

// ── Delivery DATES ("Get it Wed 26 – Mon 1 Dec") ─────────────────────────────
// Shared by the book page, bag and checkout stripes. India time
// (Asia/Kolkata), not the device clock. `range` is calendar days from today.
//  • Mon–Fri before 12:00 → the range as is (e.g. 4–9 days).
//  • After 12:00, any time on Saturday, on Sunday or a holiday → one day more
//    (e.g. 5–10 days), as Sunday isn't a working day.
//  • A date landing on a Sunday or holiday moves to the next working day.
export const CUTOFF_HOUR = 12;


// Non-working days besides Sundays, as "YYYY-MM-DD" (India dates).
export const HOLIDAYS = new Set([
  // "2026-11-08", // e.g. Diwali
]);

const IST_OFFSET_MIN = 330; // UTC+5:30, no daylight saving
const DAY = 86400000;

// A Date whose UTC fields read as India wall-clock time.
const toIst = (ms) => new Date(ms + IST_OFFSET_MIN * 60000);
const key = (d) => d.toISOString().slice(0, 10);
const isWorkingDay = (d) => d.getUTCDay() !== 0 && !HOLIDAYS.has(key(d));

// Midnight (India) of the given India-time day.
const startOfDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const nextWorking = (d) => {
  let x = d;
  while (!isWorkingDay(x)) x = new Date(x.getTime() + DAY);
  return x;
};

// { from, to } — India-time Dates (read with getUTC*); shipsToday (ordered
// now, it leaves today); msToCutoff (time left for the faster window, 0 when
// past it); days [min, max] counted from today.
export function getDeliveryEta({ range = [4, 9], now = Date.now() } = {}) {
  const ist = toIst(now);
  const today = startOfDay(ist);
  const cutoff = today.getTime() + CUTOFF_HOUR * 3600000; // India wall-clock ms
  const beforeCutoff = ist.getTime() < cutoff;
  const working = isWorkingDay(today);
  const saturday = today.getUTCDay() === 6;
  const shipsToday = working && beforeCutoff;
  // The quick window: a working weekday before noon.
  const fastWindow = shipsToday && !saturday;
  const extra = fastWindow ? 0 : 1;
  const days = [range[0] + extra, range[1] + extra];
  return {
    range,
    days,
    shipsToday,
    msToCutoff: shipsToday ? cutoff - ist.getTime() : 0,
    from: nextWorking(new Date(today.getTime() + days[0] * DAY)),
    to: nextWorking(new Date(today.getTime() + days[1] * DAY)),
  };
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Wed 26 Nov"
export const fmtEtaDate = (d) => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`;

// "Wed 26 – Mon 1 Dec" (month shown once when both dates share it)
export function fmtEtaRange(from, to) {
  if (from.getUTCMonth() === to.getUTCMonth()) {
    return `${WD[from.getUTCDay()]} ${from.getUTCDate()} – ${fmtEtaDate(to)}`;
  }
  return `${fmtEtaDate(from)} – ${fmtEtaDate(to)}`;
}

// "2h 14m" / "38m"
export function fmtCountdown(ms) {
  const mins = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

// Calendar days from today (India) to a date — for "in 4–9 days" text.
export function daysFromToday(d, now = Date.now()) {
  return Math.round((d.getTime() - startOfDay(toIst(now)).getTime()) / DAY);
}
