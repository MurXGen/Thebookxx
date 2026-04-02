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
import { useEffect } from "react";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BookDetailsModal({ book }) {
  const { cart, addToCart, toggleWishlist, wishlist } = useStore();
  const inWishlist = wishlist.includes(book.id);
  const router = useRouter();

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
    // Analytics tracking
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
      {/* JSON-LD Schema */}
      <Script
        id={`book-schema-${book.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: book.name,
            description: book.description,
            image: book.image,
            author: {
              "@type": "Person",
              name: book.author || "Various Authors",
            },
            bookFormat: "https://schema.org/Paperback",
            numberOfPages: book.pages || 180,
            inLanguage: book.language || "English",
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: book.discountedPrice,
              availability:
                book.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "TheBookX",
              },
            },
          }),
        }}
      />

      <div className="book-detail-section">
        <div className="section-1200 flex flex-col gap-24">
          {/* Header */}
          <div className="flex flex-row gap-12 items-center">
            <ArrowLeft
              size={20}
              onClick={() => router.back()}
              className="cursor-pointer hover:opacity-70"
              aria-label="Go back"
            />
            <div className="flex flex-col">
              <h1 className="font-20 weight-600">{book.name}</h1>
              {book.author && (
                <p className="font-12 dark-50">By {book.author}</p>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <div className="relative w-64 h-80 md:w-80 md:h-96">
              <Image
                src={book.image}
                alt={`${book.name} book cover`}
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="book-detail-body">
            <div className="flex flex-col gap-12">
              <div>
                <h2 className="font-24 weight-600">{book.name}</h2>
                <p className="font-14 dark-50 mt-8 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="flex flex-row flex-wrap gap-24 mt-16 pt-16 border-t border-gray-200">
                {book.author && (
                  <div className="flex flex-col">
                    <span className="font-10 uppercase text-gray-500">
                      Author
                    </span>
                    <span className="font-14 weight-500">{book.author}</span>
                  </div>
                )}
                {book.pages && (
                  <div className="flex flex-col">
                    <span className="font-10 uppercase text-gray-500">
                      Pages
                    </span>
                    <span className="font-14">{book.pages}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-10 uppercase text-gray-500">
                    Format
                  </span>
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
            </div>

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

            {/* Special Offer */}
            {book.discountedPrice === 1 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-12 mt-16">
                <span className="red font-14 weight-600">
                  🔥 Limited Time Offer!
                </span>
                <p className="font-12 mt-4">
                  Get this book for just ₹1. Free shipping across India.
                </p>
              </div>
            )}

            <div className="dashed-border my-20"></div>

            {/* Trust Badges */}
            <div className="flex flex-row flex-wrap gap-24 justify-between py-16">
              <div className="flex flex-row items-center gap-8">
                <Truck size={18} className="green" />
                <span className="font-12">Free Shipping</span>
              </div>
              <div className="flex flex-row items-center gap-8">
                <ShieldCheck size={18} className="green" />
                <span className="font-12">Secure Delivery</span>
              </div>
              <div className="flex flex-row items-center gap-8">
                <RotateCcw size={18} className="green" />
                <span className="font-12">7-Day Returns</span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-row flex-wrap gap-12 tags mt-16">
              {book.catalogue?.map((tag) => (
                <span key={tag} className="sec-mid-btn text-capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="book-detail-cta flex flex-row gap-16 flex-wrap">
            <LoadingButton
              className="flex flex-row items-center gap-12 justify-center sec-mid-btn"
              onClick={handleWishlist}
              icon={<Heart size={20} fill={inWishlist ? "red" : "none"} />}
            >
              {inWishlist ? "Saved" : "Save"}
            </LoadingButton>

            <LoadingButton
              className="flex-1 pri-big-btn flex flex-row items-center gap-12 justify-center"
              onClick={handleAddToCart}
              disabled={(isOneRupee && hasOneRupeeInCart) || book.stock === 0}
              icon={<ShoppingCart size={20} />}
            >
              {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </LoadingButton>

            <LoadingButton
              className="sec-mid-btn flex flex-row items-center gap-12 justify-center"
              onClick={handleReview}
              icon={<MessageSquare size={20} />}
            >
              Review
            </LoadingButton>
          </div>
        </div>
      </div>
    </>
  );
}
