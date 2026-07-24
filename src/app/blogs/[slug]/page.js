import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogSlugs, getAllBlogs } from "@/utils/blogs";
import BlogViews from "@/components/UI/BlogViews";
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
  Clock,
  Eye,
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
      // No per-post image: falls back to the site's branded OG card
      // (app/opengraph-image.js).
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
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
    image: ["https://www.thebookx.in/intro-image.jpeg"],
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
  const allBlogs = getAllBlogs();

  if (!blog) {
    notFound();
  }

  const structuredData = generateStructuredData(blog);

  // FAQPage schema, built from the post's FAQ section (rich-result eligible)
  const faqStructuredData =
    blog.faqs && blog.faqs.length > 0
      ? {
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
        }
      : null;


  // Filter out current blog from related blogs
  const relatedBlogs = allBlogs.filter((b) => b.slug !== slug).slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      <div className="section-1200" style={{ padding: "40px 20px" }}>
        <div className="blog-layout">
          {/* Main Content Area */}
          <div className="blog-main">
            {/* Breadcrumbs */}
            <nav
              className="breadcrumbs"
              style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}
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

            {/* Text-first article header (no cover image) */}
            <header style={{ marginBottom: "28px" }}>
              <h1
                className="font-32 weight-700"
                style={{ lineHeight: 1.2, marginBottom: "12px" }}
              >
                {blog.title}
              </h1>
              <div className="flex flex-row gap-16 flex-wrap font-14 dark-50">
                <span className="flex items-center gap-4">
                  By{" "}
                  <Link
                    href={`/author/${blog.authorSlug}`}
                    style={{ color: "#fb8500", fontWeight: 600 }}
                  >
                    {blog.author}
                  </Link>
                </span>
                <span className="flex items-center gap-4">
                  <Calendar size={14} />
                  {new Date(blog.publishDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <BlogViews slug={blog.slug} />
              </div>
            </header>

            {/* Blog Content - Rendered from JSON */}
            <div className="blog-content" style={{ marginBottom: "40px" }}>
              {blog.content.map((block, index) =>
                renderContentBlock(block, index),
              )}
            </div>

            {/* FAQ Section */}
            {blog.faqs.length > 0 && (
              <div
                className="flex flex-col gap-24"
                style={{ marginBottom: "40px" }}
              >
                <h2 className="font-24 weight-600">
                  Frequently Asked Questions
                </h2>
                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(340px, 1fr))",
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

          </div>

          {/* Right Sidebar - All Blogs Container */}
          <aside className="blog-sidebar">
            <div className="sidebar-container">
              <div className="sidebar-header">
                <h3 className="sidebar-title">📚 All Blogs</h3>
                <p className="sidebar-subtitle">Explore more articles</p>
              </div>

              <div className="blogs-list">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog.id}
                    href={`/blogs/${relatedBlog.slug}`}
                    className="blog-item"
                  >
                    <div className="blog-item-image">
                      <div className="blog-item-placeholder">📖</div>
                    </div>
                    <div className="blog-item-content">
                      <h4 className="blog-item-title">{relatedBlog.title}</h4>
                      <div className="blog-item-meta">
                        <span className="blog-item-date">
                          <Calendar size={12} />
                          {new Date(relatedBlog.publishDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <span className="blog-item-read">
                          <Clock size={12} />
                          {Math.ceil(
                            relatedBlog.content.reduce(
                              (acc, block) =>
                                acc + (block.content?.length || 0),
                              0,
                            ) / 1000,
                          )}{" "}
                          min read
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="sidebar-footer">
                <Link href="/blogs" className="view-all-btn">
                  View All Articles →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
