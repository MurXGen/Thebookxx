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

// Enhanced metadata for SEO with broad keywords
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
    title: `${author.name} - Author of "${book?.name}" | Bestselling Self-Help Book | TheBookX`,
    description: `Read reviews of ${book?.name} by ${author.name}. See reader photos, ratings, and testimonials. ${reviews.length}+ verified reviews. Should you read ${book?.name}? Find out what readers say about this clarity book.`,
    keywords: `${author.name}, Murthy Thevar, The Art of Clarity, the art, of, clarity, books to read, self help books, mental clarity books, best books to read 2026, ${book?.name} review, ${book?.name} rating, should I read ${book?.name}, ${author.name} book, reader reviews, book recommendations, top rated books, clarity coach, overthinking solutions`,
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
      title: `${author.name} - "${book?.name}" | Reader Reviews & Photos | TheBookX`,
      description: `See ${reviews.length}+ reader reviews with photos for "${book?.name}" by ${author.name}. Rated ${getAverageRating(reviews)}/5 stars. A must-read self-help book for mental clarity.`,
      url: canonicalUrl,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "profile",
      images: [
        {
          url: author.authorImages[0]?.url,
          width: 1200,
          height: 630,
          alt: `${author.name} - Author of ${book?.name}`,
        },
        {
          url: book?.image,
          width: 800,
          height: 800,
          alt: `${book?.name} book cover by ${author.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} - "${book?.name}" Reader Reviews`,
      description: `${reviews.length}+ readers share their experience with photos. See why this is a top-rated clarity book.`,
      images: [author.authorImages[0]?.url, book?.image],
      site: "@thebookx",
    },
  };
}

// Generate image gallery structured data for reviewer photos
const generateReviewerImageGallery = (reviews, book, author) => {
  return {
    "@type": "ImageGallery",
    name: `Reader reviews with photos for ${book?.name} by ${author.name}`,
    description: `Real readers share their experience reading ${book?.name}. See photos of readers with the book and their honest reviews.`,
    image: reviews.slice(0, 20).map((review) => ({
      "@type": "ImageObject",
      contentUrl: review.reviewerImage,
      name: `${review.reviewerName} reviewing ${book?.name} by ${author.name}`,
      caption: `${review.reviewerName} gave ${book?.name} ${review.rating} stars. ${review.comment.substring(0, 100)}...`,
      keywords: `${author.name}, ${book?.name}, book review, reader photo, ${review.reviewerName}`,
    })),
  };
};

// Enhanced structured data with reviewer images
const generateStructuredData = (author, book, reviews, avgRating, slug) => {
  const imageUrls = author.authorImages?.map((img) => img.url) || [];
  const reviewerImages = reviews.slice(0, 20).map((review) => ({
    "@type": "ImageObject",
    contentUrl: review.reviewerImage,
    name: `${review.reviewerName} review for ${book?.name} by ${author.name}`,
    caption: `${review.reviewerName} gave ${book?.name} ${review.rating} stars`,
    keywords: `${author.name}, ${book?.name}, book review, reader photo, ${review.reviewerName}`,
  }));

  const faqs = [
    {
      question: `Should I read "${book?.name}" by ${author.name}?`,
      answer: `Absolutely! With ${reviews.length}+ verified 5-star reviews and reader photos, this is one of the highest-rated self-help books. Readers report dramatic improvements in mental clarity within days.`,
    },
    {
      question: `Is "${book?.name}" a good book to read for mental clarity?`,
      answer: `Yes! ${reviews.length}+ readers have shared their positive experiences with photos. The book has a ${avgRating || 4.8}/5 rating and is recommended for anyone struggling with overthinking.`,
    },
    {
      question: `What do readers say about "${book?.name}"?`,
      answer: `Readers consistently praise the practical exercises and life-changing insights. See ${reviews.length}+ verified reviews with real reader photos on this page.`,
    },
    {
      question: `Is ${author.name} a trusted author?`,
      answer: `Yes, ${author.name} is India's leading clarity coach who has helped over 50,000 readers. His book has received ${reviews.length}+ verified positive reviews with real reader photos.`,
    },
    {
      question: `Where can I buy "${book?.name}"?`,
      answer: `You can purchase "${book?.name}" by ${author.name} at TheBookX.in for just ₹${book?.price}. Join 50,000+ satisfied readers today!`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://thebookx.in/author/${author.slug}#person`,
        name: author.name,
        alternateName: ["Murthy Thevar", "M Thevar", "Clarity Coach"],
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
        knowsAbout: [
          "Self-Help",
          "Personal Development",
          "Mental Clarity",
          "Overthinking Solutions",
        ],
        award: author.achievements,
        image: imageUrls,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://thebookx.in/author/${author.slug}`,
        },
      },
      {
        "@type": "Book",
        "@id": `https://thebookx.in/books/${book?.slug}#book`,
        name: book?.name,
        alternateName: [
          "The Art of Clarity book",
          "Clarity book",
          "Art of Clarity self help",
        ],
        author: {
          "@type": "Person",
          name: author.name,
        },
        description: book?.description,
        numberOfPages: book?.pages || 210,
        inLanguage: "English",
        datePublished: "2026-04-01",
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
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating || 4.8,
          reviewCount: reviews.length || 20,
          bestRating: "5",
          worstRating: "1",
        },
        review: reviews.slice(0, 20).map((review) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: "5",
          },
          author: {
            "@type": "Person",
            name: review.reviewerName,
            image: review.reviewerImage,
          },
          reviewBody: review.comment,
          datePublished: review.date,
        })),
      },
      {
        "@type": "ImageGallery",
        name: `Reader photos and reviews for ${book?.name} by ${author.name}`,
        description: `See real readers with their copy of ${book?.name}. ${reviews.length}+ verified reviews with photos.`,
        image: reviewerImages,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
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
    slug,
  );

  return (
    <>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="section-1200 flex flex-col gap-32">
        {/* Hidden H1 for broader search terms */}
        <h1
          className="visually-hidden"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
          }}
        >
          {author.name} - The Art of Clarity | Best Self Help Books to Read for
          Mental Clarity | Reader Reviews with Photos
        </h1>

        {/* Breadcrumbs */}
        <nav
          className="breadcrumbs"
          style={{ fontSize: "14px", color: "#666" }}
        >
          <Link href="/" style={{ color: "#fb8500" }}>
            Shop now
          </Link>
          <span> / </span>
          <Link href="/author" style={{ color: "#fb8500" }}>
            Author
          </Link>
          <span> / </span>
          <span style={{ color: "#374151", fontWeight: "bold" }}>
            {author.name}
          </span>
        </nav>

        {/* Author Header Section */}
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
                width: "500px",
                height: "500px",
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
                style={{ objectFit: "cover", width: "100%" }}
                priority
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0) 100%)",
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

        {/* Book Introduction with Keywords */}
        <div className="book-intro text-center">
          <h2 className="font-28 weight-600 margin-btm-16px">
            {book?.name} by {author.name}
          </h2>
          <p
            className="font-16 dark-50"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            One of the best self-help books to read for mental clarity.
            <strong> {reviews.length}+ readers</strong> have shared their
            experience with real photos.
            <strong> Rated {avgRating || "4.8"}/5 stars</strong> - A top
            recommendation for anyone struggling with overthinking.
          </p>
        </div>

        {/* Author Images Gallery */}
        {author.authorImages && author.authorImages.length > 0 && (
          <div className="author-gallery flex flex-col gap-24">
            <h2 className="font-24 weight-600">Photos of {author.name}</h2>
            <div
              className="flex flex-row gap-16"
              style={{ overflowX: "auto", paddingBottom: "8px" }}
            >
              {author.authorImages.map((img, index) => (
                <div key={index} className="gallery-image">
                  <Image
                    src={img.url}
                    alt={`${img.alt} - ${author.name} author of ${book?.name}`}
                    width={250}
                    height={250}
                    style={{
                      width: "250px",
                      height: "320px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    loading="lazy"
                  />
                  <p
                    className="font-12 text-center margin-tp-8px"
                    style={{ color: "#ffffff" }}
                  >
                    {img.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewer Images Gallery - CRITICAL for SEO */}
        <div className="reviewer-gallery flex flex-col gap-24">
          <h2 className="font-24 weight-600">
            Real Readers Share Their Experience with {book?.name}
          </h2>
          <p className="font-14 dark-50">
            See photos of real readers who have read {book?.name} by{" "}
            {author.name}
          </p>
          <div className="flex flex-row gap-16" style={{ overflow: "scroll" }}>
            {reviews.slice(0, 20).map((review, idx) => (
              <div
                key={idx}
                className="reviewer-card"
                style={{ textAlign: "center", width: "120px" }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    margin: "0 auto",
                  }}
                >
                  <Image
                    src={review.reviewerImage}
                    alt={`${review.reviewerName} review for ${book?.name} by ${author.name} - ${review.rating} stars`}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
                <p className="font-12 weight-600 margin-tp-8px">
                  {review.reviewerName}
                </p>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      fill={star <= review.rating ? "#FFB800" : "none"}
                      color="#FFB800"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Book Section */}
        {book && (
          <div className="featured-book flex flex-col gap-24">
            <h2 className="font-24 weight-600">
              Bestselling Book: {book?.name}
            </h2>
            <div className="flex flex-row gap-24 flex-wrap">
              <div className="book-cover" style={{ width: "220px" }}>
                <Image
                  src={book.image}
                  alt={`${book?.name} by ${author.name} - Best self-help book to read`}
                  width={150}
                  height={100}
                  style={{
                    borderRadius: "12px",
                    width: "150px",
                    height: "200px",
                    border: "1px solid var(--dark-20)",
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
                    ({reviews.length}+ verified reviews with photos)
                  </span>
                </div>
                <p className="font-14 dark-50">{book?.description}</p>
                <div className="flex flex-row gap-12">
                  <Link
                    href={`/books/${slugify(book?.name)}`}
                    className="pri-big-btn"
                  >
                    Buy Now - ₹{book?.price}
                  </Link>
                  <Link href={`/review?bk=${book?.id}`} className="sec-big-btn">
                    Write a Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section with Full Details */}
        {reviews.length > 0 && (
          <div className="reviews-section flex flex-col gap-24">
            <h2 className="font-24 flex flex-col">
              <span className="weight-600">
                Reader Reviews for "{book?.name}"
              </span>
              <span className="font-12 dark-50">
                Real readers share their honest experience with photos
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
                  className="review-card flex flex-col gap-12"
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "24px",
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
                        alt={`${review.reviewerName} - reader review for ${book?.name}`}
                        width={60}
                        height={60}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="reviewer-info flex flex-col gap-8 width100">
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
                          {" "}
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= review.rating ? "#FFB800" : "none"}
                              color="#FFB800"
                            />
                          ))}
                        </div>
                        <span className="font-12 gray-500">{review.date}</span>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="faqs-section flex flex-col gap-24">
          <h2 className="font-28 weight-600 text-center">
            Frequently Asked Questions About {book?.name}
          </h2>
          <div
            className="flex flex-col gap-16"
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {[
              {
                q: `Should I read "${book?.name}"?`,
                a: `Yes! ${reviews.length}+ readers have rated it ${avgRating || 4.8}/5 stars. See their photos and reviews above.`,
              },
              {
                q: `Is "${book?.name}" worth buying?`,
                a: `Absolutely. Rated ${avgRating || 4.8}/5 by ${reviews.length}+ verified readers.`,
              },
              {
                q: `What makes "${book?.name}" different?`,
                a: `Practical exercises that create immediate clarity. Most readers see results within days.`,
              },
              {
                q: `Where can I buy "${book?.name}"?`,
                a: `Available at TheBookX.in for just ₹${book?.price}.`,
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="faq-item"
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3
                  className="font-18 weight-600 margin-btm-12px"
                  style={{ color: "#fb8500" }}
                >
                  {faq.q}
                </h3>
                <p className="font-16 dark-50">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {book && (
          <div className="cta-section text-center flex flex-col gap-12">
            <h2 className="font-28 weight-600 margin-btm-12px">
              Get Your Copy Today!
            </h2>
            <p className="font-16 margin-btm-24px">
              Join {reviews.length}+ readers who have transformed their thinking
            </p>
            <Link
              href={`/books/${slugify(book?.name)}`}
              className="pri-big-btn"
            >
              Shop Now - ₹{book?.price}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
