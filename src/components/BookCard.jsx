"use client";

import { useStore } from "@/context/StoreContext";
import { trackAddToCart } from "@/lib/ga";
import { books } from "@/utils/book";
import { Book, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import CartConfetti from "./UI/Confetti";
import LoadingButton from "./UI/LoadingButton";
import WishlistButton from "./UI/WishListButton";

const getFullUrl = (path) => {
  if (!path) return "";

  // If already absolute, return as is
  if (path.startsWith("http")) return path;

  return `https://thebookx.in${path}`;
};

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

  const bookUrl = `/books/${book.id}`;

  return (
    <>
      <Script
        id={`product-schema-${book.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",

            name: book.name || "",
            description: `${book.description || "Buy this book at TheBookX"} TheBookX delivers premium quality books in pristine condition, securely shipped across India via Delhivery and Indian Post. Shop with confidence at India's most trusted online bookstore.`,

            image: book.image ? [getFullUrl(book.image)] : [],

            author: {
              "@type": "Person",
              name: book.author || "Various Authors",
              url: book.author ? "https://thebookx.in/authors" : undefined,
            },

            bookFormat:
              book.size === "Paperback"
                ? "https://schema.org/Paperback"
                : "https://schema.org/Hardcover",

            numberOfPages:
              book.pages ||
              (typeof book.pages === "string" && book.pages.includes("-")
                ? Math.floor(
                    (parseInt(book.pages.split("-")[0]) +
                      parseInt(book.pages.split("-")[1])) /
                      2,
                  )
                : 180),

            inLanguage: book.language || "English",

            // isbn: book.isbn || undefined,

            // publisher: {
            //   "@type": "Organization",
            //   name: "TheBookX",
            //   url: "https://thebookx.in",
            //   logo: "https://thebookx.in/logo.png",
            // },

            brand: {
              "@type": "Brand",
              name: "TheBookX",
              description: "India's Most Trusted Online Bookstore",
            },

            offers: {
              "@type": "Offer",
              url: `https://thebookx.in/book/${book.id}`,
              priceCurrency: "INR",
              price: Number(book.discountedPrice) || 0,
              priceValidUntil: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              )
                .toISOString()
                .split("T")[0],

              availability:
                book.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",

              itemCondition: "https://schema.org/NewCondition",

              seller: {
                "@type": "Organization",
                name: "TheBookX",
                url: "https://thebookx.in",
              },

              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: 0,
                  currency: "INR",
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "IN",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 2,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 3,
                    maxValue: 7,
                    unitCode: "DAY",
                  },
                },
              },

              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "IN",
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 7,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
                returnPolicyUrl: "https://thebookx.in/returns",
              },
            },

            aggregateRating: book.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: book.rating || 4.5,
                  reviewCount: book.reviewCount || 1250,
                  bestRating: 5,
                  worstRating: 1,
                }
              : undefined,

            review: book.featuredReview
              ? {
                  "@type": "Review",
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: book.featuredReview.rating || 5,
                    bestRating: 5,
                  },
                  author: {
                    "@type": "Person",
                    name: book.featuredReview.author || "Verified Buyer",
                  },
                  reviewBody:
                    book.featuredReview.content ||
                    "Amazing quality! TheBookX delivered my book in perfect condition. Highly recommend this trusted bookstore.",
                }
              : undefined,

            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://thebookx.in/book/${book.id}`,
            },

            potentialAction: {
              "@type": "BuyAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `https://thebookx.in/book/${book.id}`,
                actionPlatform: [
                  "http://schema.org/DesktopWebPlatform",
                  "http://schema.org/MobileWebPlatform",
                ],
              },
            },
          }),
        }}
      />
      <Script
        id={`breadcrumb-${book.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: {
                  "@id": "https://thebookx.in",
                  name: "Home",
                },
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Books",
                item: {
                  "@id": "https://thebookx.in/books",
                  name: "Books",
                },
              },
              {
                "@type": "ListItem",
                position: 3,
                name: book.name,
                item: {
                  "@id": `https://thebookx.in/book/${book.id}`,
                  name: book.name,
                },
              },
            ],
          }),
        }}
      />

      <article
        className="trending-card"
        style={{ position: "relative" }}
        itemScope
        itemType="https://schema.org/Book"
      >
        <CartConfetti trigger={confetti} />
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
        <div className=" flex flex-col gap-12 book-card margin-tp-24px">
          <h3 className="font-16 weight-500" itemProp="name">
            <Link href={bookUrl} className="book-title-link">
              {book.name}
            </Link>
            <meta
              itemProp="description"
              content={book.description || "Buy this book at TheBookX"}
            />
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
                <span className="original">₹{book.originalPrice}</span>
              </div>

              <meta itemProp="priceCurrency" content="INR" />

              {savings > 0 && (
                <span className="green font-10">You save ₹{savings}</span>
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

            {/* Actions */}
            <div className="flex gap-12 align-center card-button ">
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

                  <span className="qty">{qty}</span>

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
        </div>
      </article>
    </>
  );
}
