"use client";

import { useStore } from "@/context/StoreContext";
import { trackAddToCart } from "@/lib/ga";
import { books } from "@/utils/book";
import { Book, Minus, Plus, Share2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { flyToCart } from "@/lib/flyToCart";
import CartConfetti from "./UI/Confetti";
import LoadingButton from "./UI/LoadingButton";
import WishlistButton from "./UI/WishListButton";
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";
import { showToast } from "@/context/ToastContext";

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

const addToRecentlyViewed = (bookId) => {
  try {
    const recentlyViewed = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]",
    );

    const filtered = recentlyViewed.filter((id) => id !== bookId);
    const updated = [bookId, ...filtered];
    const trimmed = updated.slice(0, 10);

    localStorage.setItem("recentlyViewed", JSON.stringify(trimmed));

    window.dispatchEvent(
      new CustomEvent("bookViewed", {
        detail: { bookId },
      }),
    );
  } catch (error) {
    console.error("Error updating recently viewed:", error);
  }
};

export default function BookCard({ book }) {
  const [confetti, setConfetti] = useState(false);
  const { cart, wishlist, addToCart, decreaseQty, toggleWishlist, cartTotal } =
    useStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const cartItem = cart.find((i) => i.id === book.id);
  const qty = cartItem?.qty || 0;
  const inWishlist = wishlist.includes(book.id);
  const savings = book.originalPrice - book.discountedPrice;

  const isOneRupee = book.discountedPrice === 1;

  // Detect whether the cart already has any ₹1 book.
  // We still enforce a max of 1 ₹1 book per cart (allotment rule),
  // but no longer gate ₹1 books behind a cart-total unlock.
  const hasOneRupeeInCart = cart.some((i) => {
    const b = books.find((x) => x.id === i.id);
    return b?.discountedPrice === 1;
  });

  const isOneRupeeLimitReached = isOneRupee && hasOneRupeeInCart && qty === 0;

  const bookUrl = `/books/${slugify(book.name)}`;
  const fullUrl = `https://thebookx.in${bookUrl}`;

  // Track book view once per session
  useEffect(() => {
    if (!hasTrackedView && book) {
      setHasTrackedView(true);

      if (isOneRupee) {
        trackFunnelEvent(EVENTS.ONE_RUPEE_BOOK_VIEWED, {
          book_id: book.id,
          book_name: book.name,
          price: book.discountedPrice,
          cart_total: cartTotal,
        });
      } else {
        trackFunnelEvent(EVENTS.REGULAR_BOOK_VIEWED, {
          book_id: book.id,
          book_name: book.name,
          price: book.discountedPrice,
          category: book.catalogue?.[0] || "unknown",
          cart_total: cartTotal,
        });
      }
    }
  }, [book, isOneRupee, cartTotal, hasTrackedView]);

  const coverRef = useRef(null);

  const handleAddToCart = () => {
    // Allotment rule, only one ₹1 book per cart
    if (isOneRupeeLimitReached) {
      showToast("Maximum book limit reached for Rs.1", "info");
      return;
    }

    flyToCart(coverRef.current, { imageSrc: book.image });
    addToCart(book.id);
    trackAddToCart({ book, qty: 1 });

    if (isOneRupee) {
      trackFunnelEvent(EVENTS.ONE_RUPEE_BOOK_ADDED, {
        book_id: book.id,
        book_name: book.name,
        cart_total: cartTotal + book.discountedPrice,
      });
    } else {
      trackFunnelEvent(EVENTS.REGULAR_BOOK_ADDED, {
        book_id: book.id,
        book_name: book.name,
        price: book.discountedPrice,
        qty: 1,
        cart_total: cartTotal + book.discountedPrice,
      });
    }

    setConfetti(true);
    setTimeout(() => setConfetti(false), 50);
  };

  // Plus button, for ₹1 books, never allow quantity > 1
  const handleIncreaseQty = () => {
    if (isOneRupee) {
      showToast("Maximum book allotted reached for Rs.1", "info");
      return;
    }
    flyToCart(coverRef.current, { imageSrc: book.image });
    addToCart(book.id);
    trackAddToCart({ book, qty: 1 });
  };

  // Get category links for internal linking
  const primaryCategory = book.catalogue?.[0] || "";
  const categoryUrl = primaryCategory
    ? `/category/${slugify(primaryCategory)}`
    : "";

  const handleBookClick = () => {
    addToRecentlyViewed(book.id);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: book.name,
      text: `Check out "${book.name}"${book.author ? ` by ${book.author}` : ""} at TheBookX!`,
      url: fullUrl,
    };

    try {
      if (navigator.share && window.innerWidth <= 768) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(fullUrl);
        const tempMessage = document.createElement("div");
        tempMessage.textContent = "Link copied to clipboard!";
        tempMessage.style.position = "fixed";
        tempMessage.style.bottom = "20px";
        tempMessage.style.left = "50%";
        tempMessage.style.transform = "translateX(-50%)";
        tempMessage.style.backgroundColor = "#1a1a1a";
        tempMessage.style.color = "white";
        tempMessage.style.padding = "8px 16px";
        tempMessage.style.borderRadius = "40px";
        tempMessage.style.fontSize = "12px";
        tempMessage.style.zIndex = "9999";
        document.body.appendChild(tempMessage);
        setTimeout(() => {
          tempMessage.remove();
        }, 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      navigator.clipboard.writeText(fullUrl);
    }
  };

  return (
    <>
      <article className={`trending-card`} style={{ position: "relative" }}>
        <CartConfetti trigger={confetti} />

        {/* Limited Time Offer Badge */}
        {isOneRupee && book.stock > 0 && (
          <span className="flex flex-row justify-center font-10 price-drop-badge">
            🔥 Limited period - Just ₹1
          </span>
        )}

        {/* Image */}
        <div className="book-image-wrapper" ref={coverRef}>
          <WishlistButton
            inWishlist={inWishlist}
            onClick={() => toggleWishlist(book.id)}
          />

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="add-wishlist"
            aria-label={`Share ${book.name}`}
            title="Share this book"
            style={{
              top: "4px",
              background: "#00000010",
              border: "none",
              backdropFilter: "blur(12px)",
            }}
          >
            <Share2 size={14} color="black" />
          </button>

          {!imageLoaded && <div className="image-skeleton" />}

          {book.image ? (
            <Link
              href={bookUrl}
              onClick={handleBookClick}
              aria-label={`View details of ${book.name}`}
            >
              <Image
                src={book.image}
                alt={`${book.name}${book.author ? ` by ${book.author}` : ""} book cover, buy online at TheBookX`}
                width={160}
                height={240}
                className={`book-image ${imageLoaded ? "loaded" : ""}`}
                onLoadingComplete={() => setImageLoaded(true)}
                sizes="(max-width: 768px) 40vw, 160px"
                itemProp="image"
                loading="lazy"
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
            <Link
              href={bookUrl}
              onClick={handleBookClick}
              className="book-title-link"
              itemProp="url"
              aria-label={`Buy ${book.name}${book.author ? ` by ${book.author}` : ""} online at ₹${book.discountedPrice}${savings > 0 ? ` (save ₹${savings})` : ""} on TheBookX`}
              title={`${book.name}, buy online at lowest price ₹${book.discountedPrice}`}
            >
              {book.name}
            </Link>

            {/* Category Link - Internal Backlink for SEO */}
            {primaryCategory && (
              <div className="font-10 gray-500 mt-4">
                <span>in </span>
                <Link
                  href={categoryUrl}
                  className="category-link"
                  aria-label={`Browse more ${primaryCategory} books`}
                >
                  {primaryCategory.charAt(0).toUpperCase() +
                    primaryCategory.slice(1)}
                </Link>
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
            {book.catalogue && (
              <meta itemProp="genre" content={book.catalogue.join(", ")} />
            )}
          </h3>

          <div className="book-content">
            {/* Price */}
            <div
              className="flex flex-col width100"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <div className="price-row">
                <span
                  className={`discounted ${savings > 0 ? "price-ribbon-bg" : ""}`}
                  title={savings > 0 ? "Best price" : undefined}
                >
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
              <meta itemProp="seller" content="TheBookX" />

              <meta
                itemProp="hasMerchantReturnPolicy"
                content="7-day return policy"
              />
              <meta
                itemProp="shippingDetails"
                content="Free shipping across India"
              />

              {savings > 0 && (
                <span className="green font-10">Save ₹{savings}</span>
              )}
            </div>
          </div>

          {/* Add to cart — full width, dashed divider above, below the price */}
          <div className="bookcard-cart-row">
              {qty === 0 ? (
                <LoadingButton
                  className="bookcard-add-btn"
                  onClick={handleAddToCart}
                  aria-label={`Add ${book.name} to cart`}
                  aria-disabled={isOneRupeeLimitReached}
                >
                  <ShoppingCart size={17} />
                  <span>Add to Cart</span>
                </LoadingButton>
              ) : (
                <div className="bookcard-qty">
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
                    onClick={handleIncreaseQty}
                    className="plus-cart"
                    aria-label={`Increase quantity of ${book.name}`}
                    aria-disabled={isOneRupee}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
          </div>

          {/* Stock Status Display */}
          {book.stock && book.stock < 10 && book.stock > 0 && (
            <div className="font-10 orange">
              ⚡ Only {book.stock} left, order soon!
            </div>
          )}

          {book.stock === 0 && (
            <div className="font-10 red">❌ Out of Stock</div>
          )}
        </div>
      </article>
    </>
  );
}
