"use client";

import { useStore } from "@/context/StoreContext";
import { trackAddToCart } from "@/lib/ga";
import { books } from "@/utils/book";
import { Book, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CartConfetti from "./UI/Confetti";
import LoadingButton from "./UI/LoadingButton";
import WishlistButton from "./UI/WishListButton";

// Helper function to get full URL
const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://thebookx.in${path}`;
};

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BookCard({ book }) {
  const [confetti, setConfetti] = useState(false);
  const { cart, wishlist, addToCart, decreaseQty, toggleWishlist } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = cart.find((i) => i.id === book.id);
  const qty = cartItem?.qty || 0;
  const inWishlist = wishlist.includes(book.id);
  const savings = book.originalPrice - book.discountedPrice;

  const isOneRupee = book.discountedPrice === 1;

  const hasOneRupeeInCart = cart.some((i) => {
    const b = books.find((x) => x.id === i.id);
    return b?.discountedPrice === 1;
  });

  const bookUrl = `/books/${slugify(book.name)}`;
  const fullUrl = `https://thebookx.in${bookUrl}`;

  return (
    <article
      className="trending-card"
      style={{ position: "relative" }}
      itemScope
      itemType="https://schema.org/Book"
    >
      <CartConfetti trigger={confetti} />

      {/* Limited Time Offer Badge */}
      {book.discountedPrice === 1 && book.stock > 0 && (
        <span className="flex flex-row justify-center font-10">
          🔥 Price Drop - Limited time
        </span>
      )}

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
          <div
            className="book-image-placeholder"
            aria-label="Book cover placeholder"
          >
            <Book size={18} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-12 book-card margin-tp-24px">
        <h3 className="font-16 weight-500" itemProp="name">
          <Link href={bookUrl} className="book-title-link" itemProp="url">
            {book.name}
          </Link>

          {/* Author Display */}
          {book.author && (
            <div
              className="font-10 dark-50 mt-4"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span>By </span>
              <span itemProp="name">{book.author}</span>
            </div>
          )}

          <meta itemProp="description" content={book.description} />
          {book.author && <meta itemProp="author" content={book.author} />}
          {book.pages && (
            <meta itemProp="numberOfPages" content={book.pages.toString()} />
          )}
          {book.language && (
            <meta itemProp="inLanguage" content={book.language} />
          )}
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
              <span className="discounted">
                ₹<span itemProp="price">{book.discountedPrice}</span>
              </span>
              <meta itemProp="priceCurrency" content="INR" />
              {book.originalPrice > book.discountedPrice && (
                <span className="original">₹{book.originalPrice}</span>
              )}
            </div>

            <meta
              itemProp="availability"
              content={
                book.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock"
              }
            />
            <meta
              itemProp="itemCondition"
              content="https://schema.org/NewCondition"
            />
            <meta
              itemProp="priceValidUntil"
              content={
                new Date(new Date().setMonth(new Date().getMonth() + 1))
                  .toISOString()
                  .split("T")[0]
              }
            />

            {savings > 0 && (
              <span className="green font-10">You save ₹{savings}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-12 align-center card-button">
            {qty === 0 ? (
              <LoadingButton
                className="sec-mid-btn width100"
                onClick={() => {
                  addToCart(book.id);
                  trackAddToCart({ book, qty: 1 });
                  setConfetti(true);
                  setTimeout(() => setConfetti(false), 50);
                }}
                disabled={isOneRupee && hasOneRupeeInCart}
                aria-label={`Add ${book.name} to cart`}
              >
                <span>Add</span>
              </LoadingButton>
            ) : (
              <div className="width100 gap-12 items-center flex flex-row justify-between">
                <button
                  onClick={() => decreaseQty(book.id)}
                  className="minus-cart"
                  aria-label={`Decrease quantity of ${book.name}`}
                >
                  <Minus size={14} />
                </button>

                <span className="qty" aria-label={`Quantity: ${qty}`}>
                  {qty}
                </span>

                <button
                  onClick={() => {
                    addToCart(book.id);
                    trackAddToCart({ book, qty: 1 });
                  }}
                  disabled={isOneRupee && hasOneRupeeInCart}
                  className="plus-cart"
                  aria-label={`Increase quantity of ${book.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stock Status Display */}
        {book.stock && book.stock < 10 && book.stock > 0 && (
          <div className="font-10 orange">
            ⚡ Only {book.stock} left — order soon!
          </div>
        )}

        {book.stock === 0 && <div className="font-10 red">❌ Out of Stock</div>}
      </div>
    </article>
  );
}
