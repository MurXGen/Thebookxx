// app/category/[slug]/page.js
import { books } from "@/utils/book";
import { notFound } from "next/navigation";
import CategoryListing from "@/components/CategoryListing";

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
    // Brand suffix added once by the root title template ("%s | TheBookX").
    title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Books | Buy Online at Best Price`,
    description: `Shop the best ${categoryName} books online at TheBookX. Wide collection of ${categoryName} books at unbeatable prices. Free shipping across India. Limited time ₹1 book sale!`,
    alternates: {
      canonical: `https://www.thebookx.in/category/${slug}`,
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
                item: "https://www.thebookx.in",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Books",
                item: "https://www.thebookx.in/category",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: displayName,
                item: `https://www.thebookx.in/category/${slug}`,
              },
            ],
          }),
        }}
      />

      {/* CollectionPage + ItemList — tells Google this is a category listing
          and surfaces the books (deep links) it contains. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `https://www.thebookx.in/category/${slug}`,
            url: `https://www.thebookx.in/category/${slug}`,
            name: `${displayName} Books`,
            description: `Shop the best ${categoryName} books online at TheBookX at unbeatable prices, with free delivery and Cash on Delivery across India.`,
            isPartOf: { "@id": "https://www.thebookx.in/#website" },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: categoryBooks.length,
              itemListElement: categoryBooks.slice(0, 60).map((book, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://www.thebookx.in/books/${slugify(book.name)}`,
                name: book.name,
              })),
            },
          }),
        }}
      />

      <CategoryListing books={categoryBooks} displayName={displayName} />
    </>
  );
}
