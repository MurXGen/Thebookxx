// app/author/murthy-thevar/page.js
import { authorData } from "@/utils/author";
import { reviewsData, getAverageRating } from "@/utils/reviews";
import { books } from "@/utils/book";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  BookOpen,
  Calendar,
  Award,
  Instagram,
  Twitter,
  Linkedin,
  ThumbsUp,
  Quote,
} from "lucide-react";

// Generate metadata for SEO
export async function generateMetadata() {
  const author = authorData;

  if (!author) {
    return {
      title: "Author Not Found | TheBookX",
      description: "The requested author page could not be found.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const book = books.find((b) => b.id === "bk-002");
  const reviews = reviewsData.filter((r) => r.authorName === author.name);
  const avgRating = getAverageRating(reviews);
  const canonicalUrl = "https://thebookx.in/author/murthy-thevar";

  return {
    title: `${author.name} - Author of "${book?.name}" | TheBookX`,
    description: `Read reviews, ratings, and testimonials for ${author.name}'s bestselling book "${book?.name}". ${reviews.length}+ verified reader reviews with photos. Get your copy today!`,
    keywords: `${author.name}, ${book?.name}, ${book?.name} review, ${author.name} book, The Art of Clarity review, self-help book, clarity coach`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${author.name} - Author Page | TheBookX`,
      description: `Discover ${author.name}'s transformative book "${book?.name}" with ${reviews.length}+ reader reviews and photos. Rated ${avgRating}/5 stars!`,
      url: canonicalUrl,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "profile",
      images: [
        {
          url: book?.image || "/default-author.jpg",
          width: 1200,
          height: 630,
          alt: `${author.name} - ${book?.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} - Author Page | TheBookX`,
      description: `Read ${reviews.length}+ reviews for ${author.name}'s "${book?.name}"`,
      images: [book?.image],
    },
  };
}

// Structured data for SEO
const generateStructuredData = (author, book, reviews, avgRating) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio,
    url: "https://thebookx.in/author/murthy-thevar",
    sameAs: Object.values(author.socialLinks),
    worksFor: {
      "@type": "Organization",
      name: "TheBookX",
    },
    knowsAbout: ["Self-help", "Mental Clarity", "Personal Development"],
    award: author.achievements,
    image: author.authorImages[0]?.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://thebookx.in/author/murthy-thevar",
    },
    review: reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: review.reviewerName,
      },
      reviewBody: review.comment,
      datePublished: review.date,
    })),
  };
};

export default function MurthyThevarPage() {
  const author = authorData;

  // If author not found, show 404
  if (!author) {
    notFound();
  }

  const book = books.find((b) => b.id === "bk-002");
  const reviews = reviewsData.filter((r) => r.authorName === author.name);
  const avgRating = getAverageRating(reviews);
  const structuredData = generateStructuredData(
    author,
    book,
    reviews,
    avgRating,
  );

  return (
    <>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="section-1200 flex flex-col gap-32">
        {/* Breadcrumbs - Fixed with proper structure */}
        <nav
          className="breadcrumbs margin-btm-24px"
          style={{ fontSize: "14px", color: "#666" }}
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/"
              style={{ color: "#fb8500", textDecoration: "none" }}
              itemProp="item"
            >
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </span>
          <span> / </span>
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/authors"
              style={{ color: "#fb8500", textDecoration: "none" }}
              itemProp="item"
            >
              <span itemProp="name">Authors</span>
            </Link>
            <meta itemProp="position" content="2" />
          </span>
          <span> / </span>
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <span style={{ color: "#374151" }} itemProp="name">
              {author.name}
            </span>
            <meta itemProp="position" content="3" />
          </span>
        </nav>

        {/* Author Header Section */}
        <div
          className="author-header"
          style={{
            borderRadius: "12px",
          }}
        >
          <div className="flex flex-row gap-32 items-center">
            <div
              className="author-avatar"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "12px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src={author.authorImages[0]?.url || "/default-avatar.jpg"}
                alt={author.name}
                width={150}
                height={150}
                style={{
                  objectFit: "cover",
                }}
                priority
              />
            </div>
            <div className="author-info flex flex-col gap-8">
              <h1 className="font-24 weight-700 margin-btm-8px">
                {author.name}
              </h1>
              <p className="font-14 margin-btm-16px" style={{ opacity: 0.9 }}>
                {author.occupation}
              </p>
              <div className="flex flex-row gap-12 margin-tp-16px">
                <a
                  href={author.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on Instagram`}
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={author.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on Twitter`}
                >
                  <Twitter size={20} />
                </a>
                <a
                  href={author.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on LinkedIn`}
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="author-bio margin-btm-40px">
          <h2 className="font-24 weight-600 margin-btm-16px">
            About {author.name}
          </h2>
          <p className="font-16 dark-50" style={{ lineHeight: "1.6" }}>
            {author.bio}
          </p>
        </div>

        {/* Author Images Gallery */}
        {author.authorImages && author.authorImages.length > 0 && (
          <div className="author-gallery flex flex-col gap-24">
            <h2 className="font-24 weight-600 margin-btm-16px">
              Photos of {author.name}
            </h2>
            <div className="gap-16 flex flex-row" style={{ overflow: "auto" }}>
              {author.authorImages.map((img, index) => (
                <div
                  key={index}
                  className="gallery-image flex flex-col gap-12 justify-center items-center"
                  style={{
                    minWidth: "fit-content",
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    width={180}
                    height={200}
                    style={{
                      width: "180px",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Book Section */}
        {book && (
          <div className="featured-book flex flex-col gap-24">
            <h2 className="font-24 weight-600">
              Bestselling Book: {book.name}
            </h2>
            <div className="flex flex-row gap-24 flex-wrap">
              <div className="book-cover" style={{ width: "200px" }}>
                <Image
                  src={book.image}
                  alt={`${book.name} by ${author.name}`}
                  width={200}
                  height={280}
                  style={{ borderRadius: "8px", width: "100%", height: "auto" }}
                />
              </div>
              <div className="book-details flex flex-col gap-24">
                <p className="font-14 gray-500 margin-btm-8px">
                  Published: April 1, 2026
                </p>
                <div className="rating margin-btm-12px flex items-center gap-8">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        fill={star <= avgRating ? "#FFB800" : "none"}
                        color="#FFB800"
                      />
                    ))}
                  </div>
                  <span className="font-14 weight-600">{avgRating}/5</span>
                  <span className="font-12 gray-500">(378+ reviews)</span>
                </div>
                <p className="font-14 dark-50 margin-btm-16px">
                  {book.description}
                </p>
                <div className="flex flex-row gap-12">
                  <Link
                    href={`/books/the-art-of-clarity`}
                    className="pri-big-btn"
                  >
                    Buy Now - ₹{book.discountedPrice}
                  </Link>
                  <Link href={`/review?bk=${book.id}`} className="sec-big-btn">
                    Write a Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {author.achievements && author.achievements.length > 0 && (
          <div className="achievements flex flex-col gap-24">
            <h2 className="font-24 weight-600 margin-btm-16px">
              Awards & Recognition
            </h2>
            <div className="flex flex-row gap-16 flex-wrap">
              {author.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-badge"
                  style={{
                    background: "linear-gradient(135deg, #fb850050, #ffb70350)",
                    padding: "8px 16px",
                    borderRadius: "100px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Award size={16} color="#fb8500" />
                  <span className="font-12 weight-500">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="reviews-section flex flex-col gap-24">
            <h2 className="font-24 flex flex-col">
              <span className="weight-600">
                Reader Reviews for "{book?.name}"
              </span>
              <span className="font-12 dark-50">
                ({reviews.length}+ verified reviews)
              </span>
            </h2>

            <div
              className="reviews-grid"
              style={{
                display: "grid",
                gap: "24px",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              }}
            >
              {reviews.slice(0, 6).map((review) => (
                <div
                  key={review.id}
                  className="review-card flex flex-col gap-12"
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "24px",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    className="review-header flex flex-row gap-16 items-start"
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      className="reviewer-image"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        borderBottom: "1px solid grey",
                      }}
                    >
                      <Image
                        src={review.reviewerImage}
                        alt={`${review.reviewerName} review for ${book?.name} by ${author.name}`}
                        width={60}
                        height={60}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="reviewer-info flex flex-col gap-8">
                      <div className="flex justify-between items-center flex-wrap gap-8 margin-btm-4px">
                        <h3 className="font-16 weight-600">
                          {review.reviewerName}
                        </h3>
                        {review.verified && (
                          <span
                            className="font-10 green"
                            style={{
                              background: "#D1FAE5",
                              padding: "2px 8px",
                              borderRadius: "100px",
                            }}
                          >
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-8 margin-btm-4px">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= review.rating ? "#FFB800" : "none"}
                              color="#FFB800"
                            />
                          ))}
                        </div>
                        <span className="font-12 gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-8 margin-btm-8px">
                        <span className="font-12 gray-500">
                          Reviewed: {review.bookName} by {review.authorName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="review-content flex flex-col gap-12">
                    <Quote size={16} className="gray-400 margin-btm-8px" />
                    <p
                      className="font-14 dark-50"
                      style={{ lineHeight: "1.5" }}
                    >
                      {review.comment}
                    </p>
                  </div>

                  <div className="review-footer flex items-center gap-12">
                    <button
                      className="flex items-center gap-4 sec-mid-btn"
                      style={{ padding: "4px 12px" }}
                    >
                      <ThumbsUp size={12} />
                      <span className="font-12">
                        Helpful ({review.helpful})
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {book && (
          <div
            className="cta-section text-center margin-tp-40px"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "24px",
              padding: "40px",
              color: "white",
            }}
          >
            <h2 className="font-24 weight-600 margin-btm-12px">
              Get Your Copy Today!
            </h2>
            <p className="font-16 margin-btm-24px" style={{ opacity: 0.9 }}>
              Join thousands of readers who have transformed their thinking with{" "}
              {author.name}'s "{book.name}"
            </p>
            <Link
              href={`/books/the-art-of-clarity`}
              className="pri-big-btn"
              style={{
                background: "white",
                color: "#764ba2",
                textDecoration: "none",
              }}
            >
              Shop Now - ₹{book.discountedPrice}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
