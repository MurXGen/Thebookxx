"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import BookCard from "@/components/BookCard";
import HorizontalScroll from "@/components/UI/HorizontalScroll";

// Shared sort + price-filter options for every homepage rail.
const SORT_OPTS = [
  { k: "featured", label: "Featured" },
  { k: "price-asc", label: "Price: Low → High" },
  { k: "price-desc", label: "Price: High → Low" },
  { k: "save", label: "Biggest saving" },
];
const PRICE_OPTS = [
  { k: "all", label: "Any price", max: Infinity },
  { k: "199", label: "Under ₹199", max: 199 },
  { k: "299", label: "Under ₹299", max: 299 },
  { k: "499", label: "Under ₹499", max: 499 },
  { k: "999", label: "Under ₹999", max: 999 },
];

/**
 * BookRail — a noticeable, SEO-friendly homepage section that shows a
 * horizontally-scrollable rail of real <BookCard>s (same UI as "All Books"),
 * with a common sort + price filter applied per-section.
 */
export default function BookRail({
  id,
  icon: Icon,
  badge,
  title,
  subtitle,
  pill,
  books = [],
  controls = true,
}) {
  const [sort, setSort] = useState("featured");
  const [priceK, setPriceK] = useState("all");

  const shown = useMemo(() => {
    const max = (PRICE_OPTS.find((p) => p.k === priceK) || {}).max ?? Infinity;
    let list = books.filter((b) => (b.discountedPrice || 0) <= max);
    const price = (b) => Number(b.discountedPrice) || 0;
    const save = (b) =>
      Math.max(0, (Number(b.originalPrice) || 0) - price(b));
    if (sort === "price-asc") list = [...list].sort((a, b) => price(a) - price(b));
    else if (sort === "price-desc")
      list = [...list].sort((a, b) => price(b) - price(a));
    else if (sort === "save") list = [...list].sort((a, b) => save(b) - save(a));
    return list;
  }, [books, sort, priceK]);

  if (!books.length) return null;

  return (
    <section className="book-rail section-1200" aria-labelledby={`${id}-h`}>
      <div className="book-rail-head">
        <div className="book-rail-head-left">
          {badge && (
            <span className="book-rail-badge">
              {Icon && <Icon size={13} />} {badge}
            </span>
          )}
          <h2 id={`${id}-h`} className="book-rail-title">
            {title}
          </h2>
          {subtitle && <p className="book-rail-sub">{subtitle}</p>}
        </div>
        {pill && (
          <span className="book-rail-pill">
            {Icon && <Icon size={13} />} {pill}
          </span>
        )}
      </div>

      {controls && (
        <div className="book-rail-controls">
          <label className="book-rail-ctrl">
            <ArrowUpDown size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTS.map((o) => (
                <option key={o.k} value={o.k}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="book-rail-ctrl">
            <SlidersHorizontal size={14} />
            <select value={priceK} onChange={(e) => setPriceK(e.target.value)}>
              {PRICE_OPTS.map((o) => (
                <option key={o.k} value={o.k}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <span className="book-rail-count">{shown.length} books</span>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="book-rail-empty">No books match this filter.</p>
      ) : (
        <HorizontalScroll title="">
          {shown.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </HorizontalScroll>
      )}
    </section>
  );
}
