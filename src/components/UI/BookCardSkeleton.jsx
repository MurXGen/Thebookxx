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

// A BookRail-shaped skeleton: the REAL heading / badge / subtitle shown
// immediately (so the section is present & readable), with the books area
// replaced by a rail of skeleton cards until the real rail mounts.
export function BookRailSkeleton({
  id,
  icon: Icon,
  badge,
  title,
  subtitle,
  count = 6,
}) {
  return (
    <section className="book-rail section-1200">
      <div className="book-rail-head">
        <div className="book-rail-head-left">
          {badge && (
            <span className="book-rail-badge">
              {Icon && <Icon size={13} />} {badge}
            </span>
          )}
          {title && <h2 className="book-rail-title">{title}</h2>}
          {subtitle && <p className="book-rail-sub">{subtitle}</p>}
        </div>
      </div>
      <div className="bcs-rail" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
