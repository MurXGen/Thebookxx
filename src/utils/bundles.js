// utils/bundles.js
// "Frequently bought together" 2-book bundles for the storefront. Pairs mirror
// the real co-occurrence pairs surfaced in the Manage-Orders analytics. Each
// pair references books by their exact catalogue name; pricing is recomputed at
// runtime (sum of the two discounted prices) so bundles never drift out of sync.
import { books } from "./book";

// Exact-name → book (first match wins). Used so a pair like "Tuesdays with
// Morrie" resolves to the short edition rather than the long-title variant.
const byName = {};
books.forEach((b) => {
  const k = String(b.name || "").trim().toLowerCase();
  if (k && !byName[k]) byName[k] = b;
});
const find = (name) => byName[String(name || "").trim().toLowerCase()] || null;

// Round to the nearest value ending in 9 (kept consistent with combos.js).
const roundTo9 = (n) => {
  const r = Math.round((n + 1) / 10) * 10 - 1;
  return r < 9 ? 9 : r;
};
const originalOf = (p) => Math.round((p * 1.5) / 10) * 10;

// Curated pairs (title A, title B, short hook). Ordered by how often they were
// bought together.
const PAIR_DEFS = [
  ["Surrounded by Idiots", "The Art of Clarity", "Read people, think clearly"],
  ["Atomic Habits", "The Psychology of Money", "Build better habits & wealth"],
  ["The 48 Laws of Power", "The Laws of Human Nature", "Master power & people"],
  ["Before the Coffee Gets Cold", "Tuesdays with Morrie", "Stories that stay"],
  ["Can We Be Strangers Again", "White Nights", "Love, loss & longing"],
  ["Atomic Habits", "The Art of Laziness", "Beat procrastination for good"],
];

export const bundles = PAIR_DEFS.map(([a, b, hook], i) => {
  const bookA = find(a);
  const bookB = find(b);
  return {
    id: `bundle-${String(i + 1).padStart(3, "0")}`,
    hook,
    books: [bookA, bookB].filter(Boolean),
  };
}).filter((x) => x.books.length === 2);

export const getBundlePricing = (bundle) => {
  const items = bundle?.books || [];
  const sum = items.reduce((s, b) => s + (Number(b.discountedPrice) || 0), 0);
  const price = roundTo9(sum);
  const mrp = items.reduce(
    (s, b) => s + (Number(b.originalPrice) || originalOf(b.discountedPrice || 0)),
    0,
  );
  return { price, mrp, savings: Math.max(0, mrp - price), count: items.length };
};
