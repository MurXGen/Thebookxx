"use client";

import BookCard from "@/components/BookCard";
import RecommendationModal from "@/components/RecommendationModal";
import { books } from "@/utils/book";
import {
  hasQuickRead,
  QUICKREAD_PRICE,
  QUICKREAD_MRP,
} from "@/data/quickreadsMeta";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  Zap,
  Clock,
  ShoppingCart,
  Check,
  ChevronRight,
  Search,
  TrendingUp,
  Tag,
  Sparkles,
  Plus,
  Gift,
  Truck,
  RotateCcw,
  BookOpen,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
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

// Discovery shortcuts shown before the shopper types anything.
const POPULAR_SEARCHES = [
  "Colleen Hoover",
  "Freida McFadden",
  "Atomic Habits",
  "Psychology of Money",
  "Robert Greene",
  "Romance",
];
const PRICE_CHIPS = [
  { label: "Under ₹149", q: "under 150" },
  { label: "Under ₹199", q: "under 200" },
  { label: "Under ₹299", q: "under 300" },
];
const GENRES = [
  { k: "fiction", l: "Fiction" },
  { k: "self-help", l: "Self-help" },
  { k: "romance", l: "Romance" },
  { k: "thriller", l: "Thriller" },
  { k: "psychology", l: "Psychology" },
  { k: "business", l: "Business" },
  { k: "finance", l: "Finance" },
  { k: "children", l: "Children" },
].map((g) => ({
  ...g,
  n: books.filter((b) => b.catalogue?.includes(g.k)).length,
}));
// In-stock trending picks (no ₹1 books — those have their own cart rules).
const TRENDING = books
  .filter(
    (b) =>
      b.catalogue?.includes("trending") &&
      b.image &&
      Number(b.discountedPrice) > 1 &&
      (b.stock == null || Number(b.stock) > 0),
  )
  .slice(0, 10);
const FILTER_SORTS = [
  { k: "relevance", l: "Relevance" },
  { k: "low", l: "Price: low to high" },
  { k: "high", l: "Price: high to low" },
  { k: "discount", l: "Biggest discount" },
];
const FILTER_PRICES = [
  { v: null, l: "Any price" },
  { v: 149, l: "Under ₹149" },
  { v: 199, l: "Under ₹199" },
  { v: 299, l: "Under ₹299" },
  { v: 499, l: "Under ₹499" },
];
const bookSlug = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function SearchOverlay({
  open,
  onClose,
  initialSuggest = false,
  initialQuery = "",
}) {
  const inputRef = useRef(null);
  const { addQuickRead, isInQrCart, cart, addToCart } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sortType, setSortType] = useState("relevance");
  // Filter panel (opened from the icon beside the search box).
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(null);
  const [genre, setGenre] = useState(null);
  // Phones get a bottom sheet with draft values that apply on Save.
  const [isNarrow, setIsNarrow] = useState(false);
  // Results are split into Books / QuickReads tabs.
  const [resultTab, setResultTab] = useState("books");
  const [qrTipOpen, setQrTipOpen] = useState(false);
  const qrTipRef = useRef(null);
  useEffect(() => {
    if (!qrTipOpen) return;
    const away = (e) => {
      if (!qrTipRef.current?.contains(e.target)) setQrTipOpen(false);
    };
    const esc = (e) => e.key === "Escape" && setQrTipOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [qrTipOpen]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState({
    sort: "relevance",
    price: null,
    genre: null,
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 600px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  // Recent searches (persisted in localStorage), shown as scrollable chips.
  const [recentSearches, setRecentSearches] = useState([]);
  const chipsRef = useRef(null);

  // Load saved searches whenever the overlay opens.
  useEffect(() => {
    if (!open) return;
    try {
      const saved = JSON.parse(localStorage.getItem("recent_searches") || "[]");
      if (Array.isArray(saved))
        setRecentSearches(saved.filter(Boolean).slice(0, 12));
    } catch (_) {}
  }, [open]);

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

  // Seed the query from a deep-link (?q=) when the overlay opens so arriving
  // with a search URL runs that search immediately.
  useEffect(() => {
    if (open && initialQuery) setQuery(initialQuery);
  }, [open, initialQuery]);

  // Keep the URL in sync with the active search so it's shareable and survives
  // a reload. Uses replaceState so it doesn't spam the history stack or trigger
  // a Next navigation/re-render.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const term = debouncedQuery.trim();
    if (term) url.searchParams.set("q", term);
    else url.searchParams.delete("q");
    url.searchParams.delete("search"); // normalize the ?search= alias to ?q=
    window.history.replaceState(window.history.state, "", url);
  }, [debouncedQuery, open]);

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
        if (sheetOpen) setSheetOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, showRecommendationModal, sheetOpen]);

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
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setIsSearching(false);
      setFilterOpen(false);
      setSheetOpen(false);
      setResultTab("books");
      setQrTipOpen(false);
      setPriceMax(null);
      setGenre(null);
      setSortType("relevance");
      // Drop the search param only on a real open→close transition (not on the
      // initial mount, which would strip a deep-link ?q= before it's read).
      if (wasOpenRef.current && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("q") || url.searchParams.has("search")) {
          url.searchParams.delete("q");
          url.searchParams.delete("search");
          window.history.replaceState(window.history.state, "", url);
        }
      }
    }
    wasOpenRef.current = open;
  }, [open]);

  // Filter uses the debounced query so it only runs after the user pauses typing
  const filtersActive = priceMax != null || !!genre;
  const activeFilterCount =
    (priceMax != null ? 1 : 0) +
    (genre ? 1 : 0) +
    (sortType !== "relevance" ? 1 : 0);
  const matchedBooks = !debouncedQuery
    ? filtersActive
      ? books
      : []
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
          String(str || "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(Boolean);

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
            for (
              let j = i;
              j < words.length && joined.length < looseQ.length;
              j++
            ) {
              joined += words[j];
            }
            if (joined.startsWith(looseQ)) return true;
          }
          return false;
        };

        // 1⃣ Name match
        const nameWords = wordsOf(book.name);
        const nameMatch =
          startsAtWordBoundary(nameWords) || everyTokenIsWordPrefix(nameWords);

        // 2⃣ Author match
        const authorWords = wordsOf(book.author);
        const authorMatch =
          startsAtWordBoundary(authorWords) ||
          everyTokenIsWordPrefix(authorWords);

        // 3⃣ Catalogue match
        const catalogueMatch =
          looseQ && book.catalogue?.some((cat) => loose(cat).includes(looseQ));

        // 4⃣ Price match
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
  const filteredBooks = matchedBooks.filter(
    (b) =>
      (priceMax == null || Number(b.discountedPrice) <= priceMax) &&
      (!genre || b.catalogue?.includes(genre)),
  );
  const showResults = !!query || filtersActive;

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
    if (sortType === "low")
      data.sort((a, b) => a.discountedPrice - b.discountedPrice);
    else if (sortType === "high")
      data.sort((a, b) => b.discountedPrice - a.discountedPrice);
    else if (sortType === "discount")
      data.sort(
        (a, b) =>
          b.originalPrice -
          b.discountedPrice -
          (a.originalPrice - a.discountedPrice),
      );
    return data;
  })();

  // Grid items: each matched book, plus a QuickReads card right beside any
  // book that has a QuickRead (rendered as a normal card with a QR badge).
  const qrBooks = sortedBooks.filter((b) => hasQuickRead(b.id));
  const gridItems =
    resultTab === "qr"
      ? qrBooks.map((book) => ({ type: "qr", book }))
      : sortedBooks.map((book) => ({ type: "book", book }));

  // Encode search term for WhatsApp
  const whatsappMessage = `Hey hi! I'm looking for a book related to "${query}" but couldn't find it on TheBookX. Could you please help me find it?`;

  // Count for the draft (mobile sheet) so Save can say "Show N books".
  const draftCount =
    !debouncedQuery && draft.price == null && !draft.genre
      ? null
      : (debouncedQuery ? matchedBooks : books).filter(
          (b) =>
            (draft.price == null || Number(b.discountedPrice) <= draft.price) &&
            (!draft.genre || b.catalogue?.includes(draft.genre)),
        ).length;

  // Sort / Price / Genre chip groups, shared by the desktop panel (live) and
  // the mobile sheet (draft until Save).
  const renderFilterGroups = (v, set) => (
    <>
      <div className="sx-filter-grp">
        <span className="sx-filter-lbl">Sort by</span>
        <div className="sx-chips">
          {FILTER_SORTS.map((o) => (
            <button
              key={o.k}
              type="button"
              aria-pressed={v.sort === o.k}
              className={`sx-fchip${v.sort === o.k ? " on" : ""}`}
              onClick={() => set.sort(o.k)}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <div className="sx-filter-grp">
        <span className="sx-filter-lbl">Price</span>
        <div className="sx-chips">
          {FILTER_PRICES.map((o) => (
            <button
              key={o.l}
              type="button"
              aria-pressed={v.price === o.v}
              className={`sx-fchip${v.price === o.v ? " on" : ""}`}
              onClick={() => set.price(o.v)}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <div className="sx-filter-grp">
        <span className="sx-filter-lbl">Genre</span>
        <div className="sx-chips">
          <button
            type="button"
            aria-pressed={!v.genre}
            className={`sx-fchip${!v.genre ? " on" : ""}`}
            onClick={() => set.genre(null)}
          >
            All genres
          </button>
          {GENRES.map((g) => (
            <button
              key={g.k}
              type="button"
              aria-pressed={v.genre === g.k}
              className={`sx-fchip${v.genre === g.k ? " on" : ""}`}
              onClick={() => set.genre(g.k)}
            >
              {g.l}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const openFilters = () => {
    if (isNarrow) {
      setDraft({ sort: sortType, price: priceMax, genre });
      setSheetOpen(true);
    } else {
      setFilterOpen((v) => !v);
    }
  };
  const saveDraft = () => {
    setSortType(draft.sort);
    setPriceMax(draft.price);
    setGenre(draft.genre);
    setSheetOpen(false);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.setItem("recent_searches", "[]");
    } catch (_) {}
  };

  const handleClearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <>
      {mounted &&
        createPortal(
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
                      <Search
                        size={19}
                        className="search-input-ic"
                        aria-hidden="true"
                      />
                      <input
                        ref={inputRef}
                        type="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        aria-label="Search books"
                        placeholder="Search books, authors or genres"
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
                    <button
                      type="button"
                      className={`search-filter-btn${filterOpen || sheetOpen || activeFilterCount ? " on" : ""}`}
                      onClick={openFilters}
                      aria-label="Filters"
                      aria-expanded={filterOpen || sheetOpen}
                      aria-controls="sx-filter-panel"
                    >
                      <SlidersHorizontal size={18} />
                      {activeFilterCount > 0 && (
                        <span className="search-filter-count">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="search-close-btn"
                      onClick={onClose}
                      aria-label="Close search"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Filter panel — slides down under the search box. */}
                  <AnimatePresence initial={false}>
                    {filterOpen && !isNarrow && (
                      <motion.div
                        id="sx-filter-panel"
                        className="sx-filter"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        <div className="sx-filter-in">
                          {renderFilterGroups(
                            { sort: sortType, price: priceMax, genre },
                            {
                              sort: setSortType,
                              price: setPriceMax,
                              genre: setGenre,
                            },
                          )}
                          <div className="sx-filter-foot">
                            <button
                              type="button"
                              className="sx-link"
                              onClick={() => {
                                setPriceMax(null);
                                setGenre(null);
                                setSortType("relevance");
                              }}
                            >
                              Clear all
                            </button>
                            <button
                              type="button"
                              className="sx-filter-apply"
                              onClick={() => setFilterOpen(false)}
                            >
                              {showResults
                                ? `Show ${filteredBooks.length} ${filteredBooks.length === 1 ? "book" : "books"}`
                                : "Done"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Body, animated between placeholder / loader / empty / results */}
                  <div
                    className="search-body"
                    style={{ paddingBottom: 24 }}
                    // Scrolling or tapping the results tucks the filter panel away.
                    onScroll={() => filterOpen && setFilterOpen(false)}
                    onPointerDown={() => filterOpen && setFilterOpen(false)}
                  >
                    <AnimatePresence mode="wait">
                      {!showResults ? (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="sx-discover"
                        >
                          {recentSearches.length > 0 && (
                            <section className="sx-sec">
                              <div className="sx-sec-head">
                                <h3 className="sx-sec-title">
                                  <Clock size={14} /> Recent searches
                                </h3>
                                <button
                                  type="button"
                                  className="sx-link"
                                  onClick={clearRecent}
                                >
                                  Clear
                                </button>
                              </div>
                              <div
                                className="sx-chips sx-chips-scroll"
                                ref={chipsRef}
                              >
                                {recentSearches.map((term) => (
                                  <span
                                    key={term}
                                    className="sx-chip sx-chip-recent"
                                  >
                                    <button
                                      type="button"
                                      className="sx-chip-main"
                                      onClick={() => setQuery(term)}
                                    >
                                      {term}
                                    </button>
                                    <button
                                      type="button"
                                      className="sx-chip-x"
                                      aria-label={`Remove ${term}`}
                                      onClick={() => removeRecent(term)}
                                    >
                                      <X size={11} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </section>
                          )}

                          <section className="sx-sec">
                            <h3 className="sx-sec-title">
                              <TrendingUp size={14} /> Popular right now
                            </h3>
                            <div className="sx-chips">
                              {POPULAR_SEARCHES.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  className="sx-chip"
                                  onClick={() => setQuery(t)}
                                >
                                  <Search size={12} /> {t}
                                </button>
                              ))}
                            </div>
                          </section>

                          {TRENDING.length > 0 && (
                            <section className="sx-sec">
                              <h3 className="sx-sec-title">
                                <Sparkles size={14} /> Trending picks
                              </h3>
                              <div className="sx-rail">
                                {TRENDING.map((b) => {
                                  const inBag = cart?.some(
                                    (i) => i.id === b.id,
                                  );
                                  const off =
                                    Number(b.originalPrice) >
                                    Number(b.discountedPrice)
                                      ? Math.round(
                                          (1 -
                                            b.discountedPrice /
                                              b.originalPrice) *
                                            100,
                                        )
                                      : 0;
                                  return (
                                    <div key={b.id} className="sx-mini">
                                      <Link
                                        href={`/books/${bookSlug(b.name)}`}
                                        onClick={onClose}
                                        className="sx-mini-cover"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={b.image}
                                          alt={b.name}
                                          loading="lazy"
                                        />
                                        {off > 0 && (
                                          <span className="sx-mini-off">
                                            {off}% off
                                          </span>
                                        )}
                                      </Link>
                                      <Link
                                        href={`/books/${bookSlug(b.name)}`}
                                        onClick={onClose}
                                        className="sx-mini-name"
                                      >
                                        {b.name}
                                      </Link>
                                      <span className="sx-mini-price">
                                        <b>₹{b.discountedPrice}</b>
                                        {off > 0 && <s>₹{b.originalPrice}</s>}
                                      </span>
                                      <button
                                        type="button"
                                        className={`sx-mini-add${inBag ? " in" : ""}`}
                                        aria-label={
                                          inBag
                                            ? `${b.name} is in your bag`
                                            : `Add ${b.name} to bag`
                                        }
                                        onClick={() => {
                                          if (inBag) return;
                                          addToCart(b.id);
                                          showToast(
                                            `Added “${b.name}” to your bag`,
                                            "success",
                                          );
                                        }}
                                      >
                                        {inBag ? (
                                          <>
                                            <Check size={13} strokeWidth={3} />{" "}
                                            In bag
                                          </>
                                        ) : (
                                          <>
                                            <Plus size={13} strokeWidth={3} />{" "}
                                            Add
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </section>
                          )}

                          <section className="sx-sec">
                            <h3 className="sx-sec-title">
                              <Tag size={14} /> Shop by budget
                            </h3>
                            <div className="sx-chips">
                              {PRICE_CHIPS.map((c) => (
                                <button
                                  key={c.q}
                                  type="button"
                                  className="sx-chip sx-chip-price"
                                  onClick={() => setQuery(c.q)}
                                >
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </section>

                          <section className="sx-sec">
                            <div className="sx-sec-head">
                              <h3 className="sx-sec-title">
                                <BookOpen size={14} /> Browse genres
                              </h3>
                              <Link
                                href="/category"
                                onClick={onClose}
                                className="sx-link sx-link-all"
                              >
                                All categories <ChevronRight size={14} />
                              </Link>
                            </div>
                            <div className="sx-genres">
                              {GENRES.map((g) => (
                                <Link
                                  key={g.k}
                                  href={`/category/${g.k}`}
                                  onClick={onClose}
                                  className="sx-genre"
                                >
                                  <span>{g.l}</span>
                                  <small>{g.n} books</small>
                                </Link>
                              ))}
                            </div>
                          </section>

                          <div className="sx-trust">
                            <span>
                              <Gift size={13} /> Free bookmark
                            </span>
                            <span>
                              <Truck size={13} /> Cash on Delivery
                            </span>
                            <span>
                              <RotateCcw size={13} /> 7-day returns
                            </span>
                          </div>
                        </motion.div>
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
                          className="sx-none"
                        >
                          <span className="sx-none-ic">
                            <Search size={24} />
                          </span>
                          <strong>
                            {filtersActive && matchedBooks.length > 0 ? (
                              `${matchedBooks.length} ${matchedBooks.length === 1 ? "book matches" : "books match"} your search, but none fit these filters`
                            ) : debouncedQuery ? (
                              <>
                                No books found for &ldquo;{debouncedQuery}
                                &rdquo;
                              </>
                            ) : (
                              "No books match these filters"
                            )}
                          </strong>
                          <p>
                            Try a shorter word or an author&apos;s name — or
                            tell us the title and we&apos;ll find it for you.
                          </p>
                          {filtersActive && (
                            <button
                              type="button"
                              className="sx-btn sx-btn-ghost"
                              onClick={() => {
                                setPriceMax(null);
                                setGenre(null);
                              }}
                            >
                              <X size={15} /> Clear filters
                            </button>
                          )}
                          <div className="sx-none-actions">
                            <a
                              href={`https://wa.me/917710892108?text=${encodeURIComponent(whatsappMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sx-btn sx-btn-wa"
                            >
                              Ask us on WhatsApp
                            </a>
                            <button
                              type="button"
                              onClick={() => setShowRecommendationModal(true)}
                              className="sx-btn sx-btn-ghost"
                            >
                              <Sparkles size={15} /> Suggest me a book
                            </button>
                          </div>
                          <div className="sx-none-pop">
                            <span>Popular:</span>
                            {POPULAR_SEARCHES.slice(0, 4).map((t) => (
                              <button
                                key={t}
                                type="button"
                                className="sx-chip"
                                onClick={() => setQuery(t)}
                              >
                                {t}
                              </button>
                            ))}
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
                          {/* Books / QuickReads tabs */}
                          <div
                            className="sx-tabs"
                            role="tablist"
                            aria-label="Result type"
                          >
                            <button
                              type="button"
                              role="tab"
                              aria-selected={resultTab === "books"}
                              className={`sx-tab${resultTab === "books" ? " on" : ""}`}
                              onClick={() => setResultTab("books")}
                            >
                              Books{" "}
                              <span className="sx-tab-n">
                                {sortedBooks.length}
                              </span>
                            </button>
                            <div className="sx-tab-wrap" ref={qrTipRef}>
                              <button
                                type="button"
                                role="tab"
                                aria-selected={resultTab === "qr"}
                                className={`sx-tab${resultTab === "qr" ? " on" : ""}`}
                                onClick={() => setResultTab("qr")}
                              >
                                <Zap size={14} /> QuickReads{" "}
                                <span className="sx-tab-n">
                                  {qrBooks.length}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="sx-info"
                                aria-label="What are QuickReads?"
                                aria-expanded={qrTipOpen}
                                aria-describedby={
                                  qrTipOpen ? "sx-qr-tip" : undefined
                                }
                                onClick={() => setQrTipOpen((v) => !v)}
                              >
                                <Info size={15} />
                              </button>
                              {qrTipOpen && (
                                <span
                                  id="sx-qr-tip"
                                  role="tooltip"
                                  className="sx-tip"
                                >
                                  <b>QuickReads</b> are 10-minute summaries of a
                                  book&apos;s key ideas — read instantly online
                                  for just ₹{QUICKREAD_PRICE}.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Result count + active filters */}
                          <div className="sx-res-head">
                            <span className="sx-res-count">
                              <b style={{ color: "var(--foreground)" }}>
                                {gridItems.length}
                              </b>{" "}
                              {resultTab === "qr"
                                ? gridItems.length === 1
                                  ? "QuickRead"
                                  : "QuickReads"
                                : gridItems.length === 1
                                  ? "book"
                                  : "books"}
                              {debouncedQuery ? (
                                <> for &ldquo;{debouncedQuery}&rdquo;</>
                              ) : (
                                " match your filters"
                              )}
                            </span>
                            {activeFilterCount > 0 && (
                              <div className="sx-active">
                                {sortType !== "relevance" && (
                                  <button
                                    type="button"
                                    className="sx-active-chip"
                                    onClick={() => setSortType("relevance")}
                                  >
                                    {
                                      FILTER_SORTS.find((o) => o.k === sortType)
                                        ?.l
                                    }
                                    <X size={12} />
                                  </button>
                                )}
                                {priceMax != null && (
                                  <button
                                    type="button"
                                    className="sx-active-chip"
                                    onClick={() => setPriceMax(null)}
                                  >
                                    Under ₹{priceMax}
                                    <X size={12} />
                                  </button>
                                )}
                                {genre && (
                                  <button
                                    type="button"
                                    className="sx-active-chip"
                                    onClick={() => setGenre(null)}
                                  >
                                    {GENRES.find((g) => g.k === genre)?.l}
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {resultTab === "qr" && qrBooks.length === 0 && (
                            <p className="sx-tab-empty">
                              No QuickReads for this search yet — check the
                              Books tab.
                            </p>
                          )}
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
                                  <article
                                    className="trending-card"
                                    style={{ position: "relative" }}
                                  >
                                    {/* Same layout as BookCard, just a QuickRead
                                    badge + QuickRead pricing/behaviour. */}
                                    <div className="book-image-wrapper">
                                      <Link
                                        href={`/quickreads/${qrSlug(item.book.name)}`}
                                        onClick={onClose}
                                        aria-label={`Read ${item.book.name} QuickRead`}
                                      >
                                        <img
                                          src={item.book.image}
                                          alt={item.book.name}
                                          className="book-image loaded"
                                        />
                                      </Link>
                                      <span className="search-qr-badge">
                                        <Zap size={11} /> QuickRead
                                      </span>
                                    </div>

                                    <div className="flex flex-col gap-12 book-card margin-tp-24px">
                                      <h3 className="font-16 weight-500">
                                        <Link
                                          href={`/quickreads/${qrSlug(item.book.name)}`}
                                          onClick={onClose}
                                          className="book-title-link"
                                        >
                                          {item.book.name}
                                        </Link>
                                        <div className="font-10 gray-500 mt-4">
                                          <span>QuickRead</span>
                                        </div>
                                      </h3>

                                      <div className="book-content">
                                        <div className="flex flex-col width100">
                                          <div className="price-row">
                                            <span className="discounted price-ribbon-bg">
                                              ₹{QUICKREAD_PRICE}
                                            </span>
                                            <span className="original">
                                              ₹{QUICKREAD_MRP}
                                            </span>
                                          </div>
                                          <span className="green font-10">
                                            Save ₹
                                            {QUICKREAD_MRP - QUICKREAD_PRICE}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="bookcard-cart-row bc-actions-row">
                                        <button
                                          type="button"
                                          className="bookcard-add-btn bc-action-main"
                                          onClick={() => {
                                            if (isInQrCart(item.book.id)) {
                                              window.location.href =
                                                "/bag?tab=quickreads";
                                              return;
                                            }
                                            addQuickRead(item.book.id);
                                            showToast(
                                              "QuickRead added to your bag.",
                                              "success",
                                            );
                                          }}
                                        >
                                          <span className="bc-add-inner">
                                            {isInQrCart(item.book.id) ? (
                                              <>
                                                <Check size={17} />
                                                <span className="bc-add-label">
                                                  In bag
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <ShoppingCart size={17} />
                                                <span className="bc-add-label">
                                                  Add to Cart
                                                </span>
                                              </>
                                            )}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </article>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* Mobile filter sheet — portalled to <body> so it's positioned against
          the screen, not the (transformed) search modal. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {sheetOpen && isNarrow && (
              <motion.div
                className="sx-sheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
              >
                <motion.div
                  className="sx-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sx-sheet-title"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sx-sheet-head">
                    <strong id="sx-sheet-title">
                      <SlidersHorizontal size={16} /> Filters
                    </strong>
                    <button
                      type="button"
                      className="sx-sheet-x"
                      aria-label="Close filters"
                      onClick={() => setSheetOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="sx-sheet-body">
                    {renderFilterGroups(draft, {
                      sort: (v) => setDraft((d) => ({ ...d, sort: v })),
                      price: (v) => setDraft((d) => ({ ...d, price: v })),
                      genre: (v) => setDraft((d) => ({ ...d, genre: v })),
                    })}
                  </div>
                  <div className="sx-sheet-foot">
                    <button
                      type="button"
                      className="sx-sheet-reset"
                      onClick={() =>
                        setDraft({
                          sort: "relevance",
                          price: null,
                          genre: null,
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="sx-filter-apply sx-sheet-save"
                      onClick={saveDraft}
                    >
                      {draftCount != null
                        ? `Save · show ${draftCount} ${draftCount === 1 ? "book" : "books"}`
                        : "Save"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* Recommendation modal — sibling so it layers above search */}
      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
    </>
  );
}
