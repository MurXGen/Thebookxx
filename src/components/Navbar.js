"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import SearchMain from "./UI/SearchMain";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <header className="navbar-wrapper">
      {/* 🔥 Mobile promo strip */}
      <div className="mobile-offer-strip">
        <motion.span
          className="badge-star"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <Star size={14} />
        </motion.span>
        <span className="offer-text">
          Get upto <strong>₹500 OFF</strong> — T&C apply
        </span>
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
  );
}
