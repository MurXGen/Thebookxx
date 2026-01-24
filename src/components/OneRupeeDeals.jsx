import { books } from "@/utils/book";
import ProductCard from "@/components/BookCard";
import LabelDivider from "./UI/LineDivider";

export default function OneRupeeDeals() {
  const oneRupeeBooks = books.filter((book) => book.discountedPrice === 1);

  if (!oneRupeeBooks.length) return null;

  return (
    <section className="catalogue-section-2 trending-section">
      {/* Section Header */}
      <LabelDivider label="₹1 Deals · Limited Stock" />

      {/* Books Grid */}
      <div className="trending-grid margin-tp-24px">
        {oneRupeeBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
