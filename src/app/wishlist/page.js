"use client";

import BookCard from "@/components/BookCard";
import PageHeader from "@/components/UI/PageHeader";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const router = useRouter();

  const wishlistBooks = books.filter((b) => wishlist.includes(b.id));

  if (!wishlistBooks.length) {
    return (
      <>
        <div className="section-680">
          <PageHeader
            title="Your Wishlist"
            subtitle={`${wishlistBooks.length} book${wishlistBooks.length === 1 ? "" : "s"} in wishlist`}
          />
        </div>

        <div
          className="flex flex-col gap-12 justify-center items-center"
          style={{ height: "90vh" }}
        >
          <span className="font-16">Save books you like to see them here</span>

          <button onClick={() => router.push("/")} className="pri-big-btn">
            Browse Books
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="section-680 flex flex-col gap-24">
      <PageHeader
        title="Your Wishlist"
        subtitle={`${wishlistBooks.length} book${wishlistBooks.length === 1 ? "" : "s"} in wishlist`}
      />

      <div className="grid-2 flex flex-col gap-24">
        {wishlistBooks.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
