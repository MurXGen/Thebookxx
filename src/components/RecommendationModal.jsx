"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Heart,
  Check,
  Gift,
  SlidersHorizontal,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import {
  buildRecommendations,
  topGenres,
  GOAL_KEYWORDS,
} from "@/utils/recoEngine";

const PAGE = 12;
const MAX_AUTO_LOADS = 3;
const GENRES = topGenres(14);
const GOALS = [
  { id: "entertainment", label: "Entertainment" },
  { id: "knowledge", label: "Knowledge" },
  { id: "self-improvement", label: "Self-improvement" },
  { id: "career", label: "Career" },
];

const WHATSAPP = "https://wa.me/917710892108?text=";

export default function RecommendationModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) {
  const { cart, addToCart, toggleWishlist, wishlist, hasOneRupeeItem } =
    useStore();
  const router = useRouter();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // The modal is often rendered inside transformed/fixed ancestors (e.g. the
  // cart bar), which would trap a position:fixed overlay. Portal to <body>.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Optional, inline chip filters over the live results.
  const [genres, setGenres] = useState([]);
  const [goal, setGoal] = useState("");
  const [unlockOnly, setUnlockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination / windowing.
  const [visible, setVisible] = useState(PAGE);
  const autoLoadsRef = useRef(0);
  const scrollRef = useRef(null);
  const savedScrollRef = useRef(0);

  // Auto-open from ?suggest when uncontrolled.
  useEffect(() => {
    if (externalIsOpen === undefined && typeof window !== "undefined") {
      if (window.location.search.includes("suggest")) {
        setInternalIsOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("suggest");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [externalIsOpen]);

  const cartIds = cart.map((i) => i.id);
  const cartKey = cartIds.join(",");

  // Cart value + next-offer gap (reuses the same offer ladder as the cart bar).
  const discountedAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const b = books.find((x) => x.id === item.id);
      return sum + (b ? b.discountedPrice * (item.qty || 1) : 0);
    }, 0);
  }, [cart]);

  const activeOffers = getCartOffers(hasOneRupeeItem);
  const progressOffer =
    activeOffers.find(
      (o) => discountedAmount >= o.min && discountedAmount < o.target,
    ) || null;
  const remainingToNext = progressOffer
    ? Math.max(progressOffer.target - discountedAmount, 0)
    : 0;
  const gapPct = progressOffer
    ? Math.min((discountedAmount / progressOffer.target) * 100, 100)
    : 100;

  // Full ranked + diversified list (recomputed only when cart / filters change).
  const ranked = useMemo(
    () => buildRecommendations(cartIds, { genres, goal }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartKey, genres.join(","), goal],
  );

  // Books that would cross the next offer threshold on their own.
  const qualifies = useCallback(
    (b) => remainingToNext > 0 && b.discountedPrice >= remainingToNext,
    [remainingToNext],
  );

  const filtered = useMemo(
    () => (unlockOnly ? ranked.filter(qualifies) : ranked),
    [ranked, unlockOnly, qualifies],
  );

  // Reset the window whenever the result set changes.
  useEffect(() => {
    setVisible(PAGE);
    autoLoadsRef.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [cartKey, genres.join(","), goal, unlockOnly]);

  // Scroll restoration between opens.
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = savedScrollRef.current || 0;
      });
    }
  }, [isOpen]);

  const shown = filtered.slice(0, visible);
  const canAutoLoad = autoLoadsRef.current < MAX_AUTO_LOADS;
  const hasMore = visible < filtered.length;

  const loadMore = () => setVisible((v) => Math.min(v + PAGE, filtered.length));

  // Prefetch at 60% scroll for the first 3 loads, then require a Load-more tap.
  const onScroll = (e) => {
    const el = e.currentTarget;
    savedScrollRef.current = el.scrollTop;
    if (!hasMore || !canAutoLoad) return;
    const ratio = (el.scrollTop + el.clientHeight) / el.scrollHeight;
    if (ratio >= 0.6) {
      autoLoadsRef.current += 1;
      loadMore();
    }
  };

  const close = () => {
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
  };

  const toggleGenre = (g) =>
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  // Capped 3-book bundle from the current results (no dark patterns: the exact
  // books + real subtotal are shown before adding).
  const bundle = useMemo(() => filtered.slice(0, 3), [filtered]);
  const bundleSubtotal = bundle.reduce((s, b) => s + b.discountedPrice, 0);
  const addBundle = () => bundle.forEach((b) => addToCart(b.id));

  const inCart = (id) => cartIds.includes(id);
  const chatUrl =
    WHATSAPP + encodeURIComponent("Hi! Can you help me pick a book?");

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="reco-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="reco-drawer"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="reco-head">
              <span className="reco-title">
                <Sparkles size={16} /> Recommended for you
              </span>
              <button className="reco-x" onClick={close} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Gap banner — reuses the cart's next-offer value */}
            {progressOffer && (
              <div className="reco-gap">
                <div className="reco-gap-row">
                  <span className="reco-gap-text">
                    Add <b>₹{remainingToNext}</b> more for{" "}
                    <b className="reco-gap-reward">{progressOffer.reward}</b>
                  </span>
                  <button
                    type="button"
                    className={`reco-gap-filter${unlockOnly ? " on" : ""}`}
                    onClick={() => setUnlockOnly((v) => !v)}
                  >
                    {unlockOnly ? "Showing unlockers" : "Show books that unlock it"}
                  </button>
                </div>
                <span className="reco-gap-bar">
                  <motion.span
                    className="reco-gap-fill"
                    animate={{ width: `${gapPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </span>
              </div>
            )}

            {/* Optional inline filter chips */}
            <div className="reco-filters">
              <button
                type="button"
                className={`reco-filter-toggle${filtersOpen ? " on" : ""}`}
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal size={13} />
                Refine
                {(genres.length > 0 || goal) && (
                  <span className="reco-filter-count">
                    {genres.length + (goal ? 1 : 0)}
                  </span>
                )}
              </button>
              {(genres.length > 0 || goal) && (
                <button
                  type="button"
                  className="reco-filter-clear"
                  onClick={() => {
                    setGenres([]);
                    setGoal("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {filtersOpen && (
                <motion.div
                  className="reco-chiprow"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="reco-chipset">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        className={`reco-chip${genres.includes(g) ? " on" : ""}`}
                        onClick={() => toggleGenre(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <div className="reco-chipset">
                    {GOALS.map((gl) => (
                      <button
                        key={gl.id}
                        className={`reco-chip${goal === gl.id ? " on" : ""}`}
                        onClick={() => setGoal(goal === gl.id ? "" : gl.id)}
                      >
                        {gl.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="reco-scroll" ref={scrollRef} onScroll={onScroll}>
              {shown.length === 0 ? (
                <div className="reco-empty">
                  <p>No matches with these filters.</p>
                  <button
                    className="reco-chip"
                    onClick={() => {
                      setGenres([]);
                      setGoal("");
                      setUnlockOnly(false);
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="reco-grid">
                  {shown.map((b) => {
                    const hasMrp = b.originalPrice > b.discountedPrice;
                    const save = hasMrp
                      ? b.originalPrice - b.discountedPrice
                      : 0;
                    const added = inCart(b.id);
                    const unlocks = qualifies(b);
                    return (
                      <div className="reco-card" key={b.id}>
                        {unlocks && (
                          <span className="reco-unlock-pill">
                            <Gift size={11} /> Unlocks offer
                          </span>
                        )}
                        <button
                          type="button"
                          className={`reco-wish${wishlist.includes(b.id) ? " on" : ""}`}
                          onClick={() => toggleWishlist(b.id)}
                          aria-label="Wishlist"
                        >
                          <Heart
                            size={14}
                            fill={
                              wishlist.includes(b.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                        <div className="reco-cover">
                          {b.image ? (
                            <img
                              src={b.image}
                              alt={b.name}
                              loading="lazy"
                              decoding="async"
                              sizes="(max-width: 640px) 40vw, 190px"
                            />
                          ) : null}
                        </div>
                        <div className="reco-card-body">
                          <span className="reco-name">{b.name}</span>
                          {/* Mandatory reason-why line */}
                          <span className="reco-reason">{b._reason}</span>
                          <div className="reco-price">
                            <span className="reco-final">
                              ₹{b.discountedPrice}
                            </span>
                            {hasMrp && (
                              <>
                                <span className="reco-mrp">
                                  ₹{b.originalPrice}
                                </span>
                                <span className="reco-save">Save ₹{save}</span>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`reco-add${added ? " added" : ""}`}
                            onClick={() => addToCart(b.id)}
                            disabled={added}
                          >
                            {added ? (
                              <>
                                <Check size={15} /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={15} /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hasMore && !canAutoLoad && (
                <button className="reco-loadmore" onClick={loadMore}>
                  Load more books
                </button>
              )}
            </div>

            {/* Footer — capped 3-book bundle CTA + chat */}
            <div className="reco-foot">
              {bundle.length >= 2 && (
                <button
                  type="button"
                  className="reco-bundle"
                  onClick={addBundle}
                >
                  <span className="reco-bundle-main">
                    Add {bundle.length}-book bundle
                  </span>
                  <span className="reco-bundle-sub">₹{bundleSubtotal}</span>
                </button>
              )}
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="reco-chat"
              >
                <FaWhatsapp size={16} color="#25D366" />
                Confused? Chat
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
