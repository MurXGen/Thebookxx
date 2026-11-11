// utils/boxSets.js — the catalogue's box sets / series sets (single products
// that contain a whole series, e.g. Harry Potter Series Set, The Shiva Trilogy
// Set). Used by the homepage "Book sets" rail and the /book-sets page.
import { books } from "@/utils/book";

const NOT_A_SET = /go set a watchman|\bbook \d+\b(?!\s*[-–])/i;

export function isBoxSet(b) {
  if (!b?.name || !b.image || !(b.discountedPrice > 1)) return false;
  if (NOT_A_SET.test(b.name)) return false;
  const cat = b.catalogue || [];
  if (cat.includes("set") || cat.includes("boxset")) return true;
  return /\bbox set\b|\bseries set\b|\bset of \d|\(\d+[- ]book|\d+[- ]book (set|series)|\bset\b\s*(\(|$)|\bultimate collection\b|\bseries\b\s*(\(|$)/i.test(
    b.name,
  );
}

// Bestsellers first, then trending, then the rest (stable within each group).
const rank = (b) =>
  b.catalogue?.includes("bestseller") ? 0 : b.catalogue?.includes("trending") ? 1 : 2;

export const BOX_SETS = books
  .filter(isBoxSet)
  .map((b, i) => ({ b, i }))
  .sort((x, y) => rank(x.b) - rank(y.b) || x.i - y.i)
  .map(({ b }) => b);

// Genre groups for the /book-sets page (a set can sit in several).
export const BOX_SET_GENRES = [
  { key: "fantasy-scifi", label: "Fantasy & sci-fi" },
  { key: "romance", label: "Romance" },
  { key: "thriller", label: "Thrillers & mystery" },
  { key: "young-adult", label: "Young adult" },
  { key: "children", label: "Children's" },
  { key: "manga", label: "Manga & comics", also: ["comic", "graphic-novel"] },
  { key: "spirituality", label: "Indian mythology" },
  { key: "fiction", label: "Fiction classics" },
]
  .map((g) => ({
    ...g,
    books: BOX_SETS.filter((b) => [g.key, ...(g.also || [])].some((k) => b.catalogue?.includes(k))),
  }))
  .filter((g) => g.books.length);
