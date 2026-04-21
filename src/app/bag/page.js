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
  const [isShortening, setIsShortening] = useState(false);

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
      offerLabel = `Free delivery`;
    }
  }

  const finalPayable = totalDiscounted - offerDiscount;
  const canCheckout = totalDiscounted >= 151;

  // Calculate standard delivery charge (0 if order >= 400, else 100)
  const standardDeliveryCharge = getExtraDeliveryCharge(totalDiscounted);

  // Faster delivery charge is fixed at ₹119
  const FASTER_DELIVERY_CHARGE = 119;

  // Function to get delivery charge based on choice
  const getDeliveryCharge = (isFasterDelivery) => {
    if (isFasterDelivery) {
      return FASTER_DELIVERY_CHARGE;
    }
    return standardDeliveryCharge;
  };

  // Calculate total with standard delivery (for display)
  const totalWithStandardDelivery = finalPayable + standardDeliveryCharge;

  // Generate view bag link with user details
  const generateViewBagLinkWithDetails = (
    addressData,
    paymentType,
    fasterDeliveryChoice,
  ) => {
    if (!siteOrigin) return "";

    const items = cart.map((item) => `${item.id}:${item.qty}`).join(",");
    const orderId = `ORD${Date.now()}`;

    // Calculate delivery charge based on user's choice (override, not add)
    const deliveryCharge = getDeliveryCharge(fasterDeliveryChoice);
    const totalWithDelivery = finalPayable + deliveryCharge;

    const orderDetails = {
      orderId: orderId,
      name: addressData.name || "",
      phone: addressData.phone || "",
      address: addressData.address || "",
      area: addressData.area || "",
      city: addressData.city || "",
      district: addressData.district || "",
      state: addressData.state || "",
      pincode: addressData.pincode || "",
      paymentMethod: paymentType,
      fasterDelivery: fasterDeliveryChoice,
      deliveryCharge: deliveryCharge,
      orderDate: new Date().toISOString(),
      totalAmount: totalWithDelivery,
    };

    const encodedDetails = encodeURIComponent(JSON.stringify(orderDetails));

    return `${siteOrigin}/view-bag?items=${encodeURIComponent(items)}&order=${encodedDetails}`;
  };

  // Shorten URL using TinyURL API
  const shortenUrl = async (longUrl) => {
    try {
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`,
      );
      const shortUrl = await response.text();
      return shortUrl;
    } catch (error) {
      console.error("Error shortening URL:", error);
      return longUrl;
    }
  };

  const sendWhatsAppMessage = async (
    addressData,
    paymentType,
    fasterDeliveryChoice,
  ) => {
    const phoneNumber = "917710892108";

    // Calculate delivery charge based on user's choice
    const deliveryCharge = getDeliveryCharge(fasterDeliveryChoice);
    const totalWithDelivery = finalPayable + deliveryCharge;

    // Generate link with user details
    const viewBagLinkWithDetails = generateViewBagLinkWithDetails(
      addressData,
      paymentType,
      fasterDeliveryChoice,
    );

    // Shorten the URL
    setIsShortening(true);
    const shortLink = await shortenUrl(viewBagLinkWithDetails);
    setIsShortening(false);

    // Create delivery info string
    let deliveryInfo = `${addressData.city || "Not specified"} - ${addressData.pincode || "Not specified"}`;
    if (fasterDeliveryChoice) {
      deliveryInfo += ` 🚀 (Faster Delivery +₹${FASTER_DELIVERY_CHARGE})`;
    } else if (deliveryCharge > 0) {
      deliveryInfo += ` 📦 (Standard Delivery +₹${deliveryCharge})`;
    } else {
      deliveryInfo += ` 📦 (Free Delivery)`;
    }

    // Short and clean WhatsApp message
    const message = `
*CONFIRM MY ORDER*

✨👋 Hey hi, I want to confirm my order! 👋✨

👤 *Name:* ${addressData.name || "Customer"}
📞 *Phone:* ${addressData.phone || "Not provided"}

📍 *Delivery:* ${deliveryInfo}

💰 *Total Amount:* ₹${totalWithDelivery}
💳 *Payment:* ${paymentType === "COD" ? "Cash on Delivery" : "UPI Payment"}

🔗 *View Full Order Details:*
${shortLink}

Thank you! 🙏
`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    setShowAddressModal(false);
    setShowBill(false);
  };

  const handleCODCheckout = (addressData, fasterDeliveryChoice) => {
    setPaymentMethod("COD");
    sendWhatsAppMessage(addressData, "COD", fasterDeliveryChoice);
  };

  const handleUPICheckout = (addressData, fasterDeliveryChoice) => {
    setPaymentMethod("UPI");
    sendWhatsAppMessage(addressData, "UPI", fasterDeliveryChoice);
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
              ₹{totalWithStandardDelivery}
            </span>
            {offerDiscount > 0 && (
              <span className="strike dark-50 original">
                ₹{totalDiscounted}
              </span>
            )}

            {appliedOffer && (
              <span className="font-14 green weight-600">{offerLabel}</span>
            )}
          </div>
          {/* {standardDeliveryCharge > 0 && (
            <span className="font-10 red">
              +₹{standardDeliveryCharge} delivery
            </span>
          )} */}

          <span className="view-bill-text" onClick={() => setShowBill(true)}>
            View bill
          </span>
        </div>

        <SlideConfirm
          disabled={!canCheckout || isShortening}
          onComplete={() => setShowAddressModal(true)}
          resetTrigger={showAddressModal}
        />
      </div>

      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        finalPayable={finalPayable}
        totalDiscounted={totalDiscounted}
        standardDeliveryCharge={standardDeliveryCharge}
        fasterDeliveryCharge={FASTER_DELIVERY_CHARGE}
        totalWithStandardDelivery={totalWithStandardDelivery}
        handleCODCheckout={handleCODCheckout}
        handleUPICheckout={handleUPICheckout}
      />

      <BillModal
        open={showBill}
        onClose={() => setShowBill(false)}
        totalOriginal={totalOriginal}
        totalDiscounted={totalDiscounted}
        offerDiscount={offerDiscount}
        offerLabel={offerLabel}
        standardDeliveryCharge={standardDeliveryCharge}
        fasterDeliveryCharge={FASTER_DELIVERY_CHARGE}
        totalWithStandardDelivery={totalWithStandardDelivery}
        cartBooks={cartBooks}
        isFasterDelivery={false} // Pass the actual faster delivery state from your address modal
      />
    </section>
  );
}
