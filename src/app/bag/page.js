"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import { ArrowLeft, BaggageClaimIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import BillModal from "@/components/UI/BillModal";
import { CART_OFFERS } from "@/utils/cartOffers";
import AddressModal from "@/components/UI/AddressModal";

export default function BagPage() {
  const { cart } = useStore();
  const router = useRouter();
  const [siteOrigin, setSiteOrigin] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const getAppliedOffer = (amount) => {
    return [...CART_OFFERS].reverse().find((o) => amount >= o.target) || null;
  };

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
      offerLabel = `Free delivery 🚚`;
    }
  }

  const finalPayable = totalDiscounted - offerDiscount;
  const canCheckout = totalDiscounted >= 151;

  const generateViewBagLink = () => {
    if (!siteOrigin) return "";

    const items = cart.map((item) => `${item.id}:${item.qty}`).join(",");

    return `${siteOrigin}/view-bag?items=${encodeURIComponent(items)}`;
  };

  const handleWhatsAppCheckout = (addressData) => {
    const phoneNumber = "917710892108";
    const viewBagLink = generateViewBagLink();

    const message = `
Hey 👋✨  

I’d like to order these books 📚  

💰 Total: ~₹${totalDiscounted}~ ₹${finalPayable + addressData.extraCharge}

📍 Address:
City: ${addressData.city}
Pincode: ${addressData.pincode}
Address: ${addressData.address}

🚀 Quick Delivery: ${addressData.quickDelivery ? "Yes" : "No"}
Extra Charge: ₹${addressData.extraCharge}

🔗 View Bag:
${viewBagLink}
`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <section
      className="section-1200 flex flex-col gap-24"
      style={{ maxWidth: "700px" }}
    >
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

      <CartOfferStrip discountedAmount={totalDiscounted} />

      {/* Book Cards */}
      <div className="grid-2">
        {cartBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Price Summary */}
      {/* FIXED BOTTOM BAR */}
      <div className="fixed-bill-bar">
        <div className="bill-left">
          <span className="font-12 dark-50">Total payable</span>
          <div className="flex gap-8 items-center">
            <span className="font-16 weight-600 discounted">
              ₹{finalPayable}
            </span>
            {offerDiscount > 0 && (
              <span className="strike dark-50 original">
                ₹{totalDiscounted}
              </span>
            )}{" "}
            {appliedOffer && (
              <span className="font-14 green weight-600">{offerLabel}</span>
            )}
          </div>

          <span className="view-bill-text" onClick={() => setShowBill(true)}>
            View bill
          </span>
        </div>

        <button
          className="pri-big-btn"
          disabled={!canCheckout}
          onClick={() => setShowAddressModal(true)}
        >
          Confirm Order
        </button>
      </div>

      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        finalPayable={finalPayable}
        totalDiscounted={totalDiscounted}
        handleWhatsAppCheckout={handleWhatsAppCheckout}
      />

      <BillModal
        open={showBill}
        onClose={() => setShowBill(false)}
        totalOriginal={totalOriginal}
        totalDiscounted={totalDiscounted}
        offerDiscount={offerDiscount}
        offerLabel={offerLabel}
      />
    </section>
  );
}
