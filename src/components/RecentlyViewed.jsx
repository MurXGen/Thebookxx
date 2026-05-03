// components/RecentlyViewed.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { Eye } from "lucide-react";
import HorizontalScroll from "./UI/HorizontalScroll";

export default function RecentlyViewed() {
  const [recentBooks, setRecentBooks] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const loadRecentlyViewed = useCallback(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");

      if (!stored) {
        setRecentBooks([]);
        setIsVisible(false);
        return;
      }

      const ids = JSON.parse(stored);

      if (!Array.isArray(ids) || ids.length === 0) {
        setRecentBooks([]);
        setIsVisible(false);
        return;
      }

      // Filter to get only valid book objects
      const validBooks = ids
        .map((id) => books.find((book) => book.id === id))
        .filter((book) => book !== undefined);

      setRecentBooks(validBooks);
      setIsVisible(validBooks.length > 0);
    } catch (error) {
      console.error("Error reading recently viewed:", error);
      setRecentBooks([]);
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    // Load initially
    loadRecentlyViewed();

    // Create a custom event listener for when books are viewed
    const handleBookView = () => {
      loadRecentlyViewed();
    };

    // Listen for storage events (when localStorage changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "recentlyViewed") {
        loadRecentlyViewed();
      }
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bookViewed", handleBookView);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bookViewed", handleBookView);
    };
  }, [loadRecentlyViewed]);

  // Only show section if there are recently viewed books
  if (!isVisible || recentBooks.length === 0) return null;

  return (
    <section
      className="catalogue-section-2 trending-section"
      style={{ marginTop: "24px" }}
    >
      {/* Section Header */}
      {/* <div className="label-divider">
        <span className="label-text flex flex-row flex-center items-center gap-12 font-20 weight-500">
          Recently Viewed
        </span>
        <div className="label-line" />
      </div> */}

      {/* Books Grid */}
      <HorizontalScroll title="Recently viewed" className="margin-tp-24px">
        {recentBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </HorizontalScroll>
    </section>
  );
}
