// app/quickreads/page.jsx — QuickReads hub (server component for SEO).
import Script from "next/script";
import Navbar from "@/components/Navbar";
import CartBar from "@/components/CartBar";
import HomeTabs from "@/components/quickreads/HomeTabs";
import QuickReadsSection from "@/components/quickreads/QuickReadsSection";
import { books } from "@/utils/book";
import { quickReadBookIds, quickReadFrameCount, QUICKREAD_PRICE } from "@/data/quickreads";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SITE = "https://www.thebookx.in";
const PAGE_URL = `${SITE}/quickreads`;

// Aggressive, price + intent-led metadata mirroring the rest of TheBookX.
// The root layout appends "| TheBookX" via its title template.
export const metadata = {
  title: "QuickReads — Key Insights & Book Summaries in Minutes",
  description:
    "QuickReads by TheBookX — skip the 200+ pages and get the most valuable lessons, frameworks and insights from bestselling books in minutes. Beautifully bite-sized, just ₹49 per book. Read the key ideas of Ikigai and more, instantly.",
  keywords: [
    "QuickReads",
    "TheBookX QuickReads",
    "book summaries",
    "book summaries online india",
    "key insights from books",
    "micro learning",
    "bite-sized book insights",
    "read books in minutes",
    "Ikigai summary",
    "book key takeaways",
    "self help book summaries",
    "TheBookX",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "QuickReads by TheBookX — Big Ideas from Great Books in Minutes",
    description:
      "Get the most valuable lessons and frameworks from bestselling books in minutes. Bite-sized insights, just ₹49 per book.",
    url: PAGE_URL,
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickReads by TheBookX — Key Insights in Minutes",
    description:
      "Skip the 200+ pages. Read the key insights from bestselling books in minutes, just ₹49.",
  },
  robots: { index: true, follow: true },
};

export default function QuickReadsPage() {
  const seenNames = new Set();
  const items = quickReadBookIds()
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean)
    // Same title can exist under multiple catalogue ids — list it once.
    .filter((b) => {
      const key = (b.name || "").trim().toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": PAGE_URL,
    name: "QuickReads by TheBookX",
    description:
      "Key insights, lessons and frameworks from bestselling books — bite-sized and readable in minutes.",
    url: PAGE_URL,
    isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website` },
    publisher: { "@id": `${SITE}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((book, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE}/quickreads/${slugify(book.name)}`,
        name: `${book.name} QuickReads`,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "QuickReads", item: PAGE_URL },
    ],
  };

  // Product markup for each QuickRead so shopping/rich results read price + title.
  const productsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "QuickReads catalogue",
    itemListElement: items.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: `${book.name} QuickReads`,
        image: book.image,
        brand: { "@type": "Brand", name: "TheBookX" },
        description: `Key insights and lessons from ${book.name}${book.author ? ` by ${book.author}` : ""} — ${quickReadFrameCount(book.id)} bite-sized QuickReads.`,
        url: `${SITE}/quickreads/${slugify(book.name)}`,
        offers: {
          "@type": "Offer",
          price: String(QUICKREAD_PRICE),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${SITE}/quickreads/${slugify(book.name)}`,
        },
      },
    })),
  };

  return (
    <>
      <Script
        id="quickreads-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Script
        id="quickreads-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="quickreads-products-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsSchema) }}
      />

      <Navbar />

      {/* Books / QuickReads primary tabs (Books navigates back to /) */}
      <HomeTabs active="quickreads" />

      {/* Visible H1 for the page (QuickReadsSection renders an h2 sub-head). */}
      <h1 className="sr-only">
        QuickReads by TheBookX — Key Insights &amp; Book Summaries in Minutes
      </h1>

      <QuickReadsSection />

      {/* Internal linking — helps crawlers reach every QuickReads book page. */}
      <nav className="qr-seo-links section-1200" aria-label="All QuickReads">
        <h2 className="qr-seo-links-title">Browse all QuickReads</h2>
        <div className="qr-seo-links-grid">
          {items.map((book) => (
            <a
              key={book.id}
              href={`/quickreads/${slugify(book.name)}`}
              className="qr-seo-link"
            >
              {book.name} QuickReads
            </a>
          ))}
        </div>
      </nav>

      <CartBar tab="quickreads" />
    </>
  );
}
