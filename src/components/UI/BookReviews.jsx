// components/BookReviews.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  Quote,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { getReviewsByBook, getAverageRating } from "@/utils/reviews";

export default function BookReviews({ bookId, bookName, authorName }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);

  const reviews = getReviewsByBook(bookId);
  const avgRating = getAverageRating(reviews);
  const totalReviews = reviews.length;

  const toggleExpand = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < totalReviews;

  // Lazy loading with Intersection Observer
  const loadMoreReviews = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 6, totalReviews));
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreReviews();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoading, visibleCount]);

  if (totalReviews === 0) {
    return null;
  }

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="reviews-section-wrapper  flex flex-col gap-24">
      <div className="reviews-header  flex flex-col gap-24">
        <div className="reviews-header-left">
          <h3 className="font-20 weight-600">Reader Reviews</h3>
          <div className="rating-summary flex flex-row justify-between font-12">
            <div className="rating-stars-large">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= Math.round(avgRating) ? "#FFB800" : "none"}
                  color="#FFB800"
                />
              ))}
            </div>
            <div className="flex flex-row gap-4">
              <span className="avg-rating">{avgRating}</span>
              <span className="total-reviews">
                out of 5 · {totalReviews} reviews
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const reviewUrl = `/review?bk=${bookId}`;
            window.location.href = reviewUrl;
          }}
          className="sec-mid-btn width100 flex flex-row gap-4 items-center justify-center"
        >
          <MessageSquare size={16} />
          Write a Review
        </button>
      </div>

      {/* Rating Distribution Bar */}
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star];
          const percentage =
            totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="distribution-row">
              <span className="star-label">{star} ★</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="count-label">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Reviews Grid */}
      <div className="reviews-grid">
        {visibleReviews.map((review) => {
          const isExpanded = expandedReviews[review.id];
          const shouldTruncate = review.comment.length > 180;
          const displayComment = isExpanded
            ? review.comment
            : review.comment.substring(0, 180);

          return (
            <div
              key={review.id}
              className="review-card"
              itemScope
              itemType="https://schema.org/Review"
            >
              <meta itemProp="itemReviewed" content={bookName} />
              <meta itemProp="author" content={review.reviewerName} />
              <meta itemProp="reviewBody" content={review.comment} />

              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.reviewerImage ? (
                      <Image
                        src={review.reviewerImage}
                        alt={`${review.reviewerName} review for ${bookName} by ${authorName}`}
                        width={48}
                        height={48}
                        className="reviewer-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {review.reviewerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">{review.reviewerName}</h4>
                    <div className="review-meta">
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= review.rating ? "#FFB800" : "none"}
                            color="#FFB800"
                          />
                        ))}
                      </div>
                      <span className="review-date">{review.date}</span>
                      {review.verified && (
                        <span className="verified-badge">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="rating-value"
                  itemProp="reviewRating"
                  itemScope
                  itemType="https://schema.org/Rating"
                >
                  <meta itemProp="ratingValue" content={review.rating} />
                  <meta itemProp="bestRating" content="5" />
                </div>
              </div>

              <div className="review-content">
                <Quote size={16} className="quote-icon" />
                <p className="review-comment">
                  {displayComment}
                  {shouldTruncate && !isExpanded && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="read-more-btn"
                    >
                      ... read more
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="read-less-btn"
                    >
                      show less
                    </button>
                  )}
                </p>
              </div>

              <div className="review-footer">
                <button className="helpful-btn">
                  <ThumbsUp size={14} />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lazy Loading Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="lazy-load-trigger">
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <span>Loading more reviews...</span>
            </div>
          ) : (
            <div className="scroll-trigger"></div>
          )}
        </div>
      )}

      {/* All reviews loaded message */}
      {!hasMore && visibleReviews.length > 0 && (
        <div className="all-reviews-loaded">
          ✨ You've seen all {totalReviews} reviews ✨
        </div>
      )}
    </div>
  );
}
