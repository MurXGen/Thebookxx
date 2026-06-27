// app/author/page.js
import { books } from "@/utils/book";
import Link from "next/link";
import { BookOpen } from "lucide-react";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const metadata = {
  title: "All Authors — Browse Books by Author | Books Starting at ₹1",
  description:
    "Browse every author at TheBookX and explore all their books. Buy books online at the lowest prices in India — free shipping, Cash on Delivery, with books starting at just ₹1.",
  keywords:
    "authors, book authors, browse by author, buy books online India, lowest price books, books starting at ₹1, TheBookX",
  alternates: { canonical: "https://thebookx.in/author" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "All Authors — Browse Books by Author | Books Starting at ₹1",
    description:
      "Explore every author at TheBookX and all their books — lowest prices in India, free shipping, books starting at ₹1.",
    url: "https://thebookx.in/author",
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
  },
};

export default function AuthorsPage() {
  const authorMap = new Map();
  books.forEach((book) => {
    if (!book.author || book.author === "Unknown") return;
    const slug = slugify(book.author);
    if (!authorMap.has(slug)) {
      authorMap.set(slug, {
        name: book.author,
        slug,
        bookCount: 0,
        genres: new Set(),
      });
    }
    const a = authorMap.get(slug);
    a.bookCount += 1;
    (book.catalogue || []).forEach((c) => {
      if (!["bestseller", "trending", "set"].includes(c)) a.genres.add(c);
    });
  });

  const authors = Array.from(authorMap.values())
    .map((a) => ({ ...a, genres: Array.from(a.genres) }))
    .sort((x, y) => y.bookCount - x.bookCount || x.name.localeCompare(y.name));

  const totalBooks = books.filter(
    (b) => b.author && b.author !== "Unknown",
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Authors | TheBookX",
    description:
      "Browse every author at TheBookX and explore all their books, with books starting at ₹1.",
    url: "https://thebookx.in/author",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: authors.length,
      itemListElement: authors.slice(0, 100).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://thebookx.in/author/${a.slug}`,
        name: a.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="section-680 authors-page flex flex-col gap-20"
        style={{ padding: "20px 16px 64px" }}
      >
        <nav className="breadcrumbs" style={{ fontSize: "14px", color: "#666" }}>
          <Link href="/" style={{ color: "#fb8500" }}>
            Home
          </Link>
          <span> / </span>
          <span style={{ color: "#374151" }}>Authors</span>
        </nav>

        <header className="authors-hero">
          <h1 className="authors-hero-title">Our Authors</h1>
          <p className="authors-hero-sub">
            Browse {authors.length} authors and {totalBooks}+ books — buy online
            at the lowest prices, starting at just ₹1.
          </p>
        </header>

        <div className="authors-grid">
          {authors.map((author) => (
            <Link
              key={author.slug}
              href={`/author/${author.slug}`}
              className="author-card"
              aria-label={`Browse ${author.bookCount} books by ${author.name}`}
            >
              <span className="author-card-avatar">{author.name[0]}</span>
              <span className="author-card-body">
                <span className="author-card-name">{author.name}</span>
                <span className="author-card-meta">
                  <BookOpen size={12} />
                  {author.bookCount} {author.bookCount === 1 ? "book" : "books"}
                  {author.genres[0]
                    ? ` · ${author.genres[0].replace(/-/g, " ")}`
                    : ""}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
