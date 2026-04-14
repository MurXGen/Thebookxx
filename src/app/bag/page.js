"use client";

import BookCard from "@/components/BookCard";
import AddressModal from "@/components/UI/AddressModal";
import BillModal from "@/components/UI/BillModal";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import SlideConfirm from "@/components/UI/SlideConfirm";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import { CART_OFFERS, getExtraDeliveryCharge } from "@/utils/cartOffers";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BagPage() {
  const { cart } = useStore();
  const router = useRouter();
  const [siteOrigin, setSiteOrigin] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

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

  // Calculate extra delivery charge
  const extraDeliveryCharge = getExtraDeliveryCharge(totalDiscounted);
  const totalWithDelivery = finalPayable + extraDeliveryCharge;

  const generateViewBagLink = () => {
    if (!siteOrigin) return "";

    const items = cart.map((item) => `${item.id}:${item.qty}`).join(",");

    return `${siteOrigin}/view-bag?items=${encodeURIComponent(items)}`;
  };

  const formatBookList = () => {
    return cartBooks
      .map((book, index) => {
        return `${index + 1}. ${book.name} × ${book.qty} = ₹${book.discountedPrice * book.qty}`;
      })
      .join("\n");
  };

  const handleWhatsAppCheckout = (addressData, paymentType = null) => {
    const phoneNumber = "917710892108";
    const viewBagLink = generateViewBagLink();
    const payment = paymentType || paymentMethod || "Not specified";

    const bookList = formatBookList();

    const message = `
*📚 NEW ORDER - THEBOOKX*

*👤 MY DETAILS*
━━━━━━━━━━━━━━━━━━━━
Name: ${addressData.name || "Customer"}
Phone: ${addressData.phone || "Not provided"}

*📍 DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━━
${addressData.address}
Area/Locality: ${addressData.area || "Not specified"}
City: ${addressData.city}
District: ${addressData.district}
State: ${addressData.state}
Pincode: ${addressData.pincode}

*🚚 DELIVERY OPTIONS*
━━━━━━━━━━━━━━━━━━━━
Quick Delivery: ${addressData.quickDelivery ? "✅ Yes (30-60 mins)" : "❌ No"}
Extra Delivery Charge: ₹${addressData.extraCharge || extraDeliveryCharge || 0}

*💰 PAYMENT DETAILS*
━━━━━━━━━━━━━━━━━━━━
Payment Method: ${payment === "COD" ? "💵 Cash on Delivery" : payment === "UPI" ? "📱 UPI Payment" : payment}
${payment === "COD" ? "Advance Payment: 50% of total" : "Payment Status: To be verified"}

*💵 PRICE BREAKDOWN*
━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${totalDiscounted}
Offer Discount: -₹${offerDiscount}
Delivery Charge: +₹${addressData.extraCharge || extraDeliveryCharge || 0}
━━━━━━━━━━━━━━━━━━━━
*TOTAL PAYABLE: ₹${finalPayable + (addressData.extraCharge || extraDeliveryCharge || 0)}*

${offerDiscount > 0 ? `✨ Offer Applied: ${offerLabel}` : ""}
${extraDeliveryCharge > 0 ? `⚠️ Extra delivery charge of ₹100 applied (order below ₹400)` : ""}

🔗 *VIEW FULL BAG*
${viewBagLink}

━━━━━━━━━━━━━━━━━━━━
_I want to confirm my order! 📚✨_
`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    setShowAddressModal(false);
    setShowBill(false);
  };

  const handleCODCheckout = (addressData) => {
    setPaymentMethod("COD");
    handleWhatsAppCheckout(addressData, "COD");
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

      {/* FIXED BOTTOM BAR */}
      <div className="fixed-bill-bar">
        <div className="bill-left">
          <span className="font-12 dark-50">Total payable</span>
          <div className="flex gap-8 items-center">
            <span className="font-16 weight-600 discounted">
              ₹{totalWithDelivery}
            </span>
            {offerDiscount > 0 && (
              <span className="strike dark-50 original">
                ₹{totalDiscounted} |
              </span>
            )}
            {/* {extraDeliveryCharge > 0 && (
              <span className="font-10 red">
                +₹{extraDeliveryCharge} delivery
              </span>
            )} */}

            {appliedOffer && (
              <span className="font-14 green weight-600">{offerLabel}</span>
            )}
          </div>

          <span className="view-bill-text" onClick={() => setShowBill(true)}>
            View bill
          </span>
        </div>

        <SlideConfirm
          disabled={!canCheckout}
          onComplete={() => setShowAddressModal(true)}
          resetTrigger={showAddressModal}
        />
      </div>

      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        finalPayable={finalPayable}
        totalDiscounted={totalDiscounted}
        extraDeliveryCharge={extraDeliveryCharge}
        totalWithDelivery={totalWithDelivery}
        handleWhatsAppCheckout={handleWhatsAppCheckout}
        handleCODCheckout={handleCODCheckout}
      />

      <BillModal
        open={showBill}
        onClose={() => setShowBill(false)}
        totalOriginal={totalOriginal}
        totalDiscounted={totalDiscounted}
        offerDiscount={offerDiscount}
        offerLabel={offerLabel}
        extraDeliveryCharge={extraDeliveryCharge}
        totalWithDelivery={totalWithDelivery}
        cartBooks={cartBooks}
      />
    </section>
  );
}
