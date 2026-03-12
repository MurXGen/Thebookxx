"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import BookCard from "@/components/BookCard";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const router = useRouter();

  const wishlistBooks = books.filter((b) => wishlist.includes(b.id));

  if (!wishlistBooks.length) {
    return (
      <>
        <div className="section-1200 flex flex-row gap-12 items-center">
          <ArrowLeft
            size={20}
            onClick={() => router.push("/")}
            className="cursor-pointer"
          />

          <div className="flex flex-col">
            <h2 className="font-16 weight-600">Your Wishlist</h2>
            <span className="font-12 dark-50">
              {wishlistBooks.length} book
              {wishlistBooks.length > 1 ? "s" : ""} in wishlist
            </span>
          </div>
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
    <section className="section-1200 flex flex-col gap-24">
      <div className="flex flex-row gap-12 items-center">
        <ArrowLeft
          size={20}
          onClick={() => router.push("/")}
          className="cursor-pointer"
        />

        <div className="flex flex-col">
          <h2 className="font-16 weight-600">Your Wishlist</h2>
          <span className="font-12 dark-50">
            {wishlistBooks.length} book
            {wishlistBooks.length > 1 ? "s" : ""} in wishlist
          </span>
        </div>
      </div>

      <div className="grid-2 flex flex-col gap-24">
        {wishlistBooks.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
