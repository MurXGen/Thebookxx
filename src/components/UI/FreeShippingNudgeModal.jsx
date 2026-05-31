"use client";

import BookCard from "@/components/BookCard";
import { books } from "@/utils/book";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";

const FREE_SHIPPING_THRESHOLD = 399;
const INITIAL_DISPLAY_COUNT = 8;
const LOAD_MORE_COUNT = 8;

/**
 * FreeShippingNudgeModal
 *
 * Shown when:
 *   - user clicks "Confirm Order" AND
 *   - cart is below ₹399 AND
 *   - they haven't already chosen to skip this nudge
 *
 * Visual style mirrors the "Claim Now" sliding strip — orange gradient hero,
 * pulsing shadow, wiggling icon — to draw attention without using fake urgency
 * or manipulative copy. Books are shown using <BookCard /> for consistency
 * with the rest of the catalogue.
 *
 * Props:
 *   open                 : boolean
 *   onClose              : () => void     // X button — stays on bag page
 *   onSkip               : () => void     // "I'm fine to pay delivery"
 *   onProceedAfterUnlock : () => void     // cart reached ₹399 inside this modal
 *   cartBooks            : array          // current cart books (live)
 *   totalDiscounted      : number         // live cart total
 */
export default function FreeShippingNudgeModal({
  open,
  onClose,
  onSkip,
  onProceedAfterUnlock,
  cartBooks = [],
  totalDiscounted = 0,
}) {
  // Capture cart at open time — keeps suggestion list stable as user adds
  const [initialCartIds, setInitialCartIds] = useState(new Set());

  // Lazy loading states
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const [priceFilter, setPriceFilter] = useState("all");

  useEffect(() => {
    if (open) {
      setInitialCartIds(new Set(cartBooks.map((b) => b.id)));
      // Reset display count when modal opens
      setDisplayCount(INITIAL_DISPLAY_COUNT);
      setPriceFilter("all");
    }
  }, [open]);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Categories from cart (for relevance-based suggestions)
  const cartCategories = useMemo(() => {
    const cats = new Set();
    cartBooks.forEach((b) => {
      const catalogue = b.catalogue || [];
      if (Array.isArray(catalogue)) {
        catalogue.forEach((c) => cats.add(c));
      } else if (typeof catalogue === "string") {
        catalogue.split(",").forEach((c) => cats.add(c.trim()));
      }
    });
    return [...cats];
  }, [cartBooks.length]);

  // Get all available books (excluding ₹1 books and out of stock)
  const allAvailableBooks = useMemo(() => {
    return books
      .filter((b) => b.discountedPrice !== 1) // Exclude ₹1 books
      .filter((b) => (b.stock || 0) > 0) // Only in-stock books
      .filter((b) => !initialCartIds.has(b.id)); // Exclude items already in cart
  }, [initialCartIds]);

  // Sort books by price (low to high)
  const booksSortedByPrice = useMemo(() => {
    return [...allAvailableBooks].sort(
      (a, b) => a.discountedPrice - b.discountedPrice,
    );
  }, [allAvailableBooks]);

  // Apply price filter
  const getFilteredByPrice = useCallback(
    (booksList) => {
      switch (priceFilter) {
        case "under-200":
          return booksList.filter((b) => b.discountedPrice < 200);
        case "200-399":
          return booksList.filter(
            (b) => b.discountedPrice >= 200 && b.discountedPrice < 400,
          );
        case "400-599":
          return booksList.filter(
            (b) => b.discountedPrice >= 400 && b.discountedPrice < 600,
          );
        case "600-plus":
          return booksList.filter((b) => b.discountedPrice >= 600);
        default:
          return booksList;
      }
    },
    [priceFilter],
  );

  // Apply category filter (based on cart categories)
  const getFilteredByCategory = useCallback(
    (booksList) => {
      if (cartCategories.length === 0) return booksList;

      return booksList.filter((b) => {
        const catalogue = b.catalogue || [];
        if (Array.isArray(catalogue)) {
          return catalogue.some((c) => cartCategories.includes(c));
        } else if (typeof catalogue === "string") {
          return catalogue
            .split(",")
            .some((c) => cartCategories.includes(c.trim()));
        }
        return false;
      });
    },
    [cartCategories],
  );

  // Get suggested books (prioritize category match, then all books sorted by price)
  const suggestedBooks = useMemo(() => {
    if (!open) return [];

    // First, get books that match cart categories
    const categoryMatchBooks = getFilteredByCategory(booksSortedByPrice);

    if (categoryMatchBooks.length > 0) {
      return categoryMatchBooks.slice(0, displayCount);
    }

    // If no category matches, show all books sorted by price
    return booksSortedByPrice.slice(0, displayCount);
  }, [open, booksSortedByPrice, getFilteredByCategory, displayCount]);

  // Get filtered books for lazy loading
  const filteredBooks = useMemo(() => {
    let result = getFilteredByPrice(booksSortedByPrice);
    result = getFilteredByCategory(result);
    return result;
  }, [booksSortedByPrice, getFilteredByPrice, getFilteredByCategory]);

  // Books to display (with lazy loading)
  const displayedBooks = useMemo(() => {
    return filteredBooks.slice(0, displayCount);
  }, [filteredBooks, displayCount]);

  const hasMoreBooks = displayCount < filteredBooks.length;

  // Load more books (lazy loading)
  const loadMoreBooks = useCallback(() => {
    if (isLoadingMore || !hasMoreBooks) return;

    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount((prev) =>
        Math.min(prev + LOAD_MORE_COUNT, filteredBooks.length),
      );
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMoreBooks, filteredBooks.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!open || !hasMoreBooks) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMoreBooks) {
          loadMoreBooks();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [open, hasMoreBooks, isLoadingMore, loadMoreBooks]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalDiscounted);
  const progressPct = Math.min(
    100,
    (totalDiscounted / FREE_SHIPPING_THRESHOLD) * 100,
  );
  const hasUnlocked = totalDiscounted >= FREE_SHIPPING_THRESHOLD;

  // Price filter options
  const priceFilterOptions = [
    { value: "all", label: "All Prices" },
    { value: "under-200", label: "Under ₹200" },
    { value: "200-399", label: "₹200 - ₹399" },
    { value: "400-599", label: "₹400 - ₹599" },
    { value: "600-plus", label: "₹600 & above" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ maxWidth: "980px", margin: "0 auto" }}
        >
          <motion.div
            className="bill-modal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "92vh", overflowY: "auto" }}
          >
            <div className="bill-header">
              <span className="weight-600 font-16">
                {hasUnlocked ? "Free delivery unlocked" : "Almost there"}
              </span>
              <span className="cursor-pointer" onClick={onClose}>
                <X size={16} />
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* ===== Energetic Hero — Claim-Now style ===== */}
              <motion.div
                animate={
                  hasUnlocked
                    ? {}
                    : {
                        boxShadow: [
                          "0 6px 20px rgba(251, 133, 0, 0.35)",
                          "0 10px 28px rgba(251, 133, 0, 0.55)",
                          "0 6px 20px rgba(251, 133, 0, 0.35)",
                        ],
                      }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  padding: "18px 18px 16px",
                  borderRadius: 14,
                  background: hasUnlocked
                    ? "linear-gradient(135deg, var(--success, #008f0c), #00b510)"
                    : "linear-gradient(135deg, var(--tertiary, #fb8500) 0%, var(--tertiary-light, #ffb703) 100%)",
                  color: "#fff",
                  boxShadow: hasUnlocked
                    ? "0 6px 20px rgba(0, 143, 12, 0.35)"
                    : undefined,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Icon + headline */}
                <div
                  className="flex flex-row gap-12 items-center"
                  style={{ marginBottom: 14 }}
                >
                  <motion.div
                    animate={
                      hasUnlocked
                        ? { scale: [1, 1.15, 1] }
                        : {
                            rotate: [0, -10, 10, -10, 0],
                            y: [0, -2, 0],
                          }
                    }
                    transition={{
                      duration: hasUnlocked ? 0.6 : 1.6,
                      repeat: hasUnlocked ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {hasUnlocked ? (
                      <Check size={22} strokeWidth={2.5} />
                    ) : (
                      <Truck size={22} strokeWidth={2.5} />
                    )}
                  </motion.div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {hasUnlocked ? (
                      <>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            lineHeight: 1.2,
                          }}
                        >
                          You unlocked free delivery 🎉
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            opacity: 0.95,
                            marginTop: 4,
                          }}
                        >
                          Shipping is on us — ready to checkout
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            lineHeight: 1.2,
                          }}
                        >
                          Add ₹{remaining} more for FREE delivery
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            opacity: 0.95,
                            marginTop: 4,
                          }}
                        >
                          Delivery charges apply on orders below ₹
                          {FREE_SHIPPING_THRESHOLD}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* White progress bar on orange */}
                <div
                  style={{
                    height: 8,
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "#fff",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <div
                  className="flex flex-row justify-between"
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    opacity: 0.9,
                    fontWeight: 600,
                  }}
                >
                  <span>₹{totalDiscounted}</span>
                  <span>₹{FREE_SHIPPING_THRESHOLD}</span>
                </div>
              </motion.div>

              {/* ===== CTA ===== */}
              <div
                className="flex flex-col gap-8 items-stretch"
                style={{ marginTop: 4 }}
              >
                {hasUnlocked ? (
                  <motion.button
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onProceedAfterUnlock}
                    className="pri-big-btn width100 flex flex-row items-center justify-center gap-8"
                  >
                    Continue to checkout
                    <ArrowRight size={16} />
                  </motion.button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onSkip}
                      className="sec-mid-btn width100 flex flex-row items-center justify-center gap-8"
                      style={{ padding: "12px 16px" }}
                    >
                      I'm fine to pay shipping charges
                    </button>
                    <span
                      className="font-10 dark-50"
                      style={{ textAlign: "center" }}
                    >
                      Add a book above, or proceed with delivery charges
                    </span>
                  </>
                )}
              </div>

              {/* ===== Price Filter ===== */}
              {!hasUnlocked && filteredBooks.length > 0 && (
                <div className="price-filter-container">
                  <span className="font-12 weight-600">Filter by price:</span>
                  <div
                    className="flex flex-row gap-12"
                    style={{ overflow: "scroll" }}
                  >
                    {priceFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`sec-mid-btn ${priceFilter === option.value ? "active" : ""}`}
                        style={{ minWidth: "fit-content" }}
                        onClick={() => {
                          setPriceFilter(option.value);
                          setDisplayCount(INITIAL_DISPLAY_COUNT);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== Suggestions (BookCard grid) with lazy loading ===== */}
              {!hasUnlocked && displayedBooks.length > 0 && (
                <div className="flex flex-col gap-12">
                  <div className="flex flex-row items-center gap-6">
                    <Sparkles size={14} style={{ color: "var(--tertiary)" }} />
                    <span className="font-12 weight-600">
                      {cartCategories.length > 0
                        ? "Picked for you, based on your cart"
                        : "Popular books (lowest price first)"}
                    </span>
                  </div>

                  <div className="grid-2">
                    {displayedBooks.map((book, idx) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                      >
                        <BookCard book={book} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Lazy loading trigger */}
                  {hasMoreBooks && (
                    <div ref={observerRef} className="load-more-trigger">
                      {isLoadingMore ? (
                        <div className="loading-spinner">
                          <Loader2 size={24} className="spinning" />
                          <span>Loading more books...</span>
                        </div>
                      ) : (
                        <button
                          onClick={loadMoreBooks}
                          className="load-more-btn"
                        >
                          Load more books
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* No books message */}
              {!hasUnlocked && displayedBooks.length === 0 && (
                <div className="no-books-message">
                  <p>No books available at the moment.</p>
                  <button onClick={onSkip} className="sec-mid-btn mt-12">
                    Continue with delivery charges
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
