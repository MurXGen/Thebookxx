"use client";

import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { QUICKREAD_PRICE } from "@/data/quickreads";
import { getCartOffers } from "@/utils/cartOffers";
import { useRouter } from "next/navigation";
import CartOfferStrip from "@/components/UI/CartOfferStrip";
import LoadingButton from "./UI/LoadingButton";
import { motion, AnimatePresence } from "framer-motion";
import InstallPWA from "./InstallPWA";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import {
  ArrowRight,
  Zap,
  Clock,
  Gift,
  Lock,
  Sparkles,
  Search,
  Check,
  X,
} from "lucide-react";
import SearchOverlay from "./SearchOverlay";
import RecommendationModal from "./RecommendationModal";
import { getRemainingOfferTime, getOneRupeeOfferData } from "@/utils/book";
import { useEffect, useState, useRef } from "react";
import { trackFunnelEvent } from "@/lib/analytics";
import { trackEvent } from "@/lib/ga";
import { EVENTS } from "@/lib/trackingEvents";
import UnlockChip from "./UI/UnlockChip";
import OneRupeeModal from "./OneRupeeModal";

export default function CartBar({ tab = "books" }) {
  const { cart, cartTotal, qrCart, hasOneRupeeItem } = useStore();
  const router = useRouter();
  const isQuickReads = tab === "quickreads";
  const qrCount = qrCart?.length || 0;
  const qrTotal = qrCount * QUICKREAD_PRICE;
  const [liveRemainingTime, setLiveRemainingTime] = useState(0);
  const [showOneRupeeModal, setShowOneRupeeModal] = useState(false);
  const prevCartTotalRef = useRef(cartTotal);
  const hasTrackedMilestonesRef = useRef({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [showOfferSheet, setShowOfferSheet] = useState(false);
  const [fabShake, setFabShake] = useState(false);
  const [fabHint, setFabHint] = useState(false);
  const shakenRef = useRef(false);
  // Hide the bottom bar when scrolling down, reveal it when scrolling up / near
  // the top — keeps the reading area clear but the checkout one swipe away.
  const [barHidden, setBarHidden] = useState(false);
  useEffect(() => {
    let last = typeof window !== "undefined" ? window.scrollY : 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 40) setBarHidden(false);
      else if (y > last + 6) setBarHidden(true);
      else if (y < last - 6) setBarHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // When the shopper adds an item (or increases qty) while scrolled down and
  // the bar is hidden, slide it back up so they see it update immediately.
  const prevItemCountRef = useRef(
    cart.reduce((s, i) => s + (i.qty || 1), 0) + (qrCart?.length || 0),
  );
  useEffect(() => {
    const count =
      cart.reduce((s, i) => s + (i.qty || 1), 0) + (qrCart?.length || 0);
    if (count > prevItemCountRef.current) setBarHidden(false);
    prevItemCountRef.current = count;
  }, [cart, qrCart]);

  // Draw attention to the Search/Suggest quick actions: the first time the
  // user is active in the session (scroll / tap / key / pointer move), shake
  // the pill for ~3 seconds. When the shake ends, smoothly slide a hint label
  // out beside the Suggest icon for 5 seconds, then slide it back. Once only.
  useEffect(() => {
    if (shakenRef.current) return;
    const timers = [];
    const trigger = () => {
      if (shakenRef.current) return;
      shakenRef.current = true;
      setFabShake(true);
      timers.push(
        setTimeout(() => {
          setFabShake(false);
          setFabHint(true);
          timers.push(setTimeout(() => setFabHint(false), 5000));
        }, 3000),
      );
      cleanup();
    };
    const events = [
      "scroll",
      "pointerdown",
      "keydown",
      "pointermove",
      "touchstart",
    ];
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, trigger));
    events.forEach((e) =>
      window.addEventListener(e, trigger, { passive: true, once: false }),
    );
    return () => {
      cleanup();
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Open the Suggest modal on load when the URL carries?suggest
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("suggest")) {
      setSuggestOpen(true);
      trackEvent("suggestion_opened", { source: "url_param" });
      const url = new URL(window.location.href);
      url.searchParams.delete("suggest");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const hasCart = cart.length > 0;
  const showBar = isQuickReads ? qrCount > 0 : hasCart;

  const cartBooks = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.id);
      if (!book) return null;

      return {
        ...book,
        qty: item.qty,
        originalTotal: book.originalPrice * item.qty,
        discountedTotal: book.discountedPrice * item.qty,
      };
    })
    .filter(Boolean);

  const discountedAmount = cartBooks.reduce((s, b) => s + b.discountedTotal, 0);

  // Use the ₹1-aware offer set: carts containing a ₹1 book do NOT get the
  // flat ₹50/₹100 discounts (they follow the ₹1 offer ladder instead), so the
  // strip + total here stay consistent with the bag & bill modal.
  const activeOffers = getCartOffers(hasOneRupeeItem);
  const appliedOffer =
    [...activeOffers].reverse().find((o) => discountedAmount >= o.target) ||
    null;

  let offerDiscount = 0;
  let offerLabel = null;

  if (appliedOffer) {
    if (appliedOffer.type === "flat") {
      offerDiscount = appliedOffer.value;
      offerLabel = `₹${appliedOffer.value} OFF availed`;
    }

    if (appliedOffer.type === "percentage") {
      offerDiscount = Math.round((discountedAmount * appliedOffer.value) / 100);
      offerLabel = `Free shipping availed`;
    }
  }

  const finalPayable = discountedAmount - offerDiscount;

  // Next reward the shopper is progressing toward (drives AOV). "What's next".
  const progressOffer =
    activeOffers.find(
      (o) => discountedAmount >= o.min && discountedAmount < o.target,
    ) || null;
  const remainingToNext = progressOffer
    ? Math.max(progressOffer.target - discountedAmount, 0)
    : 0;
  const nextRewardText = progressOffer?.reward || "";
  const progressPct = progressOffer
    ? Math.min((discountedAmount / progressOffer.target) * 100, 100)
    : 100;

  // Get ₹1 book unlock status
  const offerData = getOneRupeeOfferData();

  const hasNeverUnlocked =
    !offerData?.timerUnlocked && !offerData?.permanentUnlocked;

  const isPermanentlyUnlocked = offerData?.permanentUnlocked === true;

  const isTimerActive =
    offerData?.timerUnlocked === true &&
    !offerData?.timerExpired &&
    (Date.now() - (offerData?.unlockTime || 0)) / 1000 / 60 <= 10;

  const isTimerExpired =
    offerData?.timerUnlocked === true && offerData?.timerExpired === true;

  const shouldBeEnabled = cartTotal >= 299;

  let uiState = "locked";

  if (isPermanentlyUnlocked) {
    if (shouldBeEnabled) {
      uiState = "permanentUnlocked";
    } else {
      uiState = "locked";
    }
  } else if (isTimerActive) {
    uiState = "timerActive";
  } else if (isTimerExpired) {
    uiState = "locked";
  } else {
    uiState = "locked";
  }

  // Track cart value changes and milestones
  useEffect(() => {
    const prevTotal = prevCartTotalRef.current;

    if (prevTotal !== cartTotal) {
      trackFunnelEvent(EVENTS.CART_VALUE_UPDATED, {
        cart_total: cartTotal,
        previous_total: prevTotal,
        item_count: cart.length,
        has_one_rupee_book: cartBooks.some((b) => b.discountedPrice === 1),
        user_unlock_status: uiState,
      });
    }

    const milestones = [151, 299, 400, 599, 799, 1000];
    for (const milestone of milestones) {
      if (
        prevTotal < milestone &&
        cartTotal >= milestone &&
        !hasTrackedMilestonesRef.current[milestone]
      ) {
        hasTrackedMilestonesRef.current[milestone] = true;
        trackFunnelEvent(EVENTS.CART_TOTAL_MILESTONE, {
          threshold: milestone,
          cart_total: cartTotal,
          milestone_type:
            milestone === 151
              ? "checkout_eligible"
              : milestone === 299
                ? "unlock_threshold"
                : milestone === 400
                  ? "free_delivery"
                  : milestone === 599
                    ? "handling_fee_discount"
                    : milestone === 799
                      ? "bulk_order_threshold"
                      : "high_value",
          user_unlock_status: uiState,
        });
      }
    }

    prevCartTotalRef.current = cartTotal;
  }, [cartTotal, cart.length, cartBooks, uiState]);

  // Real-time counter effect
  useEffect(() => {
    if (!isTimerActive) {
      setLiveRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getRemainingOfferTime();
      setLiveRemainingTime(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const remainingForUnlock = Math.max(0, 299 - cartTotal);

  // Track unlock progress view when in locked state
  useEffect(() => {
    if (uiState === "locked" && remainingForUnlock > 0 && !hasNeverUnlocked) {
      trackFunnelEvent(EVENTS.UNLOCK_PROGRESS_VIEWED, {
        current_total: cartTotal,
        remaining_needed: remainingForUnlock,
        progress_percentage: Math.min((cartTotal / 299) * 100, 100),
        has_permanent_unlock_in_storage: isPermanentlyUnlocked,
      });
    }
  }, [
    uiState,
    cartTotal,
    remainingForUnlock,
    isPermanentlyUnlocked,
    hasNeverUnlocked,
  ]);

  const handleCheckoutClick = () => {
    trackFunnelEvent(EVENTS.CHECKOUT_BUTTON_CLICKED, {
      cart_total: cartTotal,
      item_count: cart.length,
      has_one_rupee_book: cartBooks.some((b) => b.discountedPrice === 1),
      user_unlock_status: uiState,
      has_applied_offer: !!appliedOffer,
      offer_discount: offerDiscount,
    });
    router.push("/bag");
  };

  // Fallback handler (used inside locked modal CTA, scrolls to catalogue)
  const handleAddBooksClick = () => {
    trackFunnelEvent("add_books_button_clicked", {
      cart_total: cartTotal,
      remaining_needed: remainingForUnlock,
      source: "cart_bar",
    });
    const booksSection = document.querySelector(".catalogue-section");
    booksSection?.scrollIntoView({ behavior: "smooth" });
  };

  // Open the ₹1 modal, replaces the previous scroll-to-catalogue behavior
  const handleOpenOneRupeeModal = () => {
    trackFunnelEvent("one_rupee_modal_opened", {
      cart_total: cartTotal,
      remaining_needed: remainingForUnlock,
      user_unlock_status: uiState,
      source: "cart_bar",
    });
    setShowOneRupeeModal(true);
  };

  const shouldShowUnlockMessage = !hasNeverUnlocked;

  return (
    <div
      className={`cart-bar${barHidden ? " cart-bar-hidden" : ""}`}
      style={{ maxWidth: "680px", margin: "0 auto" }}
    >
      {/* Small emotional prompt above the bar — opens the suggestion modal */}
      <button
        type="button"
        className="cbx-suggest-strip"
        onClick={() => {
          trackEvent("suggestion_opened", { source: "suggest_strip" });
          setSuggestOpen(true);
        }}
        aria-label="Get a book suggestion"
      >
        <Sparkles size={14} />
        <span>
          Not sure what to read next? <b>Get a pick →</b>
        </span>
      </button>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <RecommendationModal
        isOpen={suggestOpen}
        onClose={() => setSuggestOpen(false)}
      />

      {/* QUICKREADS CART CTA */}
      <AnimatePresence mode="wait">
        {isQuickReads && qrCount > 0 && (
          <motion.div
            key="qr-cart"
            className="cart-bar-main flex flex-row gap-12"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="flex flex-col width100 gap-4">
              <div className="flex flex-row justify-between items-center">
                <span className="font-14 flex flex-row gap-6 items-center">
                  <Zap size={15} /> {qrCount} QuickRead{qrCount > 1 ? "s" : ""}
                </span>
                <span className="cart-price final weight-600">₹{qrTotal}</span>
              </div>
            </div>
            <motion.button
              className="pri-big-btn"
              onClick={() => router.push("/bag?tab=quickreads")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Checkout</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART CTA (books) — single revamped row: book stack + what's next +
          availed offer on the left, amount + checkout on the right. */}
      <AnimatePresence mode="wait">
        {!isQuickReads && hasCart && (
          <motion.div
            key="cart"
            className="cbx"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {/* Book stack — what they've got */}
            <div className="cbx-stack" aria-hidden="true">
              {cartBooks.slice(0, 3).map((b, i) =>
                i === 2 && cartBooks.length > 3 ? (
                  <span key="more" className="cbx-thumb cbx-thumb-more">
                    +{cartBooks.length - 2}
                  </span>
                ) : (
                  <span
                    key={b.id}
                    className="cbx-thumb"
                    style={{ zIndex: 3 - i }}
                  >
                    {b.image ? <img src={b.image} alt="" /> : null}
                  </span>
                ),
              )}
            </div>

            {/* Middle — what's next (highlighted, clickable) + availed offer */}
            <div className="cbx-mid">
              <button
                type="button"
                className="cbx-next"
                onClick={() => setShowOfferSheet(true)}
              >
                {progressOffer ? (
                  <>
                    Add <b>₹{remainingToNext}</b> more for{" "}
                    <b className="cbx-next-reward">{nextRewardText}</b>
                    <ArrowRight size={13} />
                  </>
                ) : (
                  <>
                    <b className="cbx-next-reward">All offers unlocked 🎉</b>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
              <span className="cbx-progress">
                <span
                  className="cbx-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </span>
              {appliedOffer && (
                <span className="cbx-availed">{offerLabel}</span>
              )}
            </div>

            {/* Right — amount + checkout */}
            <div className="cbx-right">
              <span className="cbx-amt">
                {appliedOffer && offerDiscount > 0 && (
                  <span className="cbx-strike">₹{discountedAmount}</span>
                )}
                <span className="cbx-final">₹{finalPayable}</span>
              </span>
              <motion.button
                className="cbx-checkout"
                onClick={handleCheckoutClick}
                whileTap={{ scale: 0.96 }}
              >
                <span>Checkout</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* See-all-offers sheet — opened by the highlighted "what's next" text */}
      <AnimatePresence>
        {showOfferSheet && (
          <motion.div
            className="offer-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOfferSheet(false)}
          >
            <motion.div
              className="offer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="offer-sheet-head">
                <span className="offer-sheet-title">
                  <Gift size={16} /> Unlock more rewards
                </span>
                <button
                  type="button"
                  className="offer-sheet-x"
                  onClick={() => setShowOfferSheet(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="offer-sheet-sub">
                Your cart: <b>₹{discountedAmount}</b>
              </p>
              <div className="offer-sheet-list">
                {activeOffers.map((o) => {
                  const unlocked = discountedAmount >= o.target;
                  const left = Math.max(o.target - discountedAmount, 0);
                  return (
                    <div
                      key={`${o.type}-${o.target}`}
                      className={`offer-tier${unlocked ? " unlocked" : ""}`}
                    >
                      <span className="offer-tier-ic">
                        {unlocked ? <Check size={14} /> : <Lock size={13} />}
                      </span>
                      <span className="offer-tier-main">
                        <span className="offer-tier-reward">{o.reward}</span>
                        <span className="offer-tier-note">
                          {unlocked
                            ? "Unlocked"
                            : `Add ₹${left} more (spend ₹${o.target})`}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="pri-big-btn width100 offer-sheet-cta"
                onClick={() => {
                  setShowOfferSheet(false);
                  handleCheckoutClick();
                }}
              >
                Go to bag
                <ArrowRight size={17} strokeWidth={2.5} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <UnlockChip /> */}

      {/* ₹1 Books Modal */}
      <OneRupeeModal
        isOpen={showOneRupeeModal}
        onClose={() => setShowOneRupeeModal(false)}
        mode={uiState}
        remainingForUnlock={remainingForUnlock}
        liveRemainingTime={liveRemainingTime}
        onAddBooksClick={handleAddBooksClick}
      />
    </div>
  );
}
