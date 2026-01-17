"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { CART_OFFERS } from "@/utils/cartOffers";
import { Gift, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartBar() {
  const { cart } = useStore();
  const router = useRouter();

  if (!cart.length) return null;

  // ✅ map cart items with qty
  const cartBooks = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.id);
      if (!book) return null;

      return {
        ...book,
        qty: item.qty,
        totalPrice: book.discountedPrice * item.qty,
      };
    })
    .filter(Boolean);

  const totalAmount = cartBooks.reduce((sum, book) => sum + book.totalPrice, 0);

  const activeOffer = CART_OFFERS.find(
    (offer) => totalAmount >= offer.min && totalAmount < offer.target
  );

  if (!activeOffer) return null;

  const remaining = Math.max(activeOffer.target - totalAmount, 0);

  const progressPercent = Math.min(
    (totalAmount / activeOffer.target) * 100,
    100
  );

  return (
    <div className="cart-bar">
      {/* 🎁 OFFER STRIP */}
      <div className="cart-offer">
        <div className="offer-text">
          {activeOffer.icon === "gift" ? (
            <Gift size={16} />
          ) : (
            <Sparkles size={16} />
          )}
          <span>
            {activeOffer.message.replace("{remaining}", `₹${remaining}`)}
          </span>
        </div>

        <div className="offer-progress">
          <div
            className="offer-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 🛒 CART CTA */}
      <div className="cart-bar-main">
        <span className="font-14">
          {cart.reduce((s, i) => s + i.qty, 0)} book(s) added
        </span>

        <button className="pri-big-btn" onClick={() => router.push("/bag")}>
          Checkout
        </button>
      </div>
    </div>
  );
}
