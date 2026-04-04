// app/books/[slug]/page.js
import { books } from "@/utils/book";
import { notFound, redirect } from "next/navigation";
import BookDetailsModal from "@/components/BookDeatilsModel";

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ✅ Metadata (also handles redirect case)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // 1️⃣ Try normal slug match
  let book = books.find((b) => slugify(b.name) === decodedSlug);

  // 2️⃣ If not found → try ID match
  if (!book) {
    const bookById = books.find((b) => b.id.toLowerCase() === decodedSlug);

    if (bookById) {
      const correctSlug = slugify(bookById.name);

      return {
        title: "Redirecting...",
        robots: { index: false, follow: false },
        alternates: {
          canonical: `https://thebookx.in/books/${correctSlug}`,
        },
      };
    }

    return {
      title: "Book Not Found | TheBookX",
      description: "The requested book could not be found at TheBookX.",
    };
  }

  const bookUrl = `https://thebookx.in/books/${slugify(book.name)}`;
  const title = `${book.name} by ${book.author || "Various Authors"} | Buy Online at Best Price | TheBookX`;
  const description = `${book.description.substring(0, 155)} Shop now at TheBookX — India's most trusted online bookstore. Free shipping across India.`;

  return {
    title,
    description,
    keywords: `${book.name}, ${book.author}, ${book.catalogue?.join(", ")}, buy book online, TheBookX`,
    authors: [{ name: book.author || "Various Authors" }],
    alternates: { canonical: bookUrl },
    openGraph: {
      title,
      description,
      url: bookUrl,
      siteName: "TheBookX",
      images: [
        {
          url: book.image,
          width: 1200,
          height: 630,
          alt: `${book.name} book cover`,
        },
      ],
      type: "book",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [book.image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ✅ Page logic with redirect
export default async function BookDetailsPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // 1️⃣ Try slug
  let book = books.find((b) => slugify(b.name) === decodedSlug);

  // 2️⃣ If not found → try ID → redirect
  if (!book) {
    const bookById = books.find((b) => b.id.toLowerCase() === decodedSlug);

    if (bookById) {
      const correctSlug = slugify(bookById.name);

      // 🔥 THIS IS THE KEY LINE
      redirect(`/books/${correctSlug}`);
    }

    // 3️⃣ Not found at all
    notFound();
  }

  return <BookDetailsModal book={book} />;
}
