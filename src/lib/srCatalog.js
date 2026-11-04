// Shiprocket Checkout catalog feed (Custom Integration "Fetch Products /
// Collections / Products by Collection" APIs). Server-only.
//
// IDs must be stable long numbers, so they're derived from our text IDs:
//   book bk-001           → product 1000001, variant 2000001
//   category (collection) → 3000001… (fixed order below; never reorder)
//   QuickRead of bk-001   → product 4000001, variant 5000001
//   Unlimited monthly     → product 6000001, variant 6000011
//   Unlimited yearly      → product 6000002, variant 6000012
//   "QuickReads" collection → 3000900
import crypto from "crypto";
import { NextResponse } from "next/server";
import { books } from "@/utils/book";
import {
  QUICKREAD_META,
  QUICKREAD_PRICE,
  QUICKREAD_MRP,
  SUB_MONTHLY_PRICE,
  SUB_YEARLY_PRICE,
  SUB_MONTHLY_ID,
  SUB_YEARLY_ID,
} from "@/data/quickreadsMeta";

const SITE = "https://www.thebookx.in";
// Catalog "created_at" for everything; "updated_at" is the deploy time so a
// fresh deploy (= possible price/stock change) shows up as an update.
const CREATED_AT = "2025-01-01T00:00:00+05:30";
const UPDATED_AT = new Date().toISOString();

// Append-only: new categories go at the END so existing IDs never change.
const CATEGORY_ORDER = [
  "bestseller", "fiction", "non-fiction", "romance", "self-help", "trending",
  "thriller", "children", "psychology", "spirituality", "fantasy-scifi",
  "business", "finance", "young-adult", "biography", "humor", "history", "set",
  "graphic-novel", "comic", "science-tech", "hindi", "boxset", "sports",
  "mystery", "health", "dark-romance", "poetry", "manga", "indian-author",
  "gifting", "science", "motivation", "humour", "novel", "mental-health",
];
export const QUICKREADS_COLLECTION_ID = 3000900;

const slugify = (t = "") =>
  String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const titleCase = (s) =>
  s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const money = (n) => (Math.round(Number(n || 0) * 100) / 100).toFixed(2);
const abs = (src) => (!src ? "" : /^https?:/i.test(src) ? src : `${SITE}${src.startsWith("/") ? "" : "/"}${src}`);
const bookNo = (id) => {
  const m = /^bk-(\d+)$/i.exec(String(id || ""));
  return m ? Number(m[1]) : null;
};

export function collectionId(category) {
  const i = CATEGORY_ORDER.indexOf(category);
  if (i !== -1) return 3000001 + i;
  // Unknown (new) category: stable hash in 3100000–3199999 until it's added above.
  const h = crypto.createHash("md5").update(category).digest().readUInt32BE(0);
  return 3100000 + (h % 100000);
}

function bookProduct(b) {
  const n = bookNo(b.id);
  if (n == null) return null;
  const cats = (b.catalogue || []).filter(Boolean);
  const grams = Number(b.weight) || 400;
  const img = { src: abs(b.image) || `${SITE}/icon-512.png` };
  return {
    id: 1000000 + n,
    title: b.name,
    body_html: b.description || "",
    vendor: b.author || "TheBookX",
    product_type: cats[0] ? titleCase(cats[0]) : "Books",
    created_at: CREATED_AT,
    handle: slugify(b.name),
    updated_at: UPDATED_AT,
    tags: cats.join(", "),
    status: "active",
    variants: [
      {
        id: 2000000 + n,
        title: b.size || "Paperback",
        price: money(b.discountedPrice),
        compare_at_price: money(b.originalPrice || b.discountedPrice),
        sku: b.id,
        created_at: CREATED_AT,
        updated_at: UPDATED_AT,
        quantity: Math.max(0, Number(b.stock ?? 10)),
        taxable: false,
        option_values: { Format: b.size || "Paperback" },
        grams,
        image: img,
        weight: grams / 1000,
        weight_unit: "kg",
      },
    ],
    image: img,
    _collections: cats.map(collectionId),
  };
}

function digital({ id, variantId, title, handle, sku, price, mrp, body, image }) {
  const img = { src: abs(image || "/icon-512.png") };
  return {
    id,
    title,
    body_html: body,
    vendor: "TheBookX",
    product_type: "Digital",
    created_at: CREATED_AT,
    handle,
    updated_at: UPDATED_AT,
    tags: "quickread",
    status: "active",
    variants: [
      {
        id: variantId,
        title: "Digital",
        price: money(price),
        compare_at_price: money(mrp),
        sku,
        created_at: CREATED_AT,
        updated_at: UPDATED_AT,
        quantity: 9999,
        taxable: false,
        option_values: { Format: "Digital" },
        grams: 0,
        image: img,
        weight: 0,
        weight_unit: "kg",
      },
    ],
    image: img,
    _collections: [QUICKREADS_COLLECTION_ID],
  };
}

let _cache;
function catalog() {
  if (_cache) return _cache;
  const byId = Object.fromEntries(books.map((b) => [b.id, b]));
  const bookProducts = books.map(bookProduct).filter(Boolean);
  const qr = Object.keys(QUICKREAD_META)
    .map((bid) => {
      const n = bookNo(bid);
      const b = byId[bid];
      if (n == null || !b) return null;
      return digital({
        id: 4000000 + n,
        variantId: 5000000 + n,
        title: `QuickRead: ${b.name}`,
        handle: `quickread-${slugify(b.name)}`,
        sku: `QR-${bid}`,
        price: QUICKREAD_PRICE,
        mrp: QUICKREAD_MRP,
        body: `${QUICKREAD_META[bid].count || ""} key insights from ${b.name}. ${QUICKREAD_META[bid].tagline || ""}`.trim(),
        image: b.image,
      });
    })
    .filter(Boolean);
  const plans = [
    digital({
      id: 6000001, variantId: 6000011, title: "QuickReads Unlimited — Monthly",
      handle: "quickreads-unlimited-monthly", sku: SUB_MONTHLY_ID,
      price: SUB_MONTHLY_PRICE, mrp: SUB_MONTHLY_PRICE,
      body: "Unlimited access to every QuickRead for 30 days.",
    }),
    digital({
      id: 6000002, variantId: 6000012, title: "QuickReads Unlimited — Yearly",
      handle: "quickreads-unlimited-yearly", sku: SUB_YEARLY_ID,
      price: SUB_YEARLY_PRICE, mrp: SUB_YEARLY_PRICE,
      body: "Unlimited access to every QuickRead for 365 days.",
    }),
  ];
  const products = [...bookProducts, ...qr, ...plans];

  const used = new Set(
    books.flatMap((b) => (bookNo(b.id) != null ? b.catalogue || [] : [])),
  );
  const cats = [...CATEGORY_ORDER.filter((c) => used.has(c)), ...[...used].filter((c) => !CATEGORY_ORDER.includes(c)).sort()];
  const collections = [
    ...cats.map((c) => ({
      id: collectionId(c),
      updated_at: UPDATED_AT,
      body_html: `${titleCase(c)} books at TheBookX`,
      handle: c,
      image: { src: `${SITE}/icon-512.png` },
      title: titleCase(c),
      created_at: CREATED_AT,
    })),
    {
      id: QUICKREADS_COLLECTION_ID,
      updated_at: UPDATED_AT,
      body_html: "QuickReads: the key insights of a book in minutes (digital, no shipping).",
      handle: "quickreads",
      image: { src: `${SITE}/icon-512.png` },
      title: "QuickReads",
      created_at: CREATED_AT,
    },
  ];
  _cache = { products, collections };
  return _cache;
}

const strip = ({ _collections, ...p }) => p;

export function pageParams(req) {
  const u = new URL(req.url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "100", 10) || 100));
  return { u, page, limit };
}
const slice = (arr, page, limit) => arr.slice((page - 1) * limit, page * limit);

export function listProducts(page, limit) {
  const { products } = catalog();
  return { total: products.length, products: slice(products, page, limit).map(strip) };
}
export function listCollections(page, limit) {
  const { collections } = catalog();
  return { total: collections.length, collections: slice(collections, page, limit) };
}
export function listCollectionProducts(collectionIdParam, page, limit) {
  const cid = Number(collectionIdParam);
  const { products } = catalog();
  const inCol = products.filter((p) => p._collections.includes(cid));
  return { total: inCol.length, products: slice(inCol, page, limit).map(strip) };
}

// Auth. Once SR_CHECKOUT_API_KEY is set, the caller must send the matching
// X-Api-Key, and if X-Api-HMAC-SHA256 is sent it must be the Base64
// HMAC-SHA256 (API secret) of the query string or of an empty body.
// Until the keys are configured the feed is open (it's public catalog data).
export function checkAuth(req) {
  const key = process.env.SR_CHECKOUT_API_KEY;
  const secret = process.env.SR_CHECKOUT_API_SECRET;
  if (!key) return null;
  if (req.headers.get("x-api-key") !== key) return unauthorized();
  const sig = req.headers.get("x-api-hmac-sha256");
  if (sig && secret) {
    const q = new URL(req.url).search.replace(/^\?/, "");
    const ok = [q, "", "{}"].some(
      (msg) => crypto.createHmac("sha256", secret).update(msg).digest("base64") === sig,
    );
    if (!ok) return unauthorized();
  }
  return null;
}
const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 511 });

export const ok = (data) =>
  NextResponse.json(
    { data },
    { headers: { "Cache-Control": "no-store" } },
  );
