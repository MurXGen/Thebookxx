import Link from "next/link";
import { slugifyText } from "@/utils/blogExtras";

// "Books in this article" widget — covers + price + buy button. Rendered from
// the books a post links to (server-side, no client JS needed).
export default function RelatedBooks({ books = [] }) {
  if (!books.length) return null;
  return (
    <section className="related-books">
      <h2 className="related-books-title">Books featured in this article</h2>
      <div className="related-books-grid">
        {books.map((b) => {
          const slug = slugifyText(b.name);
          return (
            <div key={b.id || slug} className="related-book-card">
              <Link href={`/books/${slug}`} className="related-book-cover">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.name} loading="lazy" />
                ) : (
                  <div className="related-book-ph"></div>
                )}
              </Link>
              <div className="related-book-info">
                <Link href={`/books/${slug}`} className="related-book-name">
                  {b.name}
                </Link>
                {b.author && (
                  <span className="related-book-author">{b.author}</span>
                )}
                {b.discountedPrice != null && (
                  <span className="related-book-price">
                    ₹{b.discountedPrice}
                    {b.originalPrice > b.discountedPrice && (
                      <span className="related-book-mrp">₹{b.originalPrice}</span>
                    )}
                  </span>
                )}
                <Link href={`/books/${slug}`} className="related-book-btn">
                  Buy now →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
