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

      {/* Heart Icon — white by default (with shadow) so it reads on covers */}
      <Heart
        size={24}
        fill={inWishlist ? "#ef4444" : "#ffffff"}
        stroke={inWishlist ? "#ffffff" : "rgba(0,0,0,0.28)"}
        strokeWidth={1.5}
        style={{
          position: "relative",
          zIndex: 2,
          filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
        }}
      />
    </button>
  );
}
