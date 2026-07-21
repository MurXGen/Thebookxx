// components/BookDetailsModal.jsx
"use client";

import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { books } from "@/utils/book";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Globe,
  Package,
  CheckCircle2,
  Check,
  XCircle,
  Bookmark,
  Minus,
  Plus,
  BadgeCheck,
  Wallet,
  Gift,
  Users,
  GraduationCap,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoadingButton from "./UI/LoadingButton";
import Script from "next/script";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { flyToCart } from "@/lib/flyToCart";
import { hasQuickRead, QUICKREAD_PRICE, quickReadFrameCount } from "@/data/quickreads";
import QuickReadsReader from "./quickreads/QuickReadsReader";
import BookCard from "./BookCard";
import Link from "next/link";
import YouMayLike from "./UI/YouMayLike";
import BookReviews from "./UI/BookReviews";
import StoreReviews from "./StoreReviews";
import LiveOrdersStrip from "./LiveOrdersStrip";
import BookLinksStrip from "./BookLinksStrip";
import CartConfetti from "./UI/Confetti";
import { getReviewsByBook, getAverageRating } from "@/utils/reviews";

// Slugify function
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStableReviewCount(bookId) {
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 20;
  const max = 300;
  return Math.abs(hash % (max - min + 1)) + min;
}

function getStableRating(bookId) {
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Number((4 + (Math.abs(hash) % 10) / 10).toFixed(1));
}

// Reusable accordion
function Accordion({ icon: Icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bd-accordion">
      <div
        className="bd-accordion-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h2 className="bd-accordion-title" style={{ margin: 0 }}>
          {Icon && <Icon size={18} className="bd-accordion-icon" />}
          {title}
        </h2>
        {open ? (
          <ChevronUp size={18} className="bd-accordion-chevron" />
        ) : (
          <ChevronDown size={18} className="bd-accordion-chevron" />
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bd-accordion-body-wrap"
          >
            <div className="bd-accordion-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Swipeable product gallery. Books have a single cover, so we render it
// across two frames (same image) with pagination dots + arrows, matching
// the e-commerce product-slider pattern the reference store uses.
function BookGallery({ image, alt }) {
  const frames = [image, image];
  const [index, setIndex] = useState(0);
  const startX = useRef(null);

  const go = (i) => setIndex((i + frames.length) % frames.length);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    startX.current = null;
  };

  return (
    <div className="bd-gallery">
      <div
        className="bd-gallery-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="bd-gallery-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {frames.map((src, i) => (
            <div className="bd-gallery-slide" key={i}>
              <Image
                src={src}
                alt={alt}
                width={300}
                height={420}
                priority={i === 0}
                className="bd-cover"
                {...(i === 0 ? { itemProp: "image" } : {})}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="bd-gallery-arrow bd-gallery-arrow-left"
          onClick={() => go(index - 1)}
          aria-label="Previous image"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="bd-gallery-arrow bd-gallery-arrow-right"
          onClick={() => go(index + 1)}
          aria-label="Next image"
        >
          <ChevronRight size={18} />
        </button>

        <div
          className="bd-gallery-dots"
          role="tablist"
          aria-label="Product images"
        >
          {frames.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`bd-gallery-dot ${i === index ? "active" : ""}`}
              onClick={() => go(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-selected={i === index}
              role="tab"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 4-up trust badge grid (mirrors the reference's "Imported Oils / Cruelty-Free
// / IFRA / Assured Delivery" row, mapped to book-relevant guarantees).
function TrustBadges() {
  const items = [
    { icon: BadgeCheck, label: "Genuine Copy" },
    { icon: Truck, label: "Free Shipping" },
    { icon: Wallet, label: "Cash on Delivery" },
    { icon: RotateCcw, label: "7-Day Returns" },
  ];
  return (
    <div className="bd-badges">
      {items.map(({ icon: Icon, label }) => (
        <div className="bd-badge" key={label}>
          <Icon size={20} className="bd-badge-icon" />
          <span className="bd-badge-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// "Great for" occasions row (mirrors their "Where To Wear It").
function PerfectFor() {
  const items = [
    { icon: Gift, label: "Gifting" },
    { icon: BookOpen, label: "Self-read" },
    { icon: Users, label: "Book clubs" },
    { icon: GraduationCap, label: "Students" },
    { icon: Sparkles, label: "Collectors" },
  ];
  return (
    <section className="bd-occasions">
      <h2 className="bd-section-title">Great for</h2>
      <div className="bd-occasions-row">
        {items.map(({ icon: Icon, label }) => (
          <div className="bd-occasion" key={label}>
            <span className="bd-occasion-icon">
              <Icon size={20} />
            </span>
            <span className="bd-occasion-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// "Frequently bought together" combo (mirrors their "Best Selling Combos").
function FrequentlyBought({ book, companion, onAddBoth }) {
  if (!companion) return null;
  const total = book.discountedPrice + companion.discountedPrice;
  const orig =
    (book.originalPrice || book.discountedPrice) +
    (companion.originalPrice || companion.discountedPrice);
  const save = orig - total;
  return (
    <section className="bd-combo">
      <h2 className="bd-section-title">Frequently bought together</h2>
      <div className="bd-combo-inner">
        <div className="bd-combo-items">
          <div className="bd-combo-item">
            {book.image && (
              <Image
                src={book.image}
                alt={book.name}
                width={60}
                height={84}
                className="bd-combo-img"
              />
            )}
            <div className="bd-combo-meta">
              <span className="bd-combo-name">{book.name}</span>
              <span className="bd-combo-p">₹{book.discountedPrice}</span>
            </div>
          </div>
          <Plus size={18} className="bd-combo-plus" />
          <div className="bd-combo-item">
            {companion.image && (
              <Image
                src={companion.image}
                alt={companion.name}
                width={60}
                height={84}
                className="bd-combo-img"
              />
            )}
            <div className="bd-combo-meta">
              <span className="bd-combo-name">{companion.name}</span>
              <span className="bd-combo-p">₹{companion.discountedPrice}</span>
            </div>
          </div>
        </div>
        <div className="bd-combo-buy">
          <div className="bd-combo-price">
            <span className="bd-combo-total">₹{total}</span>
            {orig > total && <s className="bd-combo-orig">₹{orig}</s>}
          </div>
          {save > 0 && <span className="bd-combo-save">Save ₹{save}</span>}
          <button
            type="button"
            className="bd-combo-btn"
            onClick={onAddBoth}
          >
            <ShoppingCart size={16} />
            Add both to cart
          </button>
        </div>
      </div>
    </section>
  );
}

// Customer Reviews summary — big average + star-distribution bars
// (mirrors their prominent "4.83 / Based on N reviews" block).
function ReviewsSummary({ rating, reviewCount, dist }) {
  return (
    <div className="bd-rs">
      <div className="bd-rs-score">
        <div className="bd-rs-stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={16}
              fill={s <= Math.round(rating) ? "currentColor" : "none"}
            />
          ))}
        </div>
        <div className="bd-rs-num">{Number(rating).toFixed(2)}</div>
        <div className="bd-rs-count">Based on {reviewCount.toLocaleString()} reviews</div>
      </div>
      <div className="bd-rs-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const c = dist[star] || 0;
          const pct = reviewCount ? (c / reviewCount) * 100 : 0;
          return (
            <div className="bd-rs-row" key={star}>
              <span className="bd-rs-star">{star}★</span>
              <div className="bd-rs-track">
                <div className="bd-rs-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="bd-rs-c">{c.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BookDetailsModal({ book }) {
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

  const heroRef = useRef(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const bookHasQuickRead = hasQuickRead(book.id);

  const cartItem = cart.find((i) => i.id === book.id);
  const qtyInCart = cartItem?.qty || 0;

  const bookSlug = slugify(book.name);
  const bookUrl = `/books/${bookSlug}`;
  const canonicalUrl = `https://thebookx.in${bookUrl}`;

  const isOneRupee = book.discountedPrice === 1;
  const savings = book.originalPrice - book.discountedPrice;
  const savingsPercentage = Math.round((savings / book.originalPrice) * 100);

  const hasOneRupeeInCart = cart.some((i) => {
    const b = books.find((x) => x.id === i.id);
    return b?.discountedPrice === 1;
  });

  const isOneRupeeLimitReached = isOneRupee && hasOneRupeeInCart;
  const isOutOfStock = book.stock === 0;
  const isAddDisabled = isOneRupeeLimitReached || isOutOfStock;

  // Use real customer reviews when they exist (genuine, consistent rating
  // shown in the pill, the schema and the reviews section); otherwise fall
  // back to the stable synthetic rating so every book still shows stars.
  const bookReviews = getReviewsByBook(book.id);
  const hasRealReviews = bookReviews.length > 0;
  const rating = hasRealReviews
    ? Number(getAverageRating(bookReviews))
    : book.rating || getStableRating(book.id);
  // When a book has a configured reviewCount (e.g. a hero title with many
  // reviews), use it as a floor so the displayed total reflects reality even
  // if only a sample of review objects is stored.
  const reviewCount = hasRealReviews
    ? Math.max(bookReviews.length, book.reviewCount || 0)
    : book.reviewCount || getStableReviewCount(book.id);

  // Price/value FAQ — targets long-tail searches like "price of <book>",
  // "buy <book> at lowest price in India", "<book> cash on delivery".
  const discountPct =
    book.originalPrice > book.discountedPrice
      ? Math.round(
          ((book.originalPrice - book.discountedPrice) / book.originalPrice) *
            100,
        )
      : 0;
  const byAuthor = book.author ? ` by ${book.author}` : "";
  const bookFaqs = [
    {
      q: `What is the price of ${book.name}?`,
      a: `${book.name}${byAuthor} is available at just ₹${book.discountedPrice} on TheBookX${
        discountPct ? ` (${discountPct}% off the ₹${book.originalPrice} MRP)` : ""
      }, one of the lowest prices for this book online in India.`,
    },
    {
      q: `Where can I buy ${book.name} at the lowest price in India?`,
      a: `You can buy ${book.name} online at TheBookX for ₹${book.discountedPrice}, with free delivery and Cash on Delivery available across India.`,
    },
    {
      q: `Is ${book.name} available with Cash on Delivery (COD)?`,
      a: `Yes. ${book.name} can be ordered with Cash on Delivery or fast UPI, and ships free in 3 to 7 days via Delhivery and India Post.`,
    },
    {
      q: `Is this a genuine, original copy of ${book.name}?`,
      a: `Yes, every copy is authentic and ships in pristine condition, backed by an easy 7-day return policy.`,
    },
  ];

  // Related books based on same category
  const relatedBooks = useMemo(() => {
    if (!book.catalogue || book.catalogue.length === 0) return [];
    return books
      .filter(
        (b) =>
          b.id !== book.id &&
          b.catalogue?.some((cat) => book.catalogue.includes(cat)),
      )
      .slice(0, 30);
  }, [book.id, book.catalogue]);

  // Companion book for the "frequently bought together" combo.
  // Rule: The Art of Clarity pairs with Atomic Habits; every other self-help
  // title pairs with The Art of Clarity; anything else falls back to a related
  // book.
  const companion = useMemo(() => {
    const ART = books.find((b) => b.id === "bk-002"); // The Art of Clarity
    const ATOMIC = books.find((b) => b.id === "bk-005"); // Atomic Habits
    if (book.id === "bk-002") return ATOMIC || relatedBooks[0] || null;
    if (book.catalogue?.includes("self-help"))
      return (ART && ART.id !== book.id ? ART : ATOMIC) || relatedBooks[0] || null;
    return relatedBooks[0] || null;
  }, [book.id, book.catalogue, relatedBooks]);

  // Star distribution for the reviews summary. Use real per-star counts when
  // reviews exist; otherwise synthesize a realistic 5★-skewed spread that sums
  // to reviewCount so the bars always render.
  const reviewDist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (hasRealReviews) {
      bookReviews.forEach((r) => {
        const s = Math.max(1, Math.min(5, Math.round(r.rating)));
        d[s] += 1;
      });
      // If the displayed total is larger than the stored reviews, scale the
      // distribution up proportionally so the bars sum to reviewCount.
      const real = bookReviews.length;
      if (reviewCount > real && real > 0) {
        let assigned = 0;
        [5, 4, 3, 2].forEach((star) => {
          d[star] = Math.round((d[star] / real) * reviewCount);
          assigned += d[star];
        });
        d[1] = Math.max(0, reviewCount - assigned);
      }
      return d;
    }
    const t = reviewCount;
    d[5] = Math.round(t * 0.8);
    d[4] = Math.round(t * 0.14);
    d[3] = Math.round(t * 0.04);
    d[2] = Math.round(t * 0.01);
    d[1] = Math.max(0, t - (d[5] + d[4] + d[3] + d[2]));
    return d;
  }, [hasRealReviews, bookReviews, reviewCount]);

  const handleAddBoth = () => {
    addToCart(book.id);
    if (companion) addToCart(companion.id);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1300);
    showToast("Added both to your bag", "success");
  };

  // Sticky header observer
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
    // Stay on page, only toast feedback
    showToast(
      inWishlist ? "Removed from wishlist" : "Added to wishlist",
      "success",
    );
  };

  const handleAddToCart = () => {
    if (isOneRupeeLimitReached) {
      showToast("Maximum book allotted reached for Rs.1", "info");
      return;
    }
    if (isOutOfStock) {
      showToast("This book is currently out of stock", "warning");
      return;
    }
    flyToCart(heroRef.current, { imageSrc: book.image });
    addToCart(book.id);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1300);
    showToast(`Added "${book.name}" to cart`, "success");
  };

  const handleReview = () => {
    router.push(`/review?bk=${book.id}`);
  };

  const handleShare = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const shareData = {
      title: book.name,
      text: `Check out "${book.name}"${book.author ? ` by ${book.author}` : ""} at TheBookX!`,
      url: canonicalUrl,
    };

    try {
      if (navigator.share && window.innerWidth <= 768) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(canonicalUrl);
        showToast("Link copied to clipboard", "success");
      }
    } catch (error) {
      // User dismissed share sheet, not an error
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
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

  return (
    <>
      {/* JSON-LD Schema for Book Details */}
      <Script
        id={`book-detail-schema-${book.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["Product", "Book"],
            "@id": canonicalUrl,
            url: canonicalUrl,
            name: book.name,
            description: `${book.description} Shop now at TheBookX, India's most trusted online bookstore.`,
            image: book.image,
            brand: { "@type": "Brand", name: "TheBookX" },
            sku: book.id,
            author: {
              "@type": "Person",
              name: book.author || "Various Authors",
            },
            inLanguage: book.language || "English",
            bookFormat: `https://schema.org/${
              /hard/i.test(book.size || "") ? "Hardcover" : "Paperback"
            }`,
            offers: {
              "@type": "Offer",
              "@id": `${canonicalUrl}#offer`,
              url: canonicalUrl,
              priceCurrency: "INR",
              price: book.discountedPrice,
              priceValidUntil: "2027-12-31",
              availability:
                book.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "Organization",
                name: "TheBookX",
                url: "https://thebookx.in",
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "IN",
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 7,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
                returnPolicyUrl: "https://thebookx.in/refund",
              },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: 0,
                  currency: "INR",
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "IN",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 3,
                    maxValue: 7,
                    unitCode: "DAY",
                  },
                },
              },
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: rating,
              reviewCount: reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
            ...(hasRealReviews && {
              review: bookReviews.slice(0, 20).map((rv) => ({
                "@type": "Review",
                author: { "@type": "Person", name: rv.reviewerName },
                datePublished: rv.date,
                reviewBody: rv.comment,
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: rv.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              })),
            }),
          }),
        }}
      />

      {/* FAQ schema — price / lowest-price / COD long-tail */}
      <Script
        id={`book-faq-schema-${book.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: bookFaqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      {relatedBooks.length > 0 && (
        <Script
          id={`related-items-schema-${book.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `You may also like similar to ${book.name}`,
              description: `Related books similar to ${book.name}`,
              numberOfItems: relatedBooks.length,
              itemListElement: relatedBooks
                .slice(0, 10)
                .map((relatedBook, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: `https://thebookx.in/books/${slugify(relatedBook.name)}`,
                  name: relatedBook.name,
                })),
            }),
          }}
        />
      )}

      {/* ===== Book-details top bar — appears deeper down, after the navbar
              has scrolled away past the hero ===== */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.div
            className="bd-sticky-header"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="bd-icon-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="bd-sticky-title">{book.name}</span>
            <div className="bd-sticky-actions">
              <button
                type="button"
                className="bd-icon-btn"
                onClick={handleWishlist}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  size={18}
                  fill={inWishlist ? "var(--danger)" : "none"}
                  color={inWishlist ? "var(--danger)" : "var(--foreground)"}
                />
              </button>
              <button
                type="button"
                className="bd-icon-btn"
                onClick={handleShare}
                aria-label="Share book"
              >
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bd-page" itemScope itemType="https://schema.org/Book">
        <div className="bd-container">
          {/* Breadcrumb kept as SEO structured data only — visible trail removed
              per design; the BreadcrumbList schema below is unchanged. */}
          <Script
            id={`breadcrumb-schema-${book.id}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { label: "Home", href: "/" },
                  { label: "Books", href: "/books" },
                  ...(book.catalogue?.[0]
                    ? [
                        {
                          label: book.catalogue[0]
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase()),
                          href: `/category/${book.catalogue[0]}`,
                        },
                      ]
                    : []),
                  { label: book.name },
                ].map((c, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: c.label,
                  ...(c.href
                    ? {
                        item: `https://www.thebookx.in${c.href === "/" ? "" : c.href}`,
                      }
                    : {}),
                })),
              }),
            }}
          />

          {/* ===== Top bar (in-flow) ===== */}
          <div className="bd-topbar">
            <button
              type="button"
              className="bd-icon-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bd-topbar-actions">
              <button
                type="button"
                className="bd-icon-btn"
                onClick={handleWishlist}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  size={20}
                  fill={inWishlist ? "var(--danger)" : "none"}
                  color={inWishlist ? "var(--danger)" : "var(--foreground)"}
                />
              </button>
              <button
                type="button"
                className="bd-icon-btn"
                onClick={handleShare}
                aria-label="Share book"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* ===== Hero ===== */}
          <div ref={heroRef} className="bd-hero">
            <div className="bd-hero-image">
              {book.image ? (
                <BookGallery
                  image={book.image}
                  alt={`${book.name} book cover, Buy online at TheBookX, India's trusted bookstore`}
                />
              ) : (
                <div className="bd-cover-placeholder">
                  <BookOpen size={48} />
                </div>
              )}
              {isOneRupee && book.stock > 0 && (
                <div className="bd-deal-badge">🔥 Just ₹1</div>
              )}

              {/* Format chips — sit directly below the cover image */}
              <div className="bd-quick-chips bd-quick-chips-under">
                {book.size && (
                  <div className="bd-chip">
                    <Package size={14} className="bd-chip-icon" />
                    <span className="bd-chip-text">{book.size}</span>
                  </div>
                )}
                {book.pages && (
                  <div className="bd-chip">
                    <FileText size={14} className="bd-chip-icon" />
                    <span className="bd-chip-text">{book.pages} pages</span>
                  </div>
                )}
                {book.language && (
                  <div className="bd-chip">
                    <Globe size={14} className="bd-chip-icon" />
                    <span className="bd-chip-text">{book.language}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="width100">
              <div className="bd-hero-info">
                <div className="bd-title-row">
                  <div className="bd-title-block">
                    <h1 className="bd-title" itemProp="name">
                      {book.name}
                    </h1>

                    {book.author && (
                      <p
                        className="bd-author"
                        itemProp="author"
                        itemScope
                        itemType="https://schema.org/Person"
                      >
                        by{" "}
                        <Link
                          href={`/authors/${book.authorSlug || slugify(book.author)}`}
                          className="bd-author-link"
                          itemProp="url"
                        >
                          <span itemProp="name">{book.author}</span>
                        </Link>
                      </p>
                    )}
                  </div>

                  <div className="bd-rating">
                    <span className="bd-rating-pill">
                      <Star size={12} fill="currentColor" />
                      {rating}
                    </span>
                    <span className="bd-rating-count">
                      ({reviewCount.toLocaleString()} ratings)
                    </span>
                  </div>
                </div>
              </div>
              {/* ===== Price block ===== */}
              <div
                className="bd-price-block"
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <div className="bd-price-row">
                  <span
                    className={`bd-price-current ${savings > 0 ? "price-ribbon-bg price-ribbon-bg--lg" : ""}`}
                    title={savings > 0 ? "Best price" : undefined}
                  >
                    ₹<span itemProp="price">{book.discountedPrice}</span>
                  </span>
                  {book.originalPrice > book.discountedPrice && (
                    <>
                      <span className="bd-price-original">
                        ₹{book.originalPrice}
                      </span>
                      {savings > 0 && (
                        <span className="bd-savings-badge">
                          {savingsPercentage}% off
                        </span>
                      )}
                    </>
                  )}
                  <span className="bd-price-tax">Inclusive of all taxes</span>
                </div>
                <meta itemProp="priceCurrency" content="INR" />
                <meta
                  itemProp="availability"
                  content={
                    book.stock > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock"
                  }
                />
                <meta
                  itemProp="itemCondition"
                  content="https://schema.org/NewCondition"
                />
                <meta itemProp="seller" content="TheBookX" />

                <div className="bd-stock-line">
                  {isOutOfStock ? (
                    <>
                      <XCircle size={14} className="bd-stock-icon-danger" />
                      <span className="bd-stock-text bd-text-danger">
                        Currently out of stock
                      </span>
                    </>
                  ) : book.stock < 10 ? (
                    <>
                      <CheckCircle2
                        size={14}
                        className="bd-stock-icon-warning"
                      />
                      <span className="bd-stock-text bd-text-warning">
                        Only {book.stock} left, order soon
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={14}
                        className="bd-stock-icon-success"
                      />
                      <span className="bd-stock-text bd-text-success">
                        In stock, delivers in 3-7 days
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* ===== QuickReads add-on — bundle it with the book ===== */}
              {bookHasQuickRead && (
                <div
                  className={`bd-qr-addon${isInQrCart(book.id) ? " added" : ""}`}
                >
                  <span className="bd-qr-addon-ic">
                    <Zap size={16} />
                  </span>
                  <div className="bd-qr-addon-copy">
                    <span className="bd-qr-addon-title">
                      Add QuickReads to your order
                    </span>
                    <span className="bd-qr-addon-sub">
                      {quickReadFrameCount(book.id)} key insights · unlocks
                      instantly · billed together
                    </span>
                  </div>
                  <div className="bd-qr-addon-right">
                    <span className="bd-qr-addon-price">+₹{QUICKREAD_PRICE}</span>
                    <div className="bd-qr-addon-actions">
                      <button
                        type="button"
                        className="bd-qr-addon-read"
                        onClick={() => setShowQR(true)}
                      >
                        <BookOpen size={14} /> Read
                      </button>
                      <button
                        type="button"
                        className={`bd-qr-addon-btn${
                          isInQrCart(book.id) ? " on" : ""
                        }`}
                        onClick={() =>
                          isInQrCart(book.id)
                            ? removeQuickRead(book.id)
                            : addQuickRead(book.id)
                        }
                      >
                        {isInQrCart(book.id) ? (
                          <>
                            <Check size={14} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bd-bookmark-card">
                <div className="bd-bookmark-visual" aria-hidden="true">
                  <span className="bd-bookmark-3d">
                    <Bookmark size={22} fill="currentColor" />
                  </span>
                </div>
                <div className="bd-bookmark-copy">
                  <span className="bd-bookmark-title">
                    Free collectible bookmark
                  </span>
                  <span className="bd-bookmark-sub">
                    A collectible bookmark, free with every order
                  </span>
                </div>
                <span className="bd-bookmark-tag">FREE</span>
              </div>
            </div>
          </div>

          {/* ===== Trust badges (4-up, ref style) ===== */}
          <TrustBadges />

          {/* ===== Inline CTA row (visible on desktop, hidden on mobile via CSS) ===== */}
          <div className="bd-cta-inline">
            <button
              type="button"
              className="bd-cta-icon-btn"
              onClick={handleWishlist}
              aria-label={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                size={20}
                fill={inWishlist ? "var(--danger)" : "none"}
                color={inWishlist ? "var(--danger)" : "var(--foreground)"}
              />
            </button>
            <button
              type="button"
              className="bd-cta-icon-btn"
              onClick={handleReview}
              aria-label="Write a review"
            >
              <MessageSquare size={20} />
            </button>
            {qtyInCart > 0 && !isOutOfStock ? (
              <div className="bd-cta-incart">
                <div className="bd-qty-stepper">
                  <button
                    type="button"
                    onClick={() => decreaseQty(book.id)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="bd-qty-value">{qtyInCart} in bag</span>
                  <button
                    type="button"
                    onClick={() => addToCart(book.id)}
                    aria-label="Increase quantity"
                    disabled={isAddDisabled}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Link href="/bag" className="bd-cta-gobag">
                  <ShoppingCart size={18} />
                  Go to Bag
                </Link>
              </div>
            ) : (
              <LoadingButton
                className="bd-cta-primary"
                onClick={handleAddToCart}
                aria-disabled={isAddDisabled}
                icon={<ShoppingCart size={18} />}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </LoadingButton>
            )}
          </div>

          {/* ===== Frequently bought together (ref: Best Selling Combos) ===== */}
          <FrequentlyBought
            book={book}
            companion={companion}
            onAddBoth={handleAddBoth}
          />

          {/* ===== Great for (ref: Where To Wear It) ===== */}
          <PerfectFor />

          {/* ===== Related reads (Medium articles + TheBookX links), animated ===== */}
          {book.links && book.links.length > 0 && (
            <BookLinksStrip links={book.links} mediumUrl={book.mediumUrl} />
          )}

          {/* ===== Accordions ===== */}
          <div className="bd-accordions">
            <Accordion icon={BookOpen} title="Description" defaultOpen>
              <p className="bd-description" itemProp="description">
                {book.description}
              </p>
            </Accordion>

            <Accordion icon={FileText} title="Specifications">
              <dl className="bd-specs-list">
                {book.author && (
                  <div className="bd-spec-row">
                    <dt className="bd-spec-label">Author</dt>
                    <dd className="bd-spec-value">
                      <Link
                        href={`/author/${book.authorSlug || slugify(book.author)}`}
                        className="bd-spec-link"
                      >
                        {book.author}
                      </Link>
                    </dd>
                  </div>
                )}
                {book.pages && (
                  <div className="bd-spec-row">
                    <dt className="bd-spec-label">Pages</dt>
                    <dd className="bd-spec-value">{book.pages}</dd>
                  </div>
                )}
                {book.size && (
                  <div className="bd-spec-row">
                    <dt className="bd-spec-label">Format</dt>
                    <dd className="bd-spec-value">{book.size}</dd>
                  </div>
                )}
                {book.language && (
                  <div className="bd-spec-row">
                    <dt className="bd-spec-label">Language</dt>
                    <dd className="bd-spec-value">{book.language}</dd>
                  </div>
                )}
                {book.catalogue?.length > 0 && (
                  <div className="bd-spec-row">
                    <dt className="bd-spec-label">Categories</dt>
                    <dd className="bd-spec-value">
                      {book.catalogue.join(", ")}
                    </dd>
                  </div>
                )}
                <div className="bd-spec-row">
                  <dt className="bd-spec-label">Availability</dt>
                  <dd className="bd-spec-value">
                    {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                  </dd>
                </div>
              </dl>
            </Accordion>

            <Accordion icon={Truck} title="Shipping & Returns">
              <div className="bd-shipping-content">
                <div className="bd-shipping-row">
                  <Truck size={16} className="bd-shipping-icon" />
                  <div>
                    <p className="bd-shipping-title">
                      Free shipping across India*
                    </p>
                    <p className="bd-shipping-desc">
                      Delivered via Delhivery and Indian Post in 3-7 business
                      days.
                    </p>
                  </div>
                </div>
                <div className="bd-shipping-row">
                  <ShieldCheck size={16} className="bd-shipping-icon" />
                  <div>
                    <p className="bd-shipping-title">Secure packaging</p>
                    <p className="bd-shipping-desc">
                      Every book is wrapped in protective packaging to arrive in
                      perfect condition.
                    </p>
                  </div>
                </div>
                <div className="bd-shipping-row">
                  <RotateCcw size={16} className="bd-shipping-icon" />
                  <div>
                    <p className="bd-shipping-title">7-day easy returns</p>
                    <p className="bd-shipping-desc">
                      Not satisfied? Return within 7 days of delivery for a full
                      refund.{" "}
                      <Link href="/shipping" className="bd-spec-link">
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion
              icon={MessageSquare}
              title="Frequently Asked Questions"
              defaultOpen
            >
              <div className="bd-faq-list">
                {bookFaqs.map((f, i) => (
                  <div key={i} className="bd-faq-item">
                    <h3 className="bd-faq-q">{f.q}</h3>
                    <p className="bd-faq-a">{f.a}</p>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>

          {/* ===== Customer Reviews (dedicated section, ref style) ===== */}
          <section className="bd-reviews-section" id="reviews">
            <h2 className="bd-section-title">Customer Reviews</h2>
            <ReviewsSummary
              rating={rating}
              reviewCount={reviewCount}
              dist={reviewDist}
            />
            <div className="bd-reviews-body">
              {hasRealReviews ? (
                <BookReviews
                  bookId={book.id}
                  bookName={book.name}
                  authorName={book.author}
                />
              ) : (
                <div className="bd-store-reviews-fallback">
                  <p className="bd-store-reviews-note">
                    This title doesn’t have reader reviews yet — here’s what
                    customers say about shopping with TheBookX:
                  </p>
                  <StoreReviews />
                </div>
              )}
            </div>
          </section>

          {/* ===== Category tags ===== */}
          {book.catalogue?.length > 0 && (
            <div className="bd-tags-scroll">
              {book.catalogue.map((tag) => (
                <Link
                  key={tag}
                  href={`/category/${slugify(tag)}`}
                  className="bd-tag-pill"
                  aria-label={`Browse more ${tag} books`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* ===== You May Also Like ===== */}
          <div className="bd-section-block">
            <YouMayLike
              title="You May Also Like"
              subtitle={`Discover more books similar to ${book.name}`}
              items={relatedBooks}
              initialCount={6}
              step={6}
              slugify={slugify}
              renderItem={(relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              )}
            />
          </div>

          {/* ===== Browse More Categories ===== */}
          <div className="bd-browse-block">
            <h4 className="bd-browse-title">Browse More Categories</h4>
            <div className="bd-browse-chips">
              {[...new Set(books.flatMap((b) => b.catalogue || []))]
                .slice(0, 15)
                .map((category) => (
                  <Link
                    key={category}
                    href={`/category/${slugify(category)}`}
                    className="bd-browse-chip"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Link>
                ))}
            </div>
          </div>

          {/* ===== SEO content block — readable, keyword-rich prose ===== */}
          <section className="bd-seo-block" aria-label={`About ${book.name}`}>
            <h2 className="bd-seo-title">
              Buy {book.name}{byAuthor} online in India
            </h2>
            <p className="bd-seo-text">
              Looking to buy <strong>{book.name}</strong>
              {byAuthor} online at the lowest price in India? You&apos;re in the
              right place. TheBookX offers {book.name} for just ₹
              {book.discountedPrice}
              {discountPct ? ` — ${discountPct}% off the ₹${book.originalPrice} MRP` : ""}
              , with <strong>free delivery</strong>,{" "}
              <strong>Cash on Delivery (COD)</strong> and fast UPI checkout
              available across India. Every copy is 100% genuine and ships in
              secure, protective packaging within 3–7 days via Delhivery and
              India Post.
            </p>
            <p className="bd-seo-text">
              {book.name} is a must-read
              {book.catalogue?.length
                ? ` for fans of ${book.catalogue
                    .slice(0, 3)
                    .map((c) => c.replace(/-/g, " "))
                    .join(", ")}`
                : ""}
              . Order online today and enjoy easy 7-day returns, a free
              collectible bookmark with every order, and one of the best book
              prices online in India — only at TheBookX, India&apos;s trusted
              online bookstore.
            </p>
          </section>

          {/* Spacer so sticky bottom bar doesn't overlap last content on mobile */}
          <div className="bd-bottom-spacer" />
        </div>
      </div>

      {/* ===== Sticky bottom CTA (mobile only) ===== */}
      <div className="bd-sticky-bottom">
        <CartConfetti trigger={confetti} />
        {/* Live order-history ticker, slides up like the hero strip */}
        <div className="bd-sticky-orders">
          <LiveOrdersStrip />
        </div>
        <div className="bd-sticky-bottom-inner">
          {qtyInCart > 0 && !isOutOfStock ? (
            <>
              <div className="bd-sticky-stepper">
                <button
                  type="button"
                  onClick={() => decreaseQty(book.id)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="bd-sticky-stepper-value">{qtyInCart}</span>
                <button
                  type="button"
                  onClick={() => addToCart(book.id)}
                  aria-label="Increase quantity"
                  disabled={isAddDisabled}
                >
                  <Plus size={16} />
                </button>
              </div>
              <Link href="/bag" className="bd-sticky-gobag">
                <ShoppingCart size={18} />
                Go to Bag
              </Link>
            </>
          ) : (
            <>
              <div className="bd-sticky-price">
                <span className="bd-sticky-price-current">
                  ₹{book.discountedPrice}
                </span>
                {book.originalPrice > book.discountedPrice && (
                  <span className="bd-sticky-price-original">
                    ₹{book.originalPrice}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="bd-sticky-icon-btn"
                onClick={handleWishlist}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  size={20}
                  fill={inWishlist ? "var(--danger)" : "none"}
                  color={inWishlist ? "var(--danger)" : "var(--foreground)"}
                />
              </button>
              <LoadingButton
                className="bd-sticky-add-btn"
                onClick={handleAddToCart}
                aria-disabled={isAddDisabled}
                icon={<ShoppingCart size={18} />}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </LoadingButton>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <QuickReadsReader
            book={book}
            onClose={() => setShowQR(false)}
            onUnlock={() =>
              showToast(
                "Unlock & payment is being set up — enjoy the free insights!",
                "info",
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
