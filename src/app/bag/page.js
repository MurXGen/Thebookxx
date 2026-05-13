"use client";

import BookCard from "@/components/BookCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import RecommendationModal from "@/components/RecommendationModal";
import AddressModal from "@/components/UI/AddressModal";
import BillModal from "@/components/UI/BillModal";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import HorizontalScroll from "@/components/UI/HorizontalScroll";
import SlideConfirm from "@/components/UI/SlideConfirm";
import YouMayLike from "@/components/UI/YouMayLike";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import {
  CART_OFFERS,
  getDeliveryCharge,
  getDeliveryLabel,
  getDeliveryDescription,
  getOriginalCharge,
} from "@/utils/cartOffers";
import { ArrowLeft, Gift } from "lucide-react";
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
  const [giftWrap, setGiftWrap] = useState(false);
  const GIFT_WRAP_CHARGE = 50;

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

  // In BagPage.jsx, replace the delivery charge calculation section

  const finalPayable = totalDiscounted - offerDiscount;
  const canCheckout = totalDiscounted >= 151;

  // Get dynamic delivery charges
  const standardDeliveryCharge = getDeliveryCharge(totalDiscounted, false);
  const fasterDeliveryCharge = getDeliveryCharge(totalDiscounted, true);
  const standardDeliveryLabel = getDeliveryLabel(totalDiscounted, false);
  const fasterDeliveryLabel = getDeliveryLabel(totalDiscounted, true);
  const standardDeliveryDesc = getDeliveryDescription(totalDiscounted, false);
  const fasterDeliveryDesc = getDeliveryDescription(totalDiscounted, true);
  const standardOriginalCharge = getOriginalCharge(totalDiscounted, false);
  const fasterOriginalCharge = getOriginalCharge(totalDiscounted, true);

  // Function to get delivery charge based on choice
  const getDeliveryChargeByChoice = (isFasterDelivery) => {
    return getDeliveryCharge(totalDiscounted, isFasterDelivery);
  };

  // Calculate total with standard delivery (for display)
  const totalWithStandardDelivery = finalPayable + standardDeliveryCharge;
  const totalWithStandardDeliveryGift =
    totalWithStandardDelivery + (giftWrap ? GIFT_WRAP_CHARGE : 0);

  // Calculate savings on delivery (if original charge exists)
  const standardDeliverySavings = standardOriginalCharge
    ? standardOriginalCharge - standardDeliveryCharge
    : 0;
  const fasterDeliverySavings = fasterOriginalCharge
    ? fasterOriginalCharge - fasterDeliveryCharge
    : 0;

  const displayTotal = totalWithStandardDeliveryGift;

  const isDesktop = () => {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(
        userAgent,
      );
    return !isMobile;
  };

  const generateWhatsAppMessage = (
    addressData,
    paymentType,
    fasterDeliveryChoice,
    giftWrapSelected,
    shortLink,
  ) => {
    const deliveryCharge = getDeliveryChargeByChoice(fasterDeliveryChoice);
    const deliveryLabel = getDeliveryLabel(
      totalDiscounted,
      fasterDeliveryChoice,
    );
    const giftWrapAmount = giftWrapSelected ? GIFT_WRAP_CHARGE : 0;
    const totalWithDelivery = finalPayable + deliveryCharge + giftWrapAmount;

    let deliveryInfo = `${addressData.city || "Not specified"} - ${addressData.pincode || "Not specified"}`;
    if (fasterDeliveryChoice) {
      deliveryInfo += ` 🚀 (${deliveryLabel} +₹${deliveryCharge})`;
    } else if (deliveryCharge > 0) {
      deliveryInfo += ` 📦 (${deliveryLabel} +₹${deliveryCharge})`;
    } else {
      deliveryInfo += ` 📦 (Free Delivery)`;
    }

    if (giftWrapSelected) {
      deliveryInfo += ` 🎁 (Gift Wrap +₹${GIFT_WRAP_CHARGE})`;
    }

    return `
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
  };

  const sendOrderToTelegram = async (
    addressData,
    paymentType,
    fasterDeliveryChoice,
    giftWrapSelected,
    shortLink,
  ) => {
    const deliveryCharge = getDeliveryChargeByChoice(fasterDeliveryChoice);
    const deliveryLabel = getDeliveryLabel(
      totalDiscounted,
      fasterDeliveryChoice,
    );
    const giftWrapAmount = giftWrapSelected ? GIFT_WRAP_CHARGE : 0;
    const totalWithDelivery = finalPayable + deliveryCharge + giftWrapAmount;

    const orderMessage = `
🛍️ *NEW ORDER - THEBOOKX*

━━━━━━━━━━━━━━━━━━━━
*👤 CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━
👨 *Name:* ${addressData.name || "Customer"}
📞 *Phone:* ${addressData.phone || "Not provided"}

━━━━━━━━━━━━━━━━━━━━
*📍 DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━━
🏠 *Address:* ${addressData.address || "Not provided"}
🏙️ *City:* ${addressData.city || "Not specified"}
🗺️ *District:* ${addressData.district || "Not specified"}
📍 *State:* ${addressData.state || "Not specified"}
📮 *Pincode:* ${addressData.pincode || "Not specified"}

━━━━━━━━━━━━━━━━━━━━
*📦 ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━━
${cartBooks
  .map(
    (book, idx) =>
      `${idx + 1}. *${book.name}* × ${book.qty} = ₹${book.discountedPrice * book.qty}`,
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━
*💰 BILL DETAILS*
━━━━━━━━━━━━━━━━━━━━
📚 Subtotal: ₹${totalDiscounted}
🎁 Offer Discount: -₹${offerDiscount}
🚚 Delivery: ${deliveryLabel}
📦 Delivery Charge: +₹${deliveryCharge}
${giftWrapSelected ? `🎁 Gift Wrap: +₹${GIFT_WRAP_CHARGE}` : ""}
━━━━━━━━━━━━━━━━━━━━
*💵 TOTAL PAYABLE: ₹${totalWithDelivery}*

━━━━━━━━━━━━━━━━━━━━
*💳 PAYMENT METHOD*
━━━━━━━━━━━━━━━━━━━━
${paymentType === "COD" ? "💵 Cash on Delivery" : "📱 UPI Payment"}

🔗 *Order Link:* ${shortLink}

━━━━━━━━━━━━━━━━━━━━
_Thank you for shopping with TheBookX! 📚✨_
    `;

    try {
      await fetch("https://api.journalx.app/api/bookxTelegram/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderDetails: orderMessage,
          customerName: addressData.name,
          customerPhone: addressData.phone,
          totalAmount: totalWithDelivery,
          paymentMethod: paymentType,
        }),
      });
    } catch (error) {
      console.error("Error sending order to Telegram:", error);
    }
  };

  const generateViewBagLinkWithDetails = (
    addressData,
    paymentType,
    fasterDeliveryChoice,
    giftWrapSelected,
  ) => {
    if (!siteOrigin) return "";

    const items = cart.map((item) => `${item.id}:${item.qty}`).join(",");
    const orderId = `ORD${Date.now()}`;

    const deliveryCharge = getDeliveryChargeByChoice(fasterDeliveryChoice);
    const giftWrapAmount = giftWrapSelected ? GIFT_WRAP_CHARGE : 0;
    const totalWithDelivery = finalPayable + deliveryCharge + giftWrapAmount;

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
      deliveryLabel: getDeliveryLabel(totalDiscounted, fasterDeliveryChoice),
      giftWrap: giftWrapSelected,
      giftWrapCharge: giftWrapAmount,
      orderDate: new Date().toISOString(),
      totalAmount: totalWithDelivery,
    };

    const encodedDetails = encodeURIComponent(JSON.stringify(orderDetails));

    return `${siteOrigin}/view-bag?items=${encodeURIComponent(items)}&order=${encodedDetails}`;
  };

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

  const redirectToWhatsApp = (
    addressData,
    paymentType,
    fasterDeliveryChoice,
    giftWrapSelected,
    shortLink,
  ) => {
    const phoneNumber = "917710892108";
    const message = generateWhatsAppMessage(
      addressData,
      paymentType,
      fasterDeliveryChoice,
      giftWrapSelected,
      shortLink,
    );

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleCODCheckout = async (
    addressData,
    fasterDeliveryChoice,
    giftWrapSelected,
  ) => {
    setPaymentMethod("COD");

    const viewBagLinkWithDetails = generateViewBagLinkWithDetails(
      addressData,
      "COD",
      fasterDeliveryChoice,
      giftWrapSelected,
    );

    setIsShortening(true);
    const shortLink = await shortenUrl(viewBagLinkWithDetails);
    setIsShortening(false);

    if (isDesktop()) {
      sendOrderToTelegram(
        addressData,
        "COD",
        fasterDeliveryChoice,
        giftWrapSelected,
        shortLink,
      );
    }

    redirectToWhatsApp(
      addressData,
      "COD",
      fasterDeliveryChoice,
      giftWrapSelected,
      shortLink,
    );

    setShowAddressModal(false);
    setShowBill(false);
  };

  const handleUPICheckout = async (
    addressData,
    fasterDeliveryChoice,
    giftWrapSelected,
  ) => {
    setPaymentMethod("UPI");

    const viewBagLinkWithDetails = generateViewBagLinkWithDetails(
      addressData,
      "UPI",
      fasterDeliveryChoice,
      giftWrapSelected,
    );

    setIsShortening(true);
    const shortLink = await shortenUrl(viewBagLinkWithDetails);
    setIsShortening(false);

    if (isDesktop()) {
      sendOrderToTelegram(
        addressData,
        "UPI",
        fasterDeliveryChoice,
        giftWrapSelected,
        shortLink,
      );
    }

    redirectToWhatsApp(
      addressData,
      "UPI",
      fasterDeliveryChoice,
      giftWrapSelected,
      shortLink,
    );

    setShowAddressModal(false);
    setShowBill(false);
  };

  return (
    <section className="section-1200 flex flex-col gap-24">
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

      <div className="grid-2">
        {cartBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className={`gift-wrap-section ${giftWrap ? "selected" : ""}`}>
        <label className="gift-wrap-label">
          <input
            type="checkbox"
            checked={giftWrap}
            onChange={(e) => setGiftWrap(e.target.checked)}
            className="gift-wrap-checkbox"
          />
          <div className="gift-wrap-checkbox-custom">
            <svg
              className={`checkbox-icon ${giftWrap ? "checked" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="gift-wrap-content">
            <div className="gift-wrap-text">
              <span className="gift-wrap-title">Gift Wrap this order</span>
              <span className="gift-wrap-desc">
                Beautifully wrapped with a personalized message
              </span>
            </div>
            <div className="gift-wrap-price">
              <span className="gift-wrap-amount">+ ₹{GIFT_WRAP_CHARGE}</span>
            </div>
          </div>
        </label>
      </div>

      <div
        className="fixed-bill-bar"
        style={{ maxWidth: "980px", margin: "0 auto" }}
      >
        <div className="bill-left">
          <span className="font-12 dark-50">Total payable</span>
          <div className="flex gap-8 items-center">
            <span className="font-16 weight-600 discounted">
              ₹{totalWithStandardDeliveryGift}
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
        standardDeliveryLabel={standardDeliveryLabel}
        fasterDeliveryCharge={fasterDeliveryCharge}
        fasterDeliveryLabel={fasterDeliveryLabel}
        totalWithStandardDelivery={totalWithStandardDelivery}
        giftWrapCharge={GIFT_WRAP_CHARGE}
        giftWrapSelected={giftWrap}
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
        standardDeliveryLabel={standardDeliveryLabel}
        fasterDeliveryCharge={fasterDeliveryCharge}
        fasterDeliveryLabel={fasterDeliveryLabel}
        totalWithStandardDelivery={totalWithStandardDelivery}
        cartBooks={cartBooks}
        isFasterDelivery={false}
        giftWrapCharge={giftWrap ? GIFT_WRAP_CHARGE : 0}
        giftWrapSelected={giftWrap}
      />
    </section>
  );
}
