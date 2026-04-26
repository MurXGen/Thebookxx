import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogSlugs } from "@/utils/blogs";
import { authorData } from "@/utils/author";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Generate static params for all blogs
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs;
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | TheBookX",
      robots: { index: false },
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.keywords.join(", "),
    authors: [
      {
        name: blog.author,
        url: `https://www.thebookx.in/author/${blog.authorSlug}`,
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
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.images[0]?.url || blog.coverImage],
    },
    alternates: {
      canonical: `https://www.thebookx.in/blogs/${blog.slug}`,
    },
  };
}

// Generate structured data
function generateStructuredData(blog) {
  return {
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
      url: `https://www.thebookx.in/author/${blog.authorSlug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "The Book X",
      logo: { "@type": "ImageObject", url: "https://www.thebookx.in/logo.png" },
    },
    mainEntityOfPage: `https://www.thebookx.in/blogs/${blog.slug}`,
    keywords: blog.keywords.join(", "),
  };
}

// Component to render different content types
const renderContentBlock = (block, index) => {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level}`;
      return (
        <HeadingTag
          key={index}
          className={`font-${24 - (block.level - 1) * 2} weight-600 margin-tp-24px margin-btm-12px`}
        >
          <span dangerouslySetInnerHTML={{ __html: block.content }} />
        </HeadingTag>
      );

    case "paragraph":
      return (
        <p
          key={index}
          className="font-15 dark-50"
          style={{ lineHeight: "1.8", marginBottom: "16px" }}
        >
          <span dangerouslySetInnerHTML={{ __html: block.content }} />
        </p>
      );

    case "blockquote":
      return (
        <blockquote
          key={index}
          style={{
            borderLeft: "4px solid #fb8500",
            background: "#f9fafb",
            padding: "16px 20px",
            borderRadius: "8px",
            margin: "24px 0",
            fontStyle: "italic",
          }}
        >
          <p
            className="font-14 dark-50"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </blockquote>
      );

    case "list":
      const ListTag = block.style === "ordered" ? "ol" : "ul";
      return (
        <ListTag key={index} style={{ margin: "16px 0", paddingLeft: "24px" }}>
          {block.items.map((item, i) => (
            <li
              key={i}
              className="font-14 dark-50"
              style={{ marginBottom: "8px" }}
            >
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ListTag>
      );

    case "callout":
      return (
        <div
          key={index}
          style={{
            background: block.style === "info" ? "#f59e0b20" : "#fef3c7",
            borderLeft: `4px solid ${block.style === "info" ? "#f59e0b" : "#f59e0b"}`,
            padding: "16px 20px",
            borderRadius: "8px",
            margin: "24px 0",
          }}
        >
          {block.title && (
            <h4 className="weight-600 margin-btm-8px">{block.title}</h4>
          )}
          <div
            className="font-13"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    default:
      return null;
  }
};

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const structuredData = generateStructuredData(blog);
  const book = authorData.publishedBooks[0];

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
          <Link href="/blogs" style={{ color: "#fb8500" }}>
            Blogs
          </Link>
          <span> / </span>
          <span style={{ color: "#374151" }}>{blog.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="hero-section" style={{ borderRadius: "12px" }}>
          <div
            style={{
              width: "100%",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src={blog.images[0]?.url || blog.coverImage}
              alt={blog.images[0]?.alt || blog.title}
              width={1200}
              height={500}
              style={{ objectFit: "cover", width: "100%", height: "500px" }}
              priority
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
              className="flex flex-col gap-24"
              style={{
                position: "absolute",
                bottom: "24px",
                left: "24px",
                zIndex: 2,
                color: "white",
              }}
            >
              <h1 className="font-32 weight-700">{blog.title}</h1>
              <div className="flex flex-row gap-16 flex-wrap font-16 margin-tp-12px ">
                <span className="flex items-center gap-4">
                  By
                  <Link href={`/author/${blog.authorSlug}`}>{blog.author}</Link>
                </span>
                <span className="flex items-center gap-4">
                  <Calendar size={16} />
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

        {/* Resource Links */}
        <div className="flex flex-row gap-16 justify-between">
          <Link
            href={`/author/${blog.authorSlug}`}
            className="pri-big-btn flex flex-col width100"
          >
            <span>About the Author:</span>
            <span>{blog.author}</span>
          </Link>
          <Link
            href="/books/the-art-of-clarity"
            className="sec-big-btn flex flex-col width100"
          >
            Get Your Copy of The Art of Clarity
          </Link>
        </div>

        {/* Blog Content - Rendered from JSON */}
        <div className="blog-content">
          {blog.content.map((block, index) => renderContentBlock(block, index))}
        </div>

        {/* Sources Gallery - Horizontal Scrollable */}
        {blog.images.length > 0 && (
          <div className="flex flex-col gap-24">
            <div className="flex items-center gap-8">
              <h2 className="font-24 weight-600">Sources of {blog.author}</h2>
            </div>
            <p className="font-14 dark-50">
              Explore visual insights from {blog.author}'s journey and wisdom
            </p>

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  padding: "0.5rem 0 1.5rem 0",
                  minWidth: "min-content",
                }}
              >
                {blog.images.map((image, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: "0 0 auto",
                      width: "320px",
                      background: "white",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ position: "relative", paddingBottom: "75%" }}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "12px" }}>
                      <span
                        style={{
                          background: "#fb850020",
                          padding: "2px 8px",
                          borderRadius: "100px",
                          fontSize: "10px",
                        }}
                      >
                        📸 {image.category || "Visual"}
                      </span>
                      <p className="font-12 weight-500 margin-tp-8px">
                        {image.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#6b7280",
              }}
            >
              <ChevronLeft size={16} />
              <span className="font-12">Scroll to explore more</span>
              <ChevronRight size={16} />
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="flex flex-col gap-24">
          <h2 className="font-24 weight-600">
            About the Author: {blog.author}
          </h2>
          <div className="flex flex-row gap-24 flex-wrap">
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Image
                src={authorData.authorImages[0]?.url}
                alt={blog.author}
                width={120}
                height={120}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex flex-col gap-16" style={{ flex: 1 }}>
              <p className="font-14 dark-50" style={{ lineHeight: "1.8" }}>
                {authorData.bio}
              </p>
              <div className="flex flex-row gap-12 flex-wrap">
                <Link
                  href={`/author/${blog.authorSlug}`}
                  className="pri-small-btn"
                >
                  View Author Page →
                </Link>
                <Link
                  href="/books/the-art-of-clarity"
                  className="sec-small-btn"
                >
                  Buy the Book →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {blog.faqs.length > 0 && (
          <div className="flex flex-col gap-24">
            <h2 className="font-24 weight-600">Frequently Asked Questions</h2>
            <div
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              }}
            >
              {blog.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div className="flex items-center gap-8 margin-btm-12px">
                    <Quote size={16} color="#fb8500" />
                    <h3 className="font-16 weight-600">{faq.question}</h3>
                  </div>
                  <p className="font-13 dark-50">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {book && (
          <div className="flex flex-col gap-24">
            <h2 className="font-26 weight-600">
              Get Your Copy of "{book.name}" Today!
            </h2>
            <p className="font-15 margin-tp-12px">
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
