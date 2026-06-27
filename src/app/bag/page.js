"use client";

import BookCard from "@/components/BookCard";
import CartItemRow from "@/components/CartItemRow";
import LazyBookGrid from "@/components/UI/LazyBookGrid";
import PageHeader from "@/components/UI/PageHeader";
import RecentlyViewed from "@/components/RecentlyViewed";
import RecommendationModal from "@/components/RecommendationModal";
import AddressModal from "@/components/UI/AddressModal";
import BillModal from "@/components/UI/BillModal";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import FreeShippingNudgeModal from "@/components/UI/FreeShippingNudgeModal";
import HorizontalScroll from "@/components/UI/HorizontalScroll";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { books } from "@/utils/book";
import { motion, AnimatePresence } from "framer-motion";
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

// COD handling fee, added to total only when payment method is COD.
// Disclosed transparently after delivery selection via CODHandlingFeeModal.
const COD_HANDLING_FEE = 29;

export default function BagPage() {
  const { cart } = useStore();
  const router = useRouter();
  const [siteOrigin, setSiteOrigin] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showFreeShippingNudge, setShowFreeShippingNudge] = useState(false);

  const [hasAcceptedShipping, setHasAcceptedShipping] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isShortening, setIsShortening] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const GIFT_WRAP_CHARGE = 25;

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

  const hasOneRupeeItem = cartBooks.some((book) => book.discountedPrice === 1);

  // Recommendations drawn from the categories already in the cart
  const cartIds = new Set(cartBooks.map((b) => b.id));
  const cartCategories = new Set(cartBooks.flatMap((b) => b.catalogue || []));
  const recommendedBooks = books.filter(
    (b) =>
      !cartIds.has(b.id) &&
      b.discountedPrice !== 1 &&
      (b.catalogue || []).some((c) => cartCategories.has(c)),
  );

  const MIN_CHECKOUT_AMOUNT = 151;
  const cartOffers = getCartOffers(hasOneRupeeItem);

  const totalOriginal = cartBooks.reduce(
    (sum, b) => sum + b.originalPrice * b.qty,
    0,
  );

  const totalDiscounted = cartBooks.reduce(
    (sum, b) => sum + b.discountedPrice * b.qty,
    0,
  );

  const needsShippingNudge =
    totalDiscounted < 399 && hasOneRupeeItem && !hasAcceptedShipping;

  useEffect(() => {
    if (totalDiscounted >= 399 || !hasOneRupeeItem) {
      setHasAcceptedShipping(false);
    }
  }, [totalDiscounted, hasOneRupeeItem]);

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

  const displayedFixedBarTotal = needsShippingNudge
    ? finalPayable + (giftWrap ? GIFT_WRAP_CHARGE : 0)
    : totalWithStandardDeliveryGift;

  // Returns the COD fee amount only when paymentType is COD
  const getCodFeeForPayment = (paymentType) =>
    paymentType === "COD" ? COD_HANDLING_FEE : 0;

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
    const codFee = getCodFeeForPayment(paymentType);
    const totalWithDelivery =
      finalPayable + deliveryCharge + giftWrapAmount + codFee;

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

    if (codFee > 0) {
      deliveryInfo += ` 💵 (COD Handling Fee +₹${codFee})`;
    }

    return `
*CONFIRM MY ORDER*

✨👋 Hey hi, I want to confirm my order! 👋✨

👤 *Name:* ${addressData.name || "Customer"}
📞 *Phone:* ${addressData.phone || "Not provided"}

📍 *Delivery:* ${deliveryInfo}

💰 *Total Amount:* ₹${totalWithDelivery}${codFee > 0 ? ` (incl. ₹${codFee} COD fee)` : ""}
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
    const codFee = getCodFeeForPayment(paymentType);
    const totalWithDelivery =
      finalPayable + deliveryCharge + giftWrapAmount + codFee;

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
📦 Delivery Charge: +₹${deliveryCharge}${giftWrapSelected ? `\n🎁 Gift Wrap: +₹${GIFT_WRAP_CHARGE}` : ""}${codFee > 0 ? `\n💵 COD Handling Fee: +₹${codFee}` : ""}
━━━━━━━━━━━━━━━━━━━━
*💵 TOTAL PAYABLE: ₹${totalWithDelivery}*${codFee > 0 ? `\n_(includes ₹${codFee} COD fee, collected at delivery)_` : ""}

━━━━━━━━━━━━━━━━━━━━
*💳 PAYMENT METHOD*
━━━━━━━━━━━━━━━━━━━━
${paymentType === "COD" ? `💵 Cash on Delivery (incl. ₹${codFee} fee)` : "📱 UPI Payment"}

🔗 *Order Link:* ${shortLink}

━━━━━━━━━━━━━━━━━━━━
_Thank you for shopping with TheBookX! 📚✨_
    `;

    try {
      await fetch("https://api.journalx.app/api/bookxTelegram/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // keepalive lets the request finish even when the page immediately
        // navigates to the WhatsApp app (critical on mobile, where the
        // redirect would otherwise cancel the in-flight request).
        keepalive: true,
        body: JSON.stringify({
          orderDetails: orderMessage,
          customerName: addressData.name,
          customerPhone: addressData.phone,
          totalAmount: totalWithDelivery,
          paymentMethod: paymentType,
          codHandlingFee: codFee,
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
    const codFee = getCodFeeForPayment(paymentType);
    const totalWithDelivery =
      finalPayable + deliveryCharge + giftWrapAmount + codFee;

    const orderDetails = {
      orderId,
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
      deliveryCharge,
      deliveryLabel: getDeliveryLabel(
        totalDiscounted,
        fasterDeliveryChoice,
        hasOneRupeeItem,
      ),
      giftWrap: giftWrapSelected,
      giftWrapCharge: giftWrapAmount,
      codHandlingFee: codFee,
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
      return await response.text();
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

    // Notify on every order — mobile and desktop. The fetch uses keepalive so
    // it completes even though redirectToWhatsApp navigates away right after.
    await sendOrderToTelegram(
      addressData,
      "COD",
      fasterDeliveryChoice,
      giftWrapSelected,
      shortLink,
    );

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

    // Notify on every order — mobile and desktop. The fetch uses keepalive so
    // it completes even though redirectToWhatsApp navigates away right after.
    await sendOrderToTelegram(
      addressData,
      "UPI",
      fasterDeliveryChoice,
      giftWrapSelected,
      shortLink,
    );

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

    if (needsShippingNudge) {
      setShowFreeShippingNudge(true);
      return;
    }

    setShowAddressModal(true);
  };

  const handleSkipNudge = () => {
    setHasAcceptedShipping(true);
    setShowFreeShippingNudge(false);
    setTimeout(() => setShowAddressModal(true), 100);
  };

  const handleNudgeClose = () => {
    setShowFreeShippingNudge(false);
  };

  const handleProceedAfterUnlock = () => {
    setShowFreeShippingNudge(false);
    setTimeout(() => setShowAddressModal(true), 100);
  };

  const isCheckoutDisabled = !canCheckout || isShortening;

  if (!cartBooks.length) {
    return (
      <>
        <div className="section-680">
          <PageHeader
            title="Your Bag"
            subtitle={`${cartBooks.length} book${cartBooks.length === 1 ? "" : "s"} in cart`}
            right={
              <Link href="/profile" className="sec-mid-btn">
                Order History
              </Link>
            }
          />
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

        <RecommendationModal
          isOpen={showRecommendationModal}
          onClose={() => setShowRecommendationModal(false)}
        />
      </>
    );
  }

  return (
    <section className="section-680 flex flex-col gap-24">
      <PageHeader
        title="Your Bag"
        subtitle={`${cartBooks.length} book${cartBooks.length > 1 ? "s" : ""} in cart`}
        right={
          <div className="bag-header-actions">
            <a
              href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX"
              target="_blank"
              rel="noopener noreferrer"
              className="bag-help-btn"
              aria-label="Need any help? Chat on WhatsApp"
            >
              <FaWhatsapp size={16} color="#25D366" />
              <span>Need help?</span>
            </a>
            <Link href="/profile" className="sec-mid-btn">
              Order History
            </Link>
          </div>
        }
      />

      <CartOfferStrip discountedAmount={totalDiscounted} />

      <div className="cart-items-panel">
        <div className="cart-items-list">
          {cartBooks.map((book) => (
            <CartItemRow key={book.id} book={book} />
          ))}
        </div>
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

      {recommendedBooks.length > 0 && (
        <div className="cart-sep">
          <span className="cart-sep-line" />
          <span className="cart-sep-label">
            <Sparkles size={13} /> You may also add
          </span>
          <span className="cart-sep-line" />
        </div>
      )}

      {recommendedBooks.length > 0 && (
        <div className="cart-recommendations">
          <div className="cart-rec-head">
            <span className="cart-rec-title">
              Readers who picked these also loved…
            </span>
            <span className="cart-rec-sub">
              Hand-picked for you, add one more and make it a reading you'll
              remember ❤️
            </span>
          </div>
          <LazyBookGrid items={recommendedBooks} batch={20} />
        </div>
      )}

      <div className="fixed-bill-bar flex flex-col">
        <div className="flex flex-row justify-between width100 items-center">
          <div className="bill-left">
            <span className="font-12 dark-50">Total payable</span>
            <div className="flex flex-col">
              <div className="flex flex-row gap-8 items-center">
                <span className="font-16 weight-600 discounted">
                  ₹{displayedFixedBarTotal}
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

      <FreeShippingNudgeModal
        open={showFreeShippingNudge}
        onClose={handleNudgeClose}
        onSkip={handleSkipNudge}
        onProceedAfterUnlock={handleProceedAfterUnlock}
        cartBooks={cartBooks}
        totalDiscounted={totalDiscounted}
      />

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
        codHandlingFee={COD_HANDLING_FEE}
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
        hideDeliveryCharges={needsShippingNudge}
      />

      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
    </section>
  );
}

function FreebieBadge() {
  return (
    <motion.div
      className="freebie-badge"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        padding: "16px",
        background:
          "linear-gradient(135deg, var(--tertiary-light-10, #ffb70320) 0%, var(--tertiary-10, #fb850010) 100%)",
        border: "1px dashed var(--tertiary, #fb8500)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-12 weight-600">
          <span>Free Bookmarks &amp; surprise gift packs</span>
        </div>
      </div>
    </motion.div>
  );
}
