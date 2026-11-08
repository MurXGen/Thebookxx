// app/books/page.js — Browse all book categories.
// Server component: real <title>/meta and JSON-LD in the first HTML; the
// interactive browser (filter, sort, search) is a client component.

import { books } from "@/utils/book";
import { getCatalogueData, getBooksByCategory } from "@/utils/catalogueUtils";
import BooksBrowser from "@/components/BooksBrowser";

const SITE = "https://www.thebookx.in";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildCategories() {
  return getCatalogueData().map((cat) => {
    const list = getBooksByCategory(cat.key).filter((b) => b.stock !== 0);
    // "From ₹X": cheapest regular-priced book (₹1 deals are shown separately).
    const prices = list.map((b) => b.discountedPrice).filter((p) => p > 1);
    return {
      key: cat.key,
      slug: slugify(cat.key),
      label: cat.label,
      color: cat.color,
      count: cat.count,
      from: prices.length ? Math.min(...prices) : null,
      covers: list
        .filter((b) => typeof b.image === "string" && b.image)
        .slice(0, 3)
        .map((b) => b.image),
    };
  });
}

export const metadata = {
  title: "All Book Categories: Fiction, Self-Help, Business & More",
  description: `Browse ${books.length}+ books across every category on TheBookX: fiction, self-help, business, finance, thrillers, romance, children's books and more. Genuine copies, Cash on Delivery and free delivery above ₹199.`,
  alternates: { canonical: `${SITE}/books` },
  openGraph: {
    title: "All Book Categories | TheBookX",
    description:
      "Find your next read by category: fiction, self-help, business, thrillers, romance and more.",
    url: `${SITE}/books`,
    siteName: "TheBookX",
    type: "website",
  },
};

export default function BooksPage() {
  const categories = buildCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE}/books`,
        url: `${SITE}/books`,
        name: "All Book Categories",
        description: metadata.description,
        isPartOf: { "@type": "WebSite", name: "TheBookX", url: SITE },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: categories.length,
          itemListElement: categories.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${c.label} books`,
            url: `${SITE}/category/${c.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Categories", item: `${SITE}/books` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BooksBrowser categories={categories} totalBooks={books.length} />
    </>
  );
}
