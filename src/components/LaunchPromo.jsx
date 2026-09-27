"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, BadgePercent } from "lucide-react";
import { books } from "@/utils/book";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Top-of-homepage launch banner for the most-awaited title. Brand-consistent,
// SEO-rich, with a floating 3D book cover. Currently spotlights "The Art of
// Clarity". Change LAUNCH_TITLE to feature a different book.
const LAUNCH_TITLE = "The Art of Clarity";

export default function LaunchPromo() {
  const book = books.find((b) => b.name === LAUNCH_TITLE);
  if (!book) return null;

  const price = Number(book.discountedPrice) || 0;
  const mrp =
    Number(book.originalPrice) || Math.round((price * 1.5) / 10) * 10;
  const save = Math.max(0, mrp - price);
  const off = mrp > 0 ? Math.round((save / mrp) * 100) : 0;
  const url = `/books/${slugify(book.name)}`;

  return (
    <section className="launch-promo" aria-label={`New launch: ${book.name}`}>
      <div className="section-1200 launch-inner">
        <div className="launch-copy">
          <span className="launch-eyebrow">
            <Sparkles size={14} /> Most-awaited launch · Live now
          </span>
          <h2 className="launch-title">
            <span className="launch-book-name">{book.name}</span> is here — now
            on <span className="launch-brand">TheBookX</span>
          </h2>
          <p className="launch-sub">
            The wait is over. Grab {book.name}
            {book.author ? ` by ${book.author}` : ""} at the lowest price in
            India — authentic paperback, free delivery, Cash on Delivery &amp;
            easy 7-day returns.
          </p>

          <div className="launch-price-row">
            <span className="launch-now">₹{price}</span>
            {mrp > price && <span className="launch-mrp">₹{mrp}</span>}
            {off > 0 && (
              <span className="launch-off">
                <BadgePercent size={13} /> {off}% OFF · Save ₹{save}
              </span>
            )}
          </div>

          <Link href={url} className="launch-cta">
            Grab your copy <ArrowRight size={17} />
          </Link>
        </div>

        <Link href={url} className="launch-stage" aria-label={book.name}>
          <div className="launch-glow" aria-hidden="true" />
          <div className="launch-book">
            {book.image && (
              <img src={book.image} alt={`${book.name} book cover`} />
            )}
            <span className="launch-book-spine" aria-hidden="true" />
            <span className="launch-book-shine" aria-hidden="true" />
          </div>
          <span className="launch-new-tag" aria-hidden="true">
            NEW
          </span>
        </Link>
      </div>
    </section>
  );
}
