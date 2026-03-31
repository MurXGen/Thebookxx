import ProductCard from "@/components/BookCard";
import { books } from "@/utils/book";

export default function TrendingBooks() {
  const trendingBooks = books.filter((book) =>
    book.catalogue?.includes("trending"),
  );

  if (!trendingBooks.length) return null;

  return (
    <section
      className="catalogue-section-2 trending-section sparkleContainer"
      style={{ marginTop: "24px" }}
    >
      {/* Section Header */}
      <div className="label-divider">
        <span className="label-text flex flex-row flex-center items-center gap-12 font-20 weight-500">
          Trending books
        </span>
        <div className="label-line" />
      </div>

      {/* Books Grid */}
      <div className="trending-grid margin-tp-24px">
        {trendingBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
