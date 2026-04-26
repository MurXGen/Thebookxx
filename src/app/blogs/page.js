import Link from "next/link";
import Image from "next/image";
import { getAllBlogs } from "@/utils/blogs";

export const metadata = {
  title: "Blogs | TheBookX - Insights from Murthy Thevar",
  description:
    "Explore articles and insights from Murthy Thevar, author of The Art of Clarity",
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
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
              }}
            >
              <div style={{ position: "relative", paddingBottom: "60%" }}>
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "20px" }}>
                <div className="flex items-center gap-8 margin-btm-8px">
                  <span className="font-12" style={{ color: "#fb8500" }}>
                    {new Date(blog.publishDate).toLocaleDateString()}
                  </span>
                  <span className="font-12 dark-50">• {blog.author}</span>
                </div>
                <h2 className="font-20 weight-600 margin-btm-12px">
                  {blog.title}
                </h2>
                <p className="font-13 dark-50">
                  {blog.excerpt.substring(0, 120)}...
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
