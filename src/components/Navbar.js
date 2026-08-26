"use client";

import {
  Heart,
  Star,
  Menu,
  X,
  MenuIcon,
  User,
  Search,
  Truck,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import SearchMain from "./UI/SearchMain";
import SearchOverlay from "./SearchOverlay";
import { AnimatePresence, motion } from "framer-motion";
import { CART_OFFERS } from "@/utils/cartOffers";
import InstallPWA from "./InstallPWA";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { trackEvent } from "@/lib/ga";

// Rotating trust promos shown in the black stripe below the navbar.
// Meaningful, contextual one-liners (white text, colour-accented icon).
const TRUST_PROMOS = [
  {
    icon: Truck,
    label: "Free delivery on every order across India",
    color: "#22c55e",
  },
  {
    icon: Wallet,
    label: "Pay cash on delivery — order worry-free",
    color: "#60a5fa",
  },
  {
    icon: ShieldCheck,
    label: "Trusted by thousands of happy readers",
    color: "#fbbf24",
  },
  {
    icon: Sparkles,
    label: "Grab bestselling books from just ₹1",
    color: "#f472b6",
  },
];

function RotatingTrust() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((p) => (p + 1) % TRUST_PROMOS.length),
      2200,
    );
    return () => clearInterval(t);
  }, []);
  const { icon: Icon, label, color } = TRUST_PROMOS[i];
  return (
    <div className="nav-trust">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="nav-trust-item"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <span className="nav-trust-ic">
            <Icon size={15} strokeWidth={2.25} />
          </span>
          <span className="nav-trust-label">{label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [index, setIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletExpiring, setWalletExpiring] = useState(0);
  const [showExpiryTip, setShowExpiryTip] = useState(false);
  const { cart, qrCart } = useStore();

  // Load the shopper's wallet balance (+ expiry warning) for the header chip.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { getSavedPhone } = await import("@/utils/userPhone");
        const phone = getSavedPhone();
        if (!phone) return;
        const { fetchWalletLedger } = await import("@/utils/walletLedger");
        const led = await fetchWalletLedger(phone);
        if (!alive) return;
        setWalletBalance(led.balance);
        setWalletExpiring(led.expiringSoon);
        if (led.expiringSoon > 0) {
          setShowExpiryTip(true);
          setTimeout(() => alive && setShowExpiryTip(false), 8000);
        }
      } catch (_) {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Navbar stays fixed/visible at all times (does not hide on scroll).
  const cartCount =
    cart.reduce((sum, i) => sum + (i.qty || 1), 0) + (qrCart?.length || 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % CART_OFFERS.length);
    }, 3000); // change every 3s

    return () => clearInterval(interval);
  }, []);

  const currentOffer = CART_OFFERS[index];

  return (
    <>
      <header className={`navbar-wrapper${navHidden ? " nav-hidden" : ""}`}>
        {/* <div className="flex flex-row justify-between">
          <div className="mobile-offer-strip width100">

            <motion.span
              className="badge-star"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <Star size={14} />
            </motion.span>


            <div className="offer-text-wrapper">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  className="offer-text"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {formatOfferMessage(currentOffer)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div> */}
        {/* Mobile promo strip */}

        <nav className="navbar section-1200">
          {/* LEFT — brand */}
          <div className="nav-left">
            <Link href="/" aria-label="TheBookX home" className="nav-brand">
              <span className="logo-text">TheBookX</span>
              <span className="nav-brand-sub">formerly Uskillbook</span>
            </Link>
          </div>

          {/* RIGHT — search, WhatsApp, profile, cart */}
          <div className="nav-right">
            <button
              type="button"
              className="nav-ic"
              onClick={() => {
                trackEvent("search_opened", { source: "navbar" });
                setSearchOpen(true);
              }}
              aria-label="Search books"
            >
              <Search size={24} />
            </button>
            <a
              href="https://wa.me/917710892108"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="nav-ic"
            >
              <FaWhatsapp size={24} color="#25D366" />
            </a>
            <Link
              href="/profile"
              aria-label="Wallet"
              className="nav-ic nav-wallet-chip"
            >
              <Wallet size={22} />
              {walletBalance > 0 && (
                <span className="nav-wallet-badge">₹{walletBalance}</span>
              )}
              {showExpiryTip && walletExpiring > 0 && (
                <span className="nav-wallet-tip" role="status">
                  ₹{walletExpiring} expiring soon — use it on your next order!
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              aria-label="Profile"
              className="nav-ic nav-profile"
            >
              <User size={24} />
            </Link>
            <Link
              href="/bag"
              aria-label="Cart"
              className="nav-ic nav-cart"
              id="cart-fly-target"
            >
              <HiOutlineShoppingBag size={26} />
              {cartCount > 0 && (
                <span className="nav-cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Rotating trust promo — black one-line stripe stuck below the navbar */}
        <div className="nav-trust-stripe">
          <RotatingTrust />
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* helper */
function formatOfferMessage(offer) {
  if (offer.type === "flat") {
    return (
      <>
        Get <strong className="shinny-icon">₹{offer.value} OFF</strong> on
        orders above ₹{offer.target}
      </>
    );
  }

  if (offer.type === "percentage") {
    return (
      <>
        Get <strong className="shinny-icon">Free delivery</strong> on orders
        above ₹{offer.target}
      </>
    );
  }

  return (
    <>
      <strong className="shinny-icon">Confirm order</strong> on orders above ₹
      {offer.target}
    </>
  );
}
