// components/LockedRupeeModal.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";

export default function LockedRupeeModal({ isOpen, onClose }) {
  const { cartTotal } = useStore();
  const remaining = Math.max(0, 299 - cartTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 10000 }}
        >
          <motion.div
            className="bill-modal unlock-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ textAlign: "center" }}
          >
            <button className="unlock-modal-close" onClick={onClose}>
              <X size={18} />
            </button>

            <div className="locked-modal-icon">🔒</div>

            <h2 className="locked-modal-title">₹1 Books Are Locked</h2>

            <p className="locked-modal-description">
              Add <strong>₹{remaining} more</strong> worth of books to your cart
              to unlock all ₹1 books permanently!
            </p>

            <div className="locked-modal-buttons">
              <button
                className="pri-big-btn"
                onClick={() => {
                  onClose();
                  document
                    .querySelector(".catalogue-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <ShoppingBag size={16} />
                Shop More Books
              </button>

              <a
                href="https://wa.me/917710892108?text=Hi%2C%20I%20want%20to%20know%20more%20about%20the%20₹1%20book%20offer"
                target="_blank"
                rel="noopener noreferrer"
                className="sec-mid-btn"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
