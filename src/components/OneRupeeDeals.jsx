import ProductCard from "@/components/BookCard";
import { books } from "@/utils/book";
import HorizontalScroll from "./UI/HorizontalScroll";

export default function OneRupeeDeals() {
  const oneRupeeBooks = books.filter((book) => book.discountedPrice === 1);

  if (!oneRupeeBooks.length) return null;

  return (
    <section className="catalogue-section-2 trending-section sparkleContainer">
      {/* Books Grid */}
      <HorizontalScroll title="Grab Books @₹1" className="margin-tp-24px">
        {oneRupeeBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </HorizontalScroll>
    </section>
  );
}
