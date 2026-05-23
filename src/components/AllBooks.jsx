"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { getCatalogueData } from "@/utils/catalogueUtils";
import { ArrowRight, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CartBar from "./CartBar";

const SORT_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "low", label: "Price: Low to High" },
  { key: "high", label: "Price: High to Low" },
  { key: "avg", label: "Average Price" },
];

export default function AllBooks() {
  const router = useRouter();

  // ----- Active filter/sort state (what's actually applied) -----
  const [selectedCategories, setSelectedCategories] = useState([]); // multi-select
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortType, setSortType] = useState("default");

  // ----- Modal state -----
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // ----- Staged state (inside the modal — only committed on Apply) -----
  const [stagedCategories, setStagedCategories] = useState([]);
  const [stagedPriceMin, setStagedPriceMin] = useState("");
  const [stagedPriceMax, setStagedPriceMax] = useState("");
  const [stagedSort, setStagedSort] = useState("default");

  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);

  // Get all categories (from your existing util), keeping only ones
  // with at least 11 books so we don't show sparse niche tags.
  const categoryData = useMemo(
    () => getCatalogueData().filter((cat) => cat.count >= 11),
    [],
  );

  // Compute price bounds across all books (excluding ₹1) for placeholders
  const priceBounds = useMemo(() => {
    const prices = books
      .filter((b) => b.discountedPrice !== 1)
      .map((b) => b.discountedPrice);
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, []);

  /* 🔄 Filter + Sort books */
  const filteredBooks = useMemo(() => {
    let data = [...books];

    // ❌ Remove ₹1 books
    data = data.filter((b) => b.discountedPrice !== 1);

    // Category filter (multi-select — book must match ANY selected)
    if (selectedCategories.length > 0) {
      data = data.filter((b) =>
        b.catalogue?.some((c) => selectedCategories.includes(c)),
      );
    }

    // Price range filter
    const minNum = priceMin === "" ? null : Number(priceMin);
    const maxNum = priceMax === "" ? null : Number(priceMax);
    if (minNum !== null && !isNaN(minNum)) {
      data = data.filter((b) => b.discountedPrice >= minNum);
    }
    if (maxNum !== null && !isNaN(maxNum)) {
      data = data.filter((b) => b.discountedPrice <= maxNum);
    }

    // Sort
    if (sortType === "low") {
      data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortType === "high") {
      data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sortType === "avg") {
      data.sort(
        (a, b) =>
          (a.originalPrice + a.discountedPrice) / 2 -
          (b.originalPrice + b.discountedPrice) / 2,
      );
    }

    return data;
  }, [selectedCategories, priceMin, priceMax, sortType]);

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

  // Reset visible count when filters/sort change
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategories, priceMin, priceMax, sortType]);

  // ----- Modal openers — copy active state into staged state -----
  const openFiltersModal = () => {
    setStagedCategories(selectedCategories);
    setStagedPriceMin(priceMin);
    setStagedPriceMax(priceMax);
    setShowFiltersModal(true);
  };

  const openSortModal = () => {
    setStagedSort(sortType);
    setShowSortModal(true);
  };

  // ----- Toggle chip in staged categories -----
  const toggleStagedCategory = (key) => {
    setStagedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ----- Apply / Clear -----
  const applyFilters = () => {
    setSelectedCategories(stagedCategories);
    setPriceMin(stagedPriceMin);
    setPriceMax(stagedPriceMax);
    setShowFiltersModal(false);
  };

  const clearFiltersStaged = () => {
    setStagedCategories([]);
    setStagedPriceMin("");
    setStagedPriceMax("");
  };

  const applySort = () => {
    setSortType(stagedSort);
    setShowSortModal(false);
  };

  const clearSortStaged = () => {
    setStagedSort("default");
  };

  // ----- Active counts for the button badges -----
  const activeFilterCount =
    selectedCategories.length +
    (priceMin !== "" ? 1 : 0) +
    (priceMax !== "" ? 1 : 0);

  const isSortActive = sortType !== "default";

  if (!books.length) return null;

  return (
    <section
      className="catalogue-section-2 trending-section"
      style={{ marginTop: "24px" }}
    >
      {/* Header */}
      <div className="flex flex-row justify-between flex-center gap-16">
        <div className="width100">
          <div className="flex flex-row gap-4 items-center justify-between">
            <h2 className="font-20 weight-500">All Books</h2>
            {/* Filter + Sort buttons */}
            <div className="flex flex-row gap-12 margin-tp-16px items-center">
              <div className="margin-tp-12px font-12 dark-50">
                {visibleBooks.length} of {filteredBooks.length} books
              </div>
              <button
                className="sec-mid-btn flex flex-row gap-8 items-center"
                onClick={openFiltersModal}
              >
                <SlidersHorizontal size={16} />
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      background: "#fb8500",
                      color: "white",
                      borderRadius: "999px",
                      padding: "1px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                      minWidth: "18px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                className="sec-mid-btn flex flex-row gap-8 items-center"
                onClick={openSortModal}
              >
                <ArrowUpDown size={16} />
                {isSortActive && (
                  <span
                    style={{
                      background: "#fb8500",
                      color: "white",
                      borderRadius: "999px",
                      padding: "1px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    1
                  </span>
                )}
              </button>

              {(activeFilterCount > 0 || isSortActive) && (
                <button
                  className="sec-mid-btn flex flex-row gap-4 items-center"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceMin("");
                    setPriceMax("");
                    setSortType("default");
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-between flex-center gap-16">
            <span className="font-14 dark-50">
              Explore novels, self-help, business & more
            </span>
            {/* Results count */}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid-2 margin-tp-24px">
        {visibleBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Empty state */}
      {filteredBooks.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📚</div>
          <h3 className="font-16 weight-600">No books match your filters</h3>
          <p className="font-12 dark-50 mt-8">
            Try adjusting your filters or clear them to see all books
          </p>
          <button
            onClick={() => {
              setSelectedCategories([]);
              setPriceMin("");
              setPriceMax("");
              setSortType("default");
            }}
            className="pri-big-btn mt-16"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading indicator and trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="load-more-trigger"
          style={{
            textAlign: "center",
            padding: "40px 0",
            marginTop: "20px",
          }}
        >
          {isLoading ? (
            <div className="loading-spinner">
              <span>Loading more books...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="sec-mid-btn"
              style={{ padding: "12px 24px" }}
            >
              Load More Books
            </button>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && visibleBooks.length > 0 && (
        <div
          className="end-message"
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#666",
          }}
        >
          ✨ You{"'"}ve seen all {visibleBooks.length} books ✨
        </div>
      )}

      {/* ===== Filters Modal ===== */}
      <AnimatePresence>
        {showFiltersModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFiltersModal(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Filters</span>
                <div className="flex flex-row gap-12 items-center">
                  <span
                    className="cursor-pointer font-12 orange"
                    onClick={clearFiltersStaged}
                  >
                    Clear
                  </span>
                  <span
                    className="cursor-pointer"
                    onClick={() => setShowFiltersModal(false)}
                  >
                    <X size={16} />
                  </span>
                </div>
              </div>

              <div
                className="address-form-content"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {/* Category */}
                <div className="input-group">
                  <label className="weight-600">Category</label>
                  <span className="font-10 dark-50">
                    Select one or more categories
                  </span>
                  <div
                    style={{
                      display: "flex",
                      overflow: "scroll",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    {categoryData.map((cat) => {
                      const isSelected = stagedCategories.includes(cat.key);
                      return (
                        <button
                          key={cat.key}
                          onClick={() => toggleStagedCategory(cat.key)}
                          className="sec-mid-btn"
                          style={{
                            minWidth: "fit-content",
                            maxWidth: "fit-content",
                          }}
                        >
                          <span
                            style={{
                              minWidth: "fit-content",
                              maxWidth: "fit-content",
                            }}
                          >
                            {cat.label}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              opacity: 0.6,
                              fontWeight: 500,
                            }}
                          >
                            ({cat.count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="input-group">
                  <label className="weight-600">Price Range</label>
                  <span className="font-10 dark-50">
                    Books range from ₹{priceBounds.min} to ₹{priceBounds.max}
                  </span>
                  <div
                    className="flex flex-row gap-12"
                    style={{ marginTop: "8px" }}
                  >
                    <div className="input-group flex-1" style={{ margin: 0 }}>
                      <label className="font-12">Min ₹</label>
                      <input
                        type="number"
                        className="sec-mid-btn width100"
                        placeholder={`${priceBounds.min}`}
                        value={stagedPriceMin}
                        onChange={(e) =>
                          setStagedPriceMin(
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                      />
                    </div>
                    <div className="input-group flex-1" style={{ margin: 0 }}>
                      <label className="font-12">Max ₹</label>
                      <input
                        type="number"
                        className="sec-mid-btn width100"
                        placeholder={`${priceBounds.max}`}
                        value={stagedPriceMax}
                        onChange={(e) =>
                          setStagedPriceMax(
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row gap-12 p-20">
                <button className="pri-big-btn flex-1" onClick={applyFilters}>
                  Apply Filters
                </button>
                <button
                  className="sec-mid-btn"
                  onClick={() => setShowFiltersModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Sort Modal ===== */}
      <AnimatePresence>
        {showSortModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSortModal(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal flex flex-col gap-12"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Sort By</span>
                <div className="flex flex-row gap-12 items-center">
                  <span
                    className="cursor-pointer font-12 orange"
                    onClick={clearSortStaged}
                  >
                    Clear
                  </span>
                  <span
                    className="cursor-pointer"
                    onClick={() => setShowSortModal(false)}
                  >
                    <X size={16} />
                  </span>
                </div>
              </div>

              <div className="address-form-content">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = stagedSort === opt.key;
                    return (
                      <label
                        key={opt.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          borderRadius: "10px",
                          border: `1.5px solid ${isSelected ? "#fb8500" : "#e5e7eb"}`,
                          background: isSelected ? "#fff4e5" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          className="font-14"
                          style={{
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? "#fb8500" : "#374151",
                          }}
                        >
                          {opt.label}
                        </span>
                        <input
                          type="radio"
                          name="sort"
                          value={opt.key}
                          checked={isSelected}
                          onChange={() => setStagedSort(opt.key)}
                          style={{ accentColor: "#fb8500" }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-row gap-12 p-20">
                <button className="pri-big-btn flex-1" onClick={applySort}>
                  Apply Sort
                </button>
                <button
                  className="sec-mid-btn"
                  onClick={() => setShowSortModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
