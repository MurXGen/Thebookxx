"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { books } from "@/utils/book";
import {
  getOneRupeeOfferData,
  permanentlyUnlockOffer,
  expireTimer,
  getRemainingOfferTime,
} from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import OfferCelebration from "@/components/UI/OfferCelebration";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState(() => {
    if (typeof window === "undefined") return [];
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        return JSON.parse(savedWishlist);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [oneRupeeOffer, setOneRupeeOffer] = useState(null);
  const [isOneRupeeEnabled, setIsOneRupeeEnabled] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  // ── QuickReads cart (separate slice; each is a one-time ₹49 unlock) ──
  const [qrCart, setQrCart] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(localStorage.getItem("qr_cart") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("qr_cart", JSON.stringify(qrCart));
    } catch {}
  }, [qrCart]);
  const addQuickRead = (bookId) =>
    setQrCart((prev) => (prev.includes(bookId) ? prev : [...prev, bookId]));
  const removeQuickRead = (bookId) =>
    setQrCart((prev) => prev.filter((id) => id !== bookId));
  const isInQrCart = (bookId) => qrCart.includes(bookId);
  const clearQrCart = () => setQrCart([]);

  // Function to calculate cart total
  const calculateCartTotal = (cartItems) => {
    return cartItems.reduce((sum, item) => {
      const book = books.find((b) => b.id === item.id);
      if (book) {
        return sum + book.discountedPrice * item.qty;
      }
      return sum;
    }, 0);
  };

  // Update cart total whenever cart changes
  useEffect(() => {
    const total = calculateCartTotal(cart);
    setCartTotal(total);
  }, [cart]);

  // 🎉 Celebrate when the cart crosses into a NEW offer tier (free delivery,
  // ₹50 / ₹100 off, etc.). Replaces the fly-to-cart delight for now.
  const prevRewardRef = useRef(null);
  useEffect(() => {
    const hasOneRupee = cart.some((item) => {
      const b = books.find((x) => x.id === item.id);
      return b?.discountedPrice === 1;
    });
    const offers = getCartOffers(hasOneRupee);
    const applied =
      [...offers].reverse().find((o) => cartTotal >= o.target) || null;
    const reward = applied?.reward || "";

    // Skip the very first run (hydration) so we don't fire on page load.
    if (prevRewardRef.current === null) {
      prevRewardRef.current = reward;
      return;
    }
    // Only celebrate when moving UP into a new (higher-value) reward tier.
    const prevIndex = offers.findIndex(
      (o) => o.reward === prevRewardRef.current,
    );
    const newIndex = offers.findIndex((o) => o.reward === reward);
    if (reward && reward !== prevRewardRef.current && newIndex > prevIndex) {
      window.dispatchEvent(
        new CustomEvent("tbx:offer-unlocked", { detail: { reward } }),
      );
    }
    prevRewardRef.current = reward;
  }, [cartTotal, cart]);

  // Load one rupee offer data on mount
  useEffect(() => {
    const offerData = getOneRupeeOfferData();
    setOneRupeeOffer(offerData);

    // Check if timer has expired
    if (
      offerData?.timerUnlocked &&
      !offerData?.timerExpired &&
      !offerData?.permanentUnlocked
    ) {
      const remainingTime = getRemainingOfferTime();
      if (remainingTime <= 0) {
        expireTimer();
      }
    }

    // Update enabled status
    updateOneRupeeEnabledStatus(offerData, cartTotal);
  }, []);

  // Update enabled status whenever cart total or offer data changes
  const updateOneRupeeEnabledStatus = (offerData, total) => {
    if (!offerData) {
      setIsOneRupeeEnabled(false);
      return;
    }

    // If timer unlocked and not expired
    if (offerData.timerUnlocked && !offerData.timerExpired) {
      const elapsedMinutes = (Date.now() - offerData.unlockTime) / 1000 / 60;
      if (elapsedMinutes <= 10) {
        setIsOneRupeeEnabled(true);
        return;
      } else {
        expireTimer();
        setIsOneRupeeEnabled(false);
        return;
      }
    }

    setIsOneRupeeEnabled(false);
  };

  // Check for permanent unlock whenever cart total changes
  useEffect(() => {
    const offerData = getOneRupeeOfferData();
    setOneRupeeOffer(offerData);

    // Update enabled status
    updateOneRupeeEnabledStatus(offerData, cartTotal);

    // Check if we should permanently unlock
    if (cartTotal >= 299) {
      const currentOfferData = getOneRupeeOfferData();
      // Only permanently unlock if not already permanently unlocked
      if (!currentOfferData?.permanentUnlocked) {
        console.log("Permanently unlocking ₹1 books, cart total:", cartTotal);
        permanentlyUnlockOffer();
        setOneRupeeOffer({
          ...currentOfferData,
          permanentUnlocked: true,
          timerUnlocked: true,
        });
        setIsOneRupeeEnabled(true);

        // Dispatch event for UI feedback
        if (typeof window !== "undefined") {
          const event = new CustomEvent("oneRupeePermanentUnlock");
          window.dispatchEvent(event);
        }
      }
    }
  }, [cartTotal]);

  // Persist cart
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // -------- CART LOGIC --------

  const addToCart = (id) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      let newCart;
      if (item) {
        newCart = prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      } else {
        newCart = [...prev, { id, qty: 1 }];
      }
      return newCart;
    });
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // -------- WISHLIST --------

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Force refresh unlock status
  const refreshUnlockStatus = () => {
    const offerData = getOneRupeeOfferData();
    setOneRupeeOffer(offerData);
    updateOneRupeeEnabledStatus(offerData, cartTotal);
  };

  // Check if ₹1 book can be added to cart
  const canAddOneRupeeBook = () => {
    return isOneRupeeEnabled;
  };

  // Get reason why ₹1 book cannot be added
  const getOneRupeeBlockReason = () => {
    if (!isOneRupeeEnabled) {
      const remaining = 299 - cartTotal;
      if (remaining > 0) {
        return `Add ₹${remaining} more worth of books to unlock ₹1 books`;
      }
      return "Add more than ₹299 worth of books to unlock ₹1 books";
    }
    return null;
  };

  const getCartTotal = () => cartTotal;
  const hasOneRupeeItem = cart.some((cartItem) => {
    const book = books.find((b) => b.id === cartItem.id);
    return book && book.discountedPrice === 1;
  });

  // Get minimum checkout amount based on ₹1 items
  const getMinCheckoutAmount = () => {
    return hasOneRupeeItem ? 399 : 151;
  };

  // Check if cart meets minimum checkout
  const canCheckout = () => {
    return cartTotal >= getMinCheckoutAmount();
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartTotal,
        hasOneRupeeItem, // Add this
        getMinCheckoutAmount, // Add this
        canCheckout, // Add this
        addToCart,
        decreaseQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        oneRupeeOffer,
        isOneRupeeEnabled,
        refreshUnlockStatus,
        canAddOneRupeeBook,
        getOneRupeeBlockReason,
        getCartTotal,
        // QuickReads cart
        qrCart,
        addQuickRead,
        removeQuickRead,
        isInQrCart,
        clearQrCart,
      }}
    >
      {children}
      <OfferCelebration />
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
