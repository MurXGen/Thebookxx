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

      {/* Page-wide themed decor — mysterious "roots"/tendrils creeping down the
          left & right edges (SVG), plus one faint category-icon watermark. */}
      <div className="cat-decor" aria-hidden="true">
        <svg
          className="cat-root cat-root-left"
          viewBox="0 0 140 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M78 -10 C62 120 30 160 54 300 C78 440 20 505 48 660 C74 815 60 860 66 930"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M60 150 C90 140 108 158 132 150" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M54 300 C26 316 12 300 -2 292" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M62 470 C96 486 112 470 136 462" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M48 660 C20 678 10 702 -6 708" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="133" cy="150" r="3" fill="currentColor" />
          <circle cx="-2" cy="292" r="3" fill="currentColor" />
          <circle cx="136" cy="462" r="3" fill="currentColor" />
        </svg>
        <svg
          className="cat-root cat-root-right"
          viewBox="0 0 140 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M78 -10 C62 120 30 160 54 300 C78 440 20 505 48 660 C74 815 60 860 66 930"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M60 150 C90 140 108 158 132 150" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M54 300 C26 316 12 300 -2 292" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M62 470 C96 486 112 470 136 462" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M48 660 C20 678 10 702 -6 708" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="133" cy="150" r="3" fill="currentColor" />
          <circle cx="-2" cy="292" r="3" fill="currentColor" />
          <circle cx="136" cy="462" r="3" fill="currentColor" />
        </svg>
        <CatIcon className="cat-decor-ic cat-decor-ic-1" strokeWidth={1.3} />
      </div>

      <Breadcrumbs
        items={[
          { label: "Books", href: "/books" },
          { label: `${displayName} Books` },
        ]}
      />
      {/* SEO H1 kept for crawlers but visually hidden — breadcrumb is the header */}
      <h1 className="sr-only">{displayName} Books</h1>

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
