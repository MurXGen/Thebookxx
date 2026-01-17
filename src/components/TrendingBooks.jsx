import { books } from "@/utils/book";
import ProductCard from "@/components/BookCard";
import LabelDivider from "./UI/LineDivider";

export default function TrendingBooks() {
  const trendingBooks = books.filter((book) =>
    book.catalogue?.includes("trending")
  );

  if (!trendingBooks.length) return null;

  return (
    <section
      className="catalogue-section-2 trending-section"
      style={{ marginTop: "24px" }}
    >
      {/* Section Header */}
      <LabelDivider label="Trending books" />

      {/* Books Grid */}
      <div className="trending-grid margin-tp-24px">
        {trendingBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
