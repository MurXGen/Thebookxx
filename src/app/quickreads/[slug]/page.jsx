// app/quickreads/[slug]/page.jsx — per-book QuickReads landing (SEO).
import Script from "next/script";
import { notFound, redirect } from "next/navigation";
import { books } from "@/utils/book";
import {
  hasQuickRead,
  getQuickRead,
  quickReadBookIds,
  quickReadFrameCount,
  QUICKREAD_PRICE,
} from "@/data/quickreads";
import QuickReadBookLanding from "@/components/quickreads/QuickReadBookLanding";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SITE = "https://www.thebookx.in";

// Only books that actually have QuickReads get a page.
function findQuickReadBook(decodedSlug) {
  return books.find(
    (b) => hasQuickRead(b.id) && slugify(b.name) === decodedSlug,
  );
}

export function generateStaticParams() {
  return quickReadBookIds()
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean)
    .map((b) => ({ slug: slugify(b.name) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const book = findQuickReadBook(decodedSlug);

  // Support ID-based links → redirect to the canonical slug.
  if (!book) {
    const byId = books.find(
      (b) => hasQuickRead(b.id) && b.id.toLowerCase() === decodedSlug,
    );
    if (byId) {
      return {
        title: "Redirecting…",
        robots: { index: false, follow: false },
        alternates: {
          canonical: `${SITE}/quickreads/${slugify(byId.name)}`,
        },
      };
    }
    return {
      title: "QuickRead Not Found",
      description: "This QuickRead could not be found at TheBookX.",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE}/quickreads/${slugify(book.name)}`;
  const count = quickReadFrameCount(book.id);
  // Root template appends "| TheBookX". Title leads with the book + "QuickReads".
  const title = `${book.name} QuickReads — Key Insights & Summary`;
  const description = `${book.name} QuickReads by TheBookX${book.author ? ` — ${book.author}` : ""}. Get ${count} key insights, lessons and frameworks from ${book.name} in minutes, beautifully bite-sized for just ₹${QUICKREAD_PRICE}. Read the big ideas instantly.`;

  return {
    title,
    description,
    keywords: `${book.name} QuickReads, ${book.name} summary, ${book.name} key insights, ${book.name} book summary, ${book.name} takeaways${book.author ? `, ${book.author}` : ""}, book summaries india, TheBookX QuickReads, read ${book.name} in minutes`,
    authors: [{ name: book.author || "TheBookX" }],
    alternates: { canonical: url },
    openGraph: {
      title: `${book.name} QuickReads — Key Insights in Minutes`,
      description,
      url,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "article",
      images: book.image
        ? [{ url: book.image, width: 1200, height: 630, alt: `${book.name} QuickReads` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.name} QuickReads — TheBookX`,
      description,
      images: book.image ? [book.image] : undefined,
    },
    other: {
      "product:brand": "TheBookX",
      "product:availability": "in stock",
      "product:price:amount": String(QUICKREAD_PRICE),
      "product:price:currency": "INR",
      "og:price:amount": String(QUICKREAD_PRICE),
      "og:price:currency": "INR",
    },
    robots: { index: true, follow: true },
  };
}

export default async function QuickReadBookPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  let book = findQuickReadBook(decodedSlug);

  if (!book) {
    const byId = books.find(
      (b) => hasQuickRead(b.id) && b.id.toLowerCase() === decodedSlug,
    );
    if (byId) redirect(`/quickreads/${slugify(byId.name)}`);
    notFound();
  }

  const url = `${SITE}/quickreads/${slugify(book.name)}`;
  const count = quickReadFrameCount(book.id);
  const data = getQuickRead(book.id);
  const frames = data?.frames || [];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${book.name} QuickReads`,
    image: book.image,
    description: `Key insights and lessons from ${book.name}${book.author ? ` by ${book.author}` : ""} — ${count} bite-sized QuickReads by TheBookX.`,
    brand: { "@type": "Brand", name: "TheBookX" },
    url,
    offers: {
      "@type": "Offer",
      price: String(QUICKREAD_PRICE),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "QuickReads", item: `${SITE}/quickreads` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${book.name} QuickReads`,
        item: url,
      },
    ],
  };

  // Insight titles as an ItemList — crawlable table of contents.
  const tocSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${book.name} QuickReads — key insights`,
    numberOfItems: frames.length,
    itemListElement: frames.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.title,
    })),
  };

  return (
    <>
      <Script
        id="quickread-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="quickread-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="quickread-toc-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tocSchema) }}
      />
      <QuickReadBookLanding book={book} />
    </>
  );
}
