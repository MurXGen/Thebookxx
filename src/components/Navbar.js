"use client";

import { BaggageClaim } from "lucide-react";
import { useState } from "react";
import { FiMenu, FiMessageCircle, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar-wrapper">
      <nav className="flex flex-row justify-between items-center section-1200">
        {/* Left / Logo */}
        <div className="leftSection">
          <span className="font-20 weight-700">TheBookX</span>
        </div>

        {/* Desktop Links */}
        <div className="nav-links-desktop flex flex-row gap-32 items-center">
          <a href="/wishlist" className="font-14">
            Wishlist
          </a>
          <a href="/bag" className="font-14">
            Cart
          </a>
          <a href="/about" className="font-14">
            About Us
          </a>
          <a href="/contact" className="font-14">
            Contact
          </a>

          {/* <a href="/help" className="help-btn">
            Need Help?
          </a> */}
        </div>

        <div className="flex flex-row gap-12">
          <a
            className="cursor-pointer"
            href="https://wa.me/917710892108"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <FaWhatsapp size={24} />
          </a>

          <a className="cursor-pointer" href="/bag">
            <BaggageClaim size={24} />
          </a>
          <button
            className="nav-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`nav-mobile ${open ? "open" : ""}`}>
        <a href="/wishlist" onClick={() => setOpen(false)}>
          Wishlist
        </a>
        <a href="/bag" onClick={() => setOpen(false)}>
          Cart
        </a>
        <a href="/about" onClick={() => setOpen(false)}>
          About Us
        </a>
        <a href="/contact" onClick={() => setOpen(false)}>
          Contact
        </a>
        <a href="/help" onClick={() => setOpen(false)}>
          Need Help
        </a>
      </div>
    </header>
  );
}
