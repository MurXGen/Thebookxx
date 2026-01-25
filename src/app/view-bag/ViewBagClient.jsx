"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { books } from "@/utils/book";
import { ArrowLeft } from "lucide-react";

export default function ViewBagClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const itemsParam = searchParams.get("items");

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

  const totalDiscounted = cartBooks.reduce(
    (sum, b) => sum + b.discountedPrice * b.qty,
    0,
  );

  return (
    <section className="section-1200 flex flex-col gap-24">
      <div className="flex gap-12 items-center">
        <ArrowLeft
          size={20}
          onClick={() => router.push("/")}
          className="cursor-pointer"
        />
        <h2 className="font-16 weight-600">Shared Bag</h2>
      </div>

      <div className="grid-2">
        {cartBooks.map((book) => (
          <div key={book.id} className="trending-card pad_16">
            <h3>{book.name}</h3>
            <p>Qty: {book.qty}</p>
            <p>₹{book.discountedPrice}</p>
          </div>
        ))}
      </div>

      <a
        href={`https://wa.me/917710892108?text=${encodeURIComponent(
          `Hi 👋 Here is your order total bill amount.\nTotal: ₹${totalDiscounted}`,
        )}`}
        target="_blank"
        className="pri-big-btn"
      >
        Continue on WhatsApp
      </a>
    </section>
  );
}
