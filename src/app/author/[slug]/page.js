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
  Facebook,
  Youtube,
  MapPin,
  Users,
  TrendingUp,
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
  const canonicalUrl = `https://thebookx.in/author/murthy-thevar`;

  return {
    title: `${author.name} - Author of "${book?.name}" | Bestselling Self-Help Author | TheBookX`,
    description: `Discover ${author.name}, the clarity coach and bestselling author of "${book?.name}". Read 20+ verified reader reviews, see author photos, and get your copy today. ${author.name} has helped 50,000+ readers achieve mental clarity.`,
    keywords: `${author.name}, Murthy Thevar, Murthy Thevar author, The Art of Clarity, clarity coach, self-help books India, mental clarity, best self-help books 2026, Murthy Thevar book, The Art of Clarity review, Indian author, clarity workshop, decision making books, overthinking solutions`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${author.name} - Author of "${book?.name}" | TheBookX`,
      description: `Meet ${author.name}, India's leading clarity coach. Read reviews, see photos, and discover "The Art of Clarity" - the #1 self-help book that has transformed 50,000+ lives.`,
      url: canonicalUrl,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "profile",
      images: [
        {
          url: author.authorImages[0]?.url,
          width: 1200,
          height: 630,
          alt: `${author.name} - Official author photo`,
        },
        {
          url: book?.image,
          width: 800,
          height: 800,
          alt: `${book?.name} by ${author.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} - Bestselling Author of "The Art of Clarity"`,
      description: `Read 20+ verified reviews of ${author.name}'s transformative book. Get your copy at TheBookX.in`,
      images: [author.authorImages[0]?.url, book?.image],
      site: "@thebookx",
      creator: "@murthythevar",
    },
    verification: {
      google: "your-google-verification-code", // Add your Google Search Console code
    },
    category: "books",
    authors: [{ name: author.name, url: canonicalUrl }],
  };
}

// Enhanced structured data for better Google visibility
const generateStructuredData = (author, book, reviews, avgRating) => {
  const imageUrls = author.authorImages.map((img) => img.url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://thebookx.in/author/${author.slug}#person`,
        name: author.name,
        alternateName: author.alternativeNames || [author.name],
        description: author.bio,
        url: `https://thebookx.in/author/${author.slug}`,
        sameAs: Object.values(author.socialLinks).filter(
          (link) => link && link !== "#",
        ),
        worksFor: {
          "@type": "Organization",
          name: "TheBookX",
        },
        jobTitle: "Author, Clarity Coach, Speaker",
        knowsAbout: author.genres || [
          "Self-Help",
          "Personal Development",
          "Mental Clarity",
        ],
        award: author.achievements,
        image: imageUrls,
        birthDate: "2004-01-03",
        birthPlace: {
          "@type": "Place",
          name: "Mumbai, India",
        },
        nationality: {
          "@type": "Country",
          name: "India",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://thebookx.in/author/${author.slug}`,
        },
      },
      {
        "@type": "Book",
        "@id": `https://thebookx.in/books/${book?.slug}#book`,
        name: book?.name,
        author: {
          "@type": "Person",
          name: author.name,
        },
        description: book?.description,
        isbn: book?.isbn || "978-93-12345-01-2",
        numberOfPages: book?.pages || 210,
        inLanguage: book?.language || "English",
        datePublished: book?.publishDate || "2026-04-01",
        image: book?.image,
        offers: {
          "@type": "Offer",
          price: book?.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "TheBookX",
          },
          url: book?.buyLink,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating || 4.8,
          reviewCount: reviews.length || 20,
          bestRating: "5",
          worstRating: "1",
        },
        review: reviews.slice(0, 15).map((review) => ({
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
      },
    ],
  };
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

  return (
    <>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        className="section-1200 flex flex-col gap-32"
        style={{ padding: "40px 20px" }}
      >
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

        {/* Author Header Section - Enhanced */}
        <div
          className="author-header"
          style={{
            borderRadius: "12px",
          }}
        >
          <div className="flex flex-row gap-32 items-center flex-wrap">
            <div
              className="author-avatar"
              style={{
                width: "400px",
                height: "600px",
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
                src={author.authorImages[0]?.url || "/default-author.jpg"}
                alt={author.authorImages[0]?.alt || author.name}
                width={400}
                height={600}
                style={{ objectFit: "cover" }}
                priority
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)",
                  zIndex: 1,
                }}
              />

              {/* ✅ Content ABOVE gradient */}
              <div
                className="author-info flex flex-col gap-12"
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  padding: "12px",
                  zIndex: 2,
                  color: "white",
                }}
              >
                <h1 className="font-32 weight-700">{author.name}</h1>
                <p className="font-16">{author.occupation}</p>
                <div className="flex flex-row gap-8 flex-wrap font-16">
                  {/* <span className="flex items-center gap-4">
                    <Calendar size={16} /> Born: {author.born}
                  </span> */}
                  <span className="flex items-center gap-4">
                    <MapPin size={16} /> {author.birthplace}
                  </span>
                  <span className="flex items-center gap-4">
                    <Users size={16} /> 50,000+ Readers
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

        {/* Author Bio Section - Enhanced */}
        <div className="author-bio">
          <h2 className="font-24 weight-600 margin-btm-16px">
            About {author.name}
          </h2>
          <p className="font-16 dark-50" style={{ lineHeight: "1.8" }}>
            {author.bio}
          </p>
        </div>

        {/* Author Images Gallery - Enhanced for SEO */}
        {author.authorImages && author.authorImages.length > 0 && (
          <div className="author-gallery flex flex-col gap-24">
            <h2 className="font-24 weight-600">Photos of {author.name}</h2>
            <div
              className=" flex flex-row gap-16"
              style={{ overflow: "scroll" }}
            >
              {author.authorImages.map((img, index) => (
                <div key={index} className="gallery-image">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    width={220}
                    height={200}
                    style={{
                      minWidth: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    loading="lazy"
                  />
                  <p
                    className="font-12 text-center"
                    style={{ color: "#ffffff" }}
                  >
                    {img.caption}
                  </p>
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
                  alt={`${book.name} by ${author.name} - Bestselling self-help book`}
                  width={220}
                  height={300}
                  style={{
                    borderRadius: "12px",
                    width: "100%",
                    height: "auto",
                  }}
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
                    ({reviews.length}+ verified reviews)
                  </span>
                </div>
                <p className="font-14 dark-50">{book.description}</p>
                <div className="flex flex-row gap-12">
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

        {/* Achievements */}
        {author.achievements && author.achievements.length > 0 && (
          <div className="achievements flex flex-col gap-24">
            <h2 className="font-24 weight-600">Awards & Recognition</h2>
            <div className="flex flex-row gap-16 flex-wrap">
              {author.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-badge"
                  style={{
                    background: "linear-gradient(135deg, #fb850050, #ffb70350)",
                    padding: "10px 20px",
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
                ({reviews.length}+ verified reviews with photos)
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
              {reviews.slice(0, 21).map((review) => (
                <div
                  key={review.id}
                  className="review-card"
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
                      <div className="flex justify-between items-center flex-wrap gap-8">
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
                      <div className="flex justify-between items-center flex-wrap gap-8">
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
                      <div className="flex items-center gap-8">
                        <span className="font-12 gray-500">
                          Reviewed: {review.bookName} by {review.authorName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="review-content flex flex-col gap-12 margin-tp-12px">
                    <Quote size={16} className="gray-400" />
                    <p
                      className="font-14 dark-50"
                      style={{ lineHeight: "1.6" }}
                    >
                      {review.comment}
                    </p>
                  </div>
                  <div className="review-footer flex items-center gap-12 margin-tp-12px">
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
          <div className="flex flex-col gap-24 text-center">
            <h2 className="font-28 weight-600 margin-btm-12px">
              Get Your Copy of "{book.name}" Today!
            </h2>
            <p className="font-16 margin-btm-24px" style={{ opacity: 0.9 }}>
              Join 50,000+ readers who have transformed their thinking with{" "}
              {author.name}'s guidance
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
