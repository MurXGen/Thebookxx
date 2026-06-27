"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import BookCard from "@/components/BookCard";
import LazyBookGrid from "@/components/UI/LazyBookGrid";
import Breadcrumbs from "@/components/UI/Breadcrumbs";

const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "low", label: "Price: Low to High" },
  { key: "high", label: "Price: High to Low" },
  { key: "discount", label: "Biggest Discount" },
];

export default function CategoryListing({ books = [], displayName = "" }) {
  const [sortType, setSortType] = useState("relevance");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let data = [...books];
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!Number.isNaN(min)) data = data.filter((b) => b.discountedPrice >= min);
    if (!Number.isNaN(max)) data = data.filter((b) => b.discountedPrice <= max);

    if (sortType === "low") {
      data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortType === "high") {
      data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sortType === "discount") {
      data.sort(
        (a, b) =>
          b.originalPrice - b.discountedPrice - (a.originalPrice - a.discountedPrice),
      );
    }
    return data;
  }, [books, sortType, priceMin, priceMax]);

  const clearAll = () => {
    setSortType("relevance");
    setPriceMin("");
    setPriceMax("");
  };

  const activeFilters =
    (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (sortType !== "relevance" ? 1 : 0);

  return (
    <div className="category-page">
      <Breadcrumbs
        items={[
          { label: "Books", href: "/books" },
          { label: `${displayName} Books` },
        ]}
      />
      <div className="section-1200">
        <div className="cat-hero">
          <Link
            href="/category"
            className="cat-hero-back"
            aria-label="Back to categories"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="cat-hero-text">
            {/* Real H1 for SEO */}
            <h1 className="cat-hero-title">{displayName} Books</h1>
            <span className="cat-hero-sub">
              {books.length} books · lowest prices, from ₹1 · free delivery
              across India
            </span>
          </div>
          <div className="cat-hero-thumbs">
            {books
              .filter((b) => b.image)
              .slice(0, 3)
              .map((b, i) => (
                <img
                  key={i}
                  src={typeof b.image === "string" ? b.image : b.image?.src}
                  alt=""
                  aria-hidden="true"
                  className="cat-hero-thumb"
                  loading="lazy"
                />
              ))}
          </div>
        </div>
      </div>

      {/* Filter / sort toolbar */}
      <div
        className="section-1200 flex flex-row items-center justify-between flex-wrap gap-12"
        style={{ paddingTop: 0 }}
      >
        <span className="font-12 dark-50">
          Showing <b style={{ color: "var(--foreground)" }}>{filtered.length}</b>{" "}
          of {books.length} books
        </span>
        <button
          className={`sec-mid-btn ${activeFilters ? "active" : ""}`}
          onClick={() => setShowFilters((s) => !s)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={14} />
          Filter &amp; Sort{activeFilters ? ` (${activeFilters})` : ""}
        </button>
      </div>

      {showFilters && (
        <div
          className="section-1200 flex flex-col gap-16"
          style={{
            paddingTop: 0,
            paddingBottom: "var(--px-16)",
          }}
        >
          <div
            className="flex flex-col gap-16"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--r-md)",
              padding: "var(--px-16)",
            }}
          >
            <div className="flex flex-col gap-8">
              <span className="font-12 weight-600">Sort by</span>
              <div className="flex flex-row flex-wrap gap-8">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    className={`sec-mid-btn ${sortType === s.key ? "active" : ""}`}
                    onClick={() => setSortType(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <span className="font-12 weight-600">Price range (₹)</span>
              <div className="flex flex-row gap-8 items-center">
                <input
                  className="sec-mid-btn"
                  style={{ maxWidth: 120 }}
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <span className="dark-50">, </span>
                <input
                  className="sec-mid-btn"
                  style={{ maxWidth: 120 }}
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
                {activeFilters > 0 && (
                  <button className="tertiary-btn" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          className="section-1200 flex flex-col items-center gap-8"
          style={{ padding: "var(--px-32)", textAlign: "center" }}
        >
          <span className="font-16 weight-600">No books match these filters</span>
          <span className="font-12 dark-50">Try widening your price range.</span>
          <button className="sec-mid-btn" onClick={clearAll}>
            Clear filters
          </button>
        </div>
      ) : (
        <LazyBookGrid items={filtered} batch={20} />
      )}
    </div>
  );
}
