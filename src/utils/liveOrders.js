// utils/liveOrders.js
//
// Live-order social-proof data. Real recent orders are pulled from the same
// Google Sheet the manage-orders dashboard uses; the sample RAW data below is
// only a fallback while the sheet loads or if the fetch fails. Only the
// customer's FIRST name + city are ever shown (privacy-preserving).

// Same sheet as the manage-orders dashboard.
const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const SHEET_NAME = "Form responses 1";
const SHEET_API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

const PALETTE = [
  { bg: "#fff3e6", fg: "#fb8500" },
  { bg: "#e9f0ff", fg: "#3b6fe0" },
  { bg: "#e9f9ee", fg: "#0c9b46" },
  { bg: "#fdeaf3", fg: "#d6427f" },
  { bg: "#f1ecff", fg: "#7c4dff" },
];

const RAW = [
  { name: "Aishu", city: "Coimbatore", amount: 419, books: 2, minsAgo: 50 },
  { name: "Priya", city: "Mumbai", amount: 427, books: 3, minsAgo: 2 },
  { name: "Rahul", city: "Delhi", amount: 312, books: 2, minsAgo: 4 },
  { name: "Aisha", city: "Bengaluru", amount: 189, books: 1, minsAgo: 6 },
  { name: "Karthik", city: "Chennai", amount: 538, books: 4, minsAgo: 7 },
  { name: "Sneha", city: "Pune", amount: 268, books: 2, minsAgo: 9 },
  { name: "Arjun", city: "Hyderabad", amount: 159, books: 1, minsAgo: 10 },
  { name: "Meera", city: "Kolkata", amount: 642, books: 5, minsAgo: 3 },
  { name: "Vivek", city: "Jaipur", amount: 298, books: 2, minsAgo: 5 },
  { name: "Ananya", city: "Ahmedabad", amount: 377, books: 3, minsAgo: 8 },
  { name: "Rohit", city: "Lucknow", amount: 219, books: 2, minsAgo: 1 },
];

/**
 * Returns the list of recent orders, enriched with display fields (initials +
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
      timeLabel: o.minsAgo <= 1 ? "just now" : `${o.minsAgo} mins ago`,
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

function firstName(full) {
  return String(full || "").trim().split(/\s+/)[0] || "Someone";
}

function countBooks(list) {
  const s = String(list || "").trim();
  if (!s) return 1;
  const parts = s.split(/\n|,|;|\|/).map((p) => p.trim()).filter(Boolean);
  return Math.max(1, parts.length);
}

// gviz timestamps arrive as "Date(2026,6,3,10,30,0)" (month is 0-based) or a
// plain dd/mm/yyyy string. Return a Date or null.
function parseSheetDate(v) {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
  if (m) {
    return new Date(
      +m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0),
    );
  }
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function relTime(date) {
  if (!date) return "recently";
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/**
 * Fetch recent real orders from the sheet. Resolves to
 * `{ orders, summary }` shaped exactly like the dummy helpers, so the UI is
 * identical. Falls back to the sample data on any error. Cached in-memory so
 * every component that shows the ticker shares one fetch.
 */
export async function fetchLiveOrders({ limit = 12 } = {}) {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    try {
      const res = await fetch(SHEET_API_URL);
      const text = await res.text();
      const json = JSON.parse(text.substring(47, text.length - 2));
      const headers = json.table.cols.map((c) => c.label);
      const idx = (label) => headers.indexOf(label);

      const iName = idx("Customer Name");
      const iCity = idx("City");
      const iAmt = idx("Total Amount");
      const iBooks = idx("Books List");
      const iTime = idx("Timestamp") !== -1 ? idx("Timestamp") : 0;

      const rows = json.table.rows || [];
      const cell = (row, i) => {
        if (i < 0) return "";
        let v = row.c?.[i]?.v;
        if (v && typeof v === "object" && "value" in v) v = v.value;
        return v ?? "";
      };

      const mapped = rows
        .map((row) => {
          const date = parseSheetDate(cell(row, iTime));
          return {
            name: firstName(cell(row, iName)),
            city: String(cell(row, iCity) || "").trim() || "India",
            amount: Math.round(parseFloat(cell(row, iAmt)) || 0),
            books: countBooks(cell(row, iBooks)),
            date,
          };
        })
        .filter((o) => o.amount > 0)
        // newest first (sheet appends new rows at the bottom)
        .sort((a, b) => {
          if (a.date && b.date) return b.date - a.date;
          return 0;
        })
        .reverse()
        .slice(-limit)
        .reverse();

      if (!mapped.length) throw new Error("no rows");

      const orders = mapped.map((o, i) => {
        const c = PALETTE[i % PALETTE.length];
        return {
          ...o,
          initials: o.name.slice(0, 1).toUpperCase(),
          bg: c.bg,
          fg: c.fg,
          timeLabel: relTime(o.date),
        };
      });

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
