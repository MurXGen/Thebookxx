"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";

export default function CatalogueModal({ category, onClose }) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => book.catalogue?.includes(category));
  }, [category]);

  // Capitalize category for heading
  const title =
    category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");

  // Get visible books
  const visibleBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  // Check if there are more books to load
  const hasMore = visibleCount < filteredBooks.length;

  // Load more books
  const loadMore = () => {
    if (isLoading) return;

    setIsLoading(true);
    // Simulate loading delay for smooth UX
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

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(10);
  }, [category]);

  // Handle modal body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="catalogue-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="catalogue-modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              onClick={onClose}
              className="flex items-center sec-mid-btn"
              aria-label="Close catalogue"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body grid-2">
            {filteredBooks.length > 0 ? (
              <>
                {visibleBooks.map((book) => (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <BookCard key={book.id} book={book} />
                    </div>
                  </>
                ))}

                {/* Loading indicator and trigger */}
                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="load-more-trigger"
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      marginTop: "10px",
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
                        style={{ padding: "10px 20px" }}
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
                      padding: "20px 0",
                      color: "#666",
                    }}
                  >
                    ✨ You{"'"}ve seen all {visibleBooks.length} books ✨
                  </div>
                )}
              </>
            ) : (
              <p className="empty-state">No books available in this category</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
