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

  // Generate JSON-LD structured data for reviews
  const generateReviewStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: bookName,
      author: {
        "@type": "Person",
        name: authorName,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
      review: reviews.slice(0, 10).map((review) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.reviewerName,
        },
        datePublished: review.date,
        reviewBody: review.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: "5",
        },
        ...(review.reviewerImage && {
          image: review.reviewerImage.startsWith("http")
            ? review.reviewerImage
            : `https://thebookx.in${review.reviewerImage}`,
        }),
      })),
    };
  };

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
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateReviewStructuredData()),
        }}
      />

      <div className="reviews-section-wrapper flex flex-col gap-24">
        {/* Rating Distribution with Schema */}
        <div
          className="rating-distribution-schema"
          itemScope
          itemType="https://schema.org/AggregateRating"
        >
          <meta itemProp="ratingValue" content={avgRating} />
          <meta itemProp="reviewCount" content={totalReviews} />
          <meta itemProp="bestRating" content="5" />
          <meta itemProp="worstRating" content="1" />
          <meta itemProp="itemReviewed" content={bookName} />
        </div>

        <div className="reviews-header flex flex-col gap-24">
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
                <span className="total-reviews">out of 5</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const reviewUrl = `/review?bk=${bookId}`;
              window.location.href = reviewUrl;
            }}
            className="sec-mid-btn width100 flex flex-row gap-4 items-center justify-center"
            aria-label={`Write a review for ${bookName}`}
          >
            <MessageSquare size={16} />
            Write a Review
          </button>
        </div>

        {/* Hidden SEO content for better keyword density */}
        <div
          className="seo-hidden-content"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          <p>
            Read {totalReviews} verified reviews for "{bookName}" by{" "}
            {authorName}. Real readers share their experiences with this
            transformative self-help book. Average rating of {avgRating} out of
            5 stars.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="flex flex-row gap-12" style={{ overflow: "scroll" }}>
          {visibleReviews.map((review) => {
            const isExpanded = expandedReviews[review.id];
            const shouldTruncate = review.comment.length > 180;
            const displayComment = isExpanded
              ? review.comment
              : review.comment.substring(0, 180);

            return (
              <div
                key={review.id}
                itemScope
                itemType="https://schema.org/Review"
                style={{
                  minWidth: "300px",
                  padding: "12px",
                  border: "1px solid var(--dark-20)",
                  borderRadius: "12px",
                }}
                className="flex flex-col gap-12"
              >
                <meta itemProp="itemReviewed" content={bookName} />
                <meta itemProp="author" content={review.reviewerName} />
                <meta itemProp="reviewBody" content={review.comment} />
                <meta itemProp="datePublished" content={review.date} />

                <div
                  itemProp="reviewRating"
                  itemScope
                  itemType="https://schema.org/Rating"
                >
                  <meta itemProp="ratingValue" content={review.rating} />
                  <meta itemProp="bestRating" content="5" />
                </div>

                <div className="review-header">
                  <div className="reviewer-info flex flex-row gap-12 items-center">
                    <div className="reviewer-avatar">
                      {review.reviewerImage ? (
                        <Image
                          src={review.reviewerImage}
                          alt={`${review.reviewerName} - verified review for ${bookName} by ${authorName}`}
                          width={48}
                          height={48}
                          className="reviewer-image"
                          title={`${review.reviewerName} gave ${review.rating} stars to ${bookName}`}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {review.reviewerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="reviewer-details">
                      <h4 className="reviewer-name" itemProp="name">
                        {review.reviewerName}
                      </h4>
                      <div className="review-meta font-12">
                        <div className="review-stars flex flex-row gap-8">
                          <div className="rating-value">{review.rating}.0</div>
                          <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={
                                  star <= review.rating ? "#FFB800" : "none"
                                }
                                color="#FFB800"
                              />
                            ))}
                          </div>
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
                </div>

                <div className="review-content font-12 flex flex-col gap-12">
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
                  <button
                    className="sec-mid-btn"
                    aria-label={`Mark as helpful (${review.helpful} people found this helpful)`}
                  >
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
          <div className="all-reviews-loaded font-12 flex flex-row justify-center">
            ✨ You've seen all reviews for "{bookName}" ✨
          </div>
        )}
      </div>
    </>
  );
}
