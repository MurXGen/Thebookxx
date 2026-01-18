"use client";

import { Plus, Minus } from "lucide-react";
import WishlistButton from "@/components/UI/WishListButton";
import { useStore } from "@/context/StoreContext";

export default function BookActions({ book }) {
  const { cart, wishlist, addToCart, decreaseQty, toggleWishlist } = useStore();

  const cartItem = cart.find((i) => i.id === book.id);
  const qty = cartItem?.qty || 0;
  const inWishlist = wishlist.includes(book.id);

  return (
    <div className="book-actions">
      <WishlistButton
        inWishlist={inWishlist}
        onClick={() => toggleWishlist(book.id)}
      />

      {qty === 0 ? (
        <button
          className="pri-btn"
          onClick={() => addToCart(book.id)}
          aria-label={`Add ${book.name} to cart`}
        >
          Add to Cart
        </button>
      ) : (
        <div className="qty-controls">
          <button onClick={() => decreaseQty(book.id)}>
            <Minus size={14} />
          </button>
          <span>{qty}</span>
          <button onClick={() => addToCart(book.id)}>
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
