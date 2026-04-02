// app/books/[slug]/page.js
import { books } from "@/utils/book";
import { notFound } from "next/navigation";
import BookDetailsModal from "@/components/BookDeatilsModel";

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ✅ IMPORTANT: Generate metadata on the server (this will show in Google search)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const book = books.find((b) => slugify(b.name) === decodedSlug);

  if (!book) {
    return {
      title: "Book Not Found | TheBookX",
      description: "The requested book could not be found at TheBookX.",
    };
  }

  const bookUrl = `https://thebookx.in/books/${slugify(book.name)}`;
  const title = `${book.name} by ${book.author || "Various Authors"} | Buy Online at Best Price | TheBookX`;
  const description = `${book.description.substring(0, 155)} Shop now at TheBookX — India's most trusted online bookstore. Free shipping across India. Limited time ₹1 book sale!`;

  return {
    title: title,
    description: description,
    keywords: `${book.name}, ${book.author}, ${book.catalogue?.join(", ")}, buy book online, TheBookX`,
    authors: [{ name: book.author || "Various Authors" }],
    alternates: {
      canonical: bookUrl,
    },
    openGraph: {
      title: title,
      description: description,
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
      title: title,
      description: description,
      images: [book.image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BookDetailsPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const book = books.find((b) => slugify(b.name) === decodedSlug);

  if (!book) {
    notFound();
  }

  return <BookDetailsModal book={book} />;
}
