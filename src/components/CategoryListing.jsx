"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  SlidersHorizontal,
  Zap,
  Search,
  Fingerprint,
  Ghost,
  Brain,
  TrendingUp,
  Wallet,
  LineChart,
  Landmark,
  Heart,
  BookOpen,
  Library,
  Compass,
  Sprout,
  Rocket,
  Sparkles,
  UserRound,
  Hourglass,
  Baby,
  Star,
  Laugh,
  HeartPulse,
  FlaskConical,
  Trophy,
  Flame,
} from "lucide-react";
import BookCard from "@/components/BookCard";
import LazyBookGrid from "@/components/UI/LazyBookGrid";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import Navbar from "@/components/Navbar";
import { getCategoryTheme } from "@/utils/categoryThemes";

const CAT_ICONS = {
  Zap,
  Search,
  Fingerprint,
  Ghost,
  Brain,
  TrendingUp,
  Wallet,
  LineChart,
  Landmark,
  Heart,
  BookOpen,
  Library,
  Compass,
  Sprout,
  Rocket,
  Sparkles,
  UserRound,
  Hourglass,
  Baby,
  Star,
  Laugh,
  HeartPulse,
  FlaskConical,
  Trophy,
  Flame,
};

const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "low", label: "Price: Low to High" },
  { key: "high", label: "Price: High to Low" },
  { key: "discount", label: "Biggest Discount" },
];

export default function CategoryListing({ books = [], displayName = "", slug = "" }) {
  const theme = getCategoryTheme(slug);
  const CatIcon = CAT_ICONS[theme.icon] || BookOpen;
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
    <div
      className="category-page cat-themed"
      style={{
        "--cat-a": theme.a,
        "--cat-b": theme.b,
        "--cat-accent": theme.accent,
      }}
    >
      <Navbar />

      {/* Tree-root SVGs fixed to the left & right screen edges — tinted to the
          category's accent, kept light. */}
      <svg
        className="cat-root cat-root-left"
        viewBox="0 0 120 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeLinecap="round" fill="none">
          {/* main trunk hugging the edge */}
          <path d="M6 -30 C10 110 26 180 14 300 C4 420 30 500 16 640 C8 740 14 790 12 840" strokeWidth="11" />
          {/* primary roots branching inward */}
          <path d="M16 170 C50 190 74 202 104 244" strokeWidth="6.5" />
          <path d="M15 360 C46 378 70 398 96 448" strokeWidth="6" />
          <path d="M15 560 C42 576 62 600 90 642" strokeWidth="5.5" />
          {/* secondary offshoots + tips */}
          <path d="M104 244 C114 252 119 266 122 284" strokeWidth="3" />
          <path d="M96 448 C108 458 114 474 118 492" strokeWidth="3" />
          <path d="M90 642 C102 652 108 668 112 686" strokeWidth="2.5" />
          <path d="M14 90 C34 100 44 96 60 108" strokeWidth="3" />
        </g>
      </svg>
      <svg
        className="cat-root cat-root-right"
        viewBox="0 0 120 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeLinecap="round" fill="none">
          <path d="M6 -30 C10 110 26 180 14 300 C4 420 30 500 16 640 C8 740 14 790 12 840" strokeWidth="11" />
          <path d="M16 170 C50 190 74 202 104 244" strokeWidth="6.5" />
          <path d="M15 360 C46 378 70 398 96 448" strokeWidth="6" />
          <path d="M15 560 C42 576 62 600 90 642" strokeWidth="5.5" />
          <path d="M104 244 C114 252 119 266 122 284" strokeWidth="3" />
          <path d="M96 448 C108 458 114 474 118 492" strokeWidth="3" />
          <path d="M90 642 C102 652 108 668 112 686" strokeWidth="2.5" />
          <path d="M14 90 C34 100 44 96 60 108" strokeWidth="3" />
        </g>
      </svg>

      <Breadcrumbs
        items={[
          { label: "Books", href: "/books" },
          { label: `${displayName} Books` },
        ]}
      />
      <div className="section-1200">
        <div className="cat-hero-min">
          <Link
            href="/books"
            className="cat-hero-back"
            aria-label="Back to categories"
          >
            <ArrowLeft size={18} />
          </Link>
          {/* Visible H1 — kept for SEO */}
          <h1 className="cat-hero-title">{displayName} Books</h1>
        </div>
      </div>

      {/* Filter / sort toolbar */}
      <div
        className="section-1200 flex flex-row items-center justify-between flex-wrap gap-12"
        style={{ paddingTop: 0 }}
      >
        <span className="font-12 dark-50 cat-count">
          Showing <b>{filtered.length}</b> of {books.length} books
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
