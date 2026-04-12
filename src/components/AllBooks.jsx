"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { ArrowRight } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CartBar from "./CartBar";

export default function AllBooks() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortType, setSortType] = useState(null);
  const [openSort, setOpenSort] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const router = useRouter();

  /* 🔄 Filter + Sort books */
  const filteredBooks = useMemo(() => {
    let data = [...books];

    // ❌ Remove ₹1 books
    data = data.filter((b) => b.discountedPrice !== 1);

    if (selectedCategory !== "all") {
      data = data.filter((b) => b.catalogue?.includes(selectedCategory));
    }

    if (sortType === "low") {
      data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    }

    if (sortType === "high") {
      data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    }

    if (sortType === "avg") {
      data.sort(
        (a, b) =>
          (a.originalPrice + a.discountedPrice) / 2 -
          (b.originalPrice + b.discountedPrice) / 2,
      );
    }

    return data;
  }, [selectedCategory, sortType]);

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

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, sortType]);

  if (!books.length) return null;

  return (
    <section
      className="catalogue-section-2 trending-section"
      style={{ marginTop: "24px" }}
    >
      {/* Header */}
      <div className="flex flex-row justify-between flex-center gap-16">
        <div className="width100">
          <div className="flex flex-row gap-4 items-center justify-between">
            <h2 className="font-20 weight-500">All Books</h2>
            <span
              className="flex flex-row gap-4 items-center tertiary-btn"
              onClick={() => router.push("/books")}
            >
              View all books
              <ArrowRight size={16} />
            </span>
          </div>

          <span className="font-14 dark-50">
            Explore novels, self-help, business & more
          </span>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid-2 margin-tp-24px">
        {visibleBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Loading indicator and trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="load-more-trigger"
          style={{
            textAlign: "center",
            padding: "40px 0",
            marginTop: "20px",
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
              style={{ padding: "12px 24px" }}
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
            padding: "40px 0",
            color: "#666",
          }}
        >
          ✨ You{"'"}ve seen all {visibleBooks.length} books ✨
        </div>
      )}
    </section>
  );
}
