"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function WishlistButton({ inWishlist, onClick }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, id]);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="add-wishlist"
      style={{ background: "none", border: "none" }}
    >
      {/* Ripple */}
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.span
            key={id}
            className="ripple"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() =>
              setRipples((prev) => prev.filter((r) => r !== id))
            }
          />
        ))}
      </AnimatePresence>

      {/* Heart Icon */}
      <Heart
        size={24}
        fill={inWishlist ? "red" : "grey"}
        style={{ position: "relative", zIndex: 2 }}
      />
    </button>
  );
}
