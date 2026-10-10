"use client";

import BookCard from "@/components/BookCard";
import HorizontalScroll from "@/components/UI/HorizontalScroll";

/**
 * BookRail — a noticeable, SEO-friendly homepage section that shows a
 * horizontally-scrollable rail of real <BookCard>s (same UI as "All Books").
 *
 * Props:
 *   id       – anchor/aria id for the heading
 *   icon     – lucide icon component (rendered in the badge)
 *   badge    – small eyebrow label (e.g. "BESTSELLERS")
 *   title    – big H2 heading
 *   subtitle – supporting line under the heading
 *   pill     – optional highlight pill text (e.g. "Up to 68% off")
 *   books    – array of book objects
 */
export default function BookRail({
  id,
  icon: Icon,
  badge,
  title,
  subtitle,
  pill,
  books = [],
}) {
  if (!books.length) return null;

  return (
    <section className="book-rail section-1200" aria-labelledby={`${id}-h`}>
      <div className="book-rail-head">
        <div className="book-rail-head-left">
          {badge && (
            <span className="book-rail-badge">
              {Icon && <Icon size={13} />} {badge}
            </span>
          )}
          <h2 id={`${id}-h`} className="book-rail-title">
            {title}
          </h2>
          {subtitle && <p className="book-rail-sub">{subtitle}</p>}
        </div>
        {pill && (
          <span className="book-rail-pill">
            {Icon && <Icon size={13} />} {pill}
          </span>
        )}
      </div>

      <HorizontalScroll title="">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </HorizontalScroll>
    </section>
  );
}
