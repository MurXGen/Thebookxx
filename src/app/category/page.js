// app/categories/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import PageHeader from "@/components/UI/PageHeader";
import {
  getCatalogueData,
  getBooksByCategory,
} from "@/utils/catalogueUtils";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getCatalogueData();
    const enriched = [...data]
      .sort((a, b) => b.count - a.count)
      .map((c) => {
        const covers = getBooksByCategory(c.key)
          .filter((b) => b.image)
          .slice(0, 3)
          .map((b) => b.image);
        return { ...c, covers };
      });
    setCategories(enriched);
    setLoading(false);
  }, []);

  const srcOf = (c) => (typeof c === "string" ? c : c?.src);

  return (
    <div className="categories-page">
      <div className="section-1200 flex flex-col gap-16">
        <div className="categories-header">
          <PageHeader
            title="All Categories"
            subtitle="Explore genres and find your next favourite book"
          />
        </div>

        <div className="cat-gallery-grid">
          {(loading ? Array.from({ length: 9 }) : categories).map((category, i) => {
            if (loading) {
              return (
                <div key={i} className="catg-card">
                  <div className="catg-head">
                    <span
                      className="skeleton-box"
                      style={{ width: 90, height: 16, borderRadius: 6 }}
                    />
                  </div>
                  <div className="catg-stage skeleton-box" />
                </div>
              );
            }
            const covers = category.covers || [];
            // index 0 = center (forward), 1 = right (behind), 2 = left (behind)
            const posFor = (idx) =>
              idx === 0 ? "center" : idx === 1 ? "right" : "left";
            return (
              <Link
                key={category.key}
                href={`/category/${slugify(category.key)}`}
                className="catg-card"
                aria-label={`Browse ${category.label} books`}
                style={{
                  background: `linear-gradient(160deg, ${category.color}1a, ${category.color}07)`,
                }}
              >
                <div className="catg-head">
                  <span className="catg-title">{category.label}</span>
                  <span className="catg-count">{category.count}</span>
                </div>
                <div className="catg-stage">
                  {covers.length > 0 ? (
                    covers.map((c, idx) => (
                      <img
                        key={idx}
                        src={srcOf(c)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className={`catg-cover ${posFor(idx)}`}
                      />
                    ))
                  ) : (
                    <span
                      className="catg-ph"
                      style={{ color: category.color }}
                    >
                      <BookOpen size={30} />
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
