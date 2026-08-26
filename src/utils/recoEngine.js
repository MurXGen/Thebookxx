// Cart-aware recommendation engine for the "Book Recommendations" drawer.
// Ranks the catalogue by similarity to what's already in the cart, attaches a
// mandatory reason-why line, applies optional chip filters, and produces a
// diversity-capped ordering that the UI paginates with a cursor.

import { books } from "@/utils/book";

const norm = (s) => String(s || "").toLowerCase();

// Reading-goal → category keyword map (optional chip filter/boost).
export const GOAL_KEYWORDS = {
  entertainment: [
    "romance",
    "fiction",
    "fantasy",
    "thriller",
    "mystery",
    "horror",
    "adventure",
    "humor",
  ],
  knowledge: ["science", "history", "philosophy", "biography", "science-tech"],
  "self-improvement": [
    "self-help",
    "psychology",
    "health",
    "spirituality",
    "productivity",
  ],
  career: ["business", "finance", "leadership", "management"],
};

// The most common catalogue categories, for the optional genre chip row.
export function topGenres(limit = 14) {
  const freq = new Map();
  books.forEach((b) =>
    (b.catalogue || []).forEach((c) => freq.set(c, (freq.get(c) || 0) + 1)),
  );
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([c]) => c);
}

function inStock(b) {
  return b.stock === undefined || b.stock === null || b.stock > 0;
}

function discountPct(b) {
  if (!b.originalPrice || b.originalPrice <= b.discountedPrice) return 0;
  return ((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100;
}

// Score a candidate against the cart; also return the cart book that best
// explains the match so the card can say "Because you added <that book>".
function scoreAgainstCart(book, cartBooks) {
  let best = { score: 0, source: null };
  for (const c of cartBooks) {
    if (c.id === book.id) continue;
    let s = 0;
    const shared = (book.catalogue || []).filter((cat) =>
      (c.catalogue || []).includes(cat),
    ).length;
    s += shared * 4;
    if (book.author && c.author && norm(book.author) === norm(c.author))
      s += 6;
    if (s > best.score) best = { score: s, source: c };
  }
  return best;
}

function baseScore(book) {
  let s = 0;
  const cat = (book.catalogue || []).map(norm);
  if (cat.includes("bestseller")) s += 2.5;
  if (cat.includes("trending")) s += 2;
  const d = discountPct(book);
  if (d >= 45) s += 1.5;
  else if (d >= 30) s += 0.8;
  return s;
}

function reasonFor(book, cartSource, filters) {
  if (cartSource) return `Because you added ${cartSource.name}`;
  const cat = (book.catalogue || [])[0];
  if (filters?.genres?.length && cat) return `Matches your pick: ${cat}`;
  if ((book.catalogue || []).map(norm).includes("bestseller"))
    return "One of our bestsellers";
  if ((book.catalogue || []).map(norm).includes("trending"))
    return "Trending with readers now";
  if (cat) return `Popular in ${cat}`;
  return "Hand-picked for you";
}

// Greedy diversity cap: within every window of `page` output items, allow at
// most `perAuthor` books by one author and `perCat` in one primary category.
function diversify(ranked, { perAuthor = 2, perCat = 3, page = 12 } = {}) {
  const out = [];
  const used = new Set();
  let bAuthor = {};
  let bCat = {};
  const remaining = () => ranked.find((b) => !used.has(b.id));

  while (out.length < ranked.length) {
    if (out.length % page === 0) {
      bAuthor = {};
      bCat = {};
    }
    let pick = null;
    for (const b of ranked) {
      if (used.has(b.id)) continue;
      const a = norm(b.author);
      const c = norm((b.catalogue || [])[0]);
      if (a && (bAuthor[a] || 0) >= perAuthor) continue;
      if (c && (bCat[c] || 0) >= perCat) continue;
      pick = b;
      break;
    }
    if (!pick) {
      // Nothing fits the cap in this window — reset the window and take the
      // next best so we never loop forever.
      bAuthor = {};
      bCat = {};
      pick = remaining();
      if (!pick) break;
    }
    used.add(pick.id);
    out.push(pick);
    const a = norm(pick.author);
    const c = norm((pick.catalogue || [])[0]);
    if (a) bAuthor[a] = (bAuthor[a] || 0) + 1;
    if (c) bCat[c] = (bCat[c] || 0) + 1;
  }
  return out;
}

/**
 * Build the full diversified recommendation list.
 * @param {string[]} cartIds  ids currently in the cart
 * @param {object} filters    { genres:[], goal:"", age:"" }
 * @returns ranked+diversified array of book objects, each with `_reason`.
 */
export function buildRecommendations(cartIds = [], filters = {}) {
  const cartSet = new Set(cartIds);
  const cartBooks = books.filter((b) => cartSet.has(b.id));
  const genres = (filters.genres || []).map(norm);
  const goalKw = filters.goal ? GOAL_KEYWORDS[filters.goal] || [] : [];

  let candidates = books.filter((b) => !cartSet.has(b.id) && inStock(b));

  // Optional genre chip filter (match ANY selected genre).
  if (genres.length) {
    candidates = candidates.filter((b) =>
      (b.catalogue || []).some((c) => genres.includes(norm(c))),
    );
  }

  const scored = candidates.map((b) => {
    const cartMatch = scoreAgainstCart(b, cartBooks);
    let score = cartMatch.score + baseScore(b);
    // Goal chip: soft boost for matching categories.
    if (goalKw.length) {
      const hit = (b.catalogue || []).some((c) =>
        goalKw.some((k) => norm(c).includes(k)),
      );
      if (hit) score += 3;
    }
    return {
      ...b,
      _score: score,
      _reason: reasonFor(b, cartMatch.source, filters),
    };
  });

  scored.sort((a, b) => b._score - a._score);
  return diversify(scored);
}
