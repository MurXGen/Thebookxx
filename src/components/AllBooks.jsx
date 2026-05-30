"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { getCatalogueData } from "@/utils/catalogueUtils";
import { ArrowRight, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CartBar from "./CartBar";

const SORT_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "low", label: "Price: Low to High" },
  { key: "high", label: "Price: High to Low" },
  { key: "avg", label: "Average Price" },
];

// Keys that count as "bestseller" — case-insensitive match.
// Add more variants here if your data uses a different key (e.g. "top-pick").
const BESTSELLER_KEYS = [
  "bestseller",
  "bestsellers",
  "best-seller",
  "best_seller",
];

// Flexible bestseller detection — works regardless of which field your book
// schema uses to mark bestsellers (catalogue array, tag string, or tags array).
const isBestseller = (book) => {
  const lc = (v) => (typeof v === "string" ? v.toLowerCase() : "");
  if (book.catalogue?.some((k) => BESTSELLER_KEYS.includes(lc(k)))) return true;
  if (book.tags?.some((t) => BESTSELLER_KEYS.includes(lc(t)))) return true;
  if (BESTSELLER_KEYS.includes(lc(book.tag))) return true;
  if (book.isBestseller === true) return true;
  return false;
};

export default function AllBooks() {
  const router = useRouter();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortType, setSortType] = useState("default");

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const [stagedCategories, setStagedCategories] = useState([]);
  const [stagedPriceMin, setStagedPriceMin] = useState("");
  const [stagedPriceMax, setStagedPriceMax] = useState("");
  const [stagedSort, setStagedSort] = useState("default");

  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Random score per bestseller book — populated once on mount so the order
  // is fresh on every page reload, but stable across filter changes.
  const [bestsellerScores, setBestsellerScores] = useState({});

  useEffect(() => {
    const scores = {};
    books.forEach((b) => {
      if (isBestseller(b)) scores[b.id] = Math.random();
    });
    setBestsellerScores(scores);
  }, []);

  const categoryData = useMemo(
    () => getCatalogueData().filter((cat) => cat.count >= 11),
    [],
  );

  const priceBounds = useMemo(() => {
    const prices = books
      .filter((b) => b.discountedPrice !== 1)
      .map((b) => b.discountedPrice);
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, []);

  const filteredBooks = useMemo(() => {
    let data = [...books];
    data = data.filter((b) => b.discountedPrice !== 1);

    if (selectedCategories.length > 0) {
      data = data.filter((b) =>
        b.catalogue?.some((c) => selectedCategories.includes(c)),
      );
    }

    const minNum = priceMin === "" ? null : Number(priceMin);
    const maxNum = priceMax === "" ? null : Number(priceMax);
    if (minNum !== null && !isNaN(minNum)) {
      data = data.filter((b) => b.discountedPrice >= minNum);
    }
    if (maxNum !== null && !isNaN(maxNum)) {
      data = data.filter((b) => b.discountedPrice <= maxNum);
    }

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
    } else {
      // ----- Default order: bestsellers first (shuffled), then everyone else
      const bestsellers = [];
      const others = [];
      data.forEach((b) => {
        if (isBestseller(b)) bestsellers.push(b);
        else others.push(b);
      });
      // Shuffle bestsellers using the random scores generated on mount
      bestsellers.sort(
        (a, b) => (bestsellerScores[a.id] ?? 0) - (bestsellerScores[b.id] ?? 0),
      );
      data = [...bestsellers, ...others];
    }

    return data;
  }, [selectedCategories, priceMin, priceMax, sortType, bestsellerScores]);

  const visibleBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  const hasMore = visibleCount < filteredBooks.length;

  // Manual load — no IntersectionObserver. Button click is the only trigger.
  const loadMore = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 10, filteredBooks.length));
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategories, priceMin, priceMax, sortType]);

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

  const toggleStagedCategory = (key) => {
    setStagedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

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
      <div className="flex flex-row justify-between flex-center gap-16">
        <div className="width100">
          <div className="flex flex-row gap-4 items-center justify-between">
            <h2 className="font-20 weight-500">All Books</h2>
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
          </div>
        </div>
      </div>

      <div className="grid-2 margin-tp-24px">
        {visibleBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

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

      {/* Manual load-more — click to reveal more books */}
      {hasMore && (
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
          className="flex flex-row justify-center"
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
                      flexDirection: "row",
                      gap: "8px",
                      marginTop: "8px",
                      overflowX: "scroll",
                    }}
                  >
                    {categoryData.map((cat) => {
                      const isSelected = stagedCategories.includes(cat.key);
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => toggleStagedCategory(cat.key)}
                          className={`sec-mid-btn ${isSelected ? "active" : ""}`}
                          aria-pressed={isSelected}
                          style={{
                            minWidth: "fit-content",
                            maxWidth: "fit-content",
                            border: `1.5px solid ${isSelected ? "#fb8500" : "#e5e7eb"}`,
                            background: isSelected ? "#fff4e5" : "#fff",
                            color: isSelected ? "#fb8500" : "#374151",
                            fontWeight: isSelected ? 600 : 500,
                            transition: "all 0.15s ease",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
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
                              opacity: isSelected ? 0.8 : 0.6,
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
                  {stagedCategories.length > 0 && (
                    <span
                      style={{
                        marginLeft: "8px",
                        background: "rgba(255,255,255,0.25)",
                        padding: "1px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                      }}
                    >
                      {stagedCategories.length}
                    </span>
                  )}
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
