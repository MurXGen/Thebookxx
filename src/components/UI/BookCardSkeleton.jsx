"use client";

// A single book-card shaped skeleton (cover + title lines + price + button).
export default function BookCardSkeleton() {
  return (
    <div className="bcs-card" aria-hidden="true">
      <div className="bcs-cover skel" />
      <div className="bcs-line skel" style={{ width: "88%" }} />
      <div className="bcs-line skel" style={{ width: "56%" }} />
      <div className="bcs-price-row">
        <div className="bcs-price skel" />
        <div className="bcs-old skel" />
      </div>
      <div className="bcs-btn skel" />
    </div>
  );
}

// A section-shaped skeleton: an optional heading bar + a rail of skeleton cards.
export function BooksSkeleton({ count = 6, title = true }) {
  return (
    <section className="section-1200 bcs-section" aria-hidden="true">
      {title && (
        <div className="bcs-head">
          <div className="bcs-title skel" />
          <div className="bcs-sub skel" />
        </div>
      )}
      <div className="bcs-rail">
        {Array.from({ length: count }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
