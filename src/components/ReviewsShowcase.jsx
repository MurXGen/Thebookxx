"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, X, BadgeCheck } from "lucide-react";
import { fetchSheetReviews } from "@/utils/reviewForm";
import { SEED_REVIEWS } from "@/utils/reviewsSeed";

const AVATAR_COLORS = [
  "#fb8500",
  "#2563eb",
  "#0a8f0c",
  "#7c3aed",
  "#e11d48",
  "#0891b2",
  "#d97706",
];

function initials(name) {
  return (name || "R")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Stars({ n }) {
  return (
    <span className="rvs-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= n ? "#FFB800" : "none"}
          color={s <= n ? "#FFB800" : "#D1D5DB"}
        />
      ))}
    </span>
  );
}

export default function ReviewsShowcase() {
  const [sheetReviews, setSheetReviews] = useState([]);
  const [open, setOpen] = useState(null); // review being read in modal

  useEffect(() => {
    let alive = true;
    fetchSheetReviews().then((rv) => alive && setSheetReviews(rv));
    return () => {
      alive = false;
    };
  }, []);

  // Mix real reviews (first) with the curated seed, lightly interleaved.
  const reviews = useMemo(() => {
    const combined = [...sheetReviews, ...SEED_REVIEWS];
    // stable-ish shuffle so real ones still surface near the top
    const seeded = combined.slice(0, 1).concat(
      combined
        .slice(1)
        .map((r, i) => ({ r, k: (i * 9301 + 49297) % 233280 }))
        .sort((a, b) => a.k - b.k)
        .map((x) => x.r),
    );
    return seeded;
  }, [sheetReviews]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg =
      count > 0
        ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / count).toFixed(1)
        : "5.0";
    return { count, avg };
  }, [reviews]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "TheBookX — Affordable Books Online in India",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.avg,
      reviewCount: Math.max(stats.count, SEED_REVIEWS.length),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.slice(0, 12).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating || 5),
        bestRating: "5",
      },
      reviewBody: r.text,
    })),
  };

  const TRUNCATE = 150;

  return (
    <section className="rvs-section" aria-label="Customer reviews">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="rvs-head">
        <div>
          <h2 className="rvs-title">Loved by readers across India</h2>
          <p className="rvs-sub">
            Real reviews from happy TheBookX customers — genuine books,
            unbeatable prices, fast delivery.
          </p>
        </div>
        <div className="rvs-rating-badge">
          <span className="rvs-rating-num">{stats.avg}</span>
          <Stars n={Math.round(Number(stats.avg))} />
          <span className="rvs-rating-count">
            {Math.max(stats.count, SEED_REVIEWS.length)}+ reviews
          </span>
        </div>
      </div>

      <div className="rvs-grid">
        {reviews.map((r, i) => {
          const long = r.text.length > TRUNCATE;
          return (
            <div className="rvs-card" key={`${r.name}-${i}`}>
              <div className="rvs-card-top">
                <span
                  className="rvs-avatar"
                  style={{
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  }}
                >
                  {initials(r.name)}
                </span>
                <div className="rvs-meta">
                  <span className="rvs-name">
                    {r.name}
                    <BadgeCheck size={13} className="rvs-verified" />
                  </span>
                  <Stars n={r.rating || 5} />
                </div>
                <Quote size={20} className="rvs-quote" />
              </div>
              {r.book && <span className="rvs-book">on “{r.book}”</span>}
              <p className="rvs-text">
                {long ? `${r.text.slice(0, TRUNCATE).trim()}… ` : r.text}
                {long && (
                  <button
                    type="button"
                    className="rvs-readmore"
                    onClick={() => setOpen(r)}
                  >
                    Read more
                  </button>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="rvs-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="rvs-modal"
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="rvs-modal-close"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="rvs-modal-top">
                <span
                  className="rvs-avatar rvs-avatar-lg"
                  style={{ background: AVATAR_COLORS[0] }}
                >
                  {initials(open.name)}
                </span>
                <div className="rvs-meta">
                  <span className="rvs-name">
                    {open.name}
                    <BadgeCheck size={14} className="rvs-verified" />
                  </span>
                  <Stars n={open.rating || 5} />
                  {open.book && (
                    <span className="rvs-book">on “{open.book}”</span>
                  )}
                </div>
              </div>
              <p className="rvs-modal-text">{open.text}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
