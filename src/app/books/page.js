// app/books/page.js — Browse by category (grid of category cards, no book list).
"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { books } from "@/utils/book";
import CartBar from "@/components/CartBar";
import SearchOverlay from "@/components/SearchOverlay";
import CatalogueCard from "@/components/UI/CatalogueCard";
import { getCatalogueData, getBooksByCategory } from "@/utils/catalogueUtils";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BooksPage() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  // All categories, each enriched with a few real book covers for the card.
  const categories = useMemo(
    () =>
      getCatalogueData().map((cat) => ({
        ...cat,
        covers: getBooksByCategory(cat.key)
          .filter((b) => b.image)
          .slice(0, 3)
          .map((b) => b.image),
      })),
    [],
  );

  return (
    <>
      <Script
        id="books-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": "https://thebookx.in/books",
            name: "Browse Book Categories | TheBookX",
            description:
              "Browse books by category on TheBookX — novels, self-help, business, finance, thriller, romance and more. Books starting at ₹1 with free shipping across India.",
            url: "https://thebookx.in/books",
            publisher: {
              "@type": "Organization",
              name: "TheBookX",
              url: "https://thebookx.in",
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: categories.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: c.label,
                url: `https://thebookx.in/category/${slugify(c.key)}`,
              })),
              numberOfItems: categories.length,
            },
          }),
        }}
      />
      <Script
        id="books-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://thebookx.in" },
              { "@type": "ListItem", position: 2, name: "Categories", item: "https://thebookx.in/books" },
            ],
          }),
        }}
      />

      <header className="books-page-header">
        <div className="header-content">
          <h1 className="page-title flex flex-row items-center">
            <ArrowLeft size={20} onClick={() => router.push("/")} />
            Browse Categories
            <span className="page-title-count">{categories.length} categories</span>
          </h1>
          <div className="header-actions">
            <button
              className="sec-big-btn flex flex-row flex-center"
              onClick={() => setSearchOpen(true)}
              aria-label="Search books"
            >
              <Search size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="section-1200">
        <p className="books-cat-intro">
          Pick a category to explore the books inside.
        </p>
        <div className="books-cat-grid">
          {categories.map((cat) => (
            <CatalogueCard
              key={cat.key}
              label={cat.label}
              count={cat.count}
              covers={cat.covers}
              color={cat.color}
              onClick={() => router.push(`/category/${slugify(cat.key)}`)}
            />
          ))}
        </div>
      </div>

      <CartBar />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
