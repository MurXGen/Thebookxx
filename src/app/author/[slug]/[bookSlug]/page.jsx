// app/author/[slug]/[bookSlug]/page.jsx
// Author-scoped alias for a book page (e.g. /author/morgan-housel/the-psychology-of-money).
// NOTE: the first segment MUST be [slug] to match /author/[slug] (Next requires a
// consistent param name across sibling dynamic routes at the same path level).
// Renders the full book detail but canonicalises to the primary /books/<slug> URL,
// so ranking signal consolidates there (no duplicate-content split) while the
// author-scoped URL stays crawlable and internally linked.
import { books } from "@/utils/book";
import { notFound } from "next/navigation";
import BookDetailsModal from "@/components/BookDeatilsModel";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const findBook = (authorSlug, bookSlug) =>
  books.find(
    (b) =>
      b.author &&
      b.author !== "Unknown" &&
      slugify(b.author) === authorSlug &&
      slugify(b.name) === bookSlug,
  );

export async function generateStaticParams() {
  const seen = new Set();
  const params = [];
  books.forEach((b) => {
    if (!b.author || b.author === "Unknown") return;
    const authorSlug = slugify(b.author);
    const bookSlug = slugify(b.name);
    const key = `${authorSlug}/${bookSlug}`;
    if (seen.has(key)) return;
    seen.add(key);
    params.push({ slug: authorSlug, bookSlug });
  });
  return params;
}

export async function generateMetadata({ params }) {
  const { slug: authorSlug, bookSlug } = await params;
  const book = findBook(authorSlug, bookSlug);
  if (!book) {
    return { title: "Book Not Found", robots: { index: false } };
  }
  // Canonical points to the primary book URL so ranking is consolidated there.
  const canonical = `https://www.thebookx.in/books/${bookSlug}`;
  const title = `Buy ${book.name} by ${book.author} Online at the Lowest Price | Books Starting at ₹1`;
  const description = `Buy ${book.name} by ${book.author} online at the lowest price on TheBookX. Free delivery, Cash on Delivery and easy 7-day returns across India.`;

  return {
    title,
    description,
    keywords: `${book.name}, ${book.author}, ${book.author} books, buy ${book.name} online, ${book.name} lowest price, ${book.name} cash on delivery, books starting at ₹1, TheBookX`,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://www.thebookx.in/author/${authorSlug}/${bookSlug}`,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "book",
      images: book.image
        ? [{ url: book.image, alt: `${book.name} book cover` }]
        : [],
    },
  };
}

export default async function AuthorBookPage({ params }) {
  const { slug: authorSlug, bookSlug } = await params;
  const book = findBook(authorSlug, bookSlug);
  if (!book) notFound();
  return <BookDetailsModal book={book} />;
}
