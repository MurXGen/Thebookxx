"use client";

import { useStore } from "@/context/StoreContext";
import { trackBeginCheckout } from "@/lib/ga";
import { useRouter } from "next/navigation";
import { books } from "@/utils/book"; // or wherever your book list is

export default function CheckoutButton() {
  const router = useRouter();
  const { cart } = useStore();

  // Merge cart with full book data
  const cartItems = cart.map((cartItem) => {
    const book = books.find((b) => b.id === cartItem.id);
    return {
      ...book,
      qty: cartItem.qty,
    };
  });

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.qty,
    0,
  );

  return (
    <button
      className="pri-big-btn"
      onClick={() => {
        trackBeginCheckout(cartItems, totalAmount);
        setTimeout(() => router.push("/bag"), 150);
      }}
    >
      Checkout
    </button>
  );
}
