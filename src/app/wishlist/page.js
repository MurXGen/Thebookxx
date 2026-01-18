"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import BookCard from "@/components/BookCard";
import { ArrowLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function WishlistPage() {
  const searchParams = useSearchParams();
  const sharedItems = searchParams.get("items");

  const { wishlist, cart } = useStore();
  const router = useRouter();

  const wishlistBooks = books.filter((b) => wishlist.includes(b.id));

  const sharedBooks = sharedItems
    ? sharedItems
        .split(",")
        .map((item) => {
          const [id, qty] = item.split(":");
          const book = books.find((b) => b.id === id);
          return book ? { ...book, qty: Number(qty) || 1 } : null;
        })
        .filter(Boolean)
    : [];

  const displayBooks = sharedItems ? sharedBooks : wishlistBooks;

  const handleShare = async () => {
    if (!wishlistBooks.length) return;

    // Build map of cart qty
    const qtyMap = cart.reduce((acc, item) => {
      acc[item.id] = item.qty;
      return acc;
    }, {});

    const itemsParam = wishlistBooks
      .map((b) => `${b.id}:${qtyMap[b.id] || 1}`)
      .join(",");

    const shareUrl = `${window.location.origin}/wishlist?items=${itemsParam}`;

    const shareText =
      "📚 Check out these amazing books I’ve shortlisted!\nYou might love them too 💛";

    // Native share (mobile)
    if (navigator.share) {
      await navigator.share({
        title: "My Book Wishlist",
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback (desktop)
      await navigator.clipboard.writeText(shareUrl);
      alert("🔗 Wishlist link copied!");
    }
  };

  return (
    <section className="section-1200 flex flex-col gap-24">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-12 items-center">
          <ArrowLeft
            size={20}
            onClick={() => router.push("/")}
            className="cursor-pointer"
          />
          <div className="flex flex-col">
            <h2 className="font-16 weight-600">Your Wishlist</h2>
            <span className="font-12 dark-50">Books that you like</span>
          </div>
        </div>

        {/* Share Button */}
        {wishlistBooks.length > 0 && (
          <button
            onClick={handleShare}
            aria-label="Share wishlist"
            className="icon-btn"
            style={{ background: "none", border: "none" }}
          >
            <Share2 size={18} color="#000" />
          </button>
        )}
      </div>

      {/* Books */}
      <div className="grid-2 flex flex-col gap-24">
        {wishlistBooks.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      {/* {displayBooks.map((b) => (
        <BookCard key={b.id} book={b} />
      ))} */}
    </section>
  );
}
