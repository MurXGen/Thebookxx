// Shared helpers for the blog UI: categories, reading time, trending detection,
// related-book extraction, cover resolution, and heading → TOC building.

import { getAllBlogs } from "./blogs";
import { books } from "./book";

export const slugifyText = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Map catalogue books by their PDP slug (slugified name) for fast lookup.
const bookBySlug = new Map(books.map((b) => [slugifyText(b.name), b]));

// Distinct categories across every post (for filter tabs).
export function getBlogCategories() {
  const set = new Set();
  getAllBlogs().forEach((b) => (b.categories || []).forEach((c) => set.add(c)));
  return [...set].sort((a, b) => a.localeCompare(b));
}

// Rough reading time in minutes from total content length.
export function readingMinutes(blog) {
  const chars = (blog.content || []).reduce((acc, block) => {
    if (block.content) return acc + block.content.length;
    if (block.items) return acc + block.items.join(" ").length;
    return acc;
  }, 0);
  return Math.max(2, Math.ceil(chars / 900));
}

// Is this a "Top 10 / Trending / Best" style post that we want to surface?
export function isTrending(blog) {
  const t = (blog.title || "").toLowerCase();
  const cats = (blog.categories || []).map((c) => c.toLowerCase());
  return (
    /top\s*\d|top-?10|trending|\bbest\b|read these|listicle|books like|round-?up/.test(
      t,
    ) ||
    cats.includes("bestsellers") ||
    cats.includes("reading lists") ||
    cats.includes("quickreads")
  );
}

// Books referenced inside a post (parsed from /books/<slug> links), resolved to
// catalogue entries and de-duplicated. Powers the "related books" widget.
export function relatedBooksFor(blog, limit = 8) {
  const slugs = new Set();
  (blog.content || []).forEach((block) => {
    const html = block.content || (block.items ? block.items.join(" ") : "");
    const re = /\/books\/([a-z0-9-]+)/g;
    let m;
    while ((m = re.exec(html))) slugs.add(m[1]);
  });
  const out = [];
  slugs.forEach((s) => {
    const b = bookBySlug.get(s);
    if (b) out.push(b);
  });
  return out.slice(0, limit);
}

// Best cover image for a post: explicit cover/hero/first image, else fall back
// to the cover of the first book the post features.
export function coverFor(blog) {
  return (
    blog.coverImage ||
    blog.hero ||
    (blog.images && blog.images[0] && blog.images[0].url) ||
    relatedBooksFor(blog, 1)[0]?.image ||
    null
  );
}

// H2 headings → [{ id, text }] for an on-page table of contents.
export function headingsFor(blog) {
  return (blog.content || [])
    .filter((b) => b.type === "heading" && b.level === 2)
    .map((b) => ({
      id: slugifyText(b.content),
      text: String(b.content || "").replace(/<[^>]+>/g, ""),
    }));
}
