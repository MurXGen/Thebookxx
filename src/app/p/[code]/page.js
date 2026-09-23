"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { registerCustomBook, buildCustomBook } from "@/utils/customBooks";

export default function CustomProductPage() {
  const params = useParams();
  const router = useRouter();
  const code = decodeURIComponent(params?.code || "");
  const { cart, addToCart } = useStore();

  const book = useMemo(() => buildCustomBook(code), [code]);
  const inCart = book ? cart.some((i) => i.id === book.id) : false;

  const add = (goToBag) => {
    if (!book) return;
    registerCustomBook(code); // ensure it resolves in the cart/checkout
    if (!inCart) addToCart(book.id);
    showToast(`Added to your bag 🎉 “${book.name}”`, "success");
    if (goToBag) router.push("/bag");
  };

  if (!book) {
    return (
      <main className="cp-page">
        <div className="cp-empty">
          <p>This product link looks invalid or expired.</p>
          <Link href="/" className="cp-empty-link">
            Go to TheBookX →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cp-page">
      <header className="cp-head">
        <button
          type="button"
          className="cp-back"
          onClick={() => router.push("/")}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="cp-head-title">TheBookX</span>
      </header>

      <div className="cp-card">
        <div className="cp-cover">
          {book.image ? (
            <Image
              src={book.image}
              alt={book.name}
              width={260}
              height={340}
              priority
            />
          ) : (
            <span className="cp-cover-ph">
              <ShoppingBag size={28} />
            </span>
          )}
        </div>
        <div className="cp-info">
          <h1 className="cp-name">{book.name}</h1>
          <div className="cp-price">₹{book.discountedPrice}</div>
          <div className="cp-perks">
            <span>
              <Truck size={13} /> Free & fast delivery
            </span>
            <span>
              <ShieldCheck size={13} /> Cash on delivery
            </span>
          </div>
        </div>
      </div>

      <div className="cp-actions">
        <button type="button" className="cp-add" onClick={() => add(false)}>
          {inCart ? (
            <>
              <Check size={17} /> In your bag
            </>
          ) : (
            <>
              <ShoppingBag size={17} /> Add to bag
            </>
          )}
        </button>
        <button type="button" className="cp-buy" onClick={() => add(true)}>
          Buy now
        </button>
      </div>

      <Link href="/" className="cp-browse">
        Browse more books on TheBookX →
      </Link>
    </main>
  );
}
