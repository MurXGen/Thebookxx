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

// Rotating trust promos shown in the black stripe below the navbar.
// Meaningful, contextual one-liners (white text, colour-accented icon).
const TRUST_PROMOS = [
  { icon: Truck, label: "Free delivery on every order across India", color: "#22c55e" },
  { icon: Wallet, label: "Pay cash on delivery — order worry-free", color: "#60a5fa" },
  { icon: ShieldCheck, label: "Trusted by thousands of happy readers", color: "#fbbf24" },
  { icon: Sparkles, label: "Grab bestselling books from just ₹1", color: "#f472b6" },
];

function RotatingTrust() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % TRUST_PROMOS.length), 2200);
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart } = useStore();
  const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % CART_OFFERS.length);
    }, 3000); // change every 3s

    return () => clearInterval(interval);
  }, []);

  const currentOffer = CART_OFFERS[index];

  // Menu links data
  const menuLinks = [
    { name: "List your books", path: "/list-your-books" },
    { name: "About us", path: "/about-us" },
    { name: "Terms and Conditions", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Refund Policy", path: "/refund" },
    { name: "Shipping Policy", path: "/shipping" },
    { name: "Contact us", path: "/contact-us" },
  ];

  return (
    <>
      <header className="navbar-wrapper">
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
        {/* 🔥 Mobile promo strip */}

        <nav className="navbar section-1200">
          {/* LEFT — menu + WhatsApp */}
          <div className="nav-left">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
              className="menu-button nav-ic"
            >
              <MenuIcon size={26} />
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
          </div>

          {/* CENTER — brand + former-name tagline */}
          <div className="nav-center-brand">
            <Link href="/" aria-label="TheBookX home" className="nav-brand">
              <span className="logo-text">TheBookX</span>
              <span className="nav-brand-sub">formerly Uskillbook</span>
            </Link>
          </div>

          {/* RIGHT — search + cart */}
          <div className="nav-right">
            <button
              type="button"
              className="nav-ic"
              onClick={() => setSearchOpen(true)}
              aria-label="Search books"
            >
              <Search size={24} />
            </button>
            <Link href="/bag" aria-label="Cart" className="nav-ic nav-cart">
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

      {/* Full Screen Menu Component */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sliding Menu */}
            <motion.div
              className="menu-slide-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="menu-header">
                <span className="menu-title">TheBookX</span>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="menu-close"
                >
                  <X size={28} />
                </button>
              </div>

              {/* TOP LINKS */}
              <div className="menu-links">
                <Link
                  href="/profile"
                  className="menu-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/books"
                  className="menu-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Books
                </Link>

                <Link
                  href="/category"
                  className="menu-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </Link>

                <Link
                  href="/reading-tracker"
                  className="menu-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reading Tracker
                </Link>

                <Link
                  href="/bag"
                  className="menu-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Cart
                </Link>

                <Link
                  href="https://thebookx.in?suggest"
                  className="menu-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Suggestion
                </Link>
              </div>

              {/* BOTTOM POLICY LINKS */}
              <div className="menu-links">
                {menuLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className=" font-12"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
