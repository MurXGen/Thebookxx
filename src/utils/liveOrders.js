// utils/liveOrders.js
//
// Live-order social-proof data. Real recent orders are pulled from the same
// Google Sheet the manage-orders dashboard uses; the sample RAW data below is
// only a fallback while the sheet loads or if the fetch fails. Only the
// customer's FIRST name + city are ever shown (privacy-preserving).

// Recent orders come from our own server route (/api/live-orders), which reads
// the sheet server-side and returns only privacy-safe fields. The sheet ID/URL
// is never exposed to the browser.
const PALETTE = [
  { bg: "#fff3e6", fg: "#fb8500" },
  { bg: "#e9f0ff", fg: "#3b6fe0" },
  { bg: "#e9f9ee", fg: "#0c9b46" },
  { bg: "#fdeaf3", fg: "#d6427f" },
  { bg: "#f1ecff", fg: "#7c4dff" },
];

// First-10 sample orders with a spread of freshness labels — "just now",
// minutes-ago and hours-ago — shown before the real feed for a lively ticker.
const RAW = [
  { name: "Priya", city: "Mumbai", amount: 427, books: 3, minsAgo: 0 },
  { name: "Rohit", city: "Lucknow", amount: 219, books: 2, minsAgo: 2 },
  { name: "Meera", city: "Kolkata", amount: 642, books: 5, minsAgo: 5 },
  { name: "Rahul", city: "Delhi", amount: 312, books: 2, minsAgo: 12 },
  { name: "Aisha", city: "Bengaluru", amount: 189, books: 1, minsAgo: 24 },
  { name: "Sneha", city: "Pune", amount: 268, books: 2, minsAgo: 41 },
  { name: "Karthik", city: "Chennai", amount: 538, books: 4, minsAgo: 78 },
  { name: "Vivek", city: "Jaipur", amount: 298, books: 2, minsAgo: 135 },
  { name: "Ananya", city: "Ahmedabad", amount: 377, books: 3, minsAgo: 200 },
  { name: "Aishu", city: "Coimbatore", amount: 419, books: 2, minsAgo: 320 },
];

function labelFromMins(mins) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
}

/**
 * Returns the list of sample orders, enriched with display fields (initials +
 * avatar colour). Ordered by most-recent first.
 */
export function getLiveOrders() {
  return RAW.map((o, i) => {
    const c = PALETTE[i % PALETTE.length];
    return {
      ...o,
      initials: o.name.slice(0, 1).toUpperCase(),
      bg: c.bg,
      fg: c.fg,
      timeLabel: labelFromMins(o.minsAgo),
    };
  }).sort((a, b) => a.minsAgo - b.minsAgo);
}

// Quick aggregate for a "social proof" headline, e.g. "62 books ordered in the
// last 10 minutes".
export function getLast10MinSummary() {
  const orders = getLiveOrders();
  const books = orders.reduce((s, o) => s + o.books, 0);
  return { orders: orders.length, books };
}

/* ------------------------------------------------------------------ */
/* Real orders from the Google Sheet (cached, client-side)            */
/* ------------------------------------------------------------------ */

let _cache = null; // { orders, summary }
let _inflight = null;

/**
 * Fetch recent real orders via our server route (/api/live-orders), which
 * returns only privacy-safe fields. Resolves to `{ orders, summary }` shaped
 * exactly like the dummy helpers, so the UI is identical. Falls back to the
 * sample data on any error. Cached in-memory so every component that shows the
 * ticker shares one fetch.
 */
export async function fetchLiveOrders({ limit = 12 } = {}) {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    try {
      const res = await fetch(`/api/live-orders?limit=${limit}`);
      const json = await res.json();
      const mapped = Array.isArray(json.orders) ? json.orders : [];
      if (!mapped.length) throw new Error("no rows");

      const realOrders = mapped.map((o, i) => {
        const c = PALETTE[i % PALETTE.length];
        return {
          ...o,
          initials: String(o.name || "S").slice(0, 1).toUpperCase(),
          bg: c.bg,
          fg: c.fg,
        };
      });

      // Show the 10 sample "just now / mins / hours ago" orders first, then
      // the real feed after them.
      const orders = [...getLiveOrders().slice(0, 10), ...realOrders];

      const books = orders.reduce((s, o) => s + o.books, 0);
      _cache = { orders, summary: { orders: orders.length, books } };
      return _cache;
    } catch (e) {
      const orders = getLiveOrders();
      const books = orders.reduce((s, o) => s + o.books, 0);
      return { orders, summary: { orders: orders.length, books } };
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}
