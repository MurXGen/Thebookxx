// src/components/CatalogueSection.jsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { getCatalogueData, getBooksByCategory } from "@/utils/catalogueUtils";
import { books as ALL_BOOKS } from "@/utils/book";

const coversOf = (list) =>
  list
    .filter((b) => b.image)
    .slice(0, 2)
    .map((b) => (typeof b.image === "string" ? b.image : b.image?.src));

// "Shop by category" — one swipeable row right under the hero. Real <a> links
// (not router.push buttons) so every category page is crawlable.
export default function CatalogueSection() {
  const categories = useMemo(
    () => [
      {
        key: "all",
        label: "All books",
        count: ALL_BOOKS.length,
        href: "/books",
        color: "#fd6b01",
        covers: coversOf(ALL_BOOKS),
      },
      ...getCatalogueData().map((cat) => ({
        key: cat.key,
        label: cat.label,
        count: cat.count,
        href: `/category/${cat.key}`,
        color: cat.color,
        covers: coversOf(getBooksByCategory(cat.key)),
      })),
    ],
    [],
  );

  return (
    <section className="catrow section-1200" aria-labelledby="catrow-title">
      <div className="catrow-head">
        <h2 id="catrow-title" className="catrow-title">
          Shop by category
        </h2>
        <Link href="/category" className="catrow-all">
          See all <ChevronRight size={14} />
        </Link>
      </div>

      <nav className="catrow-scroll" aria-label="Book categories">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={cat.href}
            className="catrow-item"
            style={{ "--cat": cat.color }}
            aria-label={`${cat.label} books (${cat.count})`}
          >
            <span className="catrow-tile">
              {cat.covers.length ? (
                cat.covers.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className={`catrow-cover catrow-cover-${i}`}
                  />
                ))
              ) : (
                <LayoutGrid size={20} />
              )}
            </span>
            <span className="catrow-label">{cat.label}</span>
            <span className="catrow-count">{cat.count} books</span>
          </Link>
        ))}
        <Link href="/category" className="catrow-item catrow-more">
          <span className="catrow-tile">
            <ChevronRight size={22} />
          </span>
          <span className="catrow-label">View all</span>
          <span className="catrow-count">categories</span>
        </Link>
      </nav>
    </section>
  );
}
