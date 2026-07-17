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
import WishlistStrip from "@/components/WishlistStrip";
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
import {
  ArrowLeft,
  Gift,
  Sparkle,
  Sparkles,
  User,
  Share2,
  ShoppingCart,
  RotateCcw,
  X,
  Wallet,
  Check,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { permanentlyUnlockOffer, areOneRupeeBooksEnabled } from "@/utils/book";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { FcDocument } from "react-icons/fc";

// COD handling fee, added to total only when payment method is COD.
// Disclosed transparently after delivery selection via CODHandlingFeeModal.
const COD_HANDLING_FEE = 29;

// Wallet: customers can apply their store-credit balance at checkout, capped
// per order. Balance is read from the "Wallet" column of the orders sheet.
const WALLET_SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const WALLET_MAX_PER_ORDER = 399;

function BagContent() {
  const { cart, addToCart, clearCart } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [siteOrigin, setSiteOrigin] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [upsellAccepted, setUpsellAccepted] = useState(false);
  // Wallet balance checkout
  const [walletPhone, setWalletPhone] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletChecked, setWalletChecked] = useState(false);
  const [walletChecking, setWalletChecking] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletEnabled, setWalletEnabled] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showFreeShippingNudge, setShowFreeShippingNudge] = useState(false);
  const [sharedBooks, setSharedBooks] = useState([]); // [{ book, qty }]
  const [showSharedModal, setShowSharedModal] = useState(false);

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

  // A shared bag link: /bag?shared=bk-002:1,bk-005:2 → show the shared books
  useEffect(() => {
    const shared = searchParams.get("shared");
    if (!shared) return;
    const parsed = shared
      .split(",")
      .map((entry) => {
        const [id, qty] = entry.split(":");
        const book = books.find((b) => b.id === id);
        return book ? { book, qty: Math.max(1, Number(qty) || 1) } : null;
      })
      .filter(Boolean);
    if (parsed.length) {
      setSharedBooks(parsed);
      setShowSharedModal(true);
    }
  }, [searchParams]);

  // Share the current bag as a link
  const handleShareBag = async () => {
    const enc = cart.map((i) => `${i.id}:${i.qty || 1}`).join(",");
    const url = `${siteOrigin || (typeof window !== "undefined" ? window.location.origin : "")}/bag?shared=${encodeURIComponent(enc)}`;
    try {
      if (navigator.share && window.innerWidth <= 768) {
        await navigator.share({
          title: "My TheBookX bag",
          text: "Check out the books I picked on TheBookX 📚",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Bag link copied — share it with anyone!", "success");
      }
    } catch (_) {
      /* user dismissed share sheet */
    }
  };

  // Add all shared books to the cart. When `reset`, clear the cart first.
  const addAllShared = (reset) => {
    if (reset) clearCart();
    sharedBooks.forEach(({ book, qty }) => {
      for (let i = 0; i < qty; i += 1) addToCart(book.id);
    });
    setShowSharedModal(false);
    showToast(
      reset ? "Cart reset & shared books added" : "Shared books added to cart",
      "success",
    );
    router.replace("/bag");
  };

  // Shared-bag modal — slide-up bill-modal style (like the suggestion modal),
  // scrollable list with fixed CTA buttons at the bottom.
  const sharedModal = (
    <AnimatePresence>
      {showSharedModal && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSharedModal(false)}
        >
          <motion.div
            className="bill-modal sharebag-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600)
                setShowSharedModal(false);
            }}
          >
            <div className="bill-header">
              <div className="flex flex-col">
                <span className="weight-600 font-16 flex items-center gap-8">
                  📚 A bag was shared with you
                </span>
                <span className="font-12 gray-500">
                  {sharedBooks.length} book
                  {sharedBooks.length > 1 ? "s" : ""} · ₹
                  {sharedBooks
                    .reduce(
                      (s, { book, qty }) => s + book.discountedPrice * qty,
                      0,
                    )
                    .toLocaleString()}
                </span>
              </div>
              <span
                className="cursor-pointer"
                onClick={() => setShowSharedModal(false)}
              >
                <X size={18} />
              </span>
            </div>

            <div className="sharebag-list">
              {sharedBooks.map(({ book, qty }) => (
                <div className="sharebag-item" key={book.id}>
                  {book.image && (
                    <img
                      src={book.image}
                      alt={book.name}
                      className="sharebag-img"
                    />
                  )}
                  <div className="sharebag-meta">
                    <span className="sharebag-name">{book.name}</span>
                    <span className="sharebag-cat">
                      {book.catalogue?.[0] || "Book"}
                    </span>
                  </div>
                  <div className="sharebag-price">
                    <span className="sharebag-p">₹{book.discountedPrice}</span>
                    {qty > 1 && <span className="sharebag-q">×{qty}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="sharebag-cta">
              <button
                type="button"
                className="sec-mid-btn sharebag-btn"
                onClick={() => addAllShared(true)}
              >
                <RotateCcw size={16} /> Reset & add all
              </button>
              <button
                type="button"
                className="pri-big-btn sharebag-btn"
                onClick={() => addAllShared(false)}
              >
                <ShoppingCart size={16} /> Add all to cart
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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

  // "The Art of Clarity" checkout add-on: ₹40 off, only while it's in the cart
  const ART_UPSELL_ID = "bk-002";
  const upsellDiscount =
    upsellAccepted && cartBooks.some((b) => b.id === ART_UPSELL_ID) ? 40 : 0;
  if (upsellDiscount) {
    offerDiscount += upsellDiscount;
    offerLabel = offerLabel
      ? `${offerLabel} + ₹40 add-on`
      : "₹40 book add-on";
  }

  // Wallet applied = min(balance, ₹399 cap, remaining payable) when enabled.
  const walletApplied =
    walletEnabled && walletBalance > 0
      ? Math.min(
          walletBalance,
          WALLET_MAX_PER_ORDER,
          Math.max(0, totalDiscounted - offerDiscount),
        )
      : 0;

  const finalPayable = totalDiscounted - offerDiscount - walletApplied;
  const canCheckout = totalDiscounted >= MIN_CHECKOUT_AMOUNT;
  const amountNeededToCheckout = Math.max(
    0,
    MIN_CHECKOUT_AMOUNT - totalDiscounted,
  );

  // Look up the customer's wallet balance from the orders sheet by phone
  // (max of the "Wallet" column across their rows), same source as the profile.
  const checkWallet = async () => {
    const phone = walletPhone.replace(/\D/g, "");
    if (phone.length < 10) {
      setWalletError("Enter a valid 10-digit phone number");
      return;
    }
    setWalletChecking(true);
    setWalletError("");
    try {
      const url = `https://docs.google.com/spreadsheets/d/${WALLET_SHEET_ID}/gviz/tq?tqx=out:json`;
      const res = await fetch(url);
      const text = await res.text();
      const data = JSON.parse(text.substring(47, text.length - 2));
      const headers = data.table.cols.map((c) => c.label);
      let bal = 0;
      data.table.rows.forEach((row) => {
        const o = {};
        row.c.forEach((cell, i) => {
          let v = cell?.v;
          if (v && typeof v === "object" && v.value !== undefined) v = v.value;
          o[headers[i]] = v;
        });
        const rowPhone = String(o["Phone Number"] ?? "").replace(/\D/g, "");
        if (rowPhone.slice(-10) === phone.slice(-10)) {
          const w = parseFloat(o["Wallet"] ?? o["wallet"] ?? 0);
          if (!isNaN(w)) bal = Math.max(bal, w);
        }
      });
      setWalletBalance(bal);
      setWalletChecked(true);
      setWalletEnabled(bal > 0);
      if (bal <= 0) setWalletError("No wallet balance found for this number");
    } catch (e) {
      console.error("Wallet check failed:", e);
      setWalletError("Couldn't check balance. Please try again.");
    } finally {
      setWalletChecking(false);
    }
  };

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

    const url = "https://api.journalx.app/api/bookxTelegram/order";
    const payload = JSON.stringify({
      orderDetails: orderMessage,
      customerName: addressData.name,
      customerPhone: addressData.phone,
      totalAmount: totalWithDelivery,
      paymentMethod: paymentType,
      codHandlingFee: codFee,
    });

    // 1) Try sendBeacon first — it is designed to reliably deliver data even
    //    when the page immediately navigates away (the WhatsApp redirect on
    //    mobile was killing the old fetch before it left the device).
    let delivered = false;
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        delivered = navigator.sendBeacon(url, blob);
      }
    } catch {
      delivered = false;
    }

    // 2) Fallback: keepalive fetch (also survives navigation). Fire-and-forget
    //    so it never blocks/delays the WhatsApp redirect.
    if (!delivered) {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: payload,
      })
        .then((r) => {
          if (!r.ok) console.error("Telegram notify HTTP", r.status);
        })
        .catch((error) =>
          console.error("Telegram order notification failed:", error),
        );
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

        {sharedModal}
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
            <button
              type="button"
              className="bag-icon-btn"
              onClick={handleShareBag}
              aria-label="Share your bag"
              title="Share your bag"
            >
              <Share2 size={19} />
            </button>
            <a
              href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX"
              target="_blank"
              rel="noopener noreferrer"
              className="bag-icon-btn"
              aria-label="Need help? Chat on WhatsApp"
              title="Need help? Chat on WhatsApp"
            >
              <FaWhatsapp size={20} color="#25D366" />
            </a>
            <Link
              href="/profile"
              className="bag-icon-btn"
              aria-label="Order history / profile"
              title="Order history"
            >
              <User size={20} />
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

      {/* Wishlist — horizontal strip below the added books */}
      <WishlistStrip />

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
      {canCheckout && (
        <div className="wallet-checkout">
          <div className="wc-head">
            <span className="wc-icon">
              <Wallet size={18} />
            </span>
            <div className="wc-head-txt">
              <span className="wc-title">Have wallet balance?</span>
              <span className="wc-sub">
                Use up to ₹{WALLET_MAX_PER_ORDER} on this order
              </span>
            </div>
          </div>

          {!walletChecked ? (
            <div className="wc-check-row">
              <input
                type="tel"
                inputMode="numeric"
                className="wc-input"
                placeholder="Enter your phone number"
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkWallet()}
              />
              <button
                type="button"
                className="wc-check-btn"
                onClick={checkWallet}
                disabled={walletChecking}
              >
                {walletChecking ? "Checking…" : "Check"}
              </button>
            </div>
          ) : walletBalance > 0 ? (
            <label className="wc-apply">
              <span className="wc-apply-txt">
                <span className="wc-bal">Balance ₹{walletBalance}</span>
                <span className="wc-apply-note">
                  {walletEnabled
                    ? `Applying ₹${walletApplied} to this order`
                    : `Tap to apply up to ₹${WALLET_MAX_PER_ORDER}`}
                </span>
              </span>
              <span
                className={`wc-switch${walletEnabled ? " on" : ""}`}
                aria-hidden="true"
              >
                <span className="wc-knob">
                  {walletEnabled && <Check size={11} strokeWidth={3} />}
                </span>
              </span>
              <input
                type="checkbox"
                className="wc-switch-input"
                checked={walletEnabled}
                onChange={(e) => setWalletEnabled(e.target.checked)}
              />
            </label>
          ) : null}

          {walletError && <span className="wc-error">{walletError}</span>}
        </div>
      )}

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
        notifyTelegram={sendOrderToTelegram}
        cartBooks={cartBooks}
        generateViewBagLinkWithDetails={generateViewBagLinkWithDetails}
        shortenUrl={shortenUrl}
        offerLabel={offerLabel}
        offerDiscount={offerDiscount}
        walletApplied={walletApplied}
        walletPhone={walletPhone}
        codHandlingFee={COD_HANDLING_FEE}
        onUpsellAccept={() => setUpsellAccepted(true)}
      />

      <BillModal
        open={showBill}
        onClose={() => setShowBill(false)}
        totalOriginal={totalOriginal}
        totalDiscounted={totalDiscounted}
        offerDiscount={offerDiscount}
        offerLabel={offerLabel}
        walletApplied={walletApplied}
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

      {sharedModal}
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

// useSearchParams (shared-bag links) must live inside a Suspense boundary.
export default function BagPage() {
  return (
    <Suspense fallback={null}>
      <BagContent />
    </Suspense>
  );
}
