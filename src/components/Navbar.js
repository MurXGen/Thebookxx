"use client";

import { Heart, Star, Menu, X, MenuIcon, User } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import SearchMain from "./UI/SearchMain";
import { AnimatePresence, motion } from "framer-motion";
import { CART_OFFERS } from "@/utils/cartOffers";
import InstallPWA from "./InstallPWA";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

export default function Navbar() {
  const [index, setIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          {/* LEFT (mobile: menu + wishlist) */}
          <div className="nav-left">
            {/* Menu Icon */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
              className="menu-button"
            >
              <MenuIcon size={32} />
            </button>

            <a href="/wishlist" aria-label="Wishlist">
              <Heart fill="red" stroke="none" size={32} />
            </a>
          </div>

          {/* CENTER LOGO */}
          <Link
            href="/"
            aria-label="TheBookX home"
            className="nav-center flex flex-col justify-center items-center"
          >
            <span className="logo-text">TheBookX</span>
            <span className="font-10">Formerly Uskillbook</span>
          </Link>

          {/* RIGHT ICONS */}
          <div className="nav-right">
            <a
              href="https://wa.me/917710892108"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={32} color="#25D366" />
            </a>

            <Link href="/profile" aria-label="My profile" className="nav-profile">
              <User size={28} />
            </Link>

            <Link href="/bag" aria-label="Cart" className="nav-cart">
              <HiOutlineShoppingBag size={32} />
              {cartCount > 0 && (
                <span className="nav-cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
        {/* 🔍 Search below navbar (mobile only) */}
        <div className="mobile-search">
          <SearchMain />
        </div>
      </header>

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
