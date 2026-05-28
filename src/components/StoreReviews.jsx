// components/StoreReviews.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, StarHalf, Quote, ShieldCheck, Truck, Clock } from "lucide-react";
import { storeReviews } from "@/utils/storeReviews";
import { BsCash } from "react-icons/bs";

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} size={14} fill="#ffb703" stroke="#ffb703" />
      ))}
      {hasHalfStar && <StarHalf size={14} fill="#ffb703" stroke="#ffb703" />}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <Star key={i} size={14} fill="none" stroke="#d1d5db" />
      ))}
    </div>
  );
};

export default function StoreReviews() {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  // Show latest reviews first (reverse the array)
  const reversedReviews = [...storeReviews].reverse();

  // Triple the reviews for seamless infinite scroll (using reversed order)
  const infiniteReviews = [
    ...reversedReviews,
    ...reversedReviews,
    ...reversedReviews,
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.8; // pixels per frame

    const animate = () => {
      if (!isHovered && scrollContainer) {
        scrollAmount += scrollSpeed;
        if (scrollAmount >= scrollContainer.scrollWidth / 3) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered]);

  // Calculate average rating (using original order doesn't matter for average)
  const avgRating = (
    storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length
  ).toFixed(1);
  const totalReviews = storeReviews.length;

  return (
    <section className="store-reviews-section">
      <div className="section-1200">
        {/* Infinite Scroll Reviews - Now showing latest first */}
        <div
          className="reviews-scroll-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollRef}
            className="reviews-scroll"
            style={{
              overflowX: "auto",
              scrollBehavior: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {infiniteReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="review-card"
                style={{
                  display: "inline-block",
                  width: "320px",
                  marginRight: "20px",
                  verticalAlign: "top",
                }}
              >
                <div className="review-header">
                  <div className="reviewer-avatar">{review.avatar}</div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">{review.name}</div>
                    <div className="reviewer-location">{review.location}</div>
                  </div>
                  {review.verified && (
                    <div className="verified-badge">
                      <ShieldCheck size={12} />
                      Verified
                    </div>
                  )}
                </div>

                <StarRating rating={review.rating} />

                <p className="review-text">{review.review}</p>

                <div className="review-footer">
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="reviews-cta">
          <a
            href="https://www.thebookx.in/review"
            target="_blank"
            rel="noopener noreferrer"
            className="write-review-btn"
          >
            Write a Review
            <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
