// app/books/page.js
"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import SearchOverlay from "@/components/SearchOverlay";
import { Filter, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import SearchMain from "@/components/UI/SearchMain";

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

    // Filter by category
    if (selectedCategory !== "all") {
      data = data.filter((b) => b.catalogue?.includes(selectedCategory));
    }

    // Filter by price range
    data = data.filter(
      (b) =>
        b.discountedPrice >= priceRange.min &&
        b.discountedPrice <= priceRange.max,
    );

    // Sort
    if (sortType === "low") {
      data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortType === "high") {
      data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sortType === "name") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    return data;
  }, [selectedCategory, sortType, priceRange]);

  // Get visible books
  const visibleBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  // Check if there are more books to load
  const hasMore = visibleCount < filteredBooks.length;

  // Load more books
  const loadMore = () => {
    if (isLoading) return;

    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 10, filteredBooks.length));
      setIsLoading(false);
    }, 300);
  };

  // Intersection Observer for infinite scroll
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

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, sortType, priceRange]);

  if (!books.length) return null;

  return (
    <>
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

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            {/* Category Filter */}
            <div className="filter-group">
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
            </div>

            {/* Price Range Filter */}
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

            {/* Sort Options */}
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

            {/* Clear Filters */}
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

      {/* Loading indicator and trigger */}
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

      {/* End message */}
      {!hasMore && visibleBooks.length > 0 && (
        <div className="end-message">
          ✨ You've seen all {visibleBooks.length} books ✨
        </div>
      )}

      {/* No results */}
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
