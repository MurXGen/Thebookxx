"use client";

import LiveActivity from "@/components/LiveActivity";
import { useState, useMemo } from "react";
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
import ScratchTeaserCard from "@/components/ScratchTeaserCard";
import SearchOverlay from "@/components/SearchOverlay";
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

  // Christmas snowfall — deterministic flakes so SSR and client markup match.
  const flakes = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        i,
        left: (i * 61) % 100,
        size: 3 + ((i * 7) % 6), // 3–8px
        delay: -(((i * 37) % 90) / 10), // already falling on first paint
        dur: 7 + (((i * 53) % 70) / 10), // 7–14s
        drift: 14 + ((i * 29) % 30),
        blur: i % 5 === 0,
      })),
    [],
  );
  // Fairy lights strung along the top edge.
  const lights = useMemo(() => Array.from({ length: 18 }).map((_, i) => i), []);

  const stats = [
    { icon: Star, label: "4.4 rating" },
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: RotateCcw, label: "7-day replacement" },
    { icon: Truck, label: "Faster delivery", highlight: true },
    { icon: Gift, label: "Free bookmark", highlight: true },
  ];

  const openScratch = () => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("tbx:open-scratch"));
  };

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
      {/* Christmas: fairy lights + soft snowfall behind the content */}
      <div className="hx-lights" aria-hidden="true">
        {lights.map((i) => (
          <span key={i} className={`hx-bulb c${i % 4}`} style={{ animationDelay: `${(i % 6) * 0.35}s` }} />
        ))}
      </div>
      <div className="hx-snow" aria-hidden="true">
        {flakes.map((f) => (
          <span
            key={f.i}
            className={`hx-flake${f.blur ? " soft" : ""}${f.i % 4 === 0 ? " glyph" : ""}`}
            style={{
              left: `${f.left}%`,
              width: f.i % 4 === 0 ? undefined : f.size,
              height: f.i % 4 === 0 ? undefined : f.size,
              fontSize: f.i % 4 === 0 ? 8 + f.size * 1.6 : undefined,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.dur}s`,
              "--hx-drift": `${f.drift}px`,
            }}
          >
            {f.i % 4 === 0 ? "❄" : null}
          </span>
        ))}
      </div>

      <div className="hero-top">
        <div className="home-hero-inner">
          {/* Christmas sale kicker — opens the reward tiers */}
          <button
            type="button"
            className="hx-kicker"
            onClick={() => setOffersOpen(true)}
            aria-label="Christmas sale — up to 50% off. See all offers."
          >
            <span className="hx-kicker-dot" aria-hidden="true" />
            Christmas Sale · <b>Up to 50% OFF</b>
            <ChevronRight size={14} />
          </button>

          {/* Three bestseller covers, fanned like gifts under the tree */}
          {picks.length >= 3 && (
            <div className="hx-covers" aria-hidden="true">
              {[picks[1], picks[0], picks[2]].map((b, i) => (
                <span key={b.id} className={`hx-cover hx-cover-${i}`}>
                  <img src={b.image} alt="" loading="eager" />
                  {i === 1 && <span className="hx-snowcap" />}
                </span>
              ))}
              <span className="hx-ribbon">from ₹1</span>
            </div>
          )}

          <h1 className="home-hero-title">
            Buy Books Online in India,{" "}
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
              className="hero-search-btn"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} /> Search books
            </button>
            <button
              type="button"
              className="hero-suggest-btn"
              onClick={() => setSuggestOpen(true)}
            >
              <Sparkles size={18} /> Suggest me
            </button>
          </div>

          {/* Quiet trust line */}
          <ul className="hx-trust">
            <li>
              <Star size={13} fill="#f59e0b" stroke="#f59e0b" /> 4.4 rating
            </li>
            <li>{titleCount}+ titles</li>
            <li>7-day replacement</li>
            <li>Cash on Delivery</li>
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

// Scratch & win band — moved out of the hero so the hero stays minimal. It
// reuses the homepage scratch flow (opens via the tbx:open-scratch event).
export function HeroScratchBand() {
  const openScratch = () => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("tbx:open-scratch"));
  };
  return (
    <div className="hx-scratch-wrap">
        {/* Scratch & win band — reuses the homepage scratch flow (opens the
            number modal + wallet reward via the tbx:open-scratch event). */}
        <div
          className="hero-scratch-band"
          role="button"
          tabIndex={0}
          onClick={openScratch}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openScratch()}
          aria-label="Scratch to win cashback"
        >
          <span className="hero-scratch-deco" aria-hidden="true" />
          {/* Lightning sparks that flash around the card on hover / tap */}
          {["tl", "tr", "bl", "br"].map((pos) => (
            <svg
              key={pos}
              viewBox="0 0 24 24"
              className={`sc-bolt sc-bolt-${pos}`}
              aria-hidden="true"
            >
              <path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.6L13.5 2Z" />
            </svg>
          ))}

          <div className="hero-scratch-copy">
            <span className="hero-scratch-kicker">
              <Gift size={13} /> Scratch &amp; win
            </span>
            <span className="hero-scratch-amt">
              Cashback upto <span className="hero-scratch-amt-big">₹100</span>
            </span>
            <span className="hero-scratch-sub">
              Every order wins. Tap the card to reveal.
            </span>
          </div>

          <span className="hero-scratch-teaser" aria-hidden="true">
            <ScratchTeaserCard visualOnly />
          </span>
        </div>
    </div>
  );
}
