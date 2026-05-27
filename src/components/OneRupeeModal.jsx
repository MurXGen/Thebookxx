"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Clock, Lock } from "lucide-react";
import { useEffect, useMemo } from "react";

/**
 * OneRupeeModal — sliding bottom-sheet that lists all ₹1 books.
 *
 * Props:
 *   isOpen          : boolean
 *   onClose         : () => void
 *   mode            : "permanentUnlocked" | "timerActive" | "locked" (default: "permanentUnlocked")
 *   remainingForUnlock : number   // only used for "locked" subtitle
 *   liveRemainingTime  : number   // seconds; only used for "timerActive" subtitle
 *   onAddBooksClick    : () => void  // optional CTA in locked state (e.g. scroll to catalogue)
 */
export default function OneRupeeModal({
  isOpen,
  onClose,
  mode = "permanentUnlocked",
  remainingForUnlock = 0,
  liveRemainingTime = 0,
  onAddBooksClick,
}) {
  // Filter all ₹1 books from the catalogue, in-stock first
  const oneRupeeBooks = useMemo(() => {
    return books
      .filter((b) => b.discountedPrice === 1)
      .sort((a, b) => {
        // Prioritize in-stock books
        const aInStock = (a.stock || 0) > 0 ? 1 : 0;
        const bInStock = (b.stock || 0) > 0 ? 1 : 0;
        if (aInStock !== bInStock) return bInStock - aInStock;
        return 0;
      });
  }, []);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Subtitle based on mode
  const getSubtitle = () => {
    if (mode === "timerActive" && liveRemainingTime > 0) {
      const mins = Math.floor(liveRemainingTime / 60);
      const secs = (liveRemainingTime % 60).toString().padStart(2, "0");
      return (
        <span className="flex flex-row items-center gap-4">
          <Clock size={12} />
          Grab them before{" "}
          <strong>
            {mins}:{secs}
          </strong>{" "}
          runs out
        </span>
      );
    }
    if (mode === "locked") {
      return (
        <span className="flex flex-row items-center gap-4">
          <Lock size={12} />
          Add ₹{remainingForUnlock} more to your cart to unlock these
        </span>
      );
    }
    return (
      <span>
        Add any one of these to your cart for just <strong>₹1</strong>
      </span>
    );
  };

  const headerTitle =
    mode === "locked" ? "₹1 Book Deals (Locked)" : "Your ₹1 Book Deals";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bill-modal one-rupee-modal"
            style={{ maxHeight: "85vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bill-header">
              <div className="flex flex-col gap-4">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <Sparkles size={16} color="#fb8500" />
                  {headerTitle}
                </span>
                <span className="font-12 dark-50">{getSubtitle()}</span>
              </div>
              <span className="cursor-pointer" onClick={onClose}>
                <X size={16} />
              </span>
            </div>

            {/* Scrollable body */}
            <div
              className="address-form-content"
              style={{ overflowY: "auto", maxHeight: "70vh" }}
            >
              {oneRupeeBooks.length > 0 ? (
                <>
                  <div className="one-rupee-stats flex flex-row items-center justify-between mb-12">
                    <span className="font-12 dark-50">
                      {oneRupeeBooks.length} books available at ₹1
                    </span>
                    {mode === "permanentUnlocked" && (
                      <span className="font-12 green weight-600">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>

                  <div className="grid-2">
                    {oneRupeeBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </>
              ) : (
                <div
                  className="empty-state flex flex-col items-center gap-12"
                  style={{ padding: "32px 16px" }}
                >
                  <span className="font-16 weight-500">
                    No ₹1 books available right now
                  </span>
                  <span className="font-12 dark-50">
                    Check back soon for new deals!
                  </span>
                </div>
              )}

              {/* Locked-state CTA at the bottom */}
              {mode === "locked" && onAddBooksClick && (
                <div className="mt-16 flex flex-col gap-8">
                  <button
                    className="pri-big-btn width100"
                    onClick={() => {
                      onAddBooksClick();
                      onClose();
                    }}
                  >
                    Add ₹{remainingForUnlock} more to unlock
                  </button>
                  <span className="font-12 dark-50 text-center">
                    Browse the catalogue and add books worth ₹
                    {remainingForUnlock} or more
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
