import ProductCard from "@/components/BookCard";
import { books } from "@/utils/book";
import HorizontalScroll from "./UI/HorizontalScroll";

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
      <HorizontalScroll title="Trending books" className="margin-tp-24px">
        {trendingBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </HorizontalScroll>
    </section>
  );
}
