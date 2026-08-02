"use client";

import BookCard from "@/components/BookCard";
import RecommendationModal from "@/components/RecommendationModal";
import { books } from "@/utils/book";
import { hasQuickRead, QUICKREAD_PRICE } from "@/data/quickreads";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Zap, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const normalize = (str = "") => str.toLowerCase().trim();

// "Loose" form — lowercase with every non-alphanumeric char removed. Lets
// "off cam", "off-cam" and "offcam" all match "The Off-Campus Set".
const loose = (str = "") => str.toLowerCase().replace(/[^a-z0-9]+/g, "");

// Slug for a book's QuickReads page (matches the rest of the app).
const qrSlug = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
  // Recent searches (persisted in localStorage), shown as scrollable chips.
  const [recentSearches, setRecentSearches] = useState([]);
  const chipsRef = useRef(null);

  // Load saved searches whenever the overlay opens.
  useEffect(() => {
    if (!open) return;
    try {
      const saved = JSON.parse(localStorage.getItem("recent_searches") || "[]");
      if (Array.isArray(saved)) setRecentSearches(saved.filter(Boolean).slice(0, 12));
    } catch (_) {}
  }, [open]);

  const scrollChips = (dir) => {
    const el = chipsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  const removeRecent = (term) => {
    setRecentSearches((prev) => {
      const next = prev.filter((r) => r !== term);
      try {
        localStorage.setItem("recent_searches", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

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
        // Loose query (punctuation/space stripped) + individual word tokens.
        const looseQ = loose(debouncedQuery);
        const tokens = debouncedQuery
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(Boolean);

        // Split a field into its words.
        const wordsOf = (str) =>
          str.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

        // Every query token must be a PREFIX of some word (order-independent) —
        // so "off" matches the word "off" in "Off-Campus" but NOT the "off"
        // buried inside "coffee". Handles "off cam", "campus off", etc.
        const everyTokenIsWordPrefix = (words) =>
          tokens.length > 0 &&
          tokens.every((t) => words.some((w) => w.startsWith(t)));

        // The glued query (spaces/hyphens removed) must match starting AT a word
        // boundary — so "offcampus" / "off c" match "Off-Campus" but not the
        // mid-word "off" in "coffee".
        const startsAtWordBoundary = (words) => {
          if (!looseQ) return false;
          for (let i = 0; i < words.length; i++) {
            let joined = "";
            for (let j = i; j < words.length && joined.length < looseQ.length; j++) {
              joined += words[j];
            }
            if (joined.startsWith(looseQ)) return true;
          }
          return false;
        };

        // 1️⃣ Name match
        const nameWords = wordsOf(book.name);
        const nameMatch =
          startsAtWordBoundary(nameWords) || everyTokenIsWordPrefix(nameWords);

        // 2️⃣ Author match
        const authorWords = wordsOf(book.author);
        const authorMatch =
          startsAtWordBoundary(authorWords) ||
          everyTokenIsWordPrefix(authorWords);

        // 3️⃣ Catalogue match
        const catalogueMatch =
          looseQ && book.catalogue?.some((cat) => loose(cat).includes(looseQ));

        // 4️⃣ Price match
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

        return nameMatch || authorMatch || catalogueMatch || priceMatch;
      });

  // Save a search term to recents once it settles with results. Collapses the
  // typing chain (e.g. "off" then "off cam" keeps only "off cam") and dedupes.
  useEffect(() => {
    const term = debouncedQuery.trim();
    if (!open || term.length < 2 || filteredBooks.length === 0) return;
    setRecentSearches((prev) => {
      const tl = term.toLowerCase();
      const cleaned = prev.filter((r) => {
        const rl = r.toLowerCase();
        return rl !== tl && !tl.startsWith(rl);
      });
      const next = [term, ...cleaned].slice(0, 12);
      try {
        localStorage.setItem("recent_searches", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, open]);

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

  // Grid items: each matched book, plus a QuickReads card right beside any
  // book that has a QuickRead (rendered as a normal card with a QR badge).
  const gridItems = [];
  sortedBooks.forEach((book) => {
    gridItems.push({ type: "book", book });
    if (hasQuickRead(book.id)) gridItems.push({ type: "qr", book });
  });

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

              {/* Recent searches — horizontally scrollable chips with arrows */}
              {recentSearches.length > 0 && (
                <div className="search-recent">
                  <button
                    type="button"
                    className="sr-arrow"
                    onClick={() => scrollChips("left")}
                    aria-label="Scroll recent searches left"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="sr-chips" ref={chipsRef}>
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        className="sr-chip"
                        onClick={() => setQuery(term)}
                      >
                        <Clock size={12} />
                        <span className="sr-chip-t">{term}</span>
                        <button
                          type="button"
                          className="sr-chip-x"
                          aria-label={`Remove ${term}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecent(term);
                          }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="sr-arrow"
                    onClick={() => scrollChips("right")}
                    aria-label="Scroll recent searches right"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

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
                        {gridItems.map((item, idx) => (
                        <motion.div
                          key={`${item.type}-${item.book.id}`}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: Math.min(idx * 0.03, 0.3),
                            ease: "easeOut",
                          }}
                        >
                          {item.type === "book" ? (
                            <BookCard book={item.book} />
                          ) : (
                            <Link
                              href={`/quickreads/${qrSlug(item.book.name)}`}
                              className="search-qr-item"
                              onClick={onClose}
                            >
                              <div className="search-qr-item-cover">
                                <img src={item.book.image} alt={item.book.name} />
                                <span className="search-qr-badge">
                                  <Zap size={11} /> QuickRead
                                </span>
                              </div>
                              <span className="search-qr-item-name">
                                {item.book.name}
                              </span>
                              <span className="search-qr-item-price">
                                ₹{QUICKREAD_PRICE}
                              </span>
                            </Link>
                          )}
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
