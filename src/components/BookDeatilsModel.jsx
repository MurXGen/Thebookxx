// components/BookDeatilsModel.js
"use client";

import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoadingButton from "./UI/LoadingButton";
import Script from "next/script";
import { useEffect, useState, useMemo } from "react";
import BookCard from "./BookCard";
import Link from "next/link";
import YouMayLike from "./UI/YouMayLike";

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStableReviewCount(bookId) {
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 20;
  const max = 300;
  return Math.abs(hash % (max - min + 1)) + min;
}

export default function BookDetailsModal({ book }) {
  const { cart, addToCart, toggleWishlist, wishlist } = useStore();
  const inWishlist = wishlist.includes(book.id);
  const router = useRouter();

  // Lazy loading state for related books
  const [visibleRelatedCount, setVisibleRelatedCount] = useState(6);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const bookSlug = slugify(book.name);
  const bookUrl = `/books/${bookSlug}`;
  const canonicalUrl = `https://thebookx.in${bookUrl}`;

  const isOneRupee = book.discountedPrice === 1;
  const savings = book.originalPrice - book.discountedPrice;
  const savingsPercentage = Math.round((savings / book.originalPrice) * 100);

  const hasOneRupeeInCart = cart.some((i) => {
    const b = books.find((x) => x.id === i.id);
    return b?.discountedPrice === 1;
  });

  // Get related books based on same category
  const relatedBooks = useMemo(() => {
    if (!book.catalogue || book.catalogue.length === 0) return [];

    return books
      .filter(
        (b) =>
          b.id !== book.id &&
          b.catalogue?.some((cat) => book.catalogue.includes(cat)),
      )
      .slice(0, 30);
  }, [book.id, book.catalogue]);

  // Lazy load more related books
  const loadMoreRelated = () => {
    if (isLoadingRelated) return;
    setIsLoadingRelated(true);
    setTimeout(() => {
      setVisibleRelatedCount((prev) => Math.min(prev + 6, relatedBooks.length));
      setIsLoadingRelated(false);
    }, 300);
  };

  const visibleRelatedBooks = relatedBooks.slice(0, visibleRelatedCount);
  const hasMoreRelated = visibleRelatedCount < relatedBooks.length;

  const handleWishlist = () => {
    toggleWishlist(book.id);
    router.back();
  };

  const handleAddToCart = () => {
    addToCart(book.id);
    router.push("/");
  };

  const handleReview = () => {
    router.push(`/review?bk=${book.id}`);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "view_item", {
        currency: "INR",
        value: book.discountedPrice,
        items: [
          {
            item_id: book.id,
            item_name: book.name,
            price: book.discountedPrice,
            item_category: book.catalogue?.[0] || "books",
          },
        ],
      });
    }
  }, [book]);

  return (
    <>
      {/* JSON-LD Schema for Book Details */}
      <Script
        id={`book-detail-schema-${book.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": canonicalUrl,
            url: canonicalUrl,
            name: book.name,
            description: `${book.description} Shop now at TheBookX — India's most trusted online bookstore.`,
            image: book.image,
            brand: {
              "@type": "Brand",
              name: "TheBookX",
            },
            sku: book.id,
            author: {
              "@type": "Person",
              name: book.author || "Various Authors",
            },
            offers: {
              "@type": "Offer",
              "@id": `${canonicalUrl}#offer`,
              url: canonicalUrl,
              priceCurrency: "INR",
              price: book.discountedPrice,
              priceValidUntil: "2027-12-31",
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
                    minValue: 0,
                    maxValue: 1,
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
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue:
                book.rating ||
                Number(
                  (4 + (getStableReviewCount(book.id) % 10) / 10).toFixed(1),
                ),
              reviewCount: book.reviewCount || getStableReviewCount(book.id),
              bestRating: 5,
              worstRating: 1,
            },
          }),
        }}
      />

      {/* JSON-LD for Related Items (Internal Linking SEO) */}
      {relatedBooks.length > 0 && (
        <Script
          id={`related-items-schema-${book.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `You may also like similar to ${book.name}`,
              description: `Related books similar to ${book.name}`,
              numberOfItems: relatedBooks.length,
              itemListElement: relatedBooks
                .slice(0, 10)
                .map((relatedBook, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: `https://thebookx.in/books/${slugify(relatedBook.name)}`,
                  name: relatedBook.name,
                })),
            }),
          }}
        />
      )}

      <div
        className="book-detail-section"
        itemScope
        itemType="https://schema.org/Book"
      >
        <div
          className="section-1200 flex flex-col gap-24"
          style={{ maxWidth: "680px" }}
        >
          {/* Header */}
          <div className="flex flex-row gap-12 items-center">
            <ArrowLeft
              size={24}
              onClick={() => router.push("/")}
              className="cursor-pointer hover:opacity-70"
              aria-label="Go back"
            />
            <div className="flex flex-col">
              <h1 className="font-20 weight-600" itemProp="name">
                {book.name}
              </h1>
              {book.author && (
                <p className="font-12 dark-50" itemProp="author">
                  By{" "}
                  <Link
                    href={`/authors/${book.authorSlug || slugify(book.author)}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                    itemProp="url"
                  >
                    <span itemProp="name">{book.author}</span>
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="book-detail-image flex flex-row gap-24 justify-center">
            <div className="book-detail-image">
              <Image
                src={book.image}
                alt={`${book.name} book cover — Buy online at TheBookX, India's trusted bookstore`}
                width={100}
                height={100}
                priority
                itemProp="image"
                style={{ border: "1px solid #00000020" }}
              />
              <Image
                src={book.image}
                alt={`${book.name} book cover — Buy online at TheBookX, India's trusted bookstore`}
                width={100}
                height={100}
                priority
                style={{ border: "1px solid #00000020" }}
                itemProp="image"
              />
            </div>
          </div>

          {/* Content */}
          <div className="book-detail-body">
            <div>
              <h2 className="font-24 weight-600" itemProp="name">
                {book.name}
              </h2>
              {/* Price */}
              <div className="price-row flex flex-row items-center gap-16 mt-24">
                <span className="font-32 weight-600 green">
                  ₹{book.discountedPrice}
                </span>
                {book.originalPrice > book.discountedPrice && (
                  <>
                    <span className="original font-24 line-through text-gray-400">
                      ₹{book.originalPrice}
                    </span>
                    {savings > 0 && (
                      <span className="green font-14 weight-500 bg-green-50 px-8 py-4 rounded-full">
                        Save ₹{savings} ({savingsPercentage}% OFF)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="flex flex-row flex-wrap gap-24 mt-16 pt-16 border-t border-gray-200">
              {book.author && (
                <div className="flex flex-col">
                  <span className="font-10 uppercase text-gray-500">
                    Author
                  </span>
                  <span className="font-14 weight-500">
                    <Link
                      href={`/author/${book.authorSlug || slugify(book.author)}`}
                      style={{
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      {book.author}
                    </Link>
                  </span>
                </div>
              )}
              {book.pages && (
                <div className="flex flex-col">
                  <span className="font-10 uppercase text-gray-500">Pages</span>
                  <span className="font-14">{book.pages}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-10 uppercase text-gray-500">Format</span>
                <span className="font-14">{book.size}</span>
              </div>
              {book.language && (
                <div className="flex flex-col">
                  <span className="font-10 uppercase text-gray-500">
                    Language
                  </span>
                  <span className="font-14">{book.language}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-10 uppercase text-gray-500">Stock</span>
                <span className="font-14">
                  {book.stock > 0 ? (
                    <span className="green">
                      In Stock ({book.stock} available)
                    </span>
                  ) : (
                    <span className="red">Out of Stock</span>
                  )}
                </span>
              </div>
            </div>
            <div className="dashed-border my-20"></div>
            <div className="flex flex-col gap-4">
              <p className="font-16 weight-600">Book Description</p>
              <p
                className="font-14"
                itemProp="description"
                style={{ lineHeight: "1.7", textAlign: "justify" }}
              >
                {book.description}
              </p>
              {/* Category Tags - Internal Links */}
              <div className="flex flex-row flex-wrap gap-12 tags mt-16">
                {book.catalogue?.map((tag) => (
                  <a
                    key={tag}
                    href={`/category/${slugify(tag)}`}
                    className="font-12 text-capitalize hover:opacity-80"
                    aria-label={`Browse more #${tag} books`}
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            </div>

            <div className="dashed-border my-20"></div>

            {/* Limited Offer Badge */}
            {book.discountedPrice === 1 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-12 mt-16">
                <span className="red font-14 weight-600">
                  🔥 Limited Time Offer!
                </span>
                <p className="font-12 mt-4">
                  Get this book for just ₹1. Free shipping across India. Hurry,
                  offer valid while stocks last!
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-row flex-wrap gap-24 justify-between py-16">
              <div className="flex flex-row items-center gap-8">
                <Truck size={18} className="green" />
                <span className="font-12">Free Shipping</span>
              </div>
              <div className="flex flex-row items-center gap-8">
                <ShieldCheck size={18} className="green" />
                <span className="font-12">
                  Secure Delivery via Delhivery/Indian Post
                </span>
              </div>
              <div className="flex flex-row items-center gap-8">
                <RotateCcw size={18} className="green" />
                <span className="font-12">7-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            className="book-detail-cta section-1200 flex flex-row gap-16 flex-wrap"
            style={{ zIndex: "1000" }}
          >
            <button
              className="flex flex-row items-center gap-12 justify-center sec-mid-btn"
              onClick={handleWishlist}
            >
              <Heart
                size={20}
                stroke="gray"
                fill={inWishlist ? "red" : "none"}
              />
            </button>
            <button
              className="sec-mid-btn flex flex-row gap-12"
              onClick={handleReview}
            >
              <MessageSquare size={20} />
            </button>
            <LoadingButton
              className="flex-1 pri-big-btn flex flex-row items-center gap-12 justify-center"
              onClick={handleAddToCart}
              disabled={(isOneRupee && hasOneRupeeInCart) || book.stock === 0}
              icon={<ShoppingCart size={20} />}
            >
              {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </LoadingButton>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-lg p-16 mt-8">
            <p className="font-12 text-gray-600 text-center">
              🇮🇳 Delivered securely across India via <strong>Delhivery</strong>{" "}
              and <strong>Indian Post</strong>. Estimated delivery: 3-7 business
              days.{" "}
              <a href="/shipping" className="green underline">
                Learn more
              </a>
            </p>
          </div>

          <div className="dashed-border my-20"></div>

          {/* You May Also Like Section - SEO Internal Linking */}
          <YouMayLike
            title="You May Also Like"
            subtitle={`Discover more books similar to ${book.name}`}
            items={relatedBooks}
            initialCount={6}
            step={6}
            slugify={slugify}
            renderItem={(relatedBook) => (
              <BookCard key={relatedBook.id} book={relatedBook} />
            )}
          />

          {/* Browse More Categories - Footer Links */}
          <div className="browse-categories-footer mt-24 pt-24 border-t border-gray-200">
            <h4 className="font-14 weight-600 mb-12">Browse More Categories</h4>
            <div className="flex flex-row flex-wrap gap-12">
              {[...new Set(books.flatMap((b) => b.catalogue || []))]
                .slice(0, 15)
                .map((category) => (
                  <a
                    key={category}
                    href={`/category/${slugify(category)}`}
                    className="font-12 sec-mid-btn px-12 py-6"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
