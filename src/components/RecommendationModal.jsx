"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flame,
  Gift,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { buildRecommendations, topGenres } from "@/utils/recoEngine";
import { getCartOffers } from "@/utils/cartOffers";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const GENRES = topGenres(16);

const READING_PREFERENCES = [
  { id: "entertainment", label: "Entertainment & Fun" },
  { id: "knowledge", label: "Knowledge & Learning" },
  { id: "self-improvement", label: "Self Improvement" },
  { id: "career", label: "Career & Business" },
];

// Deterministic "social proof" count per book so it never jumps between renders.
const proofCount = (id) => {
  const s = String(id || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 300 + (h % 2200); // 300–2499
};

const origOf = (b) =>
  Number(b.originalPrice) || Math.round((Number(b.discountedPrice) || 0) * 1.5);
const discPctOf = (b) => {
  const o = origOf(b);
  const d = Number(b.discountedPrice) || 0;
  return o > d ? ((o - d) / o) * 100 : 0;
};

// Free-bookmark tier by cart value (mirrors checkout).
const bmTier = (t) => (t >= 1000 ? 4 : t >= 500 ? 3 : 2);

const INITIAL_VISIBLE = 6;

export default function RecommendationModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) {
  const { addToCart, toggleWishlist, cart, cartTotal, hasOneRupeeItem } =
    useStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  // view: "picks" (default cart-first) | "refine-genre" | "refine-goal"
  const [view, setView] = useState("picks");
  const [filters, setFilters] = useState({ genres: [], goal: "" });
  const [picksList, setPicksList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [addedIds, setAddedIds] = useState(() => new Set());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // ?suggest= opens the drawer (self-controlled mode).
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

  const cartIds = useMemo(() => (cart || []).map((i) => i.id), [cart]);

  // Freeze a curated list when the drawer opens or filters change — so adding a
  // book doesn't reshuffle the grid under the shopper's finger. Threshold/perk
  // nudges still recompute live from cartTotal.
  const computePicks = () => {
    const list = buildRecommendations(cartIds, filters).slice(0, 16);
    setPicksList(list);
    setVisibleCount(INITIAL_VISIBLE);
  };

  useEffect(() => {
    if (isOpen) computePicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
    setTimeout(() => {
      setView("picks");
      setFilters({ genres: [], goal: "" });
      setAddedIds(new Set());
    }, 300);
  };

  const goToBag = () => {
    handleClose();
    router.push("/bag");
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/917710892108?text=${encodeURIComponent("Hi! I'm looking for a book. Can you help me?")}`,
      "_blank",
    );
  };

  const toggleGenre = (g) =>
    setFilters((p) => ({
      ...p,
      genres: p.genres.includes(g)
        ? p.genres.filter((x) => x !== g)
        : [...p.genres, g],
    }));

  const applyRefine = () => {
    setView("picks");
    // Recompute with the chosen filters.
    const list = buildRecommendations(cartIds, filters).slice(0, 16);
    setPicksList(list);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const addBook = (book) => {
    addToCart(book.id);
    setAddedIds((prev) => new Set(prev).add(book.id));
    showToast(`Added to your bag 🎉 “${book.name}”`, "success");
  };

  // ── Conversion levers ──────────────────────────────────────────────────
  const offers = getCartOffers(hasOneRupeeItem);
  // Current active band = the next unreached target.
  const activeBand = useMemo(() => {
    return (
      offers.find((b) => cartTotal >= b.min && cartTotal < b.target) ||
      offers.find((b) => cartTotal < b.target) ||
      null
    );
  }, [offers, cartTotal]);

  const unlockFor = (b) => {
    const newTotal = cartTotal + (Number(b.discountedPrice) || 0);
    const crossed = offers
      .filter((x) => x.target > cartTotal && x.target <= newTotal)
      .sort((a, c) => c.target - a.target)[0];
    if (crossed) return { txt: `Unlocks ${crossed.reward}`, kind: "offer" };
    if (bmTier(newTotal) > bmTier(cartTotal))
      return {
        txt: `Unlocks ${bmTier(newTotal)} free bookmarks`,
        kind: "perk",
      };
    return null;
  };

  const scarcityFor = (b) => {
    if (typeof b.stock === "number" && b.stock > 0 && b.stock <= 8)
      return `Only ${b.stock} left`;
    if (discPctOf(b) >= 45) return "Selling fast";
    return null;
  };

  const badgeFor = (b) => {
    const cat = (b.catalogue || []).map((c) => String(c).toLowerCase());
    if (cat.includes("bestseller")) return "Bestseller";
    if (cat.includes("trending")) return "Trending";
    return null;
  };

  if (!mounted) return null;

  const heading = cart?.length
    ? "Readers who bought these also loved"
    : "Trending picks for you";
  const subheading =
    filters.genres.length || filters.goal
      ? "Filtered to your taste"
      : cart?.length
        ? "Hand-picked to pair with your bag"
        : "The books everyone's adding right now";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="bill-modal-overlay" onClick={handleClose}>
          <motion.div
            className="bill-modal reco2-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bill-header">
              <span className="weight-600 font-16 flex items-center gap-8">
                <Sparkles size={16} />
                Recommended for you
              </span>
              <span className="cursor-pointer" onClick={handleClose}>
                <X size={16} />
              </span>
            </div>

            {/* ── Cart-first curated picks ── */}
            {view === "picks" && (
              <>
                <div className="reco2-body">
                  <div className="reco2-head">
                    <div className="reco2-head-txt">
                      <h3 className="reco2-title">{heading}</h3>
                      <p className="reco2-sub">{subheading}</p>
                    </div>
                    <button
                      type="button"
                      className="reco2-refine"
                      onClick={() => setView("refine-genre")}
                    >
                      <SlidersHorizontal size={14} /> Refine
                    </button>
                  </div>

                  <div
                    className="reco2-grid"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (
                        el.scrollTop + el.clientHeight >=
                          el.scrollHeight - 200 &&
                        visibleCount < picksList.length
                      )
                        setVisibleCount((v) =>
                          Math.min(v + 6, picksList.length),
                        );
                    }}
                  >
                    {picksList.length === 0 && (
                      <p className="reco2-empty">
                        We couldn&apos;t find picks right now — tap Refine to
                        choose a genre.
                      </p>
                    )}
                    {picksList.slice(0, visibleCount).map((b) => {
                      const url = `/books/${slugify(b.name)}`;
                      const orig = origOf(b);
                      const disc = Number(b.discountedPrice) || 0;
                      const save = Math.max(0, orig - disc);
                      const unlock = unlockFor(b);
                      const scarcity = scarcityFor(b);
                      const badge = badgeFor(b);
                      const added = addedIds.has(b.id);
                      return (
                        <article className="reco2-card" key={b.id}>
                          <Link
                            href={url}
                            className="reco2-cover"
                            onClick={handleClose}
                          >
                            {b.image && (
                              <img src={b.image} alt={b.name} loading="lazy" />
                            )}
                            {badge && (
                              <span className="reco2-badge">{badge}</span>
                            )}
                            {scarcity && (
                              <span className="reco2-scarcity">
                                <Flame size={11} /> {scarcity}
                              </span>
                            )}
                          </Link>
                          <div className="reco2-info">
                            {b._reason && (
                              <span className="reco2-reason">{b._reason}</span>
                            )}
                            <Link
                              href={url}
                              className="reco2-name"
                              onClick={handleClose}
                              title={b.name}
                            >
                              {b.name}
                            </Link>
                            <span className="reco2-social">
                              <Heart size={11} />{" "}
                              {proofCount(b.id).toLocaleString()} readers bought
                              this
                            </span>
                            <div className="reco2-price">
                              <span className="reco2-now">₹{disc}</span>
                              {orig > disc && (
                                <span className="reco2-mrp">₹{orig}</span>
                              )}
                              {save > 0 && (
                                <span className="reco2-save">Save ₹{save}</span>
                              )}
                            </div>
                            {unlock && (
                              <div
                                className={`reco2-unlock reco2-unlock-${unlock.kind}`}
                              >
                                <Gift size={12} /> {unlock.txt}
                              </div>
                            )}
                            <button
                              type="button"
                              className={`reco2-add${added ? " added" : ""}`}
                              onClick={() => addBook(b)}
                            >
                              {added ? (
                                <>
                                  <Check size={15} /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={15} /> Add · ₹{disc}
                                </>
                              )}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Sticky offer-progress footer — keeps momentum to next reward */}
                <div className="reco2-foot">
                  {activeBand && (
                    <div className="reco2-progress">
                      <div className="reco2-progress-txt">
                        <span>
                          {Math.max(0, activeBand.target - cartTotal) > 0 ? (
                            <>
                              <b>₹{Math.max(0, activeBand.target - cartTotal)}</b>{" "}
                              to {activeBand.reward}
                            </>
                          ) : (
                            <>You&apos;ve unlocked {activeBand.reward} 🎉</>
                          )}
                        </span>
                        <span className="reco2-progress-cur">
                          Bag ₹{cartTotal}
                        </span>
                      </div>
                      <div className="reco2-progress-bar">
                        <div
                          className="reco2-progress-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              activeBand.target > activeBand.min
                                ? ((cartTotal - activeBand.min) /
                                    (activeBand.target - activeBand.min)) *
                                    100
                                : 0,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="reco2-foot-actions">
                    <button
                      type="button"
                      className="reco2-foot-chat"
                      onClick={handleWhatsApp}
                    >
                      <FaWhatsapp size={18} color="#25d366" />
                    </button>
                    <button
                      type="button"
                      className="reco2-foot-bag"
                      onClick={goToBag}
                    >
                      Go to bag · ₹{cartTotal} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Optional refine: genres ── */}
            {view === "refine-genre" && (
              <div className="reco2-body reco2-refine-body">
                <div className="reco2-refine-head">
                  <span className="reco2-step">Refine · 1 of 2</span>
                  <h3 className="reco2-title">Which genres do you enjoy?</h3>
                  <p className="reco2-sub">Pick any that fit — or skip.</p>
                </div>
                <div className="reco2-chips">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`reco2-chip${filters.genres.includes(g) ? " on" : ""}`}
                      onClick={() => toggleGenre(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div className="reco2-refine-actions">
                  <button
                    type="button"
                    className="reco2-btn ghost"
                    onClick={() => setView("picks")}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="reco2-btn primary"
                    onClick={() => setView("refine-goal")}
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Optional refine: goal ── */}
            {view === "refine-goal" && (
              <div className="reco2-body reco2-refine-body">
                <div className="reco2-refine-head">
                  <span className="reco2-step">Refine · 2 of 2</span>
                  <h3 className="reco2-title">What are you in the mood for?</h3>
                  <p className="reco2-sub">One tap tailors your picks.</p>
                </div>
                <div className="reco2-goals">
                  {READING_PREFERENCES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`reco2-goal${filters.goal === p.id ? " on" : ""}`}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          goal: f.goal === p.id ? "" : p.id,
                        }))
                      }
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="reco2-refine-actions">
                  <button
                    type="button"
                    className="reco2-btn ghost"
                    onClick={() => setView("refine-genre")}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="reco2-btn primary"
                    onClick={applyRefine}
                  >
                    Show my picks <Sparkles size={15} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
