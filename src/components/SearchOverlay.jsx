"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const normalize = (str = "") => str.toLowerCase().trim();

const parsePriceQuery = (query) => {
  const q = normalize(query);

  if (/^\d+$/.test(q)) {
    return { type: "exact", value: Number(q) };
  }

  if (q.startsWith("under ") || q.startsWith("below ")) {
    return { type: "lt", value: Number(q.replace(/\D/g, "")) };
  }

  if (q.startsWith("above ") || q.startsWith("over ")) {
    return { type: "gt", value: Number(q.replace(/\D/g, "")) };
  }

  if (q.startsWith("<")) {
    return { type: "lt", value: Number(q.replace(/\D/g, "")) };
  }

  if (q.startsWith(">")) {
    return { type: "gt", value: Number(q.replace(/\D/g, "")) };
  }

  return null;
};

export default function SearchOverlay({ open, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  // Auto focus input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ESC key close
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const filteredBooks = books.filter((book) => {
    if (!query) return false;

    const q = normalize(query);

    // 1️⃣ Name match
    const nameMatch = normalize(book.name).includes(q);

    // 2️⃣ Catalogue match
    const catalogueMatch = book.catalogue?.some((cat) =>
      normalize(cat).includes(q),
    );

    // 3️⃣ Price match
    const priceRule = parsePriceQuery(q);
    let priceMatch = false;

    if (priceRule) {
      if (priceRule.type === "exact") {
        priceMatch = book.discountedPrice === priceRule.value;
      }
      if (priceRule.type === "lt") {
        priceMatch = book.discountedPrice < priceRule.value;
      }
      if (priceRule.type === "gt") {
        priceMatch = book.discountedPrice > priceRule.value;
      }
    }

    return nameMatch || catalogueMatch || priceMatch;
  });

  // Encode search term for WhatsApp
  const encodedSearchTerm = encodeURIComponent(query);
  const whatsappMessage = `Hey hi! I'm looking for a book related to "${query}" but couldn't find it on TheBookX. Could you please help me find it?`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="search-modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="search-header">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, category, or price (e.g. fiction, 129, under 200)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />

              <button
                onClick={onClose}
                className="flex items-center sec-mid-btn"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="search-body">
              {query ? (
                <>
                  {filteredBooks.length === 0 ? (
                    <div className="empty-state">
                      <span className="font-16 weight-500">
                        Can’t find the book you’re looking for?
                      </span>
                      <div className="flex flex-col width100 gap-12">
                        <a
                          href={`https://wa.me/917710892108?text=${encodeURIComponent(whatsappMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Chat with us on WhatsApp"
                          className="cursor-pointer pri-big-btn"
                          style={{
                            minWidth: "fit-content",
                            maxWidth: "fit-content",
                            margin: "8px auto",
                          }}
                        >
                          Ask on WhatsApp
                        </a>
                        <a
                          href="https://thebookx.in?suggest"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Chat with us on WhatsApp"
                          className="cursor-pointer sec-big-btn"
                          style={{
                            minWidth: "fit-content",
                            maxWidth: "fit-content",
                            margin: "8px auto",
                          }}
                        >
                          or Need suggestion?
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="book-grid">
                      {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="empty-state">
                  Type something to search for books...
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
