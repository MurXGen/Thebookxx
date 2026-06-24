import Link from "next/link";
import { getAllBlogs } from "@/utils/blogs";

export const metadata = {
  // `absolute` prevents the root template from appending a second "| TheBookX".
  title: {
    absolute: "Blog & Insights by Murthy Thevar | TheBookX",
  },
  description:
    "Articles and insights on clarity, focus and self-improvement from Murthy Thevar, author of The Art of Clarity, curated by TheBookX.",
  alternates: { canonical: "https://www.thebookx.in/blogs" },
};

export default function BlogsPage() {
  const blogs = getAllBlogs();

  return (
    <div className="section-1200 flex flex-col gap-32">
      <div className="text-center">
        <h1 className="font-36 weight-700">Blogs & Insights</h1>
        <p className="font-16 dark-50 margin-tp-12px">
          Discover wisdom and insights from Murthy Thevar
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        }}
      >
        {blogs.map((blog) => (
          <Link
            href={`/blogs/${blog.slug}`}
            key={blog.id}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid var(--hairline, #ececec)",
                boxShadow: "var(--shadow-xs)",
                padding: "22px",
                height: "100%",
              }}
            >
              <div className="flex items-center gap-8 margin-btm-8px">
                <span className="font-12" style={{ color: "#fb8500" }}>
                  {new Date(blog.publishDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-12 dark-50">• {blog.author}</span>
              </div>
              <h2 className="font-20 weight-600 margin-btm-12px">
                {blog.title}
              </h2>
              <p className="font-13 dark-50" style={{ lineHeight: 1.6 }}>
                {blog.excerpt.substring(0, 150)}...
              </p>
              <span
                className="font-13 weight-600"
                style={{ color: "#fb8500", display: "inline-block", marginTop: "12px" }}
              >
                Read article →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
