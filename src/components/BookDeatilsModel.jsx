// components/BookDetailsModal.jsx — the book (product) page.
"use client";

import { useStore } from "@/context/StoreContext";
import { XmasSnow, XmasTree } from "@/components/XmasDecor";
import { showToast } from "@/context/ToastContext";
import { books } from "@/utils/book";
import {
  Heart,
  MessageSquare,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Star,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Check,
  Bell,
  Bookmark,
  Minus,
  Plus,
  BadgeCheck,
  Wallet,
  Zap,
  MapPin,
  ArrowUpRight,
  Package,
  Sparkles,
  Newspaper,
  Clock,
} from "lucide-react";
import Image from "next/image";
import BookCoverImg, { coverFallbackVars } from "@/components/BookCoverImg";
import { useRouter } from "next/navigation";
import LoadingButton from "./UI/LoadingButton";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  hasQuickRead,
  QUICKREAD_PRICE,
  quickReadFrameCount,
} from "@/data/quickreadsMeta";
import QuickReadsReader from "./quickreads/QuickReadsReader";
import BookCard from "./BookCard";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import YouMayLike from "./UI/YouMayLike";
import BookReviews from "./UI/BookReviews";
import StoreReviews from "./StoreReviews";
import LiveOrdersStrip from "./LiveOrdersStrip";
import PdpWhatsApp from "./UI/PdpWhatsApp";
import CartConfetti from "./UI/Confetti";
import { shareContent } from "./UI/ShareSheet";
import { startOffer, PRICE_RISE, requestExtension } from "@/lib/offerTimer";
import { isMaharashtraPin, openPincodeSheet } from "./DeliveryCheckBar";
import { BASE_FREE_BOOKMARKS } from "@/utils/orderRewards";
import {
  FREE_DELIVERY_MIN,
  SITE,
  slugify,
  titleCase,
  authorPath,
  seoNameOf,
  discountOf,
  ratingOf,
  faqsOf,
  relatedOf,
  moreByAuthor,
  companionOf,
  offerEndFor,
} from "@/lib/bookSeo";

const WA_NUMBER = "917710892108";

function Stars({ value, size = 14 }) {
  return (
    <span className="pdp-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(value) ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      ))}
    </span>
  );
}

// The cover on a soft stage. Falls back to the designed cover when the image
// is missing or fails.
function Cover({ book, alt }) {
  const [err, setErr] = useState(false);
  if (!book.image || err) {
    return (
      <div className="book-cover-fallback pdp-cover-fallback" style={coverFallbackVars(book.name)} aria-label={book.name}>
        <span className="bcf-brand">THE BOOKX</span>
        <span className="bcf-rule" />
        <span className="bcf-title">{book.name}</span>
        {book.author && <span className="bcf-author">{book.author}</span>}
      </div>
    );
  }
  return (
    <Image
      src={book.image}
      alt={alt}
      width={360}
      height={540}
      priority
      sizes="(max-width: 767px) 62vw, 360px"
      className="pdp-cover"
      onError={() => setErr(true)}
    />
  );
}

// "Frequently bought together": this book + one companion, both ticked by
// default. Ticking changes the total live; the bundle total, savings and
// free-delivery unlock are spelled out next to one clear button.
function FrequentlyBought({ book, companion, cart, onAdd }) {
  const [pick, setPick] = useState({ main: true, comp: true });
  if (!companion || companion.stock === 0) return null;

  const items = [
    { key: "main", b: book, tag: "This book" },
    { key: "comp", b: companion },
  ];
  const chosen = items.filter((i) => pick[i.key]);
  const total = chosen.reduce((n, i) => n + i.b.discountedPrice, 0);
  const mrp = chosen.reduce((n, i) => n + (i.b.originalPrice || i.b.discountedPrice), 0);
  const save = mrp - total;
  const savePct = mrp ? Math.round((save / mrp) * 100) : 0;
  const hasRupee = chosen.some((i) => i.b.discountedPrice === 1);
  const freeAt = hasRupee ? 399 : FREE_DELIVERY_MIN;
  const unlocksFree = chosen.length === 2 && total >= freeAt;
  const inBag = (id) => cart.some((c) => c.id === id);
  const allInBag = chosen.length > 0 && chosen.every((i) => inBag(i.b.id));
  const toggle = (k) => setPick((p) => ({ ...p, [k]: !p[k] }));

  return (
    <section className="pdp-fbt4" aria-labelledby="pdp-fbt-h">
      <div className="pdp-fbt4-head">
        <h2 id="pdp-fbt-h">Frequently bought together</h2>
        {save > 0 && chosen.length === 2 && <span className="pdp-fbt4-save">Save ₹{save}</span>}
      </div>

      <div className="pdp-fbt4-tiles">
        {items.map((it, i) => {
          const on = pick[it.key];
          return (
            <div key={it.key} className="pdp-fbt4-slot">
              {i > 0 && (
                <span className="pdp-fbt4-plus" aria-hidden="true">
                  <Plus size={12} strokeWidth={3} />
                </span>
              )}
              <button
                type="button"
                className={`pdp-fbt4-tile${on ? " on" : ""}`}
                role="checkbox"
                aria-checked={on}
                aria-label={`${on ? "Remove" : "Include"} ${it.b.name}, ₹${it.b.discountedPrice}`}
                onClick={() => toggle(it.key)}
                data-no-busy
              >
                <BookCoverImg src={it.b.image} name={it.b.name} author={it.b.author} className="pdp-fbt4-img" />
                <span className="pdp-fbt4-txt">
                  <small>{it.tag || "Add-on"}</small>
                  <b>{it.b.name}</b>
                  <em>₹{it.b.discountedPrice}</em>
                </span>
                <span className="pdp-fbt4-check" aria-hidden="true">
                  {on && <Check size={11} strokeWidth={4} />}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="pdp-fbt4-buy">
        <span className="pdp-fbt4-total">
          <small>{chosen.length === 2 ? "Both for" : chosen.length ? "Total" : "Pick a book"}</small>
          {chosen.length > 0 && (
            <span>
              <motion.b key={total} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }}>
                ₹{total}
              </motion.b>
              {save > 0 && <s>₹{mrp}</s>}
              {unlocksFree && <em>Free delivery</em>}
            </span>
          )}
        </span>
        {allInBag ? (
          <Link href="/bag" className="pdp-fbt4-cta in">
            In bag <ChevronRight size={15} />
          </Link>
        ) : (
          <button
            type="button"
            className="pdp-fbt4-cta"
            disabled={chosen.length === 0}
            onClick={() => onAdd(chosen.filter((i) => !inBag(i.b.id)).map((i) => i.b))}
          >
            <ShoppingCart size={15} />
            {chosen.length === 2 ? "Add both" : "Add to bag"}
          </button>
        )}
      </div>
    </section>
  );
}

// "Offer price ends in 01h 58m 16s, then ₹149" + "Extend offer for me".
// Counts down to this device's real end (from the Timers sheet) and hides at 0.
function OfferTimer({ endsAt, after = null, compact = false }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, endsAt - Date.now()));
    const t0 = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [endsAt]);
  if (left === null || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const parts = [
    ...(d ? [[d, "d"]] : []),
    [Math.floor((s % 86400) / 3600), "h"],
    [Math.floor((s % 3600) / 60), "m"],
    [s % 60, "s"],
  ];
  const hms = parts.map(([v]) => String(v).padStart(2, "0")).join(":");
  return (
    <div className={`pdp-ot${compact ? " compact" : ""}`} role="timer" aria-live="off">
      <p className="pdp-ot-main">
        <Clock size={13} className="pdp-ot-ic" aria-hidden="true" />
        <span>Offer ends</span>
        <b className="pdp-ot-time" aria-label={`in ${hms}`}>
          {/* Each digit re-mounts when it changes, so it slides in; colons stay put. */}
          {hms.split("").map((ch, i) =>
            ch === ":" ? (
              <span key={`c${i}`} className="pdp-ot-colon" aria-hidden="true">:</span>
            ) : (
              <span key={`${i}-${ch}`} className="pdp-ot-dig" aria-hidden="true">
                {ch}
              </span>
            ),
          )}
        </b>
        {after && <span className="pdp-ot-then">· then ₹{after}</span>}
        {after && (
          <button type="button" className="pdp-ot-link" onClick={requestExtension} data-no-busy>
            Extend
          </button>
        )}
      </p>
    </div>
  );
}

function ReviewsSummary({ rating, count, dist }) {
  return (
    <div className="pdp-rs">
      <div className="pdp-rs-score">
        <b>{Number(rating).toFixed(1)}</b>
        <Stars value={rating} size={16} />
        <span>{count.toLocaleString("en-IN")} ratings</span>
      </div>
      <div className="pdp-rs-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const c = dist[star] || 0;
          const pct = count ? (c / count) * 100 : 0;
          return (
            <div className="pdp-rs-row" key={star}>
              <span>{star}★</span>
              <span className="pdp-rs-track">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="pdp-rs-c">{Math.round(pct)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Delivery estimate from the pincode the shopper saved in the delivery stripe.
function useDeliveryPin() {
  const [pin, setPin] = useState({ code: "", city: "" });
  useEffect(() => {
    const read = () => {
      try {
        const code = String(localStorage.getItem("delivery_pincode") || "").replace(/\D/g, "");
        setPin(code.length === 6 ? { code, city: localStorage.getItem("delivery_city") || "" } : { code: "", city: "" });
      } catch {
        /* ignore */
      }
    };
    const t = setTimeout(read, 0);
    window.addEventListener("tbx:pincode-set", read);
    return () => {
      clearTimeout(t);
      window.removeEventListener("tbx:pincode-set", read);
    };
  }, []);
  return pin;
}

export default function BookDetailsModal({ book: bookProp }) {
  // Use the shared client copy of this book (the server prop is a serialized
  // snapshot), so the device's post-offer price applies here too.
  const book = books.find((b) => b.id === bookProp.id) || bookProp;
  const {
    cart,
    addToCart,
    decreaseQty,
    toggleWishlist,
    wishlist,
    addQuickRead,
    removeQuickRead,
    isInQrCart,
  } = useStore();
  const inWishlist = wishlist.includes(book.id);
  const router = useRouter();
  const pin = useDeliveryPin();

  const heroRef = useRef(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  // Underline the tab of the section currently in view.
  useEffect(() => {
    const ids = ["about", "details", "reviews", "faq"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveTab(hit.target.id);
      },
      { rootMargin: "-130px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const bookHasQuickRead = hasQuickRead(book.id);

  const qtyInCart = cart.find((i) => i.id === book.id)?.qty || 0;
  const canonicalUrl = `${SITE}/books/${slugify(book.name)}`;
  const { seoName } = seoNameOf(book);
  const { price, mrp, save, pct } = discountOf(book);
  const cat = book.catalogue?.[0];
  const isBestseller = book.catalogue?.includes("bestseller");

  const isOneRupee = price === 1;
  const hasOneRupeeInCart = cart.some(
    (i) => books.find((x) => x.id === i.id)?.discountedPrice === 1,
  );
  const isOneRupeeLimitReached = isOneRupee && hasOneRupeeInCart;
  const isOutOfStock = book.stock === 0;
  const isAddDisabled = isOneRupeeLimitReached || isOutOfStock;
  const lowStock = !isOutOfStock && book.stock > 0 && book.stock < 10;

  const { reviews, real: hasRealReviews, rating, count: reviewCount } = ratingOf(book);
  const faqs = useMemo(() => faqsOf(book), [book]);
  const relatedBooks = useMemo(() => relatedOf(book), [book]);
  const byAuthor = useMemo(() => moreByAuthor(book), [book]);
  const companion = useMemo(() => companionOf(book, relatedBooks), [book, relatedBooks]);
  const allCategories = useMemo(
    () => [...new Set(books.flatMap((b) => b.catalogue || []))].slice(0, 18),
    [],
  );
  const readLinks = (book.links || []).filter(
    (l) =>
      l && l.url && l.title &&
      l.url.replace(/^https?:\/\/(www\.)?thebookx\.in/, "").replace(/\/$/, "") !== `/books/${slugify(book.name)}`,
  );

  // Star spread: real per-star counts scaled to the total, or a typical
  // 5-heavy spread when the title has no stored reviews.
  const reviewDist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (hasRealReviews) {
      reviews.forEach((r) => {
        d[Math.max(1, Math.min(5, Math.round(r.rating)))] += 1;
      });
      const n = reviews.length;
      if (reviewCount > n) {
        let assigned = 0;
        [5, 4, 3, 2].forEach((s) => {
          d[s] = Math.round((d[s] / n) * reviewCount);
          assigned += d[s];
        });
        d[1] = Math.max(0, reviewCount - assigned);
      }
      return d;
    }
    d[5] = Math.round(reviewCount * 0.8);
    d[4] = Math.round(reviewCount * 0.14);
    d[3] = Math.round(reviewCount * 0.04);
    d[2] = Math.round(reviewCount * 0.01);
    d[1] = Math.max(0, reviewCount - (d[5] + d[4] + d[3] + d[2]));
    return d;
  }, [hasRealReviews, reviews, reviewCount]);

  // Device offer: starts on the first book-page visit, lasts 2 hours. A real
  // site-wide sale end (SALE_ENDS_AT / book.offerEndsAt) is used if one is set.
  const [deviceEnd, setDeviceEnd] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = startOffer(book);
      setDeviceEnd(s.started && !s.expired ? s.endsAt : 0);
    }, 0);
    return () => clearTimeout(t);
  }, [book]);
  const offerEnd = offerEndFor(book) || deviceEnd || null;
  const priceAfter = deviceEnd && price > 1 ? Math.min(price + PRICE_RISE, mrp || Infinity) : null;
  const mh = pin.code && isMaharashtraPin(pin.code);
  const freeDelivery = price >= FREE_DELIVERY_MIN;

  const celebrate = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1300);
  };

  // Bundle add: skips a second ₹1 book (one per order) and anything out of stock.
  const handleAddBundle = (list) => {
    let rupeeTaken = hasOneRupeeInCart;
    const added = [];
    list.forEach((b) => {
      if (b.stock === 0) return;
      if (b.discountedPrice === 1) {
        if (rupeeTaken) return;
        rupeeTaken = true;
      }
      addToCart(b.id, "detail");
      added.push(b);
    });
    if (!added.length) {
      showToast("These books can't be added right now", "info");
      return;
    }
    celebrate();
    showToast(
      added.length > 1 ? `${added.length} books added to your bag` : added[0].name,
      "success",
      { title: "Added to your bag", icon: "cart" },
    );
  };

  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyHeader(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-60px 0px 0px 0px" },
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWishlist = () => {
    toggleWishlist(book.id);
    showToast(inWishlist ? "Removed from wishlist" : "Added to wishlist", "success");
  };

  const guardAdd = () => {
    if (isOneRupeeLimitReached) {
      showToast("Maximum book allotted reached for Rs.1", "info");
      return false;
    }
    if (isOutOfStock) {
      showToast("This book is currently out of stock", "warning");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!guardAdd()) return;
    addToCart(book.id, "detail");
    celebrate();
    showToast(book.name, "success", { title: "Added to your bag", icon: "cart" });
  };

  const handleBuyNow = () => {
    if (qtyInCart === 0) {
      if (!guardAdd()) return;
      addToCart(book.id, "detail");
    }
    router.push("/bag");
  };

  const handleShare = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const shareData = {
      title: book.name,
      text: `Check out "${book.name}"${book.author ? ` by ${book.author}` : ""} at TheBookX!`,
      url: canonicalUrl,
    };
    await shareContent(shareData);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "view_item", {
        currency: "INR",
        value: book.discountedPrice,
        items: [
          {
            item_id: book.id,
            item_name: book.name,
            price: book.discountedPrice,
            item_category: book.catalogue?.[0] || "books",
          },
        ],
      });
    }
  }, [book]);

  const notifyHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi TheBookX, please make "${book.name}"${
      book.author ? ` by ${book.author}` : ""
    } available and notify me when it's back in stock.`,
  )}`;

  const heart = (size) => (
    <Heart
      size={size}
      fill={inWishlist ? "var(--danger)" : "none"}
      color={inWishlist ? "var(--danger)" : "currentColor"}
    />
  );

  // Main buttons, shared by the info column and the sticky header.
  const ctas = (compact = false) =>
    isOutOfStock ? (
      <a
        href={notifyHref}
        target="_blank"
        rel="noopener noreferrer"
        className="pdp-btn pdp-btn-dark pdp-btn-grow"
        aria-label={`Notify me when ${book.name} is back in stock`}
      >
        <Bell size={17} /> Notify me when it&apos;s back
      </a>
    ) : qtyInCart > 0 ? (
      <>
        <div className="pdp-stepper">
          <button type="button" onClick={() => decreaseQty(book.id)} aria-label="Decrease quantity">
            <Minus size={15} />
          </button>
          <span>{qtyInCart} in bag</span>
          <button
            type="button"
            onClick={() => addToCart(book.id, "detail")}
            aria-label="Increase quantity"
            disabled={isAddDisabled}
          >
            <Plus size={15} />
          </button>
        </div>
        <Link href="/bag" className="pdp-btn pdp-btn-dark pdp-btn-grow">
          Go to bag <ChevronRight size={16} />
        </Link>
      </>
    ) : (
      <>
        <LoadingButton
          className="pdp-btn pdp-btn-line pdp-btn-grow"
          onClick={handleAddToCart}
          aria-disabled={isAddDisabled}
          icon={<ShoppingCart size={17} />}
        >
          Add to bag
        </LoadingButton>
        {!compact && (
          <button type="button" className="pdp-btn pdp-btn-dark pdp-btn-grow" onClick={handleBuyNow}>
            <Zap size={16} /> Buy now
          </button>
        )}
      </>
    );

  return (
    <>
      <Navbar />

      {/* Slim bar once the hero scrolls away: title, price and the main button. */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.div
            className="bd-sticky-header pdp-sticky"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pdp-sticky-in">
              <BookCoverImg src={book.image} name={book.name} author={book.author} className="pdp-sticky-img" />
              <span className="pdp-sticky-txt">
                <b>{book.name}</b>
                <small>
                  ₹{price}
                  {pct > 0 && <s>₹{mrp}</s>}
                </small>
              </span>
              <div className="pdp-sticky-cta">{ctas(true)}</div>
              <button
                type="button"
                className="pdp-icon"
                onClick={handleWishlist}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {heart(18)}
              </button>
              <button type="button" className="pdp-icon" onClick={handleShare} aria-label="Share book">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pdp-page">
      {/* Christmas: blush backdrop with snow falling behind and (lightly) over the cards */}
      <div className="pdp-fx" aria-hidden="true">
        <XmasSnow className="pdp-snowfall" density={0.9} />
      </div>
      <div className="pdp-fx front" aria-hidden="true">
        <XmasSnow className="pdp-snowfall" density={0.3} max={22} />
      </div>
      <main className="pdp pdp-x">
        <nav className="pdp-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link href="/books">Books</Link>
          {cat && (
            <>
              <ChevronRight size={13} aria-hidden="true" />
              <Link href={`/category/${cat}`}>{titleCase(cat)}</Link>
            </>
          )}
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{book.name}</span>
        </nav>

        {/* ===== Hero ===== */}
        <section ref={heroRef} className="pdp-hero">
          <div className="pdp-media">
            <div className="pdp-stage pdp-xmas">
              {/* Christmas: light snowfall and a little tree by the cover */}
              <XmasSnow density={0.8} />

              <XmasTree size={60} gifts={false} className="pdp-tree" />
              <Cover
                book={book}
                alt={`${book.name}${book.author ? ` by ${book.author}` : ""} book cover`}
              />
              {isOneRupee && !isOutOfStock && <span className="pdp-flag">Just ₹1</span>}
              {isOutOfStock && <span className="pdp-flag dark">Out of stock</span>}
              <div className="pdp-stage-actions">
                <button
                  type="button"
                  className="pdp-icon"
                  onClick={handleWishlist}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {heart(19)}
                </button>
                <button type="button" className="pdp-icon" onClick={handleShare} aria-label="Share book">
                  <Share2 size={19} />
                </button>
              </div>
            </div>
          </div>

          <div className="pdp-info">
            <div className="pdp-card pdp-head pdp-snowy">
            <div className="pdp-eyebrow">
              {cat && <Link href={`/category/${cat}`}>{titleCase(cat)}</Link>}
              {isBestseller && <span className="pdp-tag">Bestseller</span>}
            </div>

            <h1 className="pdp-title">{seoName}</h1>

            <div className="pdp-byline">
              {book.author && (
                <span>
                  by{" "}
                  <Link href={authorPath(book)} className="pdp-author">
                    {book.author}
                  </Link>
                </span>
              )}
              <a href="#reviews" className="pdp-rating" aria-label={`Rated ${rating} out of 5, ${reviewCount} ratings`}>
                <Stars value={rating} />
                <b>{Number(rating).toFixed(1)}</b>
                <span>({reviewCount.toLocaleString("en-IN")})</span>
              </a>
            </div>
            </div>

            <div className="pdp-card pdp-buy">
            <div className="pdp-price">
              <div className="pdp-price-row">
                <span className="pdp-now">₹{price}</span>
                {pct > 0 && <span className="pdp-off">{pct}% OFF</span>}
              </div>
              <p className="pdp-price-mrp">Inclusive of all taxes</p>

              {offerEnd && <OfferTimer endsAt={offerEnd} after={priceAfter} />}

              {pct > 0 && (
                <div className="pdp-bd2" aria-label={`MRP ₹${mrp}, discount ₹${save}, you pay ₹${price}`}>
                  <div className="pdp-bd2-eq">
                    <span><small>MRP</small><s>₹{mrp}</s></span>
                    <i>−</i>
                    <span className="g"><small>Discount</small>₹{save}</span>
                    <i>=</i>
                    <span className="k"><small>You pay</small>₹{price}</span>
                  </div>
                  <div className="pdp-bd-bar" aria-hidden="true">
                    <span className="pay" style={{ width: `${100 - pct}%` }} />
                    <span className="saved" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              {!isOutOfStock && (
                <p className={`pdp-stock${lowStock ? " low" : ""}`}>
                  <span className="pdp-stock-dot" />
                  {lowStock ? `Only ${book.stock} left in stock` : "In stock, ships within a day"}
                </p>
              )}
            </div>
            <div className="pdp-ctas">{ctas()}</div>
            </div>

            <FrequentlyBought book={book} companion={companion} cart={cart} onAdd={handleAddBundle} />

            {/* Delivery: estimate from the saved pincode, or a prompt to add one */}
            <div className="pdp-deliv pdp-card">
              <div className="pdp-deliv-row">
                {mh ? <Zap size={17} className="pdp-ic fast" /> : <Truck size={17} className="pdp-ic" />}
                <span className="pdp-deliv-txt">
                  {pin.code ? (
                    <>
                      Delivers to <b>{pin.city || pin.code}</b> in <b>{mh ? "1–5 days" : "4–9 days"}</b>
                      {!mh && <small>1–6 days with Faster delivery at checkout</small>}
                    </>
                  ) : (
                    <>
                      <b>Delivery in 4–9 days</b>
                      <small>Add your pincode for an exact estimate</small>
                    </>
                  )}
                </span>
                <button type="button" className="pdp-link-btn" onClick={openPincodeSheet} data-no-busy>
                  <MapPin size={13} />
                  {pin.code ? "Change" : "Check"}
                </button>
              </div>
              <div className="pdp-deliv-row">
                <Package size={17} className="pdp-ic" />
                <span className="pdp-deliv-txt">
                  {freeDelivery ? (
                    <b>Free delivery on this book</b>
                  ) : (
                    <>
                      <b>Free delivery above ₹{FREE_DELIVERY_MIN}</b>
                      <small>Add ₹{FREE_DELIVERY_MIN - price} more to your bag to unlock it</small>
                    </>
                  )}
                </span>
              </div>
              <div className="pdp-deliv-row">
                <Wallet size={17} className="pdp-ic" />
                <span className="pdp-deliv-txt">
                  <b>UPI or Cash on Delivery</b>
                </span>
              </div>
            </div>

            {/* QuickReads add-on — temporarily hidden. Change `false &&` back
                to `bookHasQuickRead &&` to re-enable. */}
            {false && bookHasQuickRead && (
              <div className={`bd-qr-addon${isInQrCart(book.id) ? " added" : ""}`}>
                <span className="bd-qr-addon-ic">
                  <Zap size={16} />
                </span>
                <div className="bd-qr-addon-copy">
                  <span className="bd-qr-addon-title">Add QuickReads to your order</span>
                  <span className="bd-qr-addon-sub">
                    {quickReadFrameCount(book.id)} key insights · unlocks instantly · billed together
                  </span>
                </div>
                <div className="bd-qr-addon-right">
                  <span className="bd-qr-addon-price">+₹{QUICKREAD_PRICE}</span>
                  <div className="bd-qr-addon-actions">
                    <button type="button" className="bd-qr-addon-read" onClick={() => setShowQR(true)}>
                      <BookOpen size={14} /> Read
                    </button>
                    <button
                      type="button"
                      className={`bd-qr-addon-btn${isInQrCart(book.id) ? " on" : ""}`}
                      onClick={() => (isInQrCart(book.id) ? removeQuickRead(book.id) : addQuickRead(book.id))}
                    >
                      {isInQrCart(book.id) ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pdp-card pdp-why">
            <ul className="pdp-perks">
              <li>
                <Bookmark size={16} />
                <span>
                  <b>{BASE_FREE_BOOKMARKS} free</b> bookmarks
                </span>
              </li>
              <li>
                <BadgeCheck size={16} />
                <span>Genuine new copy</span>
              </li>
              <li>
                <RotateCcw size={16} />
                <span>7-day replacement</span>
              </li>
              <li>
                <ShieldCheck size={16} />
                <span>Protective packing</span>
              </li>
            </ul>

            <dl className="pdp-facts">
              {book.size && (
                <div>
                  <dt>Format</dt>
                  <dd>{book.size}</dd>
                </div>
              )}
              {book.pages && (
                <div>
                  <dt>Pages</dt>
                  <dd>{book.pages}</dd>
                </div>
              )}
              {book.language && (
                <div>
                  <dt>Language</dt>
                  <dd>{book.language}</dd>
                </div>
              )}
            </dl>
            </div>
          </div>
        </section>

        {/* Section shortcuts */}
        <nav className="pdp-jump" aria-label="On this page">
          {[
            ["about", "About"],
            ["details", "Details"],
            ["reviews", "Reviews"],
            ["faq", "FAQ"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeTab === id ? "on" : ""}
              aria-current={activeTab === id ? "true" : undefined}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* ===== About ===== */}
        <section className="pdp-sec" id="about" aria-labelledby="pdp-about-h">
          <h2 id="pdp-about-h" className="pdp-h2">
            About {book.name}
          </h2>
          <div className={`pdp-desc${descOpen ? " open" : ""}`}>
            <p>{book.description}</p>
          </div>
          {String(book.description || "").length > 260 && (
            <button type="button" className="pdp-more" onClick={() => setDescOpen((v) => !v)} data-no-busy>
              {descOpen ? "Show less" : "Read more"}
              <ChevronDown size={15} className={descOpen ? "up" : ""} />
            </button>
          )}
          {readLinks.length > 0 && (
            <div className="pdp-reads">
              <div className="pdp-reads-head">
                <h3 className="pdp-h3">Read more about this book</h3>
                {book.mediumUrl && (
                  <a href={book.mediumUrl} target="_blank" rel="noopener" className="pdp-link-btn">
                    All articles <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
              <ul className="pdp-reads-list">
                {readLinks.map((l) => {
                  const internal = /(^\/|thebookx\.in)/.test(l.url);
                  const Ic = internal ? BookOpen : Newspaper;
                  return (
                    <li key={l.url}>
                      <a
                        href={internal ? l.url.replace(/^https?:\/\/(www\.)?thebookx\.in/, "") || "/" : l.url}
                        {...(internal ? {} : { target: "_blank", rel: "noopener" })}
                        className="pdp-read"
                      >
                        <Ic size={18} className="pdp-read-ic" aria-hidden="true" />
                        <span className="pdp-read-txt">
                          <b>{l.title}</b>
                          <small>{internal ? "On TheBookX" : "Article · Medium · opens in a new tab"}</small>
                        </span>
                        {internal ? (
                          <ChevronRight size={17} className="pdp-read-go" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight size={17} className="pdp-read-go" aria-hidden="true" />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* ===== Details + delivery ===== */}
        <section className="pdp-sec pdp-two" id="details">
          <div>
            <h2 className="pdp-h2">Book details</h2>
            <dl className="pdp-specs">
              <div>
                <dt>Title</dt>
                <dd>{book.name}</dd>
              </div>
              {book.author && (
                <div>
                  <dt>Author</dt>
                  <dd>
                    <Link href={authorPath(book)}>{book.author}</Link>
                  </dd>
                </div>
              )}
              {book.series && (
                <div>
                  <dt>Series</dt>
                  <dd>{book.series}</dd>
                </div>
              )}
              {book.size && (
                <div>
                  <dt>Format</dt>
                  <dd>{book.size}</dd>
                </div>
              )}
              {book.pages && (
                <div>
                  <dt>Pages</dt>
                  <dd>{book.pages}</dd>
                </div>
              )}
              {book.language && (
                <div>
                  <dt>Language</dt>
                  <dd>{book.language}</dd>
                </div>
              )}
              {book.isbn && (
                <div>
                  <dt>ISBN</dt>
                  <dd>{book.isbn}</dd>
                </div>
              )}
              {book.catalogue?.length > 0 && (
                <div>
                  <dt>Categories</dt>
                  <dd className="pdp-spec-links">
                    {book.catalogue.map((c) => (
                      <Link key={c} href={`/category/${slugify(c)}`}>
                        {titleCase(c)}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt>Condition</dt>
                <dd>New</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="pdp-h2">Delivery &amp; returns</h2>
            <ul className="pdp-policy">
              <li>
                <Truck size={18} />
                <span>
                  <b>Ships within a day</b>
                  4–9 days across India, 1–5 days in Maharashtra. Faster delivery at checkout brings it to 1–6 days.
                </span>
              </li>
              <li>
                <Package size={18} />
                <span>
                  <b>Free delivery above ₹{FREE_DELIVERY_MIN}</b>
                  Orders below ₹{FREE_DELIVERY_MIN} have a ₹69 delivery charge.
                </span>
              </li>
              <li>
                <Wallet size={18} />
                <span>
                  <b>UPI or Cash on Delivery</b>
                  Pay online, or pay at your door (a small COD fee applies).
                </span>
              </li>
              <li>
                <RotateCcw size={18} />
                <span>
                  <b>7-day replacement</b>
                  Damaged or wrong copy? Report it within 7 days of delivery for a replacement or refund.{" "}
                  <Link href="/refund">Return policy</Link>
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ===== Reviews ===== */}
        <section className="pdp-sec" id="reviews" aria-labelledby="pdp-rev-h">
          <div className="pdp-sec-head">
            <h2 id="pdp-rev-h" className="pdp-h2">Ratings &amp; reviews</h2>
            {!hasRealReviews && (
              <Link href={`/review?bk=${book.id}`} className="pdp-link-btn">
                <MessageSquare size={14} /> Write a review
              </Link>
            )}
          </div>
          <ReviewsSummary rating={rating} count={reviewCount} dist={reviewDist} />
          <div className="pdp-reviews">
            {hasRealReviews ? (
              <BookReviews bookId={book.id} bookName={book.name} authorName={book.author} />
            ) : (
              <>
                <p className="pdp-note">
                  No reader reviews for this title yet. Here&apos;s what customers say about shopping with TheBookX:
                </p>
                <StoreReviews />
              </>
            )}
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="pdp-sec" id="faq" aria-labelledby="pdp-faq-h">
          <h2 id="pdp-faq-h" className="pdp-h2">Questions about {book.name}</h2>
          <div className="pdp-faq">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  <h3>{f.q}</h3>
                  <ChevronDown size={17} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="pdp-ask">
            Still have a question?{" "}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi TheBookX, I have a question about "${book.name}".`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask us on WhatsApp
            </a>
          </p>
        </section>

        {/* ===== More by the author ===== */}
        {byAuthor.length > 0 && (
          <section className="pdp-sec" aria-labelledby="pdp-auth-h">
            <div className="pdp-sec-head">
              <h2 id="pdp-auth-h" className="pdp-h2">More by {book.author}</h2>
              <Link href={authorPath(book)} className="pdp-link-btn">
                See all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="pdp-row">
              {byAuthor.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        )}

        {/* ===== Similar books ===== */}
        <section className="pdp-sec pdp-sec-flush">
          <YouMayLike
            title={`Books like ${book.name}`}
            subtitle={cat ? `More ${titleCase(cat).toLowerCase()} picks readers love` : "Picked for you"}
            items={relatedBooks}
            initialCount={6}
            step={6}
            slugify={slugify}
            renderItem={(b) => <BookCard key={b.id} book={b} />}
          />
        </section>

        {/* ===== Browse ===== */}
        <section className="pdp-sec" aria-labelledby="pdp-browse-h">
          <h2 id="pdp-browse-h" className="pdp-h2">Browse more categories</h2>
          <div className="pdp-chips">
            {allCategories.map((c) => (
              <Link key={c} href={`/category/${slugify(c)}`} className={book.catalogue?.includes(c) ? "on" : ""}>
                {titleCase(c)}
              </Link>
            ))}
          </div>
        </section>

        {/* ===== Buying guide (readable copy for search) ===== */}
        <section className="pdp-sec pdp-seo" aria-labelledby="pdp-seo-h">
          <h2 id="pdp-seo-h" className="pdp-h2">
            Buy {book.name}
            {book.author ? ` by ${book.author}` : ""} online in India
          </h2>
          <p>
            Order <strong>{book.name}</strong>
            {book.author ? ` by ${book.author}` : ""} on TheBookX for ₹{price}
            {pct ? `, ${pct}% below the ₹${mrp} MRP` : ""}. It&apos;s a new{" "}
            {String(book.size || "paperback").toLowerCase()}
            {book.language ? ` in ${book.language}` : ""}
            {book.pages ? `, ${book.pages} pages` : ""}, shipped within a day in protective packaging.
            Pay by UPI or Cash on Delivery, get free delivery on orders above ₹{FREE_DELIVERY_MIN}, and
            add {BASE_FREE_BOOKMARKS} free bookmarks to every order.
          </p>
          {cat && (
            <p>
              Enjoyed it? Explore more{" "}
              <Link href={`/category/${cat}`}>{titleCase(cat).toLowerCase()} books</Link>
              {book.author && (
                <>
                  {" "}
                  or everything by <Link href={authorPath(book)}>{book.author}</Link>
                </>
              )}
              .
            </p>
          )}
        </section>

        <div className="bd-bottom-spacer" />
      </main>
      </div>

      {/* ===== Sticky bottom bar (phones) ===== */}
      <div className="bd-sticky-bottom pdp-bar">
        <CartConfetti trigger={confetti} />
        {/* WhatsApp "best price?" button, floating just above the bar */}
        <PdpWhatsApp
          book={book}
          price={price}
          mrp={mrp}
          liked={inWishlist}
          heart={heart(18)}
          onLike={handleWishlist}
          onShare={handleShare}
        />
        {offerEnd ? (
          <OfferTimer endsAt={offerEnd} after={priceAfter} compact />
        ) : (
          <div className="bd-sticky-orders">
            <LiveOrdersStrip />
          </div>
        )}
        <div className="pdp-bar-in">
          <div className="pdp-bar-price">
            <b>₹{price}</b>
            {pct > 0 && (
              <span>
                <s>₹{mrp}</s> <em>{pct}% off</em>
              </span>
            )}
          </div>
          {isOutOfStock ? (
            <a
              href={notifyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pdp-bar-cta dark"
              aria-label={`Notify me when ${book.name} is back in stock`}
            >
              <Bell size={17} /> Notify me
            </a>
          ) : qtyInCart > 0 ? (
            <div className="pdp-bar-incart">
              <div className="pdp-bar-step">
                <button type="button" onClick={() => decreaseQty(book.id)} aria-label="Decrease quantity">
                  <Minus size={15} strokeWidth={2.5} />
                </button>
                <motion.span key={qtyInCart} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  {qtyInCart}
                </motion.span>
                <button
                  type="button"
                  onClick={() => addToCart(book.id, "detail")}
                  aria-label="Increase quantity"
                  disabled={isAddDisabled}
                >
                  <Plus size={15} strokeWidth={2.5} />
                </button>
              </div>
              <Link href="/bag" className="pdp-bar-cta dark">
                Bag <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <LoadingButton
              className="pdp-bar-cta"
              onClick={handleAddToCart}
              aria-disabled={isAddDisabled}
              icon={<ShoppingCart size={17} />}
            >
              Add to Cart
            </LoadingButton>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <QuickReadsReader
            book={book}
            onClose={() => setShowQR(false)}
            onUnlock={() =>
              showToast("Unlock & payment is being set up — enjoy the free insights!", "info")
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
