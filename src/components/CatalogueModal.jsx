"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import { useEffect } from "react";

export default function CatalogueModal({ category, onClose }) {
  const filteredBooks = books.filter((book) =>
    book.catalogue?.includes(category)
  );

  // Capitalize category for heading
  const title =
    category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="catalogue-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="catalogue-modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              onClick={onClose}
              className="flex items-center sec-mid-btn"
              aria-label="Close catalogue"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body grid-2">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <p className="empty-state">No books available in this category</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
