// Homepage "live activity" feed: recent orders (incl. Faster delivery picks),
// books being added to bags (Abandoned Cart tab) and reader reviews.
//
// Everything is read on the SERVER and reduced to privacy-safe fields — first
// name, city, amount, a book title, a relative time. No phone, address, cart
// key or full name ever leaves the server.

import { gvizQuery, tableToObjects, ORDERS_SHEET_NAME, cartAllRows } from "@/lib/serverSheets";
import { fetchSheetReviews } from "@/utils/reviewForm";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";
import { books as CATALOGUE } from "@/utils/book";

// Longest titles first so "Thinking, Fast and Slow" wins over "Thinking".
const TITLES = CATALOGUE.map((b) => b.name).filter(Boolean).sort((a, b) => b.length - a.length);
const isTest = (n) => /^(test|demo|dummy)/i.test(String(n || ""));

const firstName = (full) => {
  const f = String(full || "").trim().split(/\s+/)[0] || "";
  return f ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase() : "";
};

const parseSheetDate = (v) => {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
  if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  // "DD/MM/YYYY HH:mm:ss" written in IST → convert to an absolute time.
  const ist = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ist)
    return new Date(
      Date.UTC(+ist[3], +ist[2] - 1, +ist[1], +(ist[4] || 0), +(ist[5] || 0), +(ist[6] || 0)) -
        330 * 60000,
    );
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const relTime = (t) => {
  if (!t) return "recently";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const firstBook = (list) => {
  const s = String(list || "").trim();
  const hit = TITLES.find((t) => s.startsWith(t));
  return (hit || s.split(/,\s/)[0])
    .replace(/\s*x\d+$/i, "")
    .replace(/\s*\((price drop|.*offer.*)\)/i, "")
    .trim()
    .slice(0, 48);
};

const countBooks = (list) => {
  const s = String(list || "").trim();
  if (!s) return 1;
  return Math.max(1, s.split(/\n|;|\|/).filter((p) => p.trim()).length);
};

const DAY = 24 * 3600 * 1000;

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`live-activity:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const now = Date.now();
  const [ordersRes, cartsRes, reviewsRes] = await Promise.allSettled([
    gvizQuery({ sheet: ORDERS_SHEET_NAME }).then(tableToObjects),
    cartAllRows(),
    fetchSheetReviews(),
  ]);

  const orderRows = ordersRes.status === "fulfilled" ? ordersRes.value : [];
  const cartRows = cartsRes.status === "fulfilled" ? cartsRes.value : [];
  const reviewRows = reviewsRes.status === "fulfilled" ? reviewsRes.value : [];

  const orders = orderRows
    .map((r) => {
      const d = parseSheetDate(r["Timestamp"] ?? r["Timestamp (D)"] ?? "");
      return {
        name: firstName(r["Customer Name"]) || "Someone",
        city: String(r["City"] || "").trim(),
        amount: Math.round(parseFloat(r["Total Amount"]) || 0),
        books: countBooks(r["Books List"]),
        faster: /faster/i.test(String(r["Delivery Type"] || "")),
        t: d ? d.getTime() : 0,
      };
    })
    .filter((o) => o.amount > 0 && o.t && !isTest(o.name))
    .sort((a, b) => b.t - a.t);

  const carts = cartRows
    .map((r) => {
      const d = parseSheetDate(r["Last Updated"] ?? r["First Added"] ?? "");
      return {
        raw: r["Name"],
        name: firstName(r["Name"]) || "A reader",
        book: firstBook(r["Books"]),
        items: Number(r["Item Count"] ?? 0) || 0,
        t: d ? d.getTime() : 0,
      };
    })
    .filter((c) => c.book && c.items > 0 && c.t && !isTest(c.raw))
    .sort((a, b) => b.t - a.t);

  const reviews = reviewRows
    .filter((rv) => rv.rating >= 4 && rv.text.length > 10)
    .slice(-12)
    .reverse();

  // Headline numbers (fall back to longer windows so a quiet day still reads well).
  const inLast = (list, ms) => list.filter((x) => now - x.t <= ms).length;
  const ordersToday = inLast(orders, DAY);
  const ordersWeek = inLast(orders, 7 * DAY);
  const fasterWeek = orders.filter((o) => o.faster && now - o.t <= 7 * DAY).length;
  const cartsToday = inLast(carts, DAY);

  const stats = {
    orders: ordersToday >= 3 ? { n: ordersToday, label: "orders today" } : { n: ordersWeek, label: "orders this week" },
    faster: { n: fasterWeek, label: "chose Faster delivery this week" },
    adds: cartsToday >= 3 ? { n: cartsToday, label: "bags filled today" } : { n: inLast(carts, 7 * DAY), label: "bags filled this week" },
    rating: reviewRows.length
      ? {
          n: (reviewRows.reduce((s, r) => s + r.rating, 0) / reviewRows.length).toFixed(1),
          label: `from ${reviewRows.length} reviews`,
        }
      : null,
  };

  // Interleave: order · cart · order(faster) · review …
  // Latest orders, making sure a few recent Faster-delivery picks are included.
  const fasterRecent = orders.filter((o) => o.faster).slice(0, 3);
  const pickOrders = [...orders.slice(0, 8), ...fasterRecent.filter((o) => !orders.slice(0, 8).includes(o))].sort((a, b) => b.t - a.t);
  const evOrders = pickOrders.map((o) => ({
    type: o.faster ? "faster" : "order",
    name: o.name,
    city: o.city,
    text: o.faster
      ? `picked Faster delivery on ${o.books} book${o.books > 1 ? "s" : ""}`
      : `ordered ${o.books} book${o.books > 1 ? "s" : ""} worth ₹${o.amount}`,
    time: relTime(o.t),
  }));
  const evCarts = carts.slice(0, 8).map((c) => ({
    type: "cart",
    name: c.name,
    text: `added “${c.book}” to their bag`,
    time: relTime(c.t),
  }));
  const evReviews = reviews.slice(0, 6).map((rv) => ({
    type: "review",
    name: /^verified/i.test(rv.name)
      ? "A reader"
      : rv.name.replace(/\d+/g, "").trim().split(/\s+/)[0] || "A reader",
    rating: rv.rating,
    text: (() => {
      const t = rv.text.replace(/\s+/g, " ").trim();
      return `“${t.length > 70 ? t.slice(0, 68).trim() + "…" : t}”`;
    })(),
    time: rv.book ? `on ${rv.book}` : "verified reader",
  }));

  const events = [];
  const max = Math.max(evOrders.length, evCarts.length, evReviews.length);
  for (let i = 0; i < max; i++) {
    if (evOrders[i]) events.push(evOrders[i]);
    if (evCarts[i]) events.push(evCarts[i]);
    if (evReviews[i]) events.push(evReviews[i]);
  }

  return Response.json(
    { stats, events: events.slice(0, 24) },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
  );
}
