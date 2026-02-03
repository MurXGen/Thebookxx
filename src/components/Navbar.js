"use client";

import { Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import SearchMain from "./UI/SearchMain";
import { AnimatePresence, motion } from "framer-motion";
import { CART_OFFERS } from "@/utils/cartOffers";
import InstallPWA from "./InstallPWA";

export default function Navbar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % CART_OFFERS.length);
    }, 3000); // change every 3s

    return () => clearInterval(interval);
  }, []);

  const currentOffer = CART_OFFERS[index];

  return (
    <>
      <InstallPWA />
      <header className="navbar-wrapper">
        {/* 🔥 Mobile promo strip */}
        <div className="mobile-offer-strip">
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

        <nav className="navbar section-1200">
          {/* LEFT (mobile: wishlist) */}
          <div className="nav-left">
            <a href="/wishlist" aria-label="Wishlist">
              <Heart fill="red" stroke="none" size={22} />
            </a>
          </div>

          {/* CENTER LOGO */}
          <div className="nav-center">
            <span className="logo-text">TheBookX</span>
          </div>

          {/* RIGHT ICONS */}
          <div className="nav-right">
            <a
              href="https://wa.me/917710892108"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={22} color="#25D366" />
            </a>

            <a href="/bag" aria-label="Cart">
              <HiOutlineShoppingBag size={24} />
            </a>
          </div>
        </nav>

        {/* 🔍 Search below navbar (mobile only) */}
        <div className="mobile-search">
          <SearchMain />
        </div>
      </header>
    </>
  );
}

/* helper */
function formatOfferMessage(offer) {
  if (offer.type === "flat") {
    return (
      <>
        Get <strong className="shinny-icon">₹{offer.value} OFF</strong> on
        orders above {offer.target}
      </>
    );
  }

  if (offer.type === "percentage") {
    return (
      <>
        Get <strong className="shinny-icon">Free delivery</strong> on orders
        above {offer.target}
      </>
    );
  }

  return (
    <>
      <strong className="shinny-icon">Confirm order</strong> on orders above{" "}
      {offer.target}
    </>
  );
}
