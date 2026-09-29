// app/books/[slug]/page.js
import { books } from "@/utils/book";
import { notFound, redirect } from "next/navigation";
import BookDetailsModal from "@/components/BookDeatilsModel";
import BookAvailabilityGate from "@/components/BookAvailabilityGate";

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Metadata (also handles redirect case)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // 1⃣ Try normal slug match
  let book = books.find((b) => slugify(b.name) === decodedSlug);

  // 2⃣ If not found try ID match
  if (!book) {
    const bookById = books.find((b) => b.id.toLowerCase() === decodedSlug);

    if (bookById) {
      const correctSlug = slugify(bookById.name);

      return {
        title: "Redirecting...",
        robots: { index: false, follow: false },
        alternates: {
          canonical: `https://thebookx.in/books/${correctSlug}`,
        },
      };
    }

    return {
      // Brand suffix is added by the root title template ("%s | TheBookX").
      title: "Book Not Found",
      description: "The requested book could not be found at TheBookX.",
    };
  }

  const bookUrl = `https://www.thebookx.in/books/${slugify(book.name)}`;
  // No trailing "| TheBookX" here, the root template appends it once,
  // which fixes the previous doubled "| TheBookX | TheBookX" suffix.
  // Title/meta surface the actual price + value keywords ("lowest price",
  // "cash on delivery") to rank for price-led searches.
  // Kept concise (~60 chars incl. the "| TheBookX" the root template appends)
  // so Google displays it verbatim instead of rewriting a long promo title,
  // while still carrying the "from ₹1" price hook.
  const title = book.author
    ? `${book.name} by ${book.author} - Books from ₹1`
    : `${book.name} - Books from ₹1`;

  // Human-readable genre/category labels (drive audience-intent keywords).
  const cats = (book.catalogue || []).map((c) =>
    String(c)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (ch) => ch.toUpperCase()),
  );
  const genrePhrase = cats.length ? cats.join(", ") : "bestselling books";
  const isHindi = /hindi/i.test(book.language || "");
  const langLabel = isHindi ? "Hindi" : book.language || "English";

  const description = `Buy ${book.name}${book.author ? ` by ${book.author}` : ""} (${langLabel}${cats[0] ? `, ${cats[0]}` : ""}) online at the lowest price on TheBookX. Free delivery, Cash on Delivery & easy 7-day returns across India. ${book.description.substring(0, 70)}`;

  // Aggressive, audience-targeted keyword set: exact title, author-fan,
  // price-intent, genre/category, language, and India buy-intent terms.
  const keywords = [
    book.name,
    book.author,
    book.author && `${book.author} books`,
    `${book.name} book`,
    `${book.name} price`,
    `${book.name} lowest price`,
    `buy ${book.name} online`,
    `${book.name} cash on delivery`,
    `${book.name} online India`,
    isHindi && `${book.name} Hindi book`,
    isHindi && `Hindi books online`,
    ...cats,
    ...cats.map((c) => `${c} books online India`),
    "buy books online India",
    "cheap books online",
    "low price books",
    "book shopping online",
    "TheBookX",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title,
    description,
    category: cats[0] || "Books",
    keywords,
    authors: [{ name: book.author || "Various Authors" }],
    alternates: { canonical: bookUrl },
    openGraph: {
      title,
      description,
      url: bookUrl,
      siteName: "TheBookX",
      images: [
        {
          url: book.image,
          width: 1200,
          height: 630,
          alt: `${book.name} book cover`,
        },
      ],
      type: "book",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [book.image],
    },
    // Product-level Open Graph price/availability tags (mirrors the
    // aggressive product markup e-commerce leaders emit) so crawlers and
    // social/shopping surfaces read price + stock straight from the head.
    other: {
      "og:type": "product",
      "product:brand": "TheBookX",
      "product:availability": book.stock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:price:amount": String(book.discountedPrice),
      "product:price:currency": "INR",
      "og:price:amount": String(book.discountedPrice),
      "og:price:currency": "INR",
      ...(book.originalPrice > book.discountedPrice && {
        "product:original_price:amount": String(book.originalPrice),
        "product:original_price:currency": "INR",
      }),
      "product:retailer_item_id": book.id,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Page logic with redirect
export default async function BookDetailsPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // 1⃣ Try slug
  let book = books.find((b) => slugify(b.name) === decodedSlug);

  // 2⃣ If not found try ID redirect
  if (!book) {
    const bookById = books.find((b) => b.id.toLowerCase() === decodedSlug);

    if (bookById) {
      const correctSlug = slugify(bookById.name);

      // THIS IS THE KEY LINE
      redirect(`/books/${correctSlug}`);
    }

    // 3⃣ Not found at all
    notFound();
  }

  return (
    <BookAvailabilityGate slug={slugify(book.name)}>
      <BookDetailsModal book={book} />
    </BookAvailabilityGate>
  );
}
