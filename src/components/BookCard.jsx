"use client";

import Image from "next/image";
import { Book, Plus, Minus } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import WishlistButton from "./UI/WishListButton";
import { useState } from "react";

export default function BookCard({ book }) {
  const { cart, wishlist, addToCart, decreaseQty, toggleWishlist } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = cart.find((i) => i.id === book.id);
  const qty = cartItem?.qty || 0;
  const inWishlist = wishlist.includes(book.id);
  const savings = book.originalPrice - book.discountedPrice;

  return (
    <div className="trending-card">
      {/* Image */}
      <div className="book-image-wrapper">
        <WishlistButton
          inWishlist={inWishlist}
          onClick={() => toggleWishlist(book.id)}
        />

        {/* 🔹 Skeleton / blur placeholder */}
        {!imageLoaded && <div className="image-skeleton" />}

        {book.image ? (
          <Image
            src={book.image}
            alt={book.name}
            fill
            sizes="(max-width: 768px) 100vw, 240px"
            className={`book-image ${imageLoaded ? "loaded" : ""}`}
            onLoadingComplete={() => setImageLoaded(true)}
            priority={false}
          />
        ) : (
          <div className="book-image-placeholder">
            <Book size={18} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pad_16 flex flex-col gap-12 book-card">
        <h3 className="font-14 weight-500 dark-50">{book.name}</h3>

        <div className="flex flex-row gap-24 justify-between">
          <div className="flex flex-col width100">
            <div className="price-row">
              <span className="discounted">₹{book.discountedPrice}</span>
              <span className="original">₹{book.originalPrice}</span>
            </div>

            {savings > 0 && (
              <span className="green font-10">You save ₹{savings}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-12 align-center card-button width100">
            {qty === 0 ? (
              <button
                className="pri-mid-btn width100"
                onClick={() => addToCart(book.id)}
              >
                Add
              </button>
            ) : (
              <div className="width100 items-center flex flex-row justify-between">
                <button
                  onClick={() => decreaseQty(book.id)}
                  className="pri-mid-btn"
                >
                  <Minus size={14} />
                </button>
                <span className="qty">{qty}</span>
                <button
                  onClick={() => addToCart(book.id)}
                  className="pri-mid-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
