import Image from "next/image";
import Link from "next/link";
import { blogData } from "@/utils/blogs";

// Generate metadata for SEO
export async function generateMetadata() {
  const { blog } = blogData;

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.keywords.join(", "),
    authors: [
      {
        name: blog.author,
        url: "https://www.thebookx.in/author/murthy-thevar",
      },
    ],
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.publishDate,
      modifiedTime: blog.lastModified,
      authors: [blog.author],
      images: [
        {
          url: blog.images[0]?.url || blog.coverImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.images[0]?.url || blog.coverImage],
      creator: "@murthythevar",
    },
    alternates: {
      canonical: `https://www.thebookx.in/blogs/the-art-of-clarity`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Generate structured data for SEO
function generateStructuredData() {
  const { blog } = blogData;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.images.map((img) => `https://www.thebookx.in${img.url}`),
    datePublished: blog.publishDate,
    dateModified: blog.lastModified,
    author: {
      "@type": "Person",
      name: blog.author,
      url: "https://www.thebookx.in/author/murthy-thevar",
      sameAs: ["https://www.thebookx.in/author/murthy-thevar"],
    },
    publisher: {
      "@type": "Organization",
      name: "The Book X",
      logo: {
        "@type": "ImageObject",
        url: "https://www.thebookx.in/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.thebookx.in/blogs/the-art-of-clarity`,
    },
    keywords: blog.keywords.join(", "),
    articleSection: blog.categories.join(", "),
  };

  return JSON.stringify(structuredData);
}

// Generate FAQ structured data
function generateFAQStructuredData() {
  const { blog } = blogData;

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: blog.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(faqData);
}

export default function BlogPost() {
  const { blog } = blogData;

  return (
    <>
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateStructuredData() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateFAQStructuredData() }}
      />

      <article
        className="blog-post"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <meta itemProp="datePublished" content={blog.publishDate} />
        <meta itemProp="dateModified" content={blog.lastModified} />
        <meta itemProp="author" content={blog.author} />

        {/* Hero Section with Image */}
        <div className="hero-section">
          <div className="hero-image-container">
            <Image
              src={blog.images[0].url}
              alt={blog.images[0].alt}
              priority
              className="hero-image"
              width={1200}
              height={630}
              quality={90}
            />
            <div className="hero-overlay">
              <div className="hero-content">
                <h1 itemProp="headline">{blog.title}</h1>
                <div className="author-info">
                  <span>By </span>
                  <Link
                    href="https://www.thebookx.in/author/murthy-thevar"
                    target="_blank"
                    rel="author noopener noreferrer"
                    itemProp="author"
                  >
                    {blog.author}
                  </Link>
                  <span className="publish-date">
                    {new Date(blog.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="blog-container">
          <div className="blog-content">
            {/* Backlink to Author and Book Pages */}
            <div className="resource-links">
              <Link
                href="https://www.thebookx.in/author/murthy-thevar"
                target="_blank"
                rel="noopener noreferrer"
                className="author-link"
              >
                About the Author: Murthy Thevar →
              </Link>
              <Link
                href="https://www.thebookx.in/books/the-art-of-clarity"
                target="_blank"
                rel="noopener noreferrer"
                className="book-link"
              >
                Get Your Copy of The Art of Clarity →
              </Link>
            </div>

            {/* Blog Content */}
            <div
              className="content-body"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              itemProp="articleBody"
            />

            {/* Horizontal Scrollable Gallery - Sources of Murthy Thevar */}
            <div className="scrollable-gallery-section">
              <div className="gallery-header">
                <h2>Sources of Murthy Thevar</h2>
                <p className="gallery-description">
                  Explore visual insights from Murthy Thevar's journey and
                  wisdom
                </p>
              </div>

              <div className="scrollable-container">
                <div className="scrollable-wrapper">
                  {blog.images.map((image, index) => (
                    <div key={index} className="scrollable-card">
                      <div className="card-image">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          width={400}
                          height={300}
                          className="card-img"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </div>
                      <div className="card-content">
                        <p className="card-caption">{image.caption}</p>
                        {index === 0 && (
                          <span className="author-tag">Murthy Thevar</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Bonus Card - Book Link */}
                  <div className="scrollable-card cta-card">
                    <div className="card-image cta-image">
                      <div className="cta-overlay">
                        <h3>Get Your Copy</h3>
                        <p>The Art of Clarity by Murthy Thevar</p>
                        <Link
                          href="https://www.thebookx.in/books/the-art-of-clarity"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cta-button"
                        >
                          Buy Now →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="scroll-indicator">
                <span className="scroll-arrow">←</span>
                <span className="scroll-text">Scroll to explore more</span>
                <span className="scroll-arrow">→</span>
              </div>
            </div>

            {/* Author Bio Section with Backlink */}
            <div className="author-bio">
              <div className="author-avatar">
                <Image
                  src="/blogs/the-art-of-clarity/murthy-thevar-author.jpg"
                  alt="Murthy Thevar"
                  width={100}
                  height={100}
                  className="author-image"
                />
              </div>
              <div className="author-details">
                <h3>About the Author: Murthy Thevar</h3>
                <p>
                  Murthy Thevar is a distinguished author and communication
                  expert. His book <strong>The Art of Clarity</strong> is
                  transforming how people communicate.
                </p>
                <Link
                  href="https://www.thebookx.in/author/murthy-thevar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="author-page-link"
                >
                  View Murthy Thevar's Author Page →
                </Link>
                <Link
                  href="https://www.thebookx.in/books/the-art-of-clarity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-page-link"
                >
                  Buy The Art of Clarity →
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {blog.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="faq-item"
                    itemScope
                    itemType="https://schema.org/Question"
                  >
                    <h3 itemProp="name">{faq.question}</h3>
                    <div
                      itemProp="acceptedAnswer"
                      itemScope
                      itemType="https://schema.org/Answer"
                    >
                      <p itemProp="text">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
