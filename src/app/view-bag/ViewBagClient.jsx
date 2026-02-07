"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { books } from "@/utils/book";
import { ArrowLeft, Check } from "lucide-react";
import { CART_OFFERS } from "@/utils/cartOffers";
import Image from "next/image";

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

  const totalOriginal = cartBooks.reduce(
    (sum, b) => sum + b.originalPrice * b.qty,
    0,
  );

  const getAppliedOffer = (amount) => {
    return [...CART_OFFERS].reverse().find((o) => amount >= o.target) || null;
  };

  const appliedOffer = getAppliedOffer(totalDiscounted);

  let offerDiscount = 0;
  let offerLabel = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscount = appliedOffer.value;
      offerLabel = `₹${appliedOffer.value} OFF`;
    }

    if (appliedOffer.type === "percentage") {
      offerDiscount = Math.round((totalDiscounted * appliedOffer.value) / 100);
      offerLabel = "Free delivery 🚚";
    }
  }

  const finalPayable = totalDiscounted - offerDiscount;
  const totalSaved = totalOriginal - finalPayable;

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
        {cartBooks.map((book) => {
          const savings =
            book.originalPrice * book.qty - book.discountedPrice * book.qty;

          return (
            <article
              key={book.id}
              className="trending-card"
              itemScope
              itemType="https://schema.org/Product"
            >
              {/* Image */}
              <div className="book-image-wrapper">
                {book.image ? (
                  <Image
                    src={book.image}
                    alt={`${book.name} book cover`}
                    width={150}
                    height={200}
                    className="book-image loaded"
                    style={{ objectFit: "cover" }}
                    itemProp="image"
                  />
                ) : (
                  <div className="book-image-placeholder">📘</div>
                )}
              </div>

              {/* Content */}
              <div className="pad_16 flex flex-col gap-12 book-card">
                <h3 className="font-14 weight-500 dark-50" itemProp="name">
                  {book.name}
                </h3>

                <p className="font-12 dark-50">Qty: {book.qty}</p>

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
                        ₹{book.discountedPrice * book.qty}
                      </span>

                      <span className="original">
                        ₹{book.originalPrice * book.qty}
                      </span>
                    </div>

                    <meta itemProp="priceCurrency" content="INR" />

                    {savings > 0 && (
                      <span className="green font-10">You save ₹{savings}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="viewbag-bill flex flex-col gap-8">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{totalOriginal}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>- ₹{totalOriginal - totalDiscounted}</span>
        </div>

        {appliedOffer && (
          <div className="flex justify-between green">
            <span>Offer Applied</span>
            <span>{offerLabel}</span>
          </div>
        )}

        <hr />

        <div className="flex justify-between weight-600 font-16">
          <span>Total Payable</span>
          <span>₹{finalPayable}</span>
        </div>
      </div>

      <a
        href={`https://wa.me/917710892108?text=${encodeURIComponent(
          `Hi 👋 Here is your order total bill amount.\nTotal: ₹${finalPayable}`,
        )}`}
        target="_blank"
        className="pri-big-btn"
      >
        Continue on WhatsApp
      </a>
    </section>
  );
}
