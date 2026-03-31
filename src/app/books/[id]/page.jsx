"use client";

import BookDetailsModal from "@/components/BookDeatilsModel";
import { books } from "@/utils/book";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function BookDetailsPage({ params }) {
  const { id } = use(params); // ✅ unwrap params
  const router = useRouter();

  const book = books.find((b) => b.id === id);
  if (!book) return null;

  return <BookDetailsModal book={book} onClose={() => router.push("/")} />;
}
