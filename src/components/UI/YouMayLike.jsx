"use client";

import { useState } from "react";

export default function YouMayLike({
  title,
  subtitle,
  items = [],
  renderItem,
  initialCount = 6,
  step = 6,
  showLoadMore = true,
  isLoadingExternal = false,
  seoBasePath = "/books",
  slugify,
  className = "",
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const handleLoadMore = () => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + step, items.length));
      setLoading(false);
    }, 300);
  };

  return (
    <div className={`books-section ${className}`}>
      {/* HEADER */}
      <div className="section-header mb-24">
        <h3 className="font-20 weight-600">{title}</h3>
        {subtitle && <p className="font-12 dark-50">{subtitle}</p>}
      </div>

      {/* GRID */}
      <div className="grid-2 mt-12">
        {visibleItems.map((item) => renderItem(item))}
      </div>

      {/* LOAD MORE */}
      {showLoadMore && hasMore && (
        <div className="load-more-container flex justify-center width100 mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loading || isLoadingExternal}
            className="sec-mid-btn"
          >
            {loading || isLoadingExternal
              ? "Loading..."
              : `Load More (${visibleCount}/${items.length})`}
          </button>
        </div>
      )}

      {/* SEO LINKS */}
      {slugify && (
        <div className="seo-internal-links" style={{ display: "none" }}>
          {items.map((item) => (
            <a key={item.id} href={`${seoBasePath}/${slugify(item.name)}`}>
              {item.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
