"use client";

import Image from "next/image";
import Link from "next/link";
import { Book, Plus, Minus } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import WishlistButton from "./UI/WishListButton";
import { useState } from "react";
import { trackAddToCart } from "@/lib/ga";

export default function BookCard({ book }) {
  const { cart, wishlist, addToCart, decreaseQty, toggleWishlist } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = cart.find((i) => i.id === book.id);
  const qty = cartItem?.qty || 0;
  const inWishlist = wishlist.includes(book.id);
  const savings = book.originalPrice - book.discountedPrice;

  const bookUrl = `#`; // 🔥 SEO-friendly internal link

  return (
    <article
      className="trending-card"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Image */}
      <div className="book-image-wrapper">
        <WishlistButton
          inWishlist={inWishlist}
          onClick={() => toggleWishlist(book.id)}
        />

        {!imageLoaded && <div className="image-skeleton" />}

        {book.image ? (
          <Link href={bookUrl} aria-label={`View details of ${book.name}`}>
            <Image
              src={book.image}
              alt={`${book.name} book cover`}
              fill
              sizes="(max-width: 768px) 100vw, 240px"
              className={`book-image ${imageLoaded ? "loaded" : ""}`}
              onLoadingComplete={() => setImageLoaded(true)}
              loading="lazy"
              itemProp="image"
            />
          </Link>
        ) : (
          <div className="book-image-placeholder">
            <Book size={18} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pad_16 flex flex-col gap-12 book-card">
        <h3 className="font-14 weight-500 dark-50" itemProp="name">
          <Link href={bookUrl} className="book-title-link">
            {book.name}
          </Link>
        </h3>

        <div className="flex flex-row gap-24 justify-between book-content">
          {/* Price */}
          <div
            className="flex flex-col width100"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <div className="price-row">
              <span className="discounted" itemProp="price">
                ₹{book.discountedPrice}
              </span>
              <span className="original">₹{book.originalPrice}</span>
            </div>

            <meta itemProp="priceCurrency" content="INR" />

            {savings > 0 && (
              <span className="green font-10">You save ₹{savings}</span>
            )}
          </div>

          {/* Actions */}
          <div
            className="flex gap-12 align-center card-button width100"
            style={{ height: "40px" }}
          >
            {qty === 0 ? (
              <button
                className="pri-mid-btn width100"
                onClick={() => {
                  addToCart(book.id);
                  trackAddToCart({ book, qty: 1 });
                }}
                aria-label={`Add ${book.name} to cart`}
              >
                Add
              </button>
            ) : (
              <div className="width100 items-center flex flex-row justify-between">
                <button
                  onClick={() => decreaseQty(book.id)}
                  className="minus-cart"
                  aria-label={`Decrease quantity of ${book.name}`}
                >
                  <Minus size={14} />
                </button>

                <span className="qty">{qty}</span>

                <button
                  onClick={() => {
                    addToCart(book.id);
                    trackAddToCart({ book, qty: 1 });
                  }}
                  className="plus-cart"
                  aria-label={`Increase quantity of ${book.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
