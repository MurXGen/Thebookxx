"use client";

import { Heart, Star, Menu, X, MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import SearchMain from "./UI/SearchMain";
import { AnimatePresence, motion } from "framer-motion";
import { CART_OFFERS } from "@/utils/cartOffers";
import InstallPWA from "./InstallPWA";
import Link from "next/link";

export default function Navbar() {
  const [index, setIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % CART_OFFERS.length);
    }, 3000); // change every 3s

    return () => clearInterval(interval);
  }, []);

  const currentOffer = CART_OFFERS[index];

  // Menu links data
  const menuLinks = [
    { name: "Terms and Conditions", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Refund Policy", path: "/refund" },
    { name: "Shipping Policy", path: "/shipping" },
  ];

  return (
    <>
      <header className="navbar-wrapper">
        <div className="flex flex-row justify-between">
          <div className="mobile-offer-strip width100">
            {/* rotating star */}
            <motion.span
              className="badge-star"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <Star size={14} />
            </motion.span>

            {/* sliding text */}
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
        </div>
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
          <div className="nav-center flex flex-col justify-center items-center">
            <span className="logo-text">TheBookX</span>
            <span className="font-10">Formerly Uskillbook</span>
          </div>

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

            <a href="/bag" aria-label="Cart">
              <HiOutlineShoppingBag size={32} />
            </a>
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
                <span className="menu-title">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="menu-close"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="menu-links">
                {menuLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="menu-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <InstallPWA />
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
