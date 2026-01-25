"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { books } from "@/utils/book";
import { ArrowLeft } from "lucide-react";

export default function ViewBagPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const itemsParam = searchParams.get("items");

  // ❌ No items → invalid link
  if (!itemsParam) {
    return (
      <div className="section-1200 flex flex-col gap-12 items-center">
        <h2>Invalid or expired bag link</h2>
        <button onClick={() => router.push("/")} className="pri-big-btn">
          Browse Books
        </button>
      </div>
    );
  }

  // 🔒 Parse strictly
  const cartBooks = itemsParam
    .split(",")
    .map((entry) => {
      const [id, qty] = entry.split(":");
      const book = books.find((b) => b.id === id);
      if (!book || !qty) return null;

      return {
        ...book,
        qty: Math.max(1, Number(qty)),
      };
    })
    .filter(Boolean);

  if (!cartBooks.length) {
    return (
      <div className="section-1200">
        <h2>No valid books found</h2>
      </div>
    );
  }

  const totalOriginal = cartBooks.reduce(
    (sum, b) => sum + b.originalPrice * b.qty,
    0,
  );

  const totalDiscounted = cartBooks.reduce(
    (sum, b) => sum + b.discountedPrice * b.qty,
    0,
  );

  return (
    <section className="section-1200 flex flex-col gap-24">
      {/* Header */}
      <div className="flex gap-12 items-center">
        <ArrowLeft
          size={20}
          onClick={() => router.push("/")}
          className="cursor-pointer"
        />
        <h2 className="font-16 weight-600">Shared Bag</h2>
      </div>

      {/* Books */}
      <div className="grid-2">
        {cartBooks.map((book) => (
          <div key={book.id} className="trending-card">
            <div className="pad_16 flex flex-col gap-8">
              <h3 className="font-14 weight-500">{book.name}</h3>

              <div className="flex justify-between">
                <span>Qty</span>
                <span>{book.qty}</span>
              </div>

              <div className="flex justify-between">
                <span>Price</span>
                <span>₹{book.discountedPrice}</span>
              </div>

              <div className="flex justify-between weight-600">
                <span>Total</span>
                <span>₹{book.discountedPrice * book.qty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bag-summary ticket">
        <div className="summary-row">
          <span>Total MRP</span>
          <span>₹{totalOriginal}</span>
        </div>

        <div className="summary-row discount-row">
          <span>Discount</span>
          <span className="green">− ₹{totalOriginal - totalDiscounted}</span>
        </div>

        <div className="summary-row total">
          <span>You Pay</span>
          <span>₹{totalDiscounted}</span>
        </div>

        <a
          href={`https://wa.me/917710892108?text=${encodeURIComponent(
            `Hi 👋 I want to order these books.\nTotal: ₹${totalDiscounted}\n\n${window.location.href}`,
          )}`}
          target="_blank"
          className="pri-big-btn width100 margin-tp-16px"
        >
          Continue on WhatsApp
        </a>
      </div>
    </section>
  );
}
