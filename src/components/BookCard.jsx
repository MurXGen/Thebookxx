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
            "@id": `https://thebookx.in/books/${book.id}#book`,

            name: book.name || "",
            description: `${book.description || "Buy this book at TheBookX"} TheBookX delivers premium quality books in pristine condition, securely shipped across India via Delhivery and Indian Post. Shop with confidence at India's most trusted online bookstore. Limited time offer — books starting at just ₹1!`,

            image: book.image ? [getFullUrl(book.image)] : [],

            author: {
              "@type": "Person",
              name: book.author || "Various Authors",
            },

            bookFormat:
              book.size === "Paperback"
                ? "https://schema.org/Paperback"
                : "https://schema.org/Hardcover",

            numberOfPages: book.pages
              ? typeof book.pages === "string" && book.pages.includes("-")
                ? Math.floor(
                    (parseInt(book.pages.split("-")[0]) +
                      parseInt(book.pages.split("-")[1])) /
                      2,
                  )
                : book.pages
              : 180,

            inLanguage: book.language || "English",

            genre:
              book.catalogue && book.catalogue.length > 0
                ? book.catalogue
                    .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1))
                    .join(", ")
                : "General Fiction",

            keywords: book.catalogue ? book.catalogue.join(", ") : "",

            publisher: {
              "@type": "Organization",
              name: "TheBookX",
              url: "https://thebookx.in",
              logo: "https://thebookx.in/favicon.ico",
              sameAs: ["https://www.instagram.com/thebookx.in"],
            },

            brand: {
              "@type": "Brand",
              name: "TheBookX",
              description: "India's Most Trusted Online Bookstore",
              logo: "https://thebookx.in/favicon.ico",
            },

            offers: {
              "@type": "Offer",
              "@id": `https://thebookx.in/books/${book.id}`,
              url: `https://thebookx.in/books/${book.id}`,
              priceCurrency: "INR",
              price: Number(book.discountedPrice) || 0,
              priceValidUntil: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              )
                .toISOString()
                .split("T")[0],

              availability:
                book.stock > 0 && book.discountedPrice > 0
                  ? "https://schema.org/InStock"
                  : book.discountedPrice === 1 && book.stock > 0
                    ? "https://schema.org/LimitedAvailability"
                    : "https://schema.org/OutOfStock",

              itemCondition: "https://schema.org/NewCondition",

              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: Number(book.discountedPrice),
                priceCurrency: "INR",
                ...(book.originalPrice > book.discountedPrice && {
                  priceType: "https://schema.org/SalePrice",
                }),
              },

              seller: {
                "@type": "Organization",
                name: "TheBookX",
                url: "https://thebookx.in",
                logo: "https://thebookx.in/favicon.ico",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+91-7977960242",
                  contactType: "customer service",
                  availableLanguage: ["English", "Hindi"],
                  areaServed: "IN",
                },
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
                returnPolicyUrl: "https://thebookx.in/refund",
              },

              availabilityStarts: new Date().toISOString(),
              availabilityEnds: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ).toISOString(),
            },

            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: book.rating || 4.5,
              reviewCount: book.reviewCount || 28,
              bestRating: 5,
              worstRating: 1,
              ratingExplanation:
                "Based on verified customer reviews on TheBookX",
            },

            review: book.featuredReview
              ? {
                  "@type": "Review",
                  "@id": `https://thebookx.in/books/${book.id}`,
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
                  datePublished:
                    book.featuredReview.date || new Date().toISOString(),
                }
              : {
                  "@type": "Review",
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: 5,
                    bestRating: 5,
                  },
                  author: {
                    "@type": "Person",
                    name: "Verified Buyer",
                  },
                  reviewBody:
                    "Excellent service! The book arrived in perfect condition. TheBookX is my go-to online bookstore now. Highly recommended!",
                },

            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://thebookx.in/books/${book.id}`,
            },

            potentialAction: {
              "@type": "BuyAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `https://thebookx.in/books/${book.id}`,
                actionPlatform: [
                  "http://schema.org/DesktopWebPlatform",
                  "http://schema.org/MobileWebPlatform",
                ],
              },
              price: Number(book.discountedPrice),
              priceCurrency: "INR",
            },

            sameAs: [
              `https://www.goodreads.com/search?q=${encodeURIComponent(book.name)}`,
            ],

            datePublished: book.publishedDate || "2024-01-01",
            copyrightYear: new Date().getFullYear(),
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
            "@id": `https://thebookx.in/books/${book.id}#breadcrumb`,
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
                  name: "All Books",
                },
              },
              ...(book.catalogue && book.catalogue.length > 0
                ? [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name:
                        book.catalogue[0].charAt(0).toUpperCase() +
                        book.catalogue[0].slice(1),
                      item: {
                        "@id": `https://thebookx.in/category/${book.catalogue[0]}`,
                        name:
                          book.catalogue[0].charAt(0).toUpperCase() +
                          book.catalogue[0].slice(1),
                      },
                    },
                    {
                      "@type": "ListItem",
                      position: 4,
                      name: book.name,
                      item: {
                        "@id": `https://thebookx.in/books/${book.id}`,
                        name: book.name,
                      },
                    },
                  ]
                : [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: book.name,
                      item: {
                        "@id": `https://thebookx.in/books/${book.id}`,
                        name: book.name,
                      },
                    },
                  ]),
            ],
          }),
        }}
      />

      <article
        className="trending-card"
        style={{ position: "relative" }}
        itemScope
        itemType="https://schema.org/Book"
        itemID={`https://thebookx.in/books/${book.id}`}
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
                alt={`${book.name} book cover — Buy online at TheBookX`}
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
            {/* Author Display (Optional - add to increase visibility) */}
            {book.author && (
              <div
                className="font-10 dark-50"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <span>By </span>
                <span itemProp="name">{book.author}</span>
              </div>
            )}
            <meta
              itemProp="description"
              content={`${book.description || "Buy this book at TheBookX"} Shop now with free shipping across India.`}
            />
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
              itemID={`https://thebookx.in/books/${book.id}#offer`}
            >
              <div className="price-row">
                <span className="discounted">
                  ₹
                  <span itemProp="price" content={book.discountedPrice}>
                    {book.discountedPrice}
                  </span>
                </span>
                <meta itemProp="priceCurrency" content="INR" />
                {book.originalPrice > book.discountedPrice && (
                  <span className="original">₹{book.originalPrice}</span>
                )}
              </div>

              <meta
                itemProp="availability"
                content={
                  book.stock > 0 && book.discountedPrice > 0
                    ? "https://schema.org/InStock"
                    : book.discountedPrice === 1 && book.stock > 0
                      ? "https://schema.org/LimitedAvailability"
                      : "https://schema.org/OutOfStock"
                }
              />

              <meta
                itemProp="itemCondition"
                content="https://schema.org/NewCondition"
              />

              <meta itemProp="seller" content="TheBookX" />

              <meta
                itemProp="priceValidUntil"
                content={
                  new Date(new Date().setMonth(new Date().getMonth() + 1))
                    .toISOString()
                    .split("T")[0]
                }
              />

              {savings > 0 && (
                <span className="green font-10">
                  You save ₹{savings}
                  <meta
                    itemProp="priceSpecification"
                    content={`Discount: ₹${savings}`}
                  />
                </span>
              )}

              {/* {book.discountedPrice === 1 && book.stock > 0 && (
                <span className="red font-10 font-weight-500">
                  🔥 Limited Time Offer! Books starting at ₹1
                  <meta itemProp="specialPrice" content="₹1 Limited Offer" />
                </span>
              )} */}
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

          {/* Stock Status Display (Optional - improves transparency) */}
          {/* {book.stock && book.stock < 10 && book.stock > 0 && (
            <div className="font-10 orange">
              ⚡ Only {book.stock} left in stock — order soon!
            </div>
          )}

          {book.stock === 0 && (
            <div className="font-10 red">
              ❌ Out of Stock — Check back soon!
            </div>
          )} */}
        </div>
      </article>
    </>
  );
}
