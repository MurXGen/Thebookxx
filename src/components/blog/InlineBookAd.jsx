import Link from "next/link";
import { slugifyText } from "@/utils/blogExtras";

// In-article book promo — dropped between sections like a native ad, but for
// our own catalogue. Cover + pitch + price + buy button, links to the PDP.
export default function InlineBookAd({ book, label = "Editor's pick" }) {
  if (!book) return null;
  const slug = slugifyText(book.name);
  return (
    <aside className="blog-inline-ad" aria-label="Recommended book">
      <Link href={`/books/${slug}`} className="bia-cover">
        {book.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.image} alt={book.name} loading="lazy" />
        ) : (
          <div className="bia-ph" />
        )}
      </Link>
      <div className="bia-body">
        <span className="bia-tag">{label}</span>
        <Link href={`/books/${slug}`} className="bia-title">
          {book.name}
        </Link>
        {book.author && <span className="bia-author">by {book.author}</span>}
        <p className="bia-pitch">
          A reader favourite on TheBookX — free delivery &amp; Cash on Delivery
          across India.
        </p>
        <div className="bia-cta-row">
          {book.discountedPrice != null && (
            <span className="bia-price">
              ₹{book.discountedPrice}
              {book.originalPrice > book.discountedPrice && (
                <span className="bia-mrp">₹{book.originalPrice}</span>
              )}
            </span>
          )}
          <Link href={`/books/${slug}`} className="bia-btn">
            Grab your copy →
          </Link>
        </div>
      </div>
    </aside>
  );
}
