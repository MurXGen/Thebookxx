// Slim catalogue shape shared by the mobile app (bundled snapshot, built by
// mobile/scripts/sync-catalog.mjs) and the live /api/app/catalog endpoint.
// Keep the two in sync by changing only this file.
const SITE = "https://www.thebookx.in";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const abs = (src) => (!src ? "" : /^https?:/.test(src) ? src : `${SITE}${src}`);

function slimBook(b) {
  const name = String(b.name || "");
  const series = String(b.series || "");
  return {
    id: b.id,
    name: series && !name.toLowerCase().includes(series.toLowerCase()) ? `${name} (${series})` : name,
    slug: slugify(b.name),
    image: abs(b.image),
    author: b.author || "",
    price: Number(b.discountedPrice) || 0,
    mrp: Number(b.originalPrice) || 0,
    cats: Array.isArray(b.catalogue) ? b.catalogue : [],
    stock: typeof b.stock === "number" ? b.stock : 10,
    rating: b.rating || null,
    reviews: b.reviewCount || null,
    pages: b.pages || "",
    lang: b.language || "",
    format: b.size || "",
    desc: String(b.description || "").slice(0, 900),
  };
}

function slimCatalog(books, hidden = [], combos = [], qrMeta = {}) {
  const hide = new Set((hidden || []).map((x) => String(x).toLowerCase()));
  const list = books
    .filter((b) => b && b.id && b.name && b.image && !hide.has(String(b.id).toLowerCase()))
    .map(slimBook);
  const have = new Set(list.map((b) => b.id));
  return {
    v: 1,
    at: Date.now(),
    books: list,
    // Combos from src/utils/combos.js — 2-book pairs carry pct (10% off when
    // both are in the bag); 3–4 book sets are bundles at the books' prices.
    combos: (combos || [])
      .filter((c) => c && c.slug && Array.isArray(c.bookIds) && c.bookIds.length > 1 && c.bookIds.every((id) => have.has(id)))
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        tagline: c.tagline || "",
        category: c.category || "",
        bookIds: c.bookIds,
        pct: Number(c.discountPct) || 0,
      })),
    // QuickReads (src/data/quickreadsMeta.js): card counts + taglines only —
    // the card text is served gated by /api/quickread.
    quickreads: Object.fromEntries(
      Object.entries(qrMeta || {})
        .filter(([id]) => have.has(id))
        .map(([id, m]) => [id, { count: Number(m.count) || 0, tagline: String(m.tagline || "") }]),
    ),
  };
}

module.exports = { slimCatalog, slimBook, SITE };
