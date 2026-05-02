// app/category/[slug]/page.js
import { books } from "@/utils/book";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Link from "next/link";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generate metadata for category page
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ");

  return {
    title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Books | Buy Online at Best Price | TheBookX`,
    description: `Shop the best ${categoryName} books online at TheBookX. Wide collection of ${categoryName} books at unbeatable prices. Free shipping across India. Limited time ₹1 book sale!`,
    alternates: {
      canonical: `https://thebookx.in/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ");

  const categoryBooks = books.filter((book) =>
    book.catalogue?.some((cat) => slugify(cat) === slug),
  );

  if (categoryBooks.length === 0) {
    notFound();
  }

  const displayName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://thebookx.in",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Books",
                item: "https://thebookx.in/category",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: displayName,
                item: `https://thebookx.in/category/${slug}`,
              },
            ],
          }),
        }}
      />

      <div className="category-page">
        <div className="category-header">
          <Link href="/category" className="back-link">
            ← Back to All Books
          </Link>
          <h1 className="category-title">{displayName} Books</h1>
          <p className="category-description">
            Browse our collection of {categoryBooks.length} {displayName} books.
            Shop online at best prices with free shipping across India.
          </p>
        </div>

        <div className="books-grid">
          {categoryBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </>
  );
}
