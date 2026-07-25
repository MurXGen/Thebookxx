"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import BlogCover from "@/components/UI/BlogCover";

// Category-filterable grid of blog cards (image + meta + excerpt).
export default function BlogListClient({ posts = [], categories = [] }) {
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    if (active === "All") return posts;
    return posts.filter((p) => (p.categories || []).includes(active));
  }, [active, posts]);

  return (
    <div className="blog-list-wrap">
      <div className="blog-cat-tabs" role="tablist">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`blog-cat-tab${active === cat ? " active" : ""}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="blog-card-grid">
        {filtered.map((blog) => (
          <Link
            href={`/blogs/${blog.slug}`}
            key={blog.slug}
            className="blog-card"
          >
            <BlogCover
              src={blog.cover}
              alt={blog.title}
              fit="cover"
              wrapperStyle={{ width: "100%", height: "180px" }}
              imgStyle={{ width: "100%", height: "100%" }}
            />
            <div className="blog-card-body">
              {blog.categories?.[0] && (
                <span className="blog-card-tag">{blog.categories[0]}</span>
              )}
              <h2 className="blog-card-title">{blog.title}</h2>
              <p className="blog-card-excerpt">
                {(blog.excerpt || "").substring(0, 120)}…
              </p>
              <div className="blog-card-meta">
                <span>
                  <Calendar size={12} />{" "}
                  {new Date(blog.publishDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>
                  <Clock size={12} /> {blog.reading} min read
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="blog-empty">No posts in this category yet.</p>
      )}
    </div>
  );
}
