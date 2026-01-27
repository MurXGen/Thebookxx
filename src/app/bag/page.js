"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import { ArrowLeft, BaggageClaimIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BagPage() {
  const { cart } = useStore();
  const router = useRouter();
  const [siteOrigin, setSiteOrigin] = useState("");

  const MIN_CHECKOUT_AMOUNT = 151;
  const isCheckoutDisabled = totalDiscounted < MIN_CHECKOUT_AMOUNT;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  const cartBooks = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.id);
      return book ? { ...book, qty: item.qty } : null;
    })
    .filter(Boolean);

  if (!cartBooks.length) {
    return (
      <>
        <div className=" section-1200 flex flec-row gap-12 items-center">
          <ArrowLeft
            size={20}
            onClick={() => router.push("/")}
            className="cursor-pointer"
          />
          <div className="flex flex-col">
            <h2 className="font-16 weight-600">Your Bag</h2>
            <span className="font-12 dark-50">
              {cartBooks.length} book{cartBooks.length > 1 ? "s" : ""} in cart
            </span>
          </div>
        </div>
        <div
          className="flex flex-col gap-12 justify-center items-center"
          style={{ height: "90vh" }}
        >
          <span className="font-16">Add books to cart to fill your bags</span>
          <button onClick={() => router.push("/")} className="pri-big-btn">
            Browse
          </button>
        </div>
      </>
    );
  }

  const totalOriginal = cartBooks.reduce(
    (sum, b) => sum + b.originalPrice * b.qty,
    0,
  );

  const totalDiscounted = cartBooks.reduce(
    (sum, b) => sum + b.discountedPrice * b.qty,
    0,
  );

  const generateViewBagLink = () => {
    if (!siteOrigin) return "";

    const items = cart.map((item) => `${item.id}:${item.qty}`).join(",");

    return `${siteOrigin}/view-bag?items=${encodeURIComponent(items)}`;
  };

  const handleWhatsAppCheckout = () => {
    if (!siteOrigin) return;

    const phoneNumber = "917710892108";

    const viewBagLink = generateViewBagLink();

    const message = `
Hey 👋✨  

I’d like to order these books 📚  

💰 Total: ₹${totalDiscounted}

🔗 View Bag:
${viewBagLink}
`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="section-1200 flex flex-col gap-24">
      {/* Header */}

      <div className="flex flec-row gap-12 items-center">
        <ArrowLeft size={20} onClick={() => router.push("/")} />
        <div className="flex flex-col">
          <h2 className="font-16 weight-600">Your Bag</h2>
          <span className="font-12 dark-50">
            {cartBooks.length} book{cartBooks.length > 1 ? "s" : ""} in cart
          </span>
        </div>
      </div>

      {/* Book Cards */}
      <div className="grid-2">
        {cartBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Price Summary */}
      <div className="bag-summary ticket">
        {/* <div className="ticket-cut top" />
        <div className="ticket-cut bottom" /> */}

        <div className="summary-row">
          <span>Total MRP</span>
          <span>₹{totalOriginal}</span>
        </div>

        <div className="summary-row discount-row">
          <span>Discount</span>
          <span className="green">− ₹{totalOriginal - totalDiscounted}</span>
        </div>

        <div className="summary-row total">
          <span>You Pay</span>
          <span>₹{totalDiscounted}</span>
        </div>

        <button
          className={`pri-big-btn width100 margin-tp-16px ${
            isCheckoutDisabled ? "disabled-btn" : ""
          }`}
          onClick={handleWhatsAppCheckout}
          disabled={isCheckoutDisabled}
        >
          {isCheckoutDisabled
            ? `Add ₹${MIN_CHECKOUT_AMOUNT - totalDiscounted} more to checkout`
            : "Proceed to Checkout"}
        </button>
      </div>
    </section>
  );
}
