"use client";

import BookCard from "@/components/BookCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import RecommendationModal from "@/components/RecommendationModal";
import AddressModal from "@/components/UI/AddressModal";
import BillModal from "@/components/UI/BillModal";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import HorizontalScroll from "@/components/UI/HorizontalScroll";
import YouMayLike from "@/components/UI/YouMayLike";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { books } from "@/utils/book";
import {
  getCartOffers,
  getDeliveryCharge,
  getDeliveryLabel,
  getDeliveryDescription,
  getOriginalCharge,
  getMinCheckoutAmount,
} from "@/utils/cartOffers";
import { ArrowLeft, Gift, Sparkle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { permanentlyUnlockOffer, areOneRupeeBooksEnabled } from "@/utils/book";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { FcDocument } from "react-icons/fc";

export default function BagPage() {
  // ✅ ALL hooks go here - NO EXCEPTIONS
  const { cart } = useStore();
  const router = useRouter();
  const [siteOrigin, setSiteOrigin] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isShortening, setIsShortening] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const GIFT_WRAP_CHARGE = 15;

  // ✅ Move useEffect hooks here
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  // Calculate cartBooks BEFORE the conditional return
  const cartBooks = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.id);
      return book ? { ...book, qty: item.qty } : null;
    })
    .filter(Boolean);

  // ✅ Check if cart has any ₹1 book
  const hasOneRupeeItem = cartBooks.some((book) => book.discountedPrice === 1);

  // ✅ Get dynamic values based on ₹1 item presence
  const MIN_CHECKOUT_AMOUNT = 151;
  const cartOffers = getCartOffers(hasOneRupeeItem);

  // Calculate other values that depend on cartBooks
  const totalOriginal = cartBooks.reduce(
    (sum, b) => sum + b.originalPrice * b.qty,
    0,
  );

  const totalDiscounted = cartBooks.reduce(
    (sum, b) => sum + b.discountedPrice * b.qty,
    0,
  );

  // ✅ Define all helper functions BEFORE conditional return
  const getAppliedOffer = (amount) => {
    return [...cartOffers].reverse().find((o) => amount >= o.target) || null;
  };

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
  const canCheckout = totalDiscounted >= MIN_CHECKOUT_AMOUNT;
  const amountNeededToCheckout = Math.max(
    0,
    MIN_CHECKOUT_AMOUNT - totalDiscounted,
  );

  const standardDeliveryCharge = getDeliveryCharge(
    totalDiscounted,
    false,
    hasOneRupeeItem,
  );
  const fasterDeliveryCharge = getDeliveryCharge(
    totalDiscounted,
    true,
    hasOneRupeeItem,
  );
  const standardDeliveryLabel = getDeliveryLabel(
    totalDiscounted,
    false,
    hasOneRupeeItem,
  );
  const fasterDeliveryLabel = getDeliveryLabel(
    totalDiscounted,
    true,
    hasOneRupeeItem,
  );
  const standardDeliveryDesc = getDeliveryDescription(
    totalDiscounted,
    false,
    hasOneRupeeItem,
  );
  const fasterDeliveryDesc = getDeliveryDescription(
    totalDiscounted,
    true,
    hasOneRupeeItem,
  );
  const standardOriginalCharge = getOriginalCharge(totalDiscounted, false);
  const fasterOriginalCharge = getOriginalCharge(totalDiscounted, true);

  const getDeliveryChargeByChoice = (isFasterDelivery) => {
    return getDeliveryCharge(
      totalDiscounted,
      isFasterDelivery,
      hasOneRupeeItem,
    );
  };

  const totalWithStandardDelivery = finalPayable + standardDeliveryCharge;
  const totalWithStandardDeliveryGift =
    totalWithStandardDelivery + (giftWrap ? GIFT_WRAP_CHARGE : 0);
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
      hasOneRupeeItem,
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
      hasOneRupeeItem,
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
      deliveryLabel: getDeliveryLabel(
        totalDiscounted,
        fasterDeliveryChoice,
        hasOneRupeeItem,
      ),
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

  // ----- Confirm Order button handler -----
  const handleConfirmOrderClick = () => {
    if (isShortening) {
      showToast("Preparing your order, please wait…", "info");
      return;
    }
    if (!canCheckout) {
      showToast(
        `Add ₹${amountNeededToCheckout} more to checkout (minimum ₹${MIN_CHECKOUT_AMOUNT})`,
        "warning",
      );
      return;
    }
    setShowAddressModal(true);
  };

  const isCheckoutDisabled = !canCheckout || isShortening;

  // ✅ NOW the conditional return (after all hooks and functions)
  if (!cartBooks.length) {
    return (
      <>
        <div className="section-1200 flex flex-row gap-12 items-center justify-between">
          <div className="flex flex-row gap-12 items-center justify-between">
            <ArrowLeft size={20} onClick={() => router.push("/")} />
            <div className="flex flex-col">
              <h2 className="font-24 weight-600">Your Bag</h2>
              <span className="font-12 dark-50">
                {cartBooks.length} book{cartBooks.length > 1 ? "s" : ""} in cart
              </span>
            </div>
          </div>
          <Link href="/profile" className="sec-mid-btn">
            <FcDocument size={16} color="orange" />
            Order History
          </Link>
        </div>
        <div
          className="flex flex-col gap-12 justify-center items-center"
          style={{ height: "90vh" }}
        >
          <span className="font-16">Add books to cart to fill your bags</span>
          <button onClick={() => router.push("/")} className="pri-big-btn">
            Browse
          </button>
          <button
            type="button"
            onClick={() => setShowRecommendationModal(true)}
            className="sec-mid-btn flex flex-row gap-8 items-center"
          >
            <Sparkles size={16} />
            Need Book Suggestion?
          </button>
        </div>

        {/* Recommendation modal — available in empty cart state too */}
        <RecommendationModal
          isOpen={showRecommendationModal}
          onClose={() => setShowRecommendationModal(false)}
        />
      </>
    );
  }

  return (
    <section className="section-1200 flex flex-col gap-24">
      <div className="flex flex-row justify-between ">
        <div className="flex flec-row gap-12 items-center">
          <ArrowLeft size={20} onClick={() => router.push("/")} />
          <div className="flex flex-col">
            <h2 className="font-24 weight-600">Your Bag</h2>
            <span className="font-12 dark-50">
              {cartBooks.length} book{cartBooks.length > 1 ? "s" : ""} in cart
            </span>
          </div>
        </div>
        <Link href="/profile" className="sec-mid-btn">
          <FcDocument size={16} color="orange" />
          Order History
        </Link>
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

      <div className="whatsapp-help-section">
        <a
          href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-help-link"
        >
          <div className="whatsapp-help-content">
            <div className="whatsapp-help-icon">
              <FaWhatsapp size={24} color="#25D366" />
            </div>
            <div className="whatsapp-help-text">
              <span className="whatsapp-help-title">Need any help?</span>
              <span className="whatsapp-help-desc">
                Chat with us on WhatsApp for quick support
              </span>
            </div>
            <div className="whatsapp-help-arrow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      <div className="fixed-bill-bar flex flex-col">
        <div className="flex flex-row justify-between width100 items-center">
          <div className="bill-left">
            <span className="font-12 dark-50">Total payable</span>
            <div className="flex flex-col">
              <div className="flex flex-row gap-8 items-center">
                <span className="font-16 weight-600 discounted">
                  ₹{totalWithStandardDeliveryGift}
                </span>
                {offerDiscount > 0 && (
                  <span className="strike dark-50 original">
                    ₹{totalDiscounted}
                  </span>
                )}
              </div>

              {appliedOffer && (
                <span className="font-14 green weight-600">{offerLabel}</span>
              )}
            </div>

            <span className="view-bill-text" onClick={() => setShowBill(true)}>
              View bill
            </span>
          </div>

          <div className="flex flex-row items-center gap-12">
            {/* Small "Need book suggestion?" CTA — sits just above the fixed bill bar */}
            <span
              type="button"
              onClick={() => setShowRecommendationModal(true)}
              className="tertiary-btn flex flex-row gap-4 items-center"
              aria-label="Get book suggestions"
            >
              <Sparkle size={12} />
              Suggest Me
            </span>
            <button
              type="button"
              className="pri-big-btn"
              onClick={handleConfirmOrderClick}
              aria-disabled={isCheckoutDisabled}
              style={
                isCheckoutDisabled
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : undefined
              }
            >
              {isShortening ? "Preparing…" : "Confirm Order"}
            </button>
          </div>
        </div>
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
        cartBooks={cartBooks}
        generateViewBagLinkWithDetails={generateViewBagLinkWithDetails}
        shortenUrl={shortenUrl}
        offerLabel={offerLabel}
        offerDiscount={offerDiscount}
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

      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
    </section>
  );
}
