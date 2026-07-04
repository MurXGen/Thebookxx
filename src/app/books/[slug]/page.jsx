// app/books/[slug]/page.js
import { books } from "@/utils/book";
import { notFound, redirect } from "next/navigation";
import BookDetailsModal from "@/components/BookDeatilsModel";

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ✅ Metadata (also handles redirect case)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // 1️⃣ Try normal slug match
  let book = books.find((b) => slugify(b.name) === decodedSlug);

  // 2️⃣ If not found → try ID match
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
  const title = `Buy ${book.name} by ${book.author || "Various Authors"} Online at the Lowest Price | Books Starting at ₹1`;
  const description = `Buy ${book.name}${book.author ? ` by ${book.author}` : ""} online at the lowest price on TheBookX. Free delivery, Cash on Delivery and easy 7-day returns across India. ${book.description.substring(0, 70)}`;

  return {
    title,
    description,
    keywords: `${book.name}, ${book.author}, ${book.name} price, ${book.name} lowest price, buy ${book.name} online, ${book.name} cash on delivery, ${book.catalogue?.join(", ")}, cheap books online, low price books, TheBookX`,
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

// ✅ Page logic with redirect
export default async function BookDetailsPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // 1️⃣ Try slug
  let book = books.find((b) => slugify(b.name) === decodedSlug);

  // 2️⃣ If not found → try ID → redirect
  if (!book) {
    const bookById = books.find((b) => b.id.toLowerCase() === decodedSlug);

    if (bookById) {
      const correctSlug = slugify(bookById.name);

      // 🔥 THIS IS THE KEY LINE
      redirect(`/books/${correctSlug}`);
    }

    // 3️⃣ Not found at all
    notFound();
  }

  return <BookDetailsModal book={book} />;
}
