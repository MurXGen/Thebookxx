"use client";

import { useMemo, useState } from "react";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import { SlidersHorizontal, AlignJustify } from "lucide-react";

export default function AllBooks() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortType, setSortType] = useState(null);
  const [openSort, setOpenSort] = useState(false);

  /* 📚 Extract unique categories */
  const categories = useMemo(() => {
    const set = new Set();
    books.forEach((b) => b.catalogue?.forEach((c) => set.add(c)));
    return ["all", ...Array.from(set)];
  }, []);

  /* 🔄 Filter + Sort books */
  const filteredBooks = useMemo(() => {
    let data = [...books];

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

  if (!books.length) return null;

  return (
    <section
      className="catalogue-section-2 trending-section"
      style={{ marginTop: "24px" }}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-start gap-16">
        <div>
          <h2 className="font-20 weight-500">All Books</h2>
          <span className="font-14 dark-50">
            Explore novels, self-help, business & more
          </span>
        </div>

        {/* Sort Menu */}
        <div className="sort-wrapper">
          <button
            className="sec-mid-btn flex flex-center"
            onClick={() => setOpenSort((p) => !p)}
            aria-label="Sort books"
          >
            <AlignJustify size={18} />
          </button>

          {openSort && (
            <div className="sort-dropdown">
              <button onClick={() => setSortType("low")}>Lowest price</button>
              <button onClick={() => setSortType("high")}>Highest price</button>
              <button onClick={() => setSortType("avg")}>Average price</button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid-2 margin-tp-24px">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
