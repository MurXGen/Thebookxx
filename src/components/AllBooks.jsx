import { books } from "@/utils/book";
import ProductCard from "@/components/BookCard";

export default function AllBooks() {
  if (!books.length) return null;

  return (
    <section className="catalogue-section-2 trending-section">
      {/* Section Header */}
      <div className="flex flex-col">
        <h2 className="font-20 weight-500">All Books</h2>
        <span className="font-14 dark-50">
          Explore novels, self-help, business & more
        </span>
      </div>

      {/* Books Grid */}
      <div className="grid-2 margin-tp-24px">
        {books.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
