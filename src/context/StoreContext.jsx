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
import { hydrateCustomBooks } from "@/utils/customBooks";

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

  // Register any persisted custom products into the catalogue so a cart that
  // contains one still resolves after a reload, then nudge a recompute.
  useEffect(() => {
    hydrateCustomBooks();
    setCart((prev) => [...prev]);
  }, []);

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

  // ── Abandoned-cart tracking ────────────────────────────────────────────────
  // Upsert ONE row per shopper/device (keyed by phone when logged in, else a
  // persistent device id) whenever the cart changes. Debounced so rapid +/−
  // taps collapse into a single write.
  const cartSyncTimer = useRef(null);
  const cartSyncedOnce = useRef(false);

  const getDeviceId = () => {
    if (typeof window === "undefined") return "";
    try {
      let id = localStorage.getItem("tbx_device_id");
      if (!id) {
        id =
          "dev_" +
          Math.random().toString(36).slice(2, 10) +
          Date.now().toString(36);
        localStorage.setItem("tbx_device_id", id);
      }
      return id;
    } catch {
      return "";
    }
  };

  const getCartIdentity = () => {
    if (typeof window === "undefined")
      return { key: "", phone: "", name: "", deviceId: "" };
    let phone = "";
    let name = "";
    try {
      phone = String(localStorage.getItem("track_orders_phone") || "")
        .replace(/\D/g, "")
        .slice(-10);
      name = String(localStorage.getItem("track_orders_name") || "").trim();
    } catch {}
    const deviceId = getDeviceId();
    // Key by the DEVICE id (stable) so that when the shopper logs in or enters
    // their name/number later, we update that same row instead of creating a new
    // one. Phone & name are carried as columns.
    return { key: deviceId, phone, name, deviceId };
  };

  const sendCartSnapshot = () => {
    if (typeof window === "undefined") return;
    const { key, phone, name, deviceId } = getCartIdentity();
    if (!key) return;
    const lines = cart.map((ci) => {
      const b = books.find((x) => x.id === ci.id);
      const nm = b?.name || ci.id;
      const q = ci.qty || 1;
      return q > 1 ? `${nm} x${q}` : nm;
    });
    const itemCount = cart.reduce((s, ci) => s + (ci.qty || 1), 0);
    const payload = {
      cartKey: key,
      name,
      phone,
      deviceId,
      books: lines.join(", "),
      itemCount,
      cartValue: cartTotal,
      source: `${window.location.pathname || ""}`,
    };
    try {
      fetch("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  // Mark the shopper's cart row as Converted once an order is placed.
  const markCartConverted = (orderId, phone) => {
    if (typeof window === "undefined") return;
    const { key, deviceId } = getCartIdentity();
    const cartKey = key || deviceId;
    if (!cartKey) return;
    const digits = String(phone || "").replace(/\D/g, "").slice(-10);
    try {
      fetch("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convert",
          cartKey,
          orderId,
          phone: digits,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  // Push the shopper's name/number onto their existing cart row once they become
  // known (login, scratch-card modal, checkout) — without touching the books.
  const lastIdentSig = useRef("");
  const maybeSyncIdentity = () => {
    if (typeof window === "undefined") return;
    const { deviceId, phone, name } = getCartIdentity();
    if (!deviceId) return;
    if (!phone && !name) return;
    const sig = `${phone}|${name}`;
    if (sig === lastIdentSig.current) return;
    lastIdentSig.current = sig;
    try {
      fetch("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "identity",
          cartKey: deviceId,
          phone,
          name,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only track once there's something in the bag; after that, keep syncing
    // (including emptying) so the sheet reflects the live cart.
    if (cart.length === 0 && !cartSyncedOnce.current) return;
    cartSyncedOnce.current = true;
    if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current);
    cartSyncTimer.current = setTimeout(sendCartSnapshot, 2500);
    return () => {
      if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, cartTotal]);

  // Watch for the shopper becoming identified (phone/name saved by any modal in
  // this tab) and update their cart row. Same-tab localStorage writes don't fire
  // a storage event, so we poll lightly + check on focus/visibility.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const iv = setInterval(maybeSyncIdentity, 5000);
    const onFocus = () => maybeSyncIdentity();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return hasOneRupeeItem ? 199 : 99;
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
        markCartConverted,
        // QuickReads cart
        qrCart,
        addQuickRead,
        removeQuickRead,
        isInQrCart,
        clearQrCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
