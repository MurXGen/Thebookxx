"use client";

import { use } from "react";
import BookDetailsModal from "@/components/BookDeatilsModel";
import { books } from "@/utils/book";
import { useRouter } from "next/navigation";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BookDetailsPage({ params }) {
  const resolvedParams = use(params); // ✅ REQUIRED
  const { slug } = resolvedParams;

  const router = useRouter();

  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  const book = books.find((b) => slugify(b.name) === decodedSlug);

  if (!book) {
    console.log("❌ Book not found for slug:", decodedSlug);
    return <div>Book not found</div>;
  }

  return <BookDetailsModal book={book} onClose={() => router.push("/")} />;
}
