import Link from "next/link";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import { getAllBlogs } from "@/utils/blogs";
import {
  getBlogCategories,
  readingMinutes,
  isTrending,
  coverFor,
} from "@/utils/blogExtras";
import BlogCover from "@/components/UI/BlogCover";
import BlogListClient from "@/components/blog/BlogListClient";
import BlogSubscribe from "@/components/blog/BlogSubscribe";

export const metadata = {
  title: {
    absolute: "Blog & Insights by Murthy Thevar | TheBookX",
  },
  description:
    "Book lists, trending reads, reviews and QuickReads from TheBookX — top 10 roundups, self-help, money, romance and more. Curated by Murthy Thevar.",
  alternates: { canonical: "https://www.thebookx.in/blogs" },
};

export default function BlogsPage() {
  const blogs = getAllBlogs();
  const categories = getBlogCategories();

  // Featured = newest trending post, else newest post overall.
  const featured = blogs.find((b) => isTrending(b)) || blogs[0];
  const trending = blogs
    .filter((b) => isTrending(b) && b.slug !== featured?.slug)
    .slice(0, 6);

  // Lightweight, serializable payload for the client grid.
  const cards = blogs.map((b) => ({
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    author: b.author,
    publishDate: b.publishDate,
    categories: b.categories || [],
    cover: coverFor(b),
    reading: readingMinutes(b),
  }));

  return (
    <div className="section-1200 blog-index">
      <div className="blog-index-head">
        <h1 className="blog-index-title">Blogs &amp; Insights</h1>
        <p className="blog-index-sub">
          Book lists, trending reads, reviews &amp; QuickReads — curated for
          readers who want the best of every shelf.
        </p>
      </div>

      {/* Featured hero */}
      {featured && (
        <Link href={`/blogs/${featured.slug}`} className="blog-hero">
          <div className="blog-hero-media">
            <BlogCover
              src={coverFor(featured)}
              alt={featured.title}
              fit="cover" wrapperStyle={{ width: "100%", height: "100%" }}
              imgStyle={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className="blog-hero-body">
            <span className="blog-hero-badge">
              <TrendingUp size={13} /> Featured
            </span>
            <h2 className="blog-hero-title">{featured.title}</h2>
            <p className="blog-hero-excerpt">
              {(featured.excerpt || "").substring(0, 180)}…
            </p>
            <span className="blog-hero-meta">
              <Clock size={13} /> {readingMinutes(featured)} min read
              <span className="blog-hero-cta">
                Read article <ArrowRight size={15} />
              </span>
            </span>
          </div>
        </Link>
      )}

      {/* Trending / Top 10 rail */}
      {trending.length > 0 && (
        <section className="blog-rail-section">
          <div className="blog-rail-head">
            <TrendingUp size={18} /> Trending &amp; Top Lists
          </div>
          <div className="blog-rail">
            {trending.map((b) => (
              <Link key={b.slug} href={`/blogs/${b.slug}`} className="blog-rail-card">
                <BlogCover
                  src={coverFor(b)}
                  alt={b.title}
                  fit="cover" wrapperStyle={{ width: "100%", height: "120px" }}
                  imgStyle={{ width: "100%", height: "100%" }}
                />
                <div className="blog-rail-body">
                  <h3 className="blog-rail-title">{b.title}</h3>
                  <span className="blog-rail-meta">
                    <Clock size={11} /> {readingMinutes(b)} min
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <BlogSubscribe source="blog-index" />

      {/* Category-filterable grid */}
      <BlogListClient posts={cards} categories={categories} />
    </div>
  );
}
