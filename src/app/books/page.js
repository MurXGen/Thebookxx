// app/books/page.js
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import SearchOverlay from "@/components/SearchOverlay";
import { Filter, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import Script from "next/script";
import Link from "next/link";

// Slugify function for URLs
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BooksPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortType, setSortType] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const loadMoreRef = useRef(null);

  /* 📚 Extract unique categories */
  const categories = useMemo(() => {
    const set = new Set();
    books.forEach((b) => b.catalogue?.forEach((c) => set.add(c)));
    return ["all", ...Array.from(set)];
  }, []);

  /* 🔄 Filter + Sort books */
  const filteredBooks = useMemo(() => {
    let data = [...books];

    if (selectedCategory !== "all") {
      data = data.filter((b) => b.catalogue?.includes(selectedCategory));
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
  }, [selectedCategory, sortType, priceRange]);

  const visibleBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  const hasMore = visibleCount < filteredBooks.length;

  const loadMore = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 10, filteredBooks.length));
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoading, visibleCount]);

  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, sortType, priceRange]);

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
              "Browse our complete collection of 300+ books including novels, self-help, business, finance, classics, and trending books. Shop online at best prices with free shipping across India.",
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
            itemListElement: categories
              .filter((c) => c !== "all")
              .map((category, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: category.charAt(0).toUpperCase() + category.slice(1),
                url: `https://thebookx.in/category/${slugify(category)}`,
              })),
          }),
        }}
      />

      <header className="books-page-header">
        <div className="header-content">
          <h1 className="page-title">All Books</h1>
          <div className="header-actions">
            <button
              className="sec-big-btn flex flex-row flex-center"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <Filter size={14} />
              {showFilters ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
            <button className="sec-big-btn flex flex-row flex-center">
              <Search size={14} onClick={() => setSearchOpen(true)} />
            </button>
          </div>
        </div>
      </header>

      {/* Category Navigation - SEO Friendly Links to Category Pages */}
      <div className="category-navigation">
        <div className="category-nav-header">
          <span className="font-12 gray-500">Browse by Category:</span>
        </div>
        <div className="category-links">
          {categories
            .filter((c) => c !== "all")
            .map((category) => (
              <Link
                key={category}
                href={`/category/${slugify(category)}`}
                className="category-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory(category);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Link>
            ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            {/* <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="category-chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-chip ${
                      selectedCategory === cat ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div> */}

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
                  onClick={() =>
                    setSortType(sortType === "high" ? null : "high")
                  }
                >
                  Price: High to Low
                </button>
                <button
                  className={`sort-btn ${sortType === "name" ? "active" : ""}`}
                  onClick={() =>
                    setSortType(sortType === "name" ? null : "name")
                  }
                >
                  Name A-Z
                </button>
              </div>
            </div>

            {(selectedCategory !== "all" ||
              sortType ||
              priceRange.min > 0 ||
              priceRange.max < 5000) && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSelectedCategory("all");
                  setSortType(null);
                  setPriceRange({ min: 0, max: 5000 });
                }}
              >
                <X size={16} />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        <span className="result-count">
          Showing {visibleBooks.length} of {filteredBooks.length} books
        </span>
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {visibleBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading more books...</span>
            </div>
          ) : (
            <button onClick={loadMore} className="load-more-btn">
              Load More Books
            </button>
          )}
        </div>
      )}

      {!hasMore && visibleBooks.length > 0 && (
        <div className="end-message">
          ✨ You've seen all {visibleBooks.length} books ✨
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div className="no-results">
          <div className="no-results-content">
            <span className="no-results-icon">📚</span>
            <h3>No books found</h3>
            <p>Try adjusting your filters or search criteria</p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                setSelectedCategory("all");
                setSortType(null);
                setPriceRange({ min: 0, max: 5000 });
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

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
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({bookCount})
                </Link>
              );
            }
            return null;
          })}
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
