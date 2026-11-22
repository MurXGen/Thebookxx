import AsyncStorage from "@react-native-async-storage/async-storage";
import snapshot from "@/data/catalog.json";
import { API } from "@/theme";

export type Book = {
  id: string;
  name: string;
  slug: string;
  image: string;
  author: string;
  price: number;
  mrp: number;
  cats: string[];
  stock: number;
  rating: number | null;
  reviews: number | null;
  pages: string;
  lang: string;
  format: string;
  desc: string;
};

export type QuickReadMeta = { count: number; tagline: string };
export type Catalog = { v: number; at: number; books: Book[]; combos?: Combo[]; quickreads?: Record<string, QuickReadMeta> };

const KEY = "tbx_catalog_v1";
export const bundledCatalog = snapshot as Catalog;

export async function loadCachedCatalog(): Promise<Catalog | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Catalog;
    return c?.books?.length && c.at > bundledCatalog.at ? c : null;
  } catch {
    return null;
  }
}

export async function fetchFreshCatalog(): Promise<Catalog | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    const res = await fetch(`${API}/api/app/catalog`, { signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const c = (await res.json()) as Catalog;
    if (!c?.books?.length) return null;
    AsyncStorage.setItem(KEY, JSON.stringify(c)).catch(() => {});
    return c;
  } catch {
    return null;
  }
}

// ── Category metadata (labels + colours mirror the website's category themes) ──
export const CATEGORY_META: Record<string, { label: string; color: string; tagline: string }> = {
  trending: { label: "Trending", color: "#C2410C", tagline: "Hot right now" },
  bestseller: { label: "Bestsellers", color: "#B91C1C", tagline: "What everyone's reading" },
  "self-help": { label: "Self Help", color: "#B45309", tagline: "Become your best self" },
  finance: { label: "Finance", color: "#14532D", tagline: "Master your money" },
  business: { label: "Business", color: "#1E3A8A", tagline: "Build, lead and grow" },
  psychology: { label: "Psychology", color: "#0F5F59", tagline: "Understand the human mind" },
  fiction: { label: "Fiction", color: "#3730A3", tagline: "Stories worth getting lost in" },
  novel: { label: "Novels", color: "#3F3186", tagline: "Immersive, unforgettable reads" },
  romance: { label: "Romance", color: "#9D174D", tagline: "Love in every page" },
  thriller: { label: "Thriller", color: "#20242E", tagline: "Heart-pounding page-turners" },
  mystery: { label: "Mystery", color: "#241B3A", tagline: "Clues, twists and the unknown" },
  crime: { label: "Crime", color: "#1C1C22", tagline: "Secrets waiting to be solved" },
  horror: { label: "Horror", color: "#241016", tagline: "Dare to turn the page" },
  "fantasy-scifi": { label: "Fantasy & Sci-fi", color: "#4C1D95", tagline: "Worlds beyond imagination" },
  biography: { label: "Biography", color: "#78350F", tagline: "Lives that inspire" },
  history: { label: "History", color: "#713F12", tagline: "The past, retold" },
  spirituality: { label: "Spirituality", color: "#6D28D9", tagline: "Peace, purpose and within" },
  "mental-health": { label: "Mental Health", color: "#047857", tagline: "Feel your best" },
  health: { label: "Health", color: "#047857", tagline: "Feel your best" },
  investing: { label: "Investing", color: "#134E4A", tagline: "Grow your wealth, wisely" },
  economics: { label: "Economics", color: "#155E75", tagline: "How markets really move" },
  "non-fiction": { label: "Non-fiction", color: "#374151", tagline: "Real stories, real ideas" },
  children: { label: "Kids", color: "#0369A1", tagline: "Wonder for little readers" },
  "young-adult": { label: "Young Adult", color: "#BE185D", tagline: "Coming-of-age favourites" },
  "graphic-novel": { label: "Graphic Novels", color: "#0E7490", tagline: "Stories in pictures" },
  "dark-romance": { label: "Dark Romance", color: "#450A24", tagline: "Love, with an edge" },
  set: { label: "Box Sets", color: "#7C2D12", tagline: "Complete series, one price" },
  hindi: { label: "Hindi", color: "#9A3412", tagline: "बेहतरीन हिंदी किताबें" },
  humor: { label: "Humour", color: "#A16207", tagline: "Laugh out loud" },
  "science-tech": { label: "Science & Tech", color: "#0E7490", tagline: "How the world works" },
};

export const catLabel = (slug: string) =>
  CATEGORY_META[slug]?.label ||
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const catColor = (slug: string) => CATEGORY_META[slug]?.color || "#1F2937";

export const isOneRupee = (b: Book) => b.price === 1;
export const inStock = (b: Book) => b.stock > 0;
export const offPct = (b: Book) => (b.mrp > b.price ? Math.round(((b.mrp - b.price) / b.mrp) * 100) : 0);

export function categoriesOf(books: Book[], min = 4) {
  const count = new Map<string, number>();
  for (const b of books) for (const c of b.cats) count.set(c, (count.get(c) || 0) + 1);
  return [...count.entries()]
    .filter(([slug, n]) => n >= min && CATEGORY_META[slug])
    .sort((a, b) => b[1] - a[1])
    .map(([slug, n]) => ({
      slug,
      count: n,
      label: catLabel(slug),
      cover: books.find((b) => b.cats.includes(slug) && !isOneRupee(b))?.image || "",
    }));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ ]/g, " ").replace(/\s+/g, " ").trim();

// Small typo-tolerant search: every query word must prefix-match (or be within
// one edit of) some word in the title/author/category.
export function searchBooks(books: Book[], q: string) {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return [];
  const close = (a: string, b: string) => {
    if (b.startsWith(a)) return true;
    if (a.length < 4) return false;
    const w = b.slice(0, a.length);
    let diff = 0;
    for (let i = 0; i < a.length && diff < 2; i++) if (a[i] !== w[i]) diff++;
    return diff < 2;
  };
  return books
    .map((b) => {
      const hay = norm(`${b.name} ${b.author} ${b.cats.join(" ")}`).split(" ");
      let score = 0;
      for (const w of words) {
        const hit = hay.findIndex((h) => close(w, h));
        if (hit < 0) return null;
        score += hit < 6 ? 3 : 1;
      }
      if (norm(b.name).startsWith(norm(q))) score += 5;
      return { b, score };
    })
    .filter((x): x is { b: Book; score: number } => !!x)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.b);
}

// ── Combos (mirrors src/utils/combos.js) ────────────────────────────────────
export type Combo = { id: string; slug: string; title: string; tagline: string; category: string; bookIds: string[]; pct: number };

const roundTo9 = (n: number) => {
  const r = Math.round((n + 1) / 10) * 10 - 1;
  return r < 9 ? 9 : r;
};

export function comboBooks(c: Combo, byId: Map<string, Book>) {
  return c.bookIds.map((id) => byId.get(id)).filter((b): b is Book => !!b);
}

export function comboPricing(c: Combo, byId: Map<string, Book>) {
  const items = comboBooks(c, byId);
  const sum = items.reduce((s, b) => s + b.price, 0);
  const price = c.pct ? Math.round(sum * (1 - c.pct / 100)) : roundTo9(sum);
  const mrp = items.reduce((s, b) => s + (b.mrp || b.price), 0);
  return { price, mrp, sum, savings: Math.max(0, mrp - price), count: items.length, inStock: items.every((b) => b.stock > 0) };
}

// Website bag rule: both books of a 2-book combo in the bag → 10% off that
// pair; each copy counts once, biggest saving matched first.
export function comboPairDiscount(cart: { id: string; qty: number }[], byId: Map<string, Book>, combos: Combo[]) {
  const qty: Record<string, number> = {};
  const price: Record<string, number> = {};
  for (const l of cart) {
    const b = byId.get(l.id);
    if (!b || !(b.price > 1)) continue;
    qty[l.id] = (qty[l.id] || 0) + l.qty;
    price[l.id] = b.price;
  }
  const options = combos
    .filter((c) => c.pct && c.bookIds.length === 2 && c.bookIds.every((id) => qty[id]))
    .map((c) => {
      const sum = c.bookIds.reduce((s, id) => s + price[id], 0);
      return { c, off: sum - Math.round(sum * (1 - c.pct / 100)) };
    })
    .sort((a, b) => b.off - a.off);
  let discount = 0;
  let pairs = 0;
  for (const { c, off } of options) {
    while (c.bookIds.every((id) => qty[id] > 0)) {
      c.bookIds.forEach((id) => (qty[id] -= 1));
      discount += off;
      pairs += 1;
    }
  }
  return { discount, pairs };
}

export function searchCombos(combos: Combo[], byId: Map<string, Book>, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return combos.filter((c) => {
    const hay = `${c.title} ${c.category} ${comboBooks(c, byId).map((b) => `${b.name} ${b.author}`).join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
