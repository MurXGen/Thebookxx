"use client";

import LiveActivity from "@/components/LiveActivity";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Truck,
  BadgePercent,
  BadgeCheck,
  Star,
  RotateCcw,
  Check,
  Lock,
  Gift,
  Plus,
  X,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { books } from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import OfferTierList from "@/components/UI/OfferTierList";
import { useStore } from "@/context/StoreContext";
import SearchOverlay from "@/components/SearchOverlay";
import { XmasSnow, XmasGarland, XmasTree } from "@/components/XmasDecor";
import RecommendationModal from "@/components/RecommendationModal";

// Static, above-the-fold hero. Gives the homepage a clear value proposition and
// a real H1 before the animated Bestsellers carousel. All stats are derived
// from the catalogue / policies, no invented numbers. (SEO copy unchanged.)
const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function HomeHero() {
  const titleCount = Math.max(100, Math.floor(books.length / 100) * 100);
  const { cart } = useStore();

  // Readers' top 3 picks shown in the hero showcase.
  const pickNames = [
    "The Metamorphosis",
    "The Art of Clarity",
    "Did You Ever Love Me?",
  ];
  const picks = (() => {
    const named = pickNames
      .map((n) => books.find((b) => b.name === n))
      .filter(Boolean);
    if (named.length >= 3) return named.slice(0, 3);
    // A named pick was removed — top up with other in-stock books (with covers)
    // so all three podium stages always fill.
    const have = new Set(named.map((b) => b.id));
    const fill = books.filter(
      (b) => b.image && !have.has(b.id) && b.discountedPrice !== 1,
    );
    return [...named, ...fill].slice(0, 3);
  })();

  // Modals wired to the existing app flows.
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);

  // Reward tiers driven by the live cart so the chips + the "Unlock more
  // rewards" sheet reflect what the shopper has actually unlocked.
  const cartAmount = cart.reduce((s, it) => {
    const b = books.find((x) => x.id === it.id);
    return s + (b?.discountedPrice || 0) * (it.qty || 1);
  }, 0);
  const hasOneRupee = cart.some((it) => {
    const b = books.find((x) => x.id === it.id);
    return b?.discountedPrice === 1;
  });
  const offers = getCartOffers(hasOneRupee);
  const offerChips = offers.map((o) => ({
    label: o.type === "free_shipping" ? "Free shipping" : `Flat ${o.reward}`,
    freeShip: o.type === "free_shipping",
  }));


  const stats = [
    { icon: Star, label: "4.4 rating" },
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: RotateCcw, label: "7-day replacement" },
    { icon: Truck, label: "Faster delivery", highlight: true },
    { icon: Gift, label: "Free bookmark", highlight: true },
  ];

  // ── Aggressive on-page SEO for the hero + its featured books ──
  const ORIGIN = "https://www.thebookx.in";
  const absUrl = (img) =>
    !img ? "" : /^https?:\/\//i.test(img) ? img : `${ORIGIN}${img}`;
  const bookUrl = (b) => `${ORIGIN}/books/${slugify(b.name)}`;
  const seoJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${ORIGIN}/#website`,
        url: ORIGIN,
        name: "TheBookX",
        description:
          "Buy books online in India starting at ₹1 — bestsellers, self-help & fiction with free delivery from ₹199, Cash on Delivery and 7-day replacement.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${ORIGIN}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ItemList",
        name: "Readers' top picks on TheBookX",
        itemListElement: picks.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Book",
            name: b.name,
            ...(b.author
              ? { author: { "@type": "Person", name: b.author } }
              : {}),
            image: absUrl(b.image),
            url: bookUrl(b),
            offers: {
              "@type": "Offer",
              price: String(b.discountedPrice),
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url: bookUrl(b),
            },
          },
        })),
      },
    ],
  };

  return (
    <section className="home-hero hero-xmas" style={{ position: "relative" }}>
      {/* Structured data — WebSite search action + featured books as Products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
      />

      {/* SEO: crawlable internal links + keyword context (visually hidden) */}
      <div className="hero-seo">
        <h2>
          Buy bestselling books online in India at the lowest prices — starting
          at ₹1 with free delivery from ₹199, Cash on Delivery and 7-day replacement.
        </h2>
        <p>Popular books on TheBookX:</p>
        <ul>
          {picks.map((b) => (
            <li key={`seo-${b.id}`}>
              <Link href={`/books/${slugify(b.name)}`}>
                Buy {b.name}
                {b.author ? ` by ${b.author}` : ""} online at ₹
                {b.discountedPrice}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/books">Browse all books from ₹1</Link>
          </li>
          <li>
            <Link href="/1rupee">Bestsellers at just ₹1</Link>
          </li>
        </ul>
      </div>
      {/* Christmas: velvet backdrop bokeh, pine garland with baubles, live snow */}
      <div className="hx-bokeh" aria-hidden="true" />
      <XmasSnow />
      <XmasGarland />

      <div className="hero-top">
        <div className="home-hero-inner">
          {/* Christmas sale kicker — opens the reward tiers */}
          <button
            type="button"
            className="hx-kicker hx-capped"
            onClick={() => setOffersOpen(true)}
            aria-label="Christmas sale — up to 50% off. See all offers."
          >
            <span className="hx-kicker-dot" aria-hidden="true" />
            Christmas Sale · <b>Up to 50% OFF</b>
            <ChevronRight size={14} />
          </button>

          <h1 className="home-hero-title">
            <span className="hx-sw">Buy</span> <span className="hx-sw">Books</span>{" "}
            <span className="hx-sw">Online</span> in <span className="hx-sw">India,</span>{" "}
            <span className="home-hero-accent">Starting at ₹1</span>
          </h1>

          <p className="home-hero-sub">
            Hand-picked bestsellers, self-help &amp; fiction from just ₹1 — free
            delivery from ₹199, Cash on Delivery &amp; 7-day replacement on damaged or wrong books across India.
          </p>

          {/* Primary actions — Search + Suggest */}
          <div className="hero-actions hx-actions">
            <button
              type="button"
              className="hero-search-btn hx-capped"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} /> Search books
            </button>
            <button
              type="button"
              className="hero-suggest-btn hx-capped"
              onClick={() => setSuggestOpen(true)}
            >
              <Sparkles size={18} /> Suggest me
            </button>
          </div>

          {/* Christmas gift — opens the scratch & win flow */}
          <div className="hx-gift-row">
            {/* Snowy Christmas trees standing on the gift card */}
            <XmasTree size={64} gifts={false} className="hx-gift-tree left" />
            <XmasTree size={92} className="hx-gift-tree right" />
            <HeroGift />
          </div>

          {/* Quiet trust line */}
          <ul className="hx-trust">
            <li>
              <Star size={13} fill="#f59e0b" stroke="#f59e0b" /> 4.4 rating
            </li>
            <li>{titleCount}+ titles</li>
            <li>7-day replacement</li>
            <li>Cash on Delivery</li>
            <li className="hx-trust-hi">Free bookmarks</li>
          </ul>

          {/* Offers — auto-scrolling chips; tap any to see all reward tiers */}
          <div className="hero-offers-row hx-offers" role="list">
            <div className="hero-offers-track">
              {[...offerChips, ...offerChips].map((c, i) => (
                <button
                  key={`${c.label}-${i}`}
                  type="button"
                  className="hero-offer-chip"
                  onClick={() => setOffersOpen(true)}
                >
                  {c.freeShip ? (
                    <Truck size={15} className="hero-offer-ic" />
                  ) : (
                    <BadgePercent size={15} className="hero-offer-ic" />
                  )}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Live activity: orders, Faster picks, bag adds, reviews */}
      <LiveActivity />

      {/* Snow drift where the hero meets the page */}
      <svg className="hx-drift" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 22 C40 8 80 30 130 18 S220 6 270 20 S350 30 400 14 V40 H0 Z" />
      </svg>

      {/* Search modal (existing overlay) */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Suggest modal (existing recommendation flow) */}
      <RecommendationModal
        isOpen={suggestOpen}
        onClose={() => setSuggestOpen(false)}
      />

      {/* All offers sheet */}
      <AnimatePresence>
        {offersOpen && (
          <motion.div
            className="offer-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOffersOpen(false)}
          >
            <motion.div
              className="offer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="offer-sheet-head">
                <span className="offer-sheet-title">
                  <Gift size={16} /> Unlock more rewards
                </span>
                <button
                  type="button"
                  className="offer-sheet-x"
                  onClick={() => setOffersOpen(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="offer-sheet-sub">
                Your cart: <b>₹{cartAmount}</b>
              </p>
              <OfferTierList
                offers={offers}
                amount={cartAmount}
                hasOneRupee={hasOneRupee}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Christmas gift in the hero. Tapping it unwraps the box (lid pops, sparkles
// burst) and then opens the existing scratch & win flow via tbx:open-scratch.
function HeroGift() {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    setOpening(true);
    try {
      navigator.vibrate?.(18);
    } catch {}
    setTimeout(() => {
      window.dispatchEvent(new Event("tbx:open-scratch"));
      setOpening(false);
    }, 650);
  };
  return (
    <button
      type="button"
      className={`hx-gift${opening ? " opening" : ""}`}
      onClick={open}
      aria-label="Open your Christmas gift: scratch and win up to ₹100 cashback"
    >
      <span className="hx-gift-shine" aria-hidden="true" />
      <span className="hx-gift-box" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="58" height="58">
          <g className="hx-gift-lid">
            <rect x="6" y="18" width="52" height="12" rx="3" fill="#e11d48" />
            <rect x="6" y="18" width="52" height="4" rx="2" fill="#fff" fillOpacity=".18" />
            <rect x="28" y="18" width="8" height="12" fill="#fbbf24" />
            <path d="M32 18c-4-9-15-11-15-4 0 4 8 5 15 4z" fill="#fbbf24" />
            <path d="M32 18c4-9 15-11 15-4 0 4-8 5-15 4z" fill="#f59e0b" />
            <circle cx="32" cy="17" r="3" fill="#d97706" />
          </g>
          <rect x="9" y="30" width="46" height="28" rx="3" fill="#be123c" />
          <rect x="9" y="30" width="46" height="5" fill="#000" fillOpacity=".12" />
          <rect x="28" y="30" width="8" height="28" fill="#fbbf24" />
          <circle cx="18" cy="44" r="1.6" fill="#fff" fillOpacity=".55" />
          <circle cx="46" cy="40" r="1.6" fill="#fff" fillOpacity=".55" />
          <circle cx="44" cy="51" r="1.2" fill="#fff" fillOpacity=".45" />
          <circle cx="20" cy="53" r="1.2" fill="#fff" fillOpacity=".45" />
        </svg>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <i key={k} className={`hx-spark s${k}`} />
        ))}
      </span>
      <span className="hx-gift-copy">
        <span className="hx-gift-kicker">Christmas gift</span>
        <span className="hx-gift-amt">
          Scratch &amp; win up to <b>₹100</b>
        </span>
        <span className="hx-gift-sub">Every order wins · tap to open</span>
      </span>
      <span className="hx-gift-cta" aria-hidden="true">
        Open <ChevronRight size={15} />
      </span>
    </button>
  );
}
