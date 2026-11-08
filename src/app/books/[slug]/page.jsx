import Link from "next/link";
// app/books/[slug]/page.js
import { books } from "@/utils/book";
import { notFound, redirect } from "next/navigation";
import BookDetailsModal from "@/components/BookDeatilsModel";
import BookAvailabilityGate from "@/components/BookAvailabilityGate";
import {
  SITE,
  FREE_DELIVERY_MIN,
  slugify,
  titleCase,
  bookUrl as pageUrlOf,
  seoNameOf,
  discountOf,
  aboutLine,
  bookJsonLd,
} from "@/lib/bookSeo";

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
          canonical: `${SITE}/books/${correctSlug}`,
        },
      };
    }

    return {
      // Brand suffix is added by the root title template ("%s | TheBookX").
      title: "Book Not Found",
      description: "The requested book could not be found at TheBookX.",
    };
  }

  const bookUrl = pageUrlOf(book);
  const { seoName, seriesTag } = seoNameOf(book);
  const { price, mrp, pct } = discountOf(book);
  const by = book.author ? ` by ${book.author}` : "";

  // Title leads with the book + author (what people search), then the real
  // price and discount, which lifts click-through on price-led searches.
  // Kept near 60 chars incl. the "| TheBookX" the root template appends.
  const priceTag = `₹${price}${pct ? `, ${pct}% off` : ""}`;
  const base = `${seoName}${by}`;
  const title =
    `${base}: ${priceTag}`.length <= 52
      ? `${base}: Buy at ${priceTag}`
      : `${base}: ${priceTag}`.length <= 60
        ? `${base}: ${priceTag}`
        : base.length <= 58
          ? base
          : seoName;

  const cats = (book.catalogue || []).map(titleCase);
  const isHindi = /hindi/i.test(book.language || "");
  const langLabel = isHindi ? "Hindi" : book.language || "English";
  const about = aboutLine(book);
  const delivery =
    price >= FREE_DELIVERY_MIN ? "Free delivery" : `Free delivery above ₹${FREE_DELIVERY_MIN}`;

  const description = `Buy ${seoName}${by} (${langLabel}${
    book.size ? ` ${book.size.toLowerCase()}` : ""
  }) at ₹${price}${pct ? `, ${pct}% off the ₹${mrp} MRP` : ""}. ${
    about && about.length < 110 ? `${about} ` : ""
  }${delivery}, Cash on Delivery and 7-day returns across India.`;

  const keywords = [
    book.name,
    book.author,
    book.author && `${book.author} books`,
    book.author && `${book.name} by ${book.author}`,
    `${book.name} book`,
    `${book.name} book price`,
    `${book.name} paperback`,
    `buy ${book.name} online`,
    `${book.name} online India`,
    seriesTag,
    seriesTag && `${seriesTag} books`,
    isHindi && `${book.name} Hindi book`,
    ...cats.map((c) => `${c} books`),
    "buy books online India",
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
          alt: `${book.name}${by} book cover`,
        },
      ],
      type: "book",
      locale: "en_IN",
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
      "product:brand": book.author || "TheBookX",
      "product:availability": book.stock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:price:amount": String(price),
      "product:price:currency": "INR",
      "og:price:amount": String(price),
      "og:price:currency": "INR",
      ...(pct > 0 && {
        "product:original_price:amount": String(mrp),
        "product:original_price:currency": "INR",
      }),
      "product:retailer_item_id": book.id,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
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

  // All structured data is rendered on the server so crawlers and AI
  // assistants read it in the first HTML (Product/Book, offer, breadcrumbs,
  // FAQ, related books and the no-login order action).
  const orderUrl = `${SITE}/order?books=${book.id}`;
  const jsonLd = bookJsonLd(book);

  return (
    <BookAvailabilityGate slug={slugify(book.name)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BookDetailsModal book={book} />
      <aside className="bd-ai-note">
        <p>
          <b>Shopping with ChatGPT, Claude or another AI assistant?</b> Ask it
          to add <i>{book.name}</i> (ID {book.id}) to your TheBookX cart. Share
          your name, phone, pincode and address, and it can give you a one-tap
          link straight to payment: <code>{orderUrl}</code>.{" "}
          <Link href="/for-ai">How it works</Link>
        </p>
      </aside>
    </BookAvailabilityGate>
  );
}
