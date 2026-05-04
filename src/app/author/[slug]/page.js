// app/author/[slug]/page.js
import { authorData, getAuthorBySlug } from "@/utils/author";
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

// Generate static params for all authors
export async function generateStaticParams() {
  const allAuthors = getAllAuthors();
  return allAuthors.map((author) => ({ slug: author.slug }));
}

// Get all authors from the author data structure
function getAllAuthors() {
  return [authorData];
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
  const canonicalUrl = `https://thebookx.in/author/${slug}`;

  return {
    title: `${author.name} - Author of "${book?.name}" | Bestselling Self-Help Author | TheBookX`,
    description: `Discover ${author.name}, the clarity coach and bestselling author of "${book?.name}". See author photos, books, achievements, and get your copy today.`,
    keywords: `${author.name}, Murthy Thevar, The Art of Clarity, clarity coach, self-help books India, mental clarity, Murthy Thevar book, best self-help books 2026`,
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
      description: `Meet ${author.name}, India's leading clarity coach. Discover "${book?.name}" and get your copy today.`,
      url: canonicalUrl,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "profile",
      images: [
        {
          url: author.authorImages[0]?.url,
          width: 1200,
          height: 630,
          alt: author.authorImages[0]?.alt,
        },
        {
          url: book?.image,
          width: 800,
          height: 800,
          alt: `${book?.name} by ${author.name}`,
        },
        ...author.authorImages
          .slice(1, 4)
          .map((img) => ({ url: img.url, width: 800, height: 800 })),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} - Bestselling Author of "The Art of Clarity"`,
      description: `Discover ${author.name}'s transformative book. See author photos and get your copy at TheBookX.in`,
      images: [author.authorImages[0]?.url, book?.image],
    },
  };
}

// Structured data for Google
const generateStructuredData = (author, book) => {
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
        sameAs: Object.values(author.socialLinks).filter((l) => l && l !== "#"),
        jobTitle: "Author, Clarity Coach, Speaker",
        award: author.achievements?.slice(0, 6),
        image: author.authorImages.map((img) => img.url),
        birthDate: "2004-01-03",
        birthPlace: { "@type": "Place", name: author.birthplace },
        nationality: { "@type": "Country", name: author.nationality },
        knowsAbout: author.genres || [
          "Self-Help",
          "Personal Development",
          "Mental Clarity",
        ],
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
        isbn: book?.isbn,
        numberOfPages: book?.pages,
        inLanguage: book?.language,
        datePublished: book?.publishDate,
        image: book?.image,
        offers: {
          "@type": "Offer",
          price: book?.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "TheBookX" },
        },
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
  const structuredData = generateStructuredData(author, book);

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
                src={author.authorImages[0]?.url || "/default-author.jpg"}
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

        {/* Author Bio Section */}
        <div className="author-bio">
          <h2 className="font-24 weight-600 margin-btm-16px">
            About {author.name}
          </h2>
          <p className="font-16 dark-50" style={{ lineHeight: "1.8" }}>
            {author.bio}
          </p>
        </div>

        {/* Author Gallery Section - ONLY AUTHOR IMAGES */}
        {author.authorImages && author.authorImages.length > 0 && (
          <div className="author-gallery flex flex-col gap-24">
            <div className="flex items-center gap-8">
              <Camera size={24} className="orange" />
              <h2 className="font-24 weight-600">Gallery - {author.name}</h2>
            </div>
            <p className="font-14 dark-50 margin-btm-8px">
              Explore photos of {author.name} from book launches, workshops,
              media interviews, and events
            </p>

            <div
              className="gallery-grid"
              style={{
                display: "flex",
                flexDirection: "row",
                overflow: "scroll",
                borderRadius: "12px",
                gap: "12px",
              }}
            >
              {author.authorImages.map((img, index) => (
                <div key={index} className="gallery-item">
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={200}
                      height={250}
                      style={{ objectFit: "cover" }}
                      loading="eager"
                      priority={index < 6}
                      fetchPriority={index < 6 ? "high" : "auto"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Books by Author Section */}
        {author.publishedBooks && author.publishedBooks.length > 0 && (
          <div className="books-by-author flex flex-col gap-24">
            <h2 className="font-24 weight-600">Books by {author.name}</h2>
            <div
              className="books-list"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {author.publishedBooks.map((bookItem) => (
                <div
                  key={bookItem.id}
                  className="book-card"
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  <div className="flex flex-row justify-center">
                    <Image
                      src={bookItem.image}
                      alt={`${bookItem.name} book cover by ${author.name}`}
                      width={100}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div
                    style={{ padding: "16px" }}
                    className="flex flex-col gap-12"
                  >
                    <h3 className="font-16 weight-600 margin-btm-8px">
                      {bookItem.name}
                    </h3>
                    <p className="font-12 dark-50 margin-btm-12px">
                      {bookItem.description.substring(0, 100)}...
                    </p>
                    <div className="rating flex items-center gap-4 margin-btm-12px">
                      <Star size={14} fill="#FFB800" color="#FFB800" />
                      <span className="font-12 weight-500">
                        {bookItem.ratings?.thebookx || 4.8}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-18 weight-700 green">
                        ₹{bookItem.price}
                      </span>
                      <Link
                        href={`/books/${bookItem.slug}`}
                        className="pri-big-btn"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards Section */}
        {author.achievements && author.achievements.length > 0 && (
          <div className="achievements flex flex-col gap-24">
            <h2 className="font-24 weight-600">Awards & Recognition</h2>
            <div
              className="flex flex-col gap-24"
              style={{
                background: "white",
                border: "1px solid var(--dark-20)",
                padding: "12px",
                borderRadius: "12px",
              }}
            >
              {author.achievements.slice(0, 10).map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-badge flex flex-row gap-4 items-center"
                  style={{
                    borderBottom: "1px solid var(--dark-20)",
                    paddingBottom: "12px",
                  }}
                >
                  <Award size={16} color="#fb8500" />
                  <span className="font-16 weight-500">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {book && (
          <div className="flex flex-col gap-20 text-center">
            <h2 className="font-26 weight-600">
              Get Your Copy of "{book.name}" Today!
            </h2>
            <p className="font-15">
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
