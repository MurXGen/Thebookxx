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
import QuickReadsCheckout from "@/components/quickreads/QuickReadsCheckout";
import QuickReadsReader from "@/components/quickreads/QuickReadsReader";
import {
  unlockedBookIds,
  submitQuickReadOrder,
  grantBookAccess,
  notifyQuickReadTelegram,
} from "@/lib/quickreads";
import { QUICKREAD_PRICE, quickReadFrameCount } from "@/data/quickreadsMeta";
import { Zap, BookOpen, Trash2, Minus, Plus } from "lucide-react";
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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { permanentlyUnlockOffer, areOneRupeeBooksEnabled } from "@/utils/book";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { FcDocument } from "react-icons/fc";

// COD handling fee, added to total only when payment method is COD.
// Disclosed transparently after delivery selection via CODHandlingFeeModal.
const COD_HANDLING_FEE = 29;

function BagContent() {
  const { cart, addToCart, clearCart, qrCart, removeQuickRead, clearQrCart } =
    useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [siteOrigin, setSiteOrigin] = useState("");
  const [bagTab, setBagTab] = useState(
    searchParams?.get("tab") === "quickreads" ? "quickreads" : "books",
  ); // books | quickreads
  const [showQrCheckout, setShowQrCheckout] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [upsellAccepted, setUpsellAccepted] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showFreeShippingNudge, setShowFreeShippingNudge] = useState(false);
  const [sharedBooks, setSharedBooks] = useState([]); // [{ book, qty }]
  const [showSharedModal, setShowSharedModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); // review-before-share
  const [shareBusy, setShareBusy] = useState(false);

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

  // A shared bag link: /bag?shared=bk-002:1,bk-005:2 show the shared books
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

  // The long bag link (bk-id based). Shortened to a TinyURL when copied.
  const buildBagLink = () => {
    const enc = cart.map((i) => `${i.id}:${i.qty || 1}`).join(",");
    const origin =
      siteOrigin ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${origin}/bag?shared=${encodeURIComponent(enc)}`;
  };

  // Open a review modal first — the shopper sees what they're sharing.
  const handleShareBag = () => {
    if (!cart.length) return;
    setShowShareModal(true);
  };

  // Confirm from the modal: shorten to TinyURL, then share/copy it.
  const confirmShareBag = async () => {
    setShareBusy(true);
    try {
      const longUrl = buildBagLink();
      const tiny = (await shortenUrl(longUrl)) || longUrl;
      if (navigator.share && window.innerWidth <= 768) {
        await navigator.share({
          title: "My TheBookX bag",
          text: "Check out the books I picked on TheBookX ",
          url: tiny,
        });
      } else {
        await navigator.clipboard.writeText(tiny);
        showToast("Bag link copied — share it with anyone!", "success");
      }
      setShowShareModal(false);
    } catch (_) {
      /* user dismissed share sheet */
    } finally {
      setShareBusy(false);
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
                  A bag was shared with you
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

  const shareTotal = cartBooks.reduce(
    (s, b) => s + (b.discountedPrice || 0) * (b.qty || 1),
    0,
  );
  const shareModal = (
    <AnimatePresence>
      {showShareModal && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !shareBusy && setShowShareModal(false)}
        >
          <motion.div
            className="bill-modal sharebag-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bill-header">
              <div className="flex flex-col">
                <span className="weight-600 font-16">Share your bag</span>
                <span className="font-12 gray-500">
                  {cartBooks.length} book{cartBooks.length > 1 ? "s" : ""} · ₹
                  {shareTotal.toLocaleString()}
                </span>
              </div>
              <span
                className="cursor-pointer"
                onClick={() => !shareBusy && setShowShareModal(false)}
              >
                <X size={18} />
              </span>
            </div>
            <p className="ep-hint" style={{ marginBottom: 10 }}>
              Anyone who opens this link can add these books to their own bag.
            </p>
            <div className="sharebag-list">
              {cartBooks.map((b) => (
                <div className="sharebag-row" key={b.id}>
                  {b.image ? (
                    <img className="sharebag-cover" src={b.image} alt={b.name} />
                  ) : (
                    <span className="sharebag-cover sharebag-cover-ph" />
                  )}
                  <div className="sharebag-info">
                    <span className="sharebag-name">{b.name}</span>
                    <span className="sharebag-meta">
                      Qty {b.qty || 1} · ₹{b.discountedPrice}
                    </span>
                  </div>
                  <span className="sharebag-amt">
                    ₹{((b.discountedPrice || 0) * (b.qty || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="pri-big-btn sharebag-cta"
              onClick={confirmShareBag}
              disabled={shareBusy}
            >
              <Share2 size={17} />
              {shareBusy ? "Preparing link…" : "Copy & share link"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Recommendations for the empty-bag state (exclude ₹1 books).
  const recTrending = books
    .filter(
      (b) =>
        (b.catalogue || []).includes("trending") && b.discountedPrice !== 1,
    )
    .slice(0, 10);
  const recBest = books
    .filter(
      (b) =>
        (b.catalogue || []).includes("bestseller") && b.discountedPrice !== 1,
    )
    .slice(0, 10);
  const recQuick = books
    .filter((b) => quickReadFrameCount(b.id) > 0 && b.discountedPrice !== 1)
    .slice(0, 10);

  // QuickReads in the bag (separate slice)
  const qrItems = (qrCart || [])
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);
  const qrTotal = qrItems.length * QUICKREAD_PRICE;

  // Purchased/unlocked QuickReads on this device (their library). Read once on
  // mount (localStorage) so SSR + first client render stay consistent.
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [openReaderBook, setOpenReaderBook] = useState(null);
  useEffect(() => {
    const ids = unlockedBookIds();
    setLibraryBooks(
      ids.map((id) => books.find((b) => b.id === id)).filter(Boolean),
    );
  }, []);

  // Honor the tab the user actually selected (so clicking "Books" always shows
  // the books bag, even when it's empty).
  const activeBagTab = bagTab;

  // One-time sensible default: land on QuickReads if the cart has only reads.
  const didInitBagTab = useRef(false);
  useEffect(() => {
    if (didInitBagTab.current) return;
    if (searchParams?.get("tab") === "quickreads") {
      didInitBagTab.current = true;
      return;
    }
    if (cartBooks.length === 0 && qrItems.length > 0) {
      setBagTab("quickreads");
    }
    if (cartBooks.length > 0 || qrItems.length > 0) {
      didInitBagTab.current = true;
    }
  }, [cartBooks.length, qrItems.length, searchParams]);

  // Recommendations drawn from the categories already in the cart
  const cartIds = new Set(cartBooks.map((b) => b.id));
  const cartCategories = new Set(cartBooks.flatMap((b) => b.catalogue || []));
  const recommendedBooks = books.filter(
    (b) =>
      !cartIds.has(b.id) &&
      b.discountedPrice !== 1 &&
      (b.catalogue || []).some((c) => cartCategories.has(c)),
  );

  // Normal carts can check out below ₹199 (a ₹69 delivery fee applies); ₹1-book
  // carts keep the higher threshold. Derived so both flows stay consistent.
  const MIN_CHECKOUT_AMOUNT = getMinCheckoutAmount(hasOneRupeeItem);
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
    totalDiscounted < 499 && hasOneRupeeItem && !hasAcceptedShipping;

  useEffect(() => {
    if (totalDiscounted >= 499 || !hasOneRupeeItem) {
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
    offerLabel = offerLabel ? `${offerLabel} + ₹40 add-on` : "₹40 book add-on";
  }

  const finalPayable = totalDiscounted - offerDiscount;
  // Gift wrap (+₹25) counts toward the checkout minimum, so a ₹149 cart can
  // reach the ₹199 minimum by opting into gift wrapping.
  const checkoutValue = totalDiscounted + (giftWrap ? GIFT_WRAP_CHARGE : 0);
  const canCheckout = checkoutValue >= MIN_CHECKOUT_AMOUNT;
  const amountNeededToCheckout = Math.max(
    0,
    MIN_CHECKOUT_AMOUNT - checkoutValue,
  );

  const standardDeliveryCharge = getDeliveryCharge(
    totalDiscounted,
    false,
    hasOneRupeeItem,
  );
  // Faster delivery is available for every order (no weight cap / contact
  // support). Its price is the express tier of getDeliveryCharge — i.e.
  // standard + 50% of standard.
  const fasterUnavailable = false;
  // Gift wrap add-on price by order value: +₹15 up to ₹500, +₹35 above.
  const giftWrapChargeEff = totalDiscounted > 500 ? 35 : 15;
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

  // QuickReads ride on the same physical-book bill (one combined checkout).
  const hasBundledQr = cartBooks.length > 0 && qrItems.length > 0;
  const bundledQrTotal = hasBundledQr ? qrTotal : 0;
  const displayedFixedBarTotalWithQr = displayedFixedBarTotal + bundledQrTotal;

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
      finalPayable + deliveryCharge + giftWrapAmount + codFee + bundledQrTotal;

    let deliveryInfo = `${addressData.city || "Not specified"} - ${addressData.pincode || "Not specified"}`;
    if (fasterDeliveryChoice) {
      deliveryInfo += ` (${deliveryLabel} +₹${deliveryCharge})`;
    } else if (deliveryCharge > 0) {
      deliveryInfo += ` (${deliveryLabel} +₹${deliveryCharge})`;
    } else {
      deliveryInfo += ` (Free Delivery)`;
    }

    if (giftWrapSelected) {
      deliveryInfo += ` (Gift Wrap +₹${GIFT_WRAP_CHARGE})`;
    }

    if (codFee > 0) {
      deliveryInfo += ` (COD Handling Fee +₹${codFee})`;
    }

    if (bundledQrTotal > 0) {
      deliveryInfo += ` (${qrItems.length} QuickRead${qrItems.length > 1 ? "s" : ""} +₹${bundledQrTotal})`;
    }

    const itemsBlock = cartBooks
      .map(
        (book, idx) =>
          `${idx + 1}. ${book.name} × ${book.qty} — ₹${book.discountedPrice * book.qty}`,
      )
      .join("\n");
    const qrBlock =
      bundledQrTotal > 0
        ? "\n" +
          qrItems
            .map(
              (b, idx) =>
                `${cartBooks.length + idx + 1}. ${b.name} (QuickRead) — ₹${QUICKREAD_PRICE}`,
            )
            .join("\n")
        : "";
    const orderId = addressData.orderId || "";
    const orderLink = orderId
      ? `https://thebookx.in?orderID=${encodeURIComponent(orderId)}`
      : "";
    // Merchant confirmation page — the merchant opens this, enters the password
    // and (for WhatsApp orders) picks COD or Online, which sets the final bill.
    const merchantLink = orderId
      ? `https://thebookx.in/${encodeURIComponent(orderId)}`
      : "";
    const profileLink = "https://www.thebookx.in/profile";
    const fullAddr = [
      addressData.address,
      addressData.area,
      addressData.city,
      addressData.district,
      addressData.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    return `
*CONFIRM MY ORDER — TheBookX*

Hi, I'd like to confirm my order. Here are the full details:

*Customer*
Name: ${addressData.name || "Customer"}
Phone: ${addressData.phone || "Not provided"}

*Delivery address*
${fullAddr || "Not provided"}
${deliveryInfo}

*Books ordered*
${itemsBlock}${qrBlock}

*Bill*
Subtotal: ₹${totalDiscounted}${offerDiscount > 0 ? `\nOffer discount: -₹${offerDiscount}` : ""}
Delivery: ${deliveryCharge > 0 ? `+₹${deliveryCharge}` : "FREE"}${giftWrapSelected ? `\nGift wrap: +₹${GIFT_WRAP_CHARGE}` : ""}${codFee > 0 ? `\nCOD handling fee: +₹${codFee}` : ""}
*Total: ₹${totalWithDelivery}*
Payment: ${paymentType === "COD" ? "Cash on Delivery" : paymentType === "WhatsApp" ? "Confirming on WhatsApp" : "UPI Payment"}
${orderLink ? `\n*Order details:* ${orderLink}` : ""}
*My orders & tracking:* ${profileLink}${merchantLink ? `\n\n_(Merchant use) Confirm & set payment:_ ${merchantLink}` : ""}

Thank you!
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
      finalPayable + deliveryCharge + giftWrapAmount + codFee + bundledQrTotal;

    const qrLines =
      bundledQrTotal > 0
        ? `\n📖 *QuickReads*\n${qrItems
            .map((b, idx) => `${idx + 1}. ${b.name} — ₹${QUICKREAD_PRICE}`)
            .join("\n")}`
        : "";

    // Links: the customer invoice link + (for online payments) the merchant
    // confirmation link so the team can confirm once the UPI payment lands.
    const orderId = addressData.orderId || "";
    const isOnline = paymentType === "UPI";
    // Merchant confirm link is useful for online payments AND WhatsApp orders
    // (merchant sets the final payment method on that page).
    const needsMerchantConfirm = isOnline || paymentType === "WhatsApp";
    const orderLink = orderId
      ? `https://thebookx.in?orderID=${encodeURIComponent(orderId)}`
      : shortLink || "";
    const merchantLink = orderId
      ? `https://thebookx.in/${encodeURIComponent(orderId)}`
      : "";

    // Direct WhatsApp link to message THIS customer — warm, conversational,
    // sales-friendly opener pre-filled.
    const custDigits = String(addressData.phone || "")
      .replace(/\D/g, "")
      .slice(-10);
    const firstName = String(addressData.name || "there").trim().split(/\s+/)[0];
    const orderRef = orderId ? ` (order ${orderId})` : "";
    // Message tailored to how the customer chose to pay/order.
    const custMsg =
      paymentType === "COD"
        ? `Hi ${firstName}! 📚 Thank you for your order with TheBookX${orderRef} 💛\n\nIt's a Cash on Delivery order — please keep the amount handy at delivery. Do you need any help with this order? 😊`
        : paymentType === "WhatsApp"
          ? `Hi ${firstName}! 📚✨ Thanks for choosing TheBookX${orderRef} 💛\n\nWe're getting your order ready to confirm. Do you have any questions or need help picking your books? We're right here for you! 😊`
          : `Hi ${firstName}! 📚✨ Thank you for your order with TheBookX${orderRef} 💛\n\nWe're confirming your payment now. Do you need any help with this order? We'd love to make it perfect for you! 😊`;
    const waCustomerLink =
      custDigits.length === 10
        ? `https://wa.me/91${custDigits}?text=${encodeURIComponent(custMsg)}`
        : "";

    const payLine =
      paymentType === "COD"
        ? `💵 COD${codFee > 0 ? ` · +₹${codFee} fee` : ""}`
        : paymentType === "WhatsApp"
          ? "🟢 Confirm on WhatsApp"
          : "💳 Online (UPI)";

    const itemsBlock = cartBooks
      .map(
        (book, idx) =>
          `${idx + 1}. ${book.name} ×${book.qty} — ₹${book.discountedPrice * book.qty}`,
      )
      .join("\n");

    const addrLine = [
      addressData.address,
      addressData.city,
      addressData.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    const orderMessage = `🛒 *New order · TheBookX*

👤 *${addressData.name || "Customer"}*  ·  ${payLine}
📞 ${addressData.phone || "—"}
📍 ${addrLine || "—"}

📚 *Items (${cartBooks.length})*
${itemsBlock}${qrLines}

🧾 Subtotal ₹${totalDiscounted}${offerDiscount > 0 ? ` · Offer -₹${offerDiscount}` : ""} · Delivery ₹${deliveryCharge}${giftWrapSelected ? ` · Gift +₹${GIFT_WRAP_CHARGE}` : ""}${codFee > 0 ? ` · COD +₹${codFee}` : ""}${bundledQrTotal > 0 ? ` · QuickReads +₹${bundledQrTotal}` : ""}
💰 *Total: ₹${totalWithDelivery}*${codFee > 0 ? ` _(₹${codFee} collected at door)_` : ""}
🚚 ${deliveryLabel}

${orderId ? `🆔 ${orderId}\n` : ""}🧾 Invoice: ${orderLink || "—"}${
      needsMerchantConfirm && merchantLink
        ? `\n✅ Confirm & set payment: ${merchantLink}`
        : ""
    }${waCustomerLink ? `\n💬 Message customer: ${waCustomerLink}` : ""}`;

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
    // when the page immediately navigates away (the WhatsApp redirect on
    // mobile was killing the old fetch before it left the device).
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
    // so it never blocks/delays the WhatsApp redirect.
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

  // The /view-bag order-preview page was removed. This now returns an empty
  // string so no order link is generated or shared (kept as a no-op so the
  // existing call sites in the checkout flow stay intact).
  const generateViewBagLinkWithDetails = () => "";

  const shortenUrl = async (longUrl) => {
    if (!longUrl) return ""; // nothing to shorten (order link removed)
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

  // When a customer checks out physical books, any QuickReads sitting in the
  // bag ride on the SAME bill. Submit each to the QuickReads sheet using the
  // phone entered at checkout, grant local access, then clear the QR cart.
  const submitBundledQuickReads = async (addressData, paymentType) => {
    if (!qrItems.length) return;
    const phone = addressData?.phone || "";
    for (const b of qrItems) {
      try {
        await submitQuickReadOrder({
          name: addressData?.name || "",
          mobile: phone,
          bookId: b.id,
          bookName: b.name,
          amount: QUICKREAD_PRICE,
          paymentMethod: paymentType === "COD" ? "COD" : "UPI Payment",
        });
        notifyQuickReadTelegram({
          name: addressData?.name || "",
          mobile: phone,
          bookId: b.id,
          bookName: b.name,
          amount: QUICKREAD_PRICE,
          paymentMethod: paymentType === "COD" ? "COD" : "UPI Payment",
        });
        if (phone) grantBookAccess(b.id, phone);
      } catch (e) {
        console.error("Bundled QuickRead submit failed:", b.id, e);
      }
    }
    clearQrCart();
  };

  const handleCODCheckout = async (
    addressData,
    fasterDeliveryChoice,
    giftWrapSelected,
    method = "COD",
  ) => {
    const isWhatsApp = method === "WhatsApp";
    setPaymentMethod(isWhatsApp ? "WhatsApp" : "COD");

    const viewBagLinkWithDetails = generateViewBagLinkWithDetails(
      addressData,
      method,
      fasterDeliveryChoice,
      giftWrapSelected,
    );

    setIsShortening(true);
    const shortLink = await shortenUrl(viewBagLinkWithDetails);
    setIsShortening(false);

    // Telegram notify for both COD and WhatsApp orders. For a WhatsApp order
    // the notification carries the merchant confirm link (to set payment) and
    // a link to message the customer.
    await sendOrderToTelegram(
      addressData,
      isWhatsApp ? "WhatsApp" : "COD",
      fasterDeliveryChoice,
      giftWrapSelected,
      shortLink,
    );

    // Bundle any QuickReads onto this same order before redirecting.
    await submitBundledQuickReads(addressData, method);

    redirectToWhatsApp(
      addressData,
      method,
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

    // Bundle any QuickReads onto this same order before redirecting.
    await submitBundledQuickReads(addressData, "UPI");

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

  if (!cartBooks.length && !qrItems.length && !libraryBooks.length) {
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
        {shareModal}
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

      {cartBooks.length === 0 && qrItems.length === 0 && (
        <>
          <div className="bag-empty-hero">
            <span className="bag-empty-ic">
              <BookOpen size={30} />
            </span>
            <p className="bag-empty-title">Your bag is empty</p>
            <p className="bag-empty-sub">
              Add a book and unlock free delivery, wallet rewards and more.
            </p>
            <Link href="/books" className="pri-big-btn">
              Browse all books
            </Link>
          </div>

          {recTrending.length > 0 && (
            <section
              className="catalogue-section-2 trending-section"
              style={{ marginTop: "24px" }}
            >
              <HorizontalScroll title="Trending now">
                {recTrending.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </HorizontalScroll>
            </section>
          )}

          {recBest.length > 0 && (
            <section
              className="catalogue-section-2"
              style={{ marginTop: "24px" }}
            >
              <HorizontalScroll title="Bestsellers">
                {recBest.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </HorizontalScroll>
            </section>
          )}

          {recQuick.length > 0 && (
            <section
              className="catalogue-section-2"
              style={{ marginTop: "24px" }}
            >
              <HorizontalScroll title="QuickReads">
                {recQuick.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </HorizontalScroll>
            </section>
          )}
        </>
      )}

      {(cartBooks.length > 0 || qrItems.length > 0) && (
        <>
          {cartBooks.length > 0 && (
            <CartOfferStrip discountedAmount={totalDiscounted} />
          )}

          <div className="cart-items-panel">
            <div className="cart-items-list">
              {cartBooks.map((book) => (
                <CartItemRow key={book.id} book={book} />
              ))}
              {qrItems.map((b) => (
                <div key={b.id} className="cart-row cart-row-qr">
                  <Link
                    href="/quickreads"
                    className="cart-row-cover"
                    aria-label={`${b.name} — QuickRead`}
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      className="cart-row-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Link>
                  <div className="cart-row-body">
                    <div className="cart-row-info">
                      <Link href="/quickreads" className="cart-row-title">
                        {b.name}
                      </Link>
                      <Link href="/quickreads" className="cart-row-cat">
                        QuickReads
                      </Link>

                      <div
                        className="cart-stepper"
                        role="group"
                        aria-label="Quantity"
                      >
                        <button
                          type="button"
                          className="cart-step-btn cart-step-minus"
                          onClick={() => removeQuickRead(b.id)}
                          aria-label={`Remove ${b.name}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="cart-step-qty">1</span>
                        <button
                          type="button"
                          className="cart-step-btn cart-step-plus"
                          aria-disabled="true"
                          onClick={() =>
                            showToast(
                              "One copy per QuickRead is enough",
                              "info",
                            )
                          }
                          aria-label="Only one QuickRead copy allowed"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-row-aside">
                      <div className="cart-row-aside-price">
                        <span className="cart-row-aside-now">
                          ₹{QUICKREAD_PRICE}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wishlist — horizontal strip below the added books */}
          <WishlistStrip />

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
                  remember
                </span>
              </div>
              <LazyBookGrid items={recommendedBooks} batch={20} />
            </div>
          )}

          {cartBooks.length > 0 ? (
            <div
              className={`fixed-bill-bar flex flex-col${showRecommendationModal ? " reco-open" : ""}`}
            >
              <div className="flex flex-row justify-between width100 items-center">
                <div className="bill-left">
                  <span className="font-12 dark-50">Total payable</span>
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-8 items-center">
                      <span className="font-16 weight-600 discounted">
                        ₹{displayedFixedBarTotalWithQr}
                      </span>
                      {offerDiscount > 0 && (
                        <span className="strike dark-50 original">
                          ₹{totalDiscounted + bundledQrTotal}
                        </span>
                      )}
                    </div>

                    {appliedOffer && (
                      <span className="font-14 green weight-600">
                        {offerLabel}
                      </span>
                    )}
                  </div>

                  <span
                    className="view-bill-text"
                    onClick={() => setShowBill(true)}
                  >
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
          ) : (
            <div
              className={`fixed-bill-bar flex flex-col${showRecommendationModal ? " reco-open" : ""}`}
            >
              <div className="flex flex-row justify-between width100 items-center">
                <div className="bill-left">
                  <span className="font-12 dark-50">Total payable</span>
                  <div className="flex flex-col">
                    <span className="font-16 weight-600 discounted">
                      ₹{qrTotal}
                    </span>
                    <span className="font-14 green weight-600">
                      {qrItems.length} QuickRead{qrItems.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="pri-big-btn"
                  onClick={() => setShowQrCheckout(true)}
                >
                  Checkout QuickReads
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
        fasterUnavailable={fasterUnavailable}
        totalWithStandardDelivery={totalWithStandardDelivery}
        giftWrapCharge={giftWrapChargeEff}
        giftWrapSelected={false}
        handleCODCheckout={handleCODCheckout}
        handleUPICheckout={handleUPICheckout}
        notifyTelegram={sendOrderToTelegram}
        cartBooks={cartBooks}
        generateViewBagLinkWithDetails={generateViewBagLinkWithDetails}
        shortenUrl={shortenUrl}
        offerLabel={offerLabel}
        offerDiscount={offerDiscount}
        codHandlingFee={COD_HANDLING_FEE}
        onUpsellAccept={() => setUpsellAccepted(true)}
        quickReadItems={hasBundledQr ? qrItems : []}
        quickReadUnitPrice={QUICKREAD_PRICE}
        quickReadTotal={bundledQrTotal}
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
        fasterUnavailable={fasterUnavailable}
        totalWithStandardDelivery={totalWithStandardDelivery}
        cartBooks={cartBooks}
        isFasterDelivery={false}
        giftWrapCharge={giftWrapChargeEff}
        giftWrapSelected={false}
        hideDeliveryCharges={needsShippingNudge}
        quickReadItems={hasBundledQr ? qrItems : []}
        quickReadUnitPrice={QUICKREAD_PRICE}
        quickReadTotal={bundledQrTotal}
      />

      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />

      {sharedModal}

      <AnimatePresence>
        {showQrCheckout && (
          <QuickReadsCheckout
            items={qrItems}
            onClose={() => setShowQrCheckout(false)}
            onPaid={() => clearQrCart()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openReaderBook && (
          <QuickReadsReader
            book={openReaderBook}
            resume
            onClose={() => setOpenReaderBook(null)}
          />
        )}
      </AnimatePresence>
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
