"use client";

import BookCard from "@/components/BookCard";
import RecommendationModal from "@/components/RecommendationModal";
import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
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

export default function SearchOverlay({ open, onClose, initialSuggest = false }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sortType, setSortType] = useState("relevance");
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  // Auto focus input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Open straight into the recommendation ("suggest") flow when requested.
  useEffect(() => {
    if (open && initialSuggest) setShowRecommendationModal(true);
  }, [open, initialSuggest]);

  // Debounce the query, keeps filtering off the main thread on every keystroke
  // so typing stays smooth even on large book lists. The loader shows during
  // the debounce window so the user gets visual feedback that search is happening.
  useEffect(() => {
    if (!query) {
      setDebouncedQuery("");
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  // ESC key close, but don't close SearchOverlay if RecommendationModal is open
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !showRecommendationModal) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, showRecommendationModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // Clean state when the modal closes, next open starts fresh
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setIsSearching(false);
    }
  }, [open]);

  // Filter uses the debounced query so it only runs after the user pauses typing
  const filteredBooks = !debouncedQuery
    ? []
    : books.filter((book) => {
        const q = normalize(debouncedQuery);

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

  // Apply the chosen sort to the matched results (relevance keeps match order)
  const sortedBooks = (() => {
    const data = [...filteredBooks];
    if (sortType === "low") data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    else if (sortType === "high") data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    else if (sortType === "discount")
      data.sort(
        (a, b) =>
          b.originalPrice - b.discountedPrice - (a.originalPrice - a.discountedPrice),
      );
    return data;
  })();

  // Encode search term for WhatsApp
  const whatsappMessage = `Hey hi! I'm looking for a book related to "${query}" but couldn't find it on TheBookX. Could you please help me find it?`;

  const handleClearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <>
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
              {/* Header, input with inline clear-X (only when typing) */}
              <div className="search-header">
                <div
                  className="search-input-wrapper"
                  style={{
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search by name, category, or price (e.g. fiction, 129, under 200)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                    style={{ paddingRight: 38, width: "100%" }}
                  />

                  <AnimatePresence>
                    {query && (
                      <motion.button
                        type="button"
                        key="clear-btn"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleClearInput}
                        aria-label="Clear search"
                        style={{
                          position: "absolute",
                          right: 10,
                          transform: "translateY(-50%)",
                          background: "var(--dark-10)",
                          border: "none",
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--dark-50)",
                          padding: 0,
                        }}
                      >
                        <X size={12} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Body, animated between placeholder / loader / empty / results */}
              <div className="search-body" style={{ paddingBottom: 100 }}>
                <AnimatePresence mode="wait">
                  {!query ? (
                    <motion.p
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="empty-state"
                    >
                      Type something to search for books...
                    </motion.p>
                  ) : isSearching ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 16px",
                        gap: 12,
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{ color: "var(--tertiary, #fb8500)" }}
                      >
                        <Loader2 size={28} />
                      </motion.div>
                      <span className="font-12 dark-50">
                        Searching books...
                      </span>
                    </motion.div>
                  ) : filteredBooks.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="empty-state"
                    >
                      <span className="font-16 weight-500">
                        Can&apos;t find the book you&apos;re looking for?
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
                        <button
                          type="button"
                          onClick={() => setShowRecommendationModal(true)}
                          aria-label="Get book suggestions"
                          className="cursor-pointer sec-big-btn"
                          style={{
                            minWidth: "fit-content",
                            maxWidth: "fit-content",
                            margin: "8px auto",
                          }}
                        >
                          or Need suggestion?
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`results-${debouncedQuery}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* Result count + sort controls */}
                      <div
                        className="flex flex-row items-center justify-between flex-wrap gap-8"
                        style={{ padding: "4px 4px 14px" }}
                      >
                        <span className="font-12 dark-50">
                          <b style={{ color: "var(--foreground)" }}>
                            {sortedBooks.length}
                          </b>{" "}
                          {sortedBooks.length === 1 ? "result" : "results"} for
                          &ldquo;{debouncedQuery}&rdquo;
                        </span>
                        <div className="flex flex-row flex-wrap gap-8">
                          {[
                            { k: "relevance", l: "Relevance" },
                            { k: "low", l: "Price ↑" },
                            { k: "high", l: "Price ↓" },
                            { k: "discount", l: "Discount" },
                          ].map((s) => (
                            <button
                              key={s.k}
                              className={`sec-mid-btn ${sortType === s.k ? "active" : ""}`}
                              onClick={() => setSortType(s.k)}
                            >
                              {s.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="book-grid">
                        {sortedBooks.map((book, idx) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: Math.min(idx * 0.03, 0.3),
                            ease: "easeOut",
                          }}
                        >
                          <BookCard book={book} />
                        </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Fixed bottom-right close FAB, always visible, even when scrolled */}
              <motion.button
                type="button"
                key="close-fab"
                initial={{ opacity: 0, scale: 0.7, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 12 }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
                onClick={onClose}
                aria-label="Close search"
                style={{
                  position: "fixed",
                  bottom: 24,
                  right: 24,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "var(--foreground, #0a0a0a)",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.28)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10000,
                }}
              >
                <X size={22} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation modal, rendered as sibling so it layers above search */}
      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
    </>
  );
}
