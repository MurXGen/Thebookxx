// utils/liveOrders.js
//
// Sample, realistic-looking "live order" social proof data for the homepage
// ticker. This is dummy data for now (no backend). Swap getLiveOrders() for a
// real API/feed later and the UI keeps working.

const PALETTE = [
  { bg: "#fff3e6", fg: "#fb8500" },
  { bg: "#e9f0ff", fg: "#3b6fe0" },
  { bg: "#e9f9ee", fg: "#0c9b46" },
  { bg: "#fdeaf3", fg: "#d6427f" },
  { bg: "#f1ecff", fg: "#7c4dff" },
];

const RAW = [
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
