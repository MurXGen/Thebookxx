// app/author/[slug]/page.js
import { authorData, getAuthorBySlug } from "@/utils/author";
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
  MapPin,
  Users,
  Camera,
} from "lucide-react";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generate static params
export async function generateStaticParams() {
  return [{ slug: "murthy-thevar" }, { slug: "murthy" }, { slug: "thevar" }];
}

// Enhanced metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found | TheBookX",
      robots: { index: false },
    };
  }

  const book = author.publishedBooks?.[0];
  const reviews = reviewsData.filter((r) => r.authorName === author.name);
  const canonicalUrl = `https://thebookx.in/author/${slug}`;

  return {
    title: `${author.name} - Author of "${book?.name}" | Bestselling Self-Help Author | TheBookX`,
    description: `Discover ${author.name}, the clarity coach and bestselling author of "${book?.name}". Read verified reader reviews, see author photos, and get your copy today.`,
    keywords: `${author.name}, Murthy Thevar, The Art of Clarity, clarity coach, self-help books India, mental clarity`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${author.name} - Author of "${book?.name}" | TheBookX`,
      description: `Meet ${author.name}, India's leading clarity coach. Read reviews and discover "The Art of Clarity".`,
      url: canonicalUrl,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "profile",
      images: [
        { url: author.authorImages[0]?.url, width: 1200, height: 630 },
        { url: book?.image, width: 800, height: 800 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} - Bestselling Author`,
      description: `Read verified reviews of ${author.name}'s transformative book.`,
      images: [author.authorImages[0]?.url, book?.image],
    },
  };
}

// Structured data for Google
const generateStructuredData = (author, book, reviews, avgRating) => {
  const allImages = [
    ...author.authorImages.map((img) => img.url),
    ...reviews.slice(0, 6).map((r) => r.reviewerImage),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://thebookx.in/author/${author.slug}#person`,
        name: author.name,
        description: author.bio,
        url: `https://thebookx.in/author/${author.slug}`,
        sameAs: Object.values(author.socialLinks).filter((l) => l && l !== "#"),
        jobTitle: "Author, Clarity Coach, Speaker",
        award: author.achievements?.slice(0, 5),
        image: allImages.slice(0, 10),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://thebookx.in/author/${author.slug}`,
        },
      },
      {
        "@type": "Book",
        "@id": `https://thebookx.in/books/${book?.slug}#book`,
        name: book?.name,
        author: { "@type": "Person", name: author.name },
        description: book?.description,
        image: book?.image,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating || 4.8,
          reviewCount: Math.min(reviews.length, 50),
          bestRating: "5",
        },
        review: reviews.slice(0, 10).map((review) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: "5",
          },
          author: { "@type": "Person", name: review.reviewerName },
          reviewBody: review.comment.substring(0, 200),
          datePublished: review.date,
        })),
      },
    ],
  };
};

// Get unique reviewer images (avoid duplicates)
const getUniqueReviewerImages = (reviews) => {
  const unique = new Map();
  reviews.forEach((review) => {
    if (!unique.has(review.reviewerName)) {
      unique.set(review.reviewerName, {
        url: review.reviewerImage,
        name: review.reviewerName,
        rating: review.rating,
        comment: review.comment.substring(0, 100),
      });
    }
  });
  return Array.from(unique.values()).slice(0, 20);
};

export default async function AuthorPage({ params }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const book = author.publishedBooks?.[0];
  const reviews = reviewsData.filter((r) => r.authorName === author.name);
  const avgRating = getAverageRating(reviews);
  const structuredData = generateStructuredData(
    author,
    book,
    reviews,
    avgRating,
  );
  const reviewerImages = getUniqueReviewerImages(reviews);

  // Combine author images and reviewer images for gallery
  const galleryImages = [
    ...author.authorImages.map((img) => ({
      ...img,
      type: "author",
      category: "Author Photos",
    })),
    ...reviewerImages.map((reviewer, idx) => ({
      url: reviewer.url,
      alt: `${reviewer.name} reviewing ${book?.name} by ${author.name}`,
      caption: `${reviewer.name} - ${reviewer.rating}-star review`,
      type: "reviewer",
      category: "Reader Reviews",
    })),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="section-1200 flex flex-col gap-32">
        {/* Breadcrumbs */}
        <nav
          className="breadcrumbs"
          style={{ fontSize: "14px", color: "#666" }}
        >
          <Link href="/" style={{ color: "#fb8500" }}>
            Home
          </Link>
          <span> / </span>
          <Link href="/author" style={{ color: "#fb8500" }}>
            Authors
          </Link>
          <span> / </span>
          <span style={{ color: "#374151" }}>{author.name}</span>
        </nav>

        {/* Author Header Section */}
        <div className="author-header" style={{ borderRadius: "12px" }}>
          <div className="flex flex-row gap-32 items-center flex-wrap">
            <div
              className="author-avatar"
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                borderRadius: "12px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src={author.authorImages[1]?.url || "/default-author.jpg"}
                alt={author.authorImages[0]?.alt || author.name}
                width={500}
                height={600}
                style={{ objectFit: "cover", width: "100%", height: "500px" }}
                priority
                loading="eager"
                fetchPriority="high"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)",
                  zIndex: 1,
                }}
              />
              <div
                className="author-info flex flex-col gap-12"
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "24px",
                  zIndex: 2,
                  color: "white",
                }}
              >
                <h1 className="font-32 weight-700">{author.name}</h1>
                <p className="font-16">{author.occupation}</p>
                <div className="flex flex-row gap-16 flex-wrap font-16">
                  <span className="flex items-center gap-4">
                    <MapPin size={16} /> {author.birthplace}
                  </span>
                  <span className="flex items-center gap-4">
                    <Users size={16} /> Inspired Readers
                  </span>
                </div>
                <div className="flex flex-row gap-12">
                  <a
                    href={author.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "white" }}
                  >
                    <Instagram size={22} />
                  </a>
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "white" }}
                  >
                    <Twitter size={22} />
                  </a>
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "white" }}
                  >
                    <Linkedin size={22} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="author-bio">
          <h2 className="font-24 weight-600 margin-btm-16px">
            About {author.name}
          </h2>
          <p className="font-16 dark-50" style={{ lineHeight: "1.8" }}>
            {author.bio}
          </p>
        </div>

        {/* Combined Gallery Section - Author Photos + Reviewer Photos */}
        {galleryImages.length > 0 && (
          <div className="author-gallery flex flex-col gap-24">
            <div className="flex items-center gap-8">
              <h2 className="font-24 weight-600">Gallery of {author.name}</h2>
            </div>
            <p className="font-14 dark-50 margin-btm-8px">
              Explore photos of {author.name} and verified readers who reviewed
              "{book?.name}"
            </p>

            {/* Gallery Grid */}
            <div
              className="gallery-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#f9fafb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div style={{ position: "relative", paddingBottom: "100%" }}>
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      style={{ objectFit: "cover" }}
                      loading="eager"
                      priority
                      fetchPriority={index < 25 ? "high" : "auto"}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div style={{ padding: "12px" }}>
                    {img.type === "author" ? (
                      <>
                        <span
                          className="font-10 orange"
                          style={{
                            background: "#fb850020",
                            padding: "2px 8px",
                            borderRadius: "100px",
                          }}
                        >
                          📸 Author Photo
                        </span>
                        <p className="font-12 weight-500 margin-tp-8px">
                          {img.caption}
                        </p>
                      </>
                    ) : (
                      <>
                        <span
                          className="font-10 green"
                          style={{
                            background: "#10b98120",
                            padding: "2px 8px",
                            borderRadius: "100px",
                          }}
                        >
                          ⭐ Reader Review
                        </span>
                        <p className="font-12 weight-500 margin-tp-8px">
                          {img.caption}
                        </p>
                      </>
                    )}
                  </div>
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
              <div className="book-cover" style={{ width: "220px" }}>
                <Image
                  src={book.image}
                  alt={`${book.name} by ${author.name}`}
                  width={220}
                  height={300}
                  style={{
                    borderRadius: "12px",
                    width: "100%",
                    height: "auto",
                  }}
                  loading="eager"
                  priority
                  fetchPriority="high"
                />
              </div>
              <div
                className="book-details flex flex-col gap-24"
                style={{ flex: 1 }}
              >
                <div className="rating flex items-center gap-8">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        fill={star <= (avgRating || 4.8) ? "#FFB800" : "none"}
                        color="#FFB800"
                      />
                    ))}
                  </div>
                  <span className="font-16 weight-600">
                    {avgRating || "4.8"}/5
                  </span>
                  <span className="font-12 gray-500">
                    ({Math.min(reviews.length, 50)}+ reviews)
                  </span>
                </div>
                <p className="font-14 dark-50">{book.description}</p>
                <div className="flex flex-row gap-12 flex-wrap">
                  <Link href={`/books/${book.slug}`} className="pri-big-btn">
                    Buy Now - ₹{book.price}
                  </Link>
                  <Link href={`/review?bk=${book.id}`} className="sec-big-btn">
                    Write a Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Awards Section - Limited to 6 for optimal display */}
        {author.achievements && author.achievements.length > 0 && (
          <div className="achievements flex flex-col gap-24">
            <h2 className="font-24 weight-600">Awards & Recognition</h2>
            <div className="flex flex-row gap-16 flex-wrap">
              {author.achievements.slice(0, 20).map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-badge"
                  style={{
                    background: "linear-gradient(135deg, #fb850020, #ffb70320)",
                    padding: "8px 20px",
                    borderRadius: "100px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Award size={16} color="#fb8500" />
                  <span className="font-13 weight-500">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section - Display top 12 reviews for optimal performance */}
        {reviews.length > 0 && (
          <div className="reviews-section flex flex-col gap-24">
            <h2 className="font-24 flex flex-col">
              <span className="weight-600">
                Reader Reviews for "{book?.name}"
              </span>
              <span className="font-12 dark-50">
                {Math.min(reviews.length, 50)}+ verified reviews with photos
              </span>
            </h2>

            <div
              className="reviews-grid"
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              }}
            >
              {reviews.slice(0, 12).map((review) => (
                <div
                  key={review.id}
                  className="review-card"
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "20px",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    className="review-header flex flex-row gap-14 items-start"
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      className="reviewer-image"
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#f3e8ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {review.reviewerImage ? (
                        <Image
                          src={review.reviewerImage}
                          alt={review.reviewerName}
                          width={52}
                          height={52}
                          style={{ objectFit: "cover" }}
                          loading="eager"
                          priority
                          fetchPriority="high"
                        />
                      ) : (
                        <span className="font-20">
                          {review.reviewerName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div
                      className="reviewer-info flex flex-col gap-6"
                      style={{ flex: 1 }}
                    >
                      {/* ... existing reviewer-info JSX ... */}
                      <div className="flex justify-between items-center flex-wrap gap-6">
                        <h3 className="font-15 weight-600">
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
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-6">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              fill={star <= review.rating ? "#FFB800" : "none"}
                              color="#FFB800"
                            />
                          ))}
                        </div>
                        <span className="font-11 gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  {/* ... existing review content and footer JSX ... */}
                  <div className="review-content margin-tp-12px">
                    <Quote size={14} className="gray-400 margin-btm-6px" />
                    <p
                      className="font-13 dark-50"
                      style={{ lineHeight: "1.5" }}
                    >
                      {review.comment.length > 180
                        ? review.comment.substring(0, 180) + "..."
                        : review.comment}
                    </p>
                  </div>
                  <div className="review-footer flex items-center gap-10 margin-tp-12px">
                    <button
                      className="flex items-center gap-3 sec-mid-btn"
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      <ThumbsUp size={11} />
                      <span>Helpful ({review.helpful})</span>
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
            className="flex flex-col gap-20"
            style={{
              borderRadius: "20px",
            }}
          >
            <h2 className="font-26 weight-600">
              Get Your Copy of "{book.name}" Today!
            </h2>
            <p className="font-15">
              Join 50,000+ readers who have transformed their thinking
            </p>
            <Link href={`/books/${book.slug}`} className="pri-big-btn">
              Shop Now - ₹{book.price}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
