"use client";

import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { BookOpen, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Slugify (matches BookCard / PDP routing)
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Compact horizontal cart line item:
 * [cover] | title / category / price / qty-stepper
 * Used only on the Bag page (recommendations still use BookCard).
 */
export default function CartItemRow({ book }) {
  const { addToCart, decreaseQty, removeFromCart } = useStore();

  const qty = book.qty || 0;
  const isOneRupee = book.discountedPrice === 1;
  const category = book.catalogue?.[0] || "";
  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "";
  const categoryUrl = category ? `/category/${slugify(category)}` : "";
  const bookUrl = `/books/${slugify(book.name)}`;

  // Line totals (per-item subtotal reflects quantity)
  const lineNow = book.discountedPrice * qty;
  const lineWas = book.originalPrice * qty;
  const lineSave = lineWas - lineNow;

  const handlePlus = () => {
    // ₹1 books are limited to a single copy per cart.
    if (isOneRupee) {
      showToast("Maximum book allotted reached for Rs.1", "info");
      return;
    }
    addToCart(book.id);
  };

  const handleMinus = () => decreaseQty(book.id);
  const handleRemove = () => removeFromCart && removeFromCart(book.id);

  return (
    <div className="cart-row">
      <Link href={bookUrl} className="cart-row-cover" aria-label={book.name}>
        {book.image ? (
          <Image
            src={book.image}
            alt={book.name}
            fill
            className="cart-row-img"
            sizes="84px"
          />
        ) : (
          <BookOpen size={26} className="cart-row-ph" />
        )}
      </Link>

      <div className="cart-row-body">
        {/* LEFT: title, category, stepper */}
        <div className="cart-row-info">
          <Link href={bookUrl} className="cart-row-title">
            {book.name}
          </Link>

          {categoryLabel &&
            (categoryUrl ? (
              <Link href={categoryUrl} className="cart-row-cat">
                in {categoryLabel}
              </Link>
            ) : (
              <span className="cart-row-cat">in {categoryLabel}</span>
            ))}

          <div className="cart-stepper" role="group" aria-label="Quantity">
            <button
              type="button"
              className="cart-step-btn cart-step-minus"
              onClick={handleMinus}
              aria-label={`Decrease quantity of ${book.name}`}
            >
              <Minus size={16} />
            </button>
            <span className="cart-step-qty" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className="cart-step-btn cart-step-plus"
              onClick={handlePlus}
              aria-label={`Increase quantity of ${book.name}`}
              aria-disabled={isOneRupee}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT: line price (top, aligned with title) */}
        <div className="cart-row-aside">
          <div className="cart-row-aside-price">
            <span className="cart-row-aside-now">₹{lineNow}</span>
            {lineWas > lineNow && (
              <span className="cart-row-aside-was">₹{lineWas}</span>
            )}
            {lineSave > 0 && (
              <span className="cart-row-aside-save">Save ₹{lineSave}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
