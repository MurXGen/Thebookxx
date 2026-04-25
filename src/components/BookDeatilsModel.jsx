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
        className="blog-detail-section"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <div className="section-1200 flex flex-col gap-24">
          <meta itemProp="datePublished" content={blog.publishDate} />
          <meta itemProp="dateModified" content={blog.lastModified} />
          <meta itemProp="author" content={blog.author} />

          {/* Hero Section */}
          <div className="blog-hero-section">
            <div className="blog-hero-image-container">
              <Image
                src={blog.images[0].url}
                alt={blog.images[0].alt}
                priority
                className="blog-hero-image"
                width={1200}
                height={630}
                quality={90}
              />
              <div className="blog-hero-overlay">
                <div className="blog-hero-content">
                  <h1 className="font-32 weight-600" itemProp="headline">
                    {blog.title}
                  </h1>
                  <div className="flex flex-row gap-12 mt-16 justify-center">
                    <span className="font-14 dark-50">By</span>
                    <Link
                      href="https://www.thebookx.in/author/murthy-thevar"
                      target="_blank"
                      rel="author noopener noreferrer"
                      className="font-14 weight-500 green"
                      itemProp="author"
                    >
                      {blog.author}
                    </Link>
                    <span className="font-14 dark-50">
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

          {/* Resource Links */}
          <div className="flex flex-row flex-wrap gap-16 resource-links mt-24">
            <Link
              href="https://www.thebookx.in/author/murthy-thevar"
              target="_blank"
              rel="noopener noreferrer"
              className="sec-mid-btn flex-1 text-center"
            >
              About the Author: Murthy Thevar →
            </Link>
            <Link
              href="https://www.thebookx.in/books/the-art-of-clarity"
              target="_blank"
              rel="noopener noreferrer"
              className="pri-mid-btn flex-1 text-center"
            >
              Get Your Copy of The Art of Clarity →
            </Link>
          </div>

          {/* Blog Content */}
          <div
            className="blog-content-body font-16 dark-50 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
            itemProp="articleBody"
          />

          {/* Sources of Murthy Thevar - Horizontal Scrollable Gallery */}
          <div className="scrollable-gallery-section mt-32">
            <div className="section-header mb-24 text-center">
              <h2 className="font-24 weight-600">Sources of Murthy Thevar</h2>
              <p className="font-14 dark-50 mt-8">
                Explore visual insights from Murthy Thevar's journey and wisdom
              </p>
            </div>

            <div className="scrollable-container">
              <div className="scrollable-wrapper flex flex-row gap-16">
                {blog.images.map((image, index) => (
                  <div key={index} className="scrollable-card">
                    <div className="scrollable-card-image">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        width={400}
                        height={300}
                        className="width100"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="scrollable-card-content p-16">
                      <p className="font-12 dark-70">{image.caption}</p>
                      {index === 0 && (
                        <span className="pri-mid-badge mt-8 inline-block">
                          Murthy Thevar
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* CTA Card */}
                <div className="scrollable-card cta-card">
                  <div className="scrollable-card-image bg-primary flex flex-col items-center justify-center text-center p-24">
                    <h3 className="font-20 weight-600 white mb-12">
                      Get Your Copy
                    </h3>
                    <p className="font-14 white-80 mb-16">
                      The Art of Clarity by Murthy Thevar
                    </p>
                    <Link
                      href="https://www.thebookx.in/books/the-art-of-clarity"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pri-small-btn"
                    >
                      Buy Now →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-indicator text-center mt-16">
              <span className="font-12 dark-50">
                ← Scroll to explore more →
              </span>
            </div>
          </div>

          {/* Author Bio Section */}
          <div className="author-bio-section bg-gray-50 rounded-lg p-24 mt-32 flex flex-row flex-wrap gap-24 items-center">
            <div className="author-bio-avatar">
              <Image
                src="/blogs/the-art-of-clarity/murthy-thevar-author.jpg"
                alt="Murthy Thevar"
                width={100}
                height={100}
                className="author-bio-image rounded-full"
              />
            </div>
            <div className="author-bio-details flex-1">
              <h3 className="font-18 weight-600 mb-8">
                About the Author: Murthy Thevar
              </h3>
              <p className="font-14 dark-70 mb-16">
                Murthy Thevar is a distinguished author and communication
                expert. His book <strong>The Art of Clarity</strong> is
                transforming how people communicate.
              </p>
              <div className="flex flex-row flex-wrap gap-12">
                <Link
                  href="https://www.thebookx.in/author/murthy-thevar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sec-mid-btn"
                >
                  View Author Page →
                </Link>
                <Link
                  href="https://www.thebookx.in/books/the-art-of-clarity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pri-mid-btn"
                >
                  Buy The Art of Clarity →
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section mt-32">
            <div className="section-header mb-24">
              <h2 className="font-20 weight-600">Frequently Asked Questions</h2>
            </div>
            <div className="faq-list flex flex-col gap-16">
              {blog.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-item border-b border-gray-200 pb-16"
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <h3 className="font-16 weight-600 mb-8" itemProp="name">
                    {faq.question}
                  </h3>
                  <div
                    itemProp="acceptedAnswer"
                    itemScope
                    itemType="https://schema.org/Answer"
                  >
                    <p className="font-14 dark-70" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browse More Categories - Footer Links */}
          <div className="browse-categories-footer mt-24 pt-24 border-t border-gray-200">
            <h4 className="font-14 weight-600 mb-12">Browse More Categories</h4>
            <div className="flex flex-row flex-wrap gap-12">
              {blog.categories.map((category) => (
                <a
                  key={category}
                  href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="font-12 sec-mid-btn px-12 py-6"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
