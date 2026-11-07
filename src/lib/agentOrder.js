// Order links for AI assistants (and anyone sharing a ready cart).
//
//   https://www.thebookx.in/order?books=bk-005:2,atomic-habits&name=Asha%20Rao
//     &phone=9876543210&pincode=400019&address=Flat%2012%2C%20Green%20Residency…
//
// books   comma list of  <book>[:qty]  where <book> is our ID (bk-005), the book
//         page slug (atomic-habits) or the exact title. qty 1–10, default 1.
// name / phone / pincode / address / email are optional; whatever is given is
// prefilled. With all of name, phone, pincode and a full address (30+ chars)
// the shopper lands directly on "Choose payment method".
import { books } from "@/utils/book";

export const SITE = "https://www.thebookx.in";
export const MAX_QTY = 10;

export const slugify = (t = "") =>
  String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const byId = new Map(books.map((b) => [String(b.id).toLowerCase(), b]));
const bySlug = new Map(books.map((b) => [slugify(b.name), b]));

export function findBook(ref) {
  const r = String(ref || "").trim();
  if (!r) return null;
  const low = r.toLowerCase();
  return byId.get(low) || bySlug.get(low) || bySlug.get(slugify(r)) || null;
}

// → { items: [{ book, qty }], unknown: [ref], notes: [string] }
export function parseBooksParam(param) {
  const items = [];
  const unknown = [];
  const notes = [];
  const seen = new Map();
  String(param || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const m = part.match(/^(.*?)(?::(\d+))?$/);
      const ref = decodeURIComponent((m?.[1] || "").trim());
      const qty = Math.min(MAX_QTY, Math.max(1, parseInt(m?.[2] || "1", 10) || 1));
      const book = findBook(ref);
      if (!book) return unknown.push(ref);
      if (book.stock === 0) return notes.push(`${book.name} is out of stock`);
      if (seen.has(book.id)) seen.get(book.id).qty = Math.min(MAX_QTY, seen.get(book.id).qty + qty);
      else {
        const it = { book, qty };
        seen.set(book.id, it);
        items.push(it);
      }
    });
  // Only one ₹1 book per order.
  let rupee = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    if (Number(items[i].book.discountedPrice) !== 1) continue;
    rupee += items[i].qty;
  }
  if (rupee > 1) {
    let kept = false;
    for (let i = 0; i < items.length; i++) {
      if (Number(items[i].book.discountedPrice) !== 1) continue;
      if (!kept) {
        items[i].qty = 1;
        kept = true;
      } else items.splice(i--, 1);
    }
    notes.push("Only one ₹1 book is allowed per order");
  }
  return { items, unknown, notes };
}

export const cleanPhone = (raw = "") => {
  let d = String(raw).replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.slice(-10);
};

export function buildOrderLink({ books: list = [], name, phone, pincode, address, email } = {}) {
  const u = new URL("/order", SITE);
  const b = list
    .map((x) => (typeof x === "string" ? x : `${x.id}${x.qty > 1 ? `:${x.qty}` : ""}`))
    .join(",");
  if (b) u.searchParams.set("books", b);
  if (name) u.searchParams.set("name", name);
  if (phone) u.searchParams.set("phone", cleanPhone(phone));
  if (pincode) u.searchParams.set("pincode", String(pincode).replace(/\D/g, "").slice(0, 6));
  if (address) u.searchParams.set("address", address);
  if (email) u.searchParams.set("email", email);
  return u.toString();
}
