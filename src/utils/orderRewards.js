// Bookmark achievements — free bookmarks grow with the order, and ₹3000+
// orders get the Mystery Box. Based on the books total (same base checkout
// uses for free bookmarks). One source of truth for the bag, checkout and the
// order note.

export const BASE_FREE_BOOKMARKS = 2;

export const REWARD_LEVELS = [
  {
    id: "bm3",
    at: 500,
    tag: "3 free",
    title: "3 free bookmarks",
    short: "a 3rd free bookmark",
    bookmarks: 3,
    perks: ["Pick 3 bookmarks free at checkout"],
  },
  {
    id: "bm4",
    at: 1000,
    tag: "4 free",
    title: "4 free bookmarks",
    short: "a 4th free bookmark",
    bookmarks: 4,
    perks: ["Pick 4 bookmarks free at checkout"],
  },
  {
    id: "mystery",
    at: 3000,
    tag: "Mystery Box",
    title: "The Mystery Box",
    short: "the Mystery Box",
    bookmarks: 4,
    mystery: true,
    perks: ["A sealed Mystery Box, packed with care", "Plus your 4 free bookmarks"],
  },
];

// Free bookmarks for a books total (mirrors checkout).
export const freeBookmarksFor = (amount) =>
  amount >= 1000 ? 4 : amount >= 500 ? 3 : BASE_FREE_BOOKMARKS;

// { current, next, gap, unlocked[], level } for a books total.
export function rewardProgress(amount) {
  const amt = Math.max(0, Number(amount) || 0);
  const unlocked = REWARD_LEVELS.filter((l) => amt >= l.at);
  const current = unlocked[unlocked.length - 1] || null;
  const next = REWARD_LEVELS.find((l) => amt < l.at) || null;
  return {
    current,
    next,
    gap: next ? next.at - amt : 0,
    unlocked,
    level: unlocked.length, // 0 = base (2 free)
    bookmarks: freeBookmarksFor(amt),
    amount: amt,
  };
}

// Position (0–100) of a milestone on a track that ends at the last one.
export const levelPos = (at) =>
  (at / REWARD_LEVELS[REWARD_LEVELS.length - 1].at) * 100;

// Line added to the order comment so the packing team sees it.
export function rewardNote(amount) {
  const { current } = rewardProgress(amount);
  return current?.mystery ? "Reward: Mystery Box (order ₹3000+)" : "";
}
