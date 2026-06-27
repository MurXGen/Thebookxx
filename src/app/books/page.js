// app/books/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { books } from "@/utils/book";
import LazyBookGrid from "@/components/UI/LazyBookGrid";
import SearchOverlay from "@/components/SearchOverlay";
import { Filter, X, ChevronDown, ChevronUp, Search, ArrowLeft, LayoutGrid } from "lucide-react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartBar from "@/components/CartBar";
import { getCategoryLabel } from "@/utils/catalogueUtils";

// Slugify function for URLs
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const titleCase = (s) =>
  (s || "").replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());

export default function BooksPage() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortType, setSortType] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  // Text query from ?q= (powers the Google sitelinks search box without the
  // useSearchParams Suspense requirement, read straight from the URL).
  const [textQuery, setTextQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q") || "";
    if (q) setTextQuery(q);
  }, []);

  /* 📚 Categories with a representative cover + count for the side rail */
  const railCategories = useMemo(() => {
    const map = new Map();
    books.forEach((b) => {
      (b.catalogue || []).forEach((c) => {
        if (!map.has(c)) map.set(c, { key: c, count: 0, covers: [] });
        const entry = map.get(c);
        entry.count += 1;
        if (entry.covers.length < 2 && b.image) entry.covers.push(b.image);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, []);

  const categories = useMemo(
    () => ["all", ...railCategories.map((c) => c.key)],
    [railCategories],
  );

  const allCovers = useMemo(
    () => books.filter((b) => b.image).slice(0, 2).map((b) => b.image),
    [],
  );

  /* 🔄 Filter + Sort books */
  const filteredBooks = useMemo(() => {
    let data = [...books];

    if (selectedCategory !== "all") {
      data = data.filter((b) => b.catalogue?.includes(selectedCategory));
    }

    // Free-text query (name or category) from the URL ?q= parameter
    const q = textQuery.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.catalogue?.some((c) => c.toLowerCase().includes(q)),
      );
    }

    data = data.filter(
      (b) =>
        b.discountedPrice >= priceRange.min &&
        b.discountedPrice <= priceRange.max,
    );

    if (sortType === "low") {
      data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortType === "high") {
      data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sortType === "name") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    return data;
  }, [selectedCategory, sortType, priceRange, textQuery]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    sortType ||
    priceRange.min > 0 ||
    priceRange.max < 5000;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortType(null);
    setPriceRange({ min: 0, max: 5000 });
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!books.length) return null;

  return (
    <>
      {/* Main CollectionPage Schema */}
      <Script
        id="books-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": "https://thebookx.in/books",
            name: "All Books | TheBookX Online Bookstore",
            description:
              "Browse our complete collection of 300+ books including novels, self-help, business, finance, classics, and trending books. Shop online at the lowest prices, with books starting at just ₹1 and free shipping across India.",
            url: "https://thebookx.in/books",
            publisher: {
              "@type": "Organization",
              name: "TheBookX",
              url: "https://thebookx.in",
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: books.slice(0, 30).map((book, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `https://thebookx.in/books/${slugify(book.name)}`,
                name: book.name,
              })),
            },
            numberOfItems: books.length,
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <Script
        id="books-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://thebookx.in",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Books",
                item: "https://thebookx.in/books",
              },
            ],
          }),
        }}
      />

      {/* Category Listing Schema - Helps Google crawl category pages */}
      <Script
        id="category-listing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Book Categories",
            description: "Browse books by category at TheBookX",
            itemListElement: railCategories.map((c, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: titleCase(c.key),
              url: `https://thebookx.in/category/${slugify(c.key)}`,
            })),
          }),
        }}
      />

      <header className="books-page-header">
        <div className="header-content">
          <h1 className="page-title flex flex-row items-center">
            <ArrowLeft size={20} onClick={() => router.push("/")} />
            {selectedCategory === "all"
              ? "All Books"
              : getCategoryLabel(selectedCategory)}
            <span className="page-title-count">{filteredBooks.length} books</span>
          </h1>
          <div className="header-actions">
            <button
              className={`sec-big-btn flex flex-row flex-center ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <Filter size={14} />
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {hasActiveFilters && (
              <button
                className="sec-big-btn flex flex-row flex-center"
                onClick={clearFilters}
                aria-label="Clear filters"
              >
                <X size={14} />
              </button>
            )}
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

      {/* Two-column browse shell: scrollable category rail + book grid */}
      <div className="books-shell">
        {/* ── Category rail ── */}
        <aside className="cat-rail" aria-label="Browse by category">
          <button
            type="button"
            className={`cat-rail-item ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => selectCategory("all")}
            aria-pressed={selectedCategory === "all"}
          >
            <span className="cat-rail-thumb cat-rail-thumb--all">
              {allCovers.length > 0 ? (
                allCovers.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={`crt-cover crt-cover-${i}`}
                  />
                ))
              ) : (
                <LayoutGrid size={18} />
              )}
            </span>
            <span className="cat-rail-name">All</span>
            <span className="cat-rail-count">{books.length}</span>
          </button>

          {railCategories.map((c) => (
            <a
              key={c.key}
              href={`/category/${slugify(c.key)}`}
              className={`cat-rail-item ${selectedCategory === c.key ? "active" : ""}`}
              aria-pressed={selectedCategory === c.key}
              onClick={(e) => {
                e.preventDefault();
                selectCategory(c.key);
              }}
            >
              <span className="cat-rail-thumb">
                {c.covers.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={`crt-cover crt-cover-${i}`}
                  />
                ))}
              </span>
              <span className="cat-rail-name">{getCategoryLabel(c.key)}</span>
              <span className="cat-rail-count">{c.count}</span>
            </a>
          ))}
        </aside>

        {/* ── Main content ── */}
        <div className="books-main">
          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel filters-panel--inline">
              <div className="filters-content">
                <div className="filter-group">
                  <label className="filter-label">Price Range</label>
                  <div className="price-range">
                    <div className="price-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value) || 0,
                          })
                        }
                        className="price-input"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value) || 5000,
                          })
                        }
                        className="price-input"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: Number(e.target.value),
                        })
                      }
                      className="price-slider"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Sort By</label>
                  <div className="sort-options">
                    <button
                      className={`sort-btn ${sortType === "low" ? "active" : ""}`}
                      onClick={() => setSortType(sortType === "low" ? null : "low")}
                    >
                      Price: Low to High
                    </button>
                    <button
                      className={`sort-btn ${sortType === "high" ? "active" : ""}`}
                      onClick={() => setSortType(sortType === "high" ? null : "high")}
                    >
                      Price: High to Low
                    </button>
                    <button
                      className={`sort-btn ${sortType === "name" ? "active" : ""}`}
                      onClick={() => setSortType(sortType === "name" ? null : "name")}
                    >
                      Name A-Z
                    </button>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    <X size={16} />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Books Grid (2-up mobile / 3-up desktop) with scroll lazy-load */}
          {filteredBooks.length > 0 ? (
            <LazyBookGrid
              items={filteredBooks}
              batch={20}
              className="books-grid books-grid--browse"
            />
          ) : (
            <div className="no-results">
              <div className="no-results-content">
                <span className="no-results-icon">📚</span>
                <h3>No books found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button className="reset-filters-btn" onClick={clearFilters}>
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Internal Linking Section - Helps Google discover all pages */}
      <div className="internal-linking-section">
        <h3 className="font-14 weight-600 mb-12">Popular Categories</h3>
        <div className="popular-categories">
          {[
            "self-help",
            "fiction",
            "romance",
            "thriller",
            "mythology",
            "finance",
            "biography",
            "classic",
          ].map((cat) => {
            const bookCount = books.filter((b) =>
              b.catalogue?.includes(cat),
            ).length;
            if (bookCount > 0) {
              return (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="popular-category-link"
                >
                  {titleCase(cat)} ({bookCount})
                </Link>
              );
            }
            return null;
          })}
        </div>
      </div>
      <CartBar />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
