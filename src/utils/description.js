// utils/description.js
//
// Catalogue descriptions are unique per book but padded with the same
// promotional / shipping boilerplate ("…from TheBookX.in, delivered via
// Delhivery and Indian Post, books starting at ₹1, contact us…"). That repeated
// copy hurts SEO (near-duplicate content) and persuasion.
//
// cleanBookDescription() strips inline brand mentions, then drops whole
// boilerplate sentences, keeping each book's genuine, on-topic copy. Shipping /
// returns / ₹1 info already lives in the dedicated PDP accordions. A templated,
// book-specific fallback is used when little real content remains.

// Sentences that are essentially boilerplate (matched AFTER brand mentions are
// stripped). Markers are specific to the promo copy to avoid false positives.
const BOILERPLATE =
  /delhivery|indian post|₹\s?1\b|\bcontact\b|support team|for any queries|your order|satisfaction guaranteed|satisfied readers|reading (journey|needs)|join thousands|limited[- ]?(time|period)|books start(?:ing)?|pristine condition|securely (packaged|delivered|shipped)|unbeatable price|premium quality books|high-quality books|authentic books|trusted (destination|book partner|online bookstore)|your trusted|go-?to online bookstore|grab your copy|order today|shop now/i;

function templatedFallback(book, partial = "") {
  const cats = (book?.catalogue || [])
    .filter(Boolean)
    .slice(0, 2)
    .map((c) => String(c).replace(/-/g, " "))
    .join(" & ");
  const lead = `${book?.name || "This book"}${
    book?.author ? ` by ${book.author}` : ""
  } is a ${cats || "must-read"} title${
    book?.pages ? ` (${book.pages} pages)` : ""
  }.`;
  return [lead, partial].filter(Boolean).join(" ").trim();
}

const tidy = (s) =>
  s
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

export function cleanBookDescription(book) {
  let raw = (book?.description || "").trim();
  if (!raw) return templatedFallback(book);

  // Remove inline brand mentions so the genuine sentence around them survives.
  raw = tidy(
    raw
      .replace(/\s*(from|at|with|by)\s+thebookx(\.in)?/gi, " ")
      .replace(/thebookx(\.in)?/gi, " "),
  );

  const sentences = raw.match(/[^.!?]+[.!?]+/g) || [raw];
  const kept = tidy(
    sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 12 && /\s/.test(s) && !BOILERPLATE.test(s))
      .join(" "),
  );

  return kept.length >= 40 ? kept : templatedFallback(book, kept);
}

// Short, unique meta description (no repeated brand tail across every page).
export function bookMetaDescription(book) {
  const clean = cleanBookDescription(book);
  return clean.length > 158 ? `${clean.slice(0, 155).trim()}…` : clean;
}

// Brand + promotion line appended to the on-page / schema description.
// Includes the book's own name (and author) so the line stays semi-unique per
// page while reinforcing the brand and surfacing promo keywords for SEO.
export function brandPromoLine(book) {
  const name = book?.name || "this book";
  const author = book?.author ? ` by ${book.author}` : "";
  return `Buy ${name}${author} online at TheBookX — India's trusted online bookstore offering free delivery, Cash on Delivery, and books starting at ₹1.`;
}

// Full on-page / schema description: unique cleaned content first (best for SEO
// and the reader), followed by the brand + promotion line.
export function bookDescriptionWithBrand(book) {
  return `${cleanBookDescription(book)} ${brandPromoLine(book)}`.trim();
}
