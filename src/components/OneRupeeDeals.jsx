import { books } from "@/utils/book";
import ProductCard from "@/components/BookCard";
import LabelDivider from "./UI/LineDivider";
import { Percent, Zap } from "lucide-react";

export default function OneRupeeDeals() {
  const oneRupeeBooks = books.filter((book) => book.discountedPrice === 1);

  if (!oneRupeeBooks.length) return null;

  return (
    <section className="catalogue-section-2 trending-section sparkleContainer">
      {/* Section Header */}

      <div className="label-divider">
        <span className="label-text flex flex-row flex-center items-center gap-12 font-20 weight-500">
          ₹1 Deals · Limited Stock
        </span>
        <div className="label-line" />
      </div>
      {/* Books Grid */}
      <div className="trending-grid margin-tp-24px">
        {oneRupeeBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
