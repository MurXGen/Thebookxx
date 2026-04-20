// app/authors/page.js
import { books } from "@/utils/book";
import Link from "next/link";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AuthorsPage() {
  const authorMap = new Map();

  books.forEach((book) => {
    if (book.author && !authorMap.has(book.author)) {
      authorMap.set(book.author, {
        name: book.author,
        slug: slugify(book.author),
        bookCount: books.filter((b) => b.author === book.author).length,
      });
    }
  });

  const authors = Array.from(authorMap.values());

  return (
    <div className="section-1200" style={{ padding: "40px 20px" }}>
      <h1 className="font-32 weight-700 margin-btm-24px">Our Authors</h1>
      <div className="grid-3 gap-16">
        {authors.map((author) => (
          <Link
            key={author.slug}
            href={`/author/${author.slug}`}
            className="author-card"
            style={{
              padding: "24px",
              background: "white",
              borderRadius: "12px",
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #e5e7eb",
              transition: "all 0.3s",
            }}
          >
            <h3 className="font-18 weight-600 margin-btm-8px">{author.name}</h3>
            <p className="font-12 gray-500">{author.bookCount} books</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
