"use client";

import { useState, useRef, useEffect } from "react";
import BookCard from "@/components/BookCard";

/**
 * Renders a grid of books in batches and auto-loads the next batch when the
 * user scrolls near the bottom (IntersectionObserver). Default batch = 20.
 */
export default function LazyBookGrid({
  items = [],
  batch = 20,
  className = "books-grid",
}) {
  const [visible, setVisible] = useState(batch);
  const sentinelRef = useRef(null);

  // Reset when the underlying list changes (e.g. filters/sort)
  useEffect(() => {
    setVisible(batch);
  }, [items, batch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + batch, items.length));
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, batch, visible]);

  const shown = items.slice(0, visible);

  return (
    <>
      <div className={className}>
        {shown.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
      {visible < items.length && (
        <div ref={sentinelRef} className="lazy-sentinel">
          <span className="lazy-spinner" />
          <span>Loading more books…</span>
        </div>
      )}
    </>
  );
}
