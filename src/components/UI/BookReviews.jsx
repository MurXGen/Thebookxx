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
  BadgeCheck,
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

  // Lazy loading: a skeleton card at the END of the horizontal row. More
  // reviews load only when the shopper swipes it into view, so the page never
  // jumps, and fixed-size skeletons hold the space while cards arrive.
  const rowRef = useRef(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;
    let t;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        setIsLoading(true);
        t = setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 6, totalReviews));
          setIsLoading(false);
        }, 250);
      },
      { root: rowRef.current, rootMargin: "0px 200px 0px 0px", threshold: 0.01 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, [hasMore, visibleCount, totalReviews]);

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
      review: reviews.slice(0, 40).map((review) => ({
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
      {/* Review JSON-LD is emitted once by the product page's main
          Product/Book schema to avoid a duplicate/conflicting Product entity. */}

      <div className="reviews-section-wrapper flex flex-col gap-24">
        {/* Structured data is emitted as JSON-LD in the product page's main
            Product/Book schema, so no (error-prone) microdata is used here. */}

        {/* Reviews Grid */}
        <div className="brv-row" ref={rowRef}>
          {visibleReviews.map((review) => {
            const isExpanded = expandedReviews[review.id];
            const shouldTruncate = review.comment.length > 180;
            const displayComment = isExpanded
              ? review.comment
              : review.comment.substring(0, 180);

            return (
              <article key={review.id} className="brv-card">
                <div className="brv-top">
                  <span className="brv-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={star <= review.rating ? "currentColor" : "none"}
                        strokeWidth={1.8}
                      />
                    ))}
                  </span>
                  {review.verified && (
                    <span className="brv-verified">
                      <BadgeCheck size={13} /> Verified buyer
                    </span>
                  )}
                </div>

                <p className="brv-text">
                  {displayComment}
                  {shouldTruncate && !isExpanded && "… "}
                  {shouldTruncate && (
                    <button type="button" className="brv-more" onClick={() => toggleExpand(review.id)}>
                      {isExpanded ? " Show less" : "Read more"}
                    </button>
                  )}
                </p>

                <div className="brv-who">
                  {review.reviewerImage ? (
                    <Image
                      src={review.reviewerImage}
                      alt={`${review.reviewerName}, reader of ${bookName}`}
                      width={40}
                      height={40}
                      loading="lazy"
                      className="brv-avatar"
                    />
                  ) : (
                    <span className="brv-avatar brv-initial">{review.reviewerName.charAt(0)}</span>
                  )}
                  <span className="brv-who-txt">
                    <b>{review.reviewerName}</b>
                    <small>{review.date}</small>
                  </span>
                </div>
              </article>
            );
          })}
          {hasMore && (
            <div ref={loadMoreRef} className="brv-card brv-skel" aria-hidden="true">
              <span className="brv-skel-head" />
              <span className="brv-skel-line" />
              <span className="brv-skel-line" />
              <span className="brv-skel-line short" />
            </div>
          )}
        </div>

        <div className="reviews-header flex flex-col gap-24 width100">
          <div className="reviews-header-left width100">
            <div className=" flex flex-row justify-between font-12">
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

        {/* All reviews loaded message */}
        {/* {!hasMore && visibleReviews.length > 0 && (
          <div className="all-reviews-loaded font-12 flex flex-row justify-center">
             You've seen all reviews for "{bookName}"
          </div>
        )} */}
      </div>
    </>
  );
}
