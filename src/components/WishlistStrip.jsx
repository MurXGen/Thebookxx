"use client";

import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Compact, horizontally-scrollable strip of the shopper's wishlist books
 * (cover + short name + price + quick add). Renders nothing when the wishlist
 * is empty.
 */
export default function WishlistStrip() {
  const { wishlist, addToCart } = useStore();
  if (!wishlist || wishlist.length === 0) return null;

  const items = wishlist
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);
  if (!items.length) return null;

  return (
    <section className="wl-strip">
      <div className="wl-strip-head">
        <span className="wl-strip-title">
          <Heart size={16} fill="#ef4444" stroke="none" /> Your Wishlist
        </span>
        <span className="wl-strip-count">{items.length}</span>
      </div>
      <div className="wl-row">
        {items.map((b) => (
          <div className="wl-card" key={b.id}>
            <Link href={`/books/${slugify(b.name)}`} className="wl-card-img">
              {b.image && <img src={b.image} alt={b.name} loading="lazy" />}
            </Link>
            <div className="wl-card-info">
              <Link
                href={`/books/${slugify(b.name)}`}
                className="wl-card-name"
                title={b.name}
              >
                {b.name}
              </Link>
              <span className="wl-card-price">₹{b.discountedPrice}</span>
            </div>
            <button
              type="button"
              className="wl-card-add"
              onClick={() => addToCart(b.id)}
              aria-label={`Add ${b.name} to cart`}
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
