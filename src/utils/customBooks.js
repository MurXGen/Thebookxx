// Custom ("shareable") products — a merchant creates a product with a name,
// price and a cover picked from the book-image library, shares a link, and the
// customer can add it to the same cart & checkout as any catalogue book.
//
// There is no product database: the product is fully encoded in the share link
// and, when opened/added, registered into the in-memory `books` catalogue (and
// localStorage) so every existing cart / bag / checkout / order flow resolves
// it exactly like a normal book.

import { books } from "@/utils/book";
import { bookImages } from "@/utils/bookImages";

const LS_KEY = "tbx_custom_books";

// base64url helpers (URL-safe, no padding).
const toB64Url = (s) => {
  const b64 =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(s)))
      : Buffer.from(s, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64Url = (s) => {
  const b64 = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  return typeof window !== "undefined"
    ? decodeURIComponent(escape(window.atob(b64)))
    : Buffer.from(b64, "base64").toString("utf8");
};

export function encodeProduct({ name, price, imageSlug }) {
  const payload = JSON.stringify({
    n: String(name || "").trim().slice(0, 80),
    p: Math.max(1, Math.round(Number(price) || 0)),
    i: String(imageSlug || ""),
  });
  return toB64Url(payload);
}

export function decodeProduct(code) {
  try {
    const o = JSON.parse(fromB64Url(code));
    const name = String(o.n || "").trim();
    if (!name) return null;
    return {
      name,
      price: Math.max(1, Math.round(Number(o.p) || 0)),
      imageSlug: String(o.i || ""),
    };
  } catch {
    return null;
  }
}

// A catalogue-shaped book object for a custom product.
export function buildCustomBook(code) {
  const p = decodeProduct(code);
  if (!p) return null;
  const image =
    bookImages[p.imageSlug] || Object.values(bookImages)[0] || "";
  return {
    id: `cust-${code}`,
    name: p.name,
    image,
    imageSlug: p.imageSlug,
    description: "",
    catalogue: ["custom"],
    originalPrice: p.price,
    discountedPrice: p.price,
    price: p.price,
    weight: 300,
    custom: true,
  };
}

// Register a custom product into the live catalogue (idempotent) + persist its
// code so it survives reloads. Returns the book object.
export function registerCustomBook(code) {
  const book = buildCustomBook(code);
  if (!book) return null;
  if (!books.some((b) => b.id === book.id)) books.push(book);
  try {
    const codes = new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
    codes.add(code);
    localStorage.setItem(LS_KEY, JSON.stringify([...codes]));
  } catch {}
  return book;
}

// Re-register every persisted custom product (call once on app load so carts
// that contain a custom product still resolve after a refresh).
export function hydrateCustomBooks() {
  try {
    const codes = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    codes.forEach((c) => {
      const book = buildCustomBook(c);
      if (book && !books.some((b) => b.id === book.id)) books.push(book);
    });
  } catch {}
}
