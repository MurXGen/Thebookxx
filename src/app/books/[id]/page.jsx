"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { books } from "@/utils/book";
import BookDetailsModal from "@/components/BookDeatilsModel";

export default function BookDetailsPage({ params }) {
  const { id } = use(params); // ✅ unwrap params
  const router = useRouter();

  const book = books.find((b) => b.id === id);
  if (!book) return null;

  return <BookDetailsModal book={book} onClose={() => router.back()} />;
}
