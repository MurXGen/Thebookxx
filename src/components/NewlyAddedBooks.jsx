import ProductCard from "@/components/BookCard";
import { books } from "@/utils/book";
import HorizontalScroll from "./UI/HorizontalScroll";

export default function NewlyAddedBooks() {
  // 👇 Get latest 50 books
  const newlyAddedBooks = [...books].slice(-50).reverse();

  if (!newlyAddedBooks.length) return null;

  return (
    <section
      className="catalogue-section-2 newly-added-section sparkleContainer"
      style={{ marginTop: "24px" }}
    >
      <HorizontalScroll
        title="Newly Added Books"
        hint="Fresh arrivals →"
        className="margin-tp-24px"
      >
        {newlyAddedBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </HorizontalScroll>
    </section>
  );
}
