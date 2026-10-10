"use client";

import { useRef, useState, useMemo } from "react";
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
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { books } from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import LiveOrdersStrip from "@/components/LiveOrdersStrip";
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
  const { cart, addToCart } = useStore();

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

  // Tap-anywhere firecracker: spawn a short-lived sparkle burst at the pointer.
  const heroRef = useRef(null);
  const [bursts, setBursts] = useState([]);

  // Tap the festive season card → a big confetti shower across the hero.
  const [showers, setShowers] = useState([]);
  const fireShower = (e) => {
    e?.stopPropagation?.();
    const COLORS = [
      "#fb8500",
      "#ffb703",
      "#ffd23f",
      "#c0223b",
      "#ff8c42",
      "#4ade80",
      "#60a5fa",
      "#f472b6",
      "#ffffff",
    ];
    const id = `sh-${Date.now()}-${Math.random()}`;
    const pieces = Array.from({ length: 54 }).map((_, i) => ({
      i,
      left: Math.random() * 100,
      delay: Math.random() * 0.45,
      dur: 1.8 + Math.random() * 1.6,
      size: 6 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 760 - 380,
      drift: Math.random() * 160 - 80,
      round: Math.random() < 0.42,
    }));
    setShowers((s) => [...s, { id, pieces }]);
    setTimeout(() => setShowers((s) => s.filter((z) => z.id !== id)), 3600);
  };
  const SPARK_COLORS = ["#fb8500", "#ff8c42", "#e6a83c", "#ffd23f", "#c0223b"];
  const spawnBurst = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = `${Date.now()}-${Math.random()}`;
    const n = 10 + Math.floor(Math.random() * 4);
    const parts = Array.from({ length: n }).map((_, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 28 + Math.random() * 46;
      return {
        i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 4 + Math.random() * 5,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      };
    });
    setBursts((b) => [...b, { id, x, y, parts }]);
    setTimeout(() => setBursts((b) => b.filter((z) => z.id !== id)), 750);
  };

  // Festive confetti raining across the whole hero. Deterministic values keep
  // SSR and client markup identical (no hydration mismatch).
  const confetti = useMemo(() => {
    const COLORS = [
      "#fb8500",
      "#ffb703",
      "#ffd23f",
      "#c0223b",
      "#ff8c42",
      "#4ade80",
      "#60a5fa",
      "#f472b6",
      "#ffffff",
    ];
    return Array.from({ length: 30 }).map((_, i) => ({
      i,
      left: (i * 97) % 100,
      delay: ((i * 53) % 60) / 10, // 0–6s
      dur: 4.5 + (((i * 71) % 45) / 10), // 4.5–9s
      size: 6 + (i % 4) * 2, // 6–12px
      color: COLORS[i % COLORS.length],
      rot: (i * 61) % 360,
      round: i % 3 === 0, // some circles, some rectangles
    }));
  }, []);

  const stats = [
    { icon: Star, label: "4.4 rating" },
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: RotateCcw, label: "7-day returns" },
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
          "Buy books online in India starting at ₹1 — bestsellers, self-help & fiction with free shipping, Cash on Delivery and 7-day returns.",
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
    <section
      className="home-hero"
      ref={heroRef}
      onPointerDown={spawnBurst}
      style={{ position: "relative" }}
    >
      {/* Structured data — WebSite search action + featured books as Products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
      />

      {/* SEO: crawlable internal links + keyword context (visually hidden) */}
      <div className="hero-seo">
        <h2>
          Buy bestselling books online in India at the lowest prices — starting
          at ₹1 with free shipping, Cash on Delivery and 7-day returns.
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
      {/* Festive confetti raining down the whole hero (behind the content) */}
      <div className="hero-confetti" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.i}
            className={`hero-cf${c.round ? " round" : ""}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.round ? c.size : c.size + 4,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              "--cf-rot": `${c.rot}deg`,
            }}
          />
        ))}
      </div>

      {/* Confetti shower fired when the season card is tapped */}
      <div className="hero-shower-layer" aria-hidden="true">
        {showers.flatMap((sh) =>
          sh.pieces.map((p) => (
            <span
              key={`${sh.id}-${p.i}`}
              className={`hero-shower-piece${p.round ? " round" : ""}`}
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.round ? p.size : p.size + 4,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                "--sh-rot": `${p.rot}deg`,
                "--sh-x": `${p.drift}px`,
              }}
            />
          )),
        )}
      </div>

      {/* Tap-anywhere firecracker sparkles */}
      <div className="hero-spark-layer" aria-hidden="true">
        {bursts.map((burst) =>
          burst.parts.map((p) => (
            <motion.span
              key={`${burst.id}-${p.i}`}
              className="hero-spark"
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 0.3, x: p.dx, y: p.dy }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              style={{
                left: burst.x,
                top: burst.y,
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          )),
        )}
      </div>

      <div className="hero-top">
        <div className="home-hero-inner">
          {/* Festive Q4 season card — tap to shower confetti */}
          <button
            type="button"
            className="hero-festive"
            onClick={fireShower}
            aria-label="Festive sale — up to 50% off. Tap for confetti."
          >
            <span className="hero-festive-glow" aria-hidden="true" />
            {/* Ambient confetti inside the card */}
            <span className="hero-festive-confetti" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className={`hfc hfc-${i}`} />
              ))}
            </span>
            <span className="hero-festive-diya" aria-hidden="true">
              🪔
            </span>
            <span className="hero-festive-txt">
              <span className="hero-festive-kicker">
                ✦ Festive Season Sale is live ✦
              </span>
              <span className="hero-festive-amt">
                Up to <b>50% OFF</b> on every order
              </span>
              <span className="hero-festive-hint">Tap for a surprise 🎉</span>
            </span>
            <span className="hero-festive-diya" aria-hidden="true">
              🎉
            </span>
          </button>

          {/* Offers marquee — auto-scrolls; tap any chip to see all reward tiers */}
          <div className="hero-offers-row" role="list">
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

          <h1 className="home-hero-title">
            Buy Books Online in India,{" "}
            <span className="home-hero-accent">Starting at ₹1</span>
          </h1>

          {/* Big festive discount headline */}
          <div className="hero-bigsale" aria-label="Festive sale: up to 50% off">
            <span className="hero-bigsale-top">
              🎉 Festive Season Sale is live
            </span>
            <span className="hero-bigsale-main">
              Up to <span className="hero-bigsale-pct">50%</span> OFF
            </span>
            <span className="hero-bigsale-note">
              on every order • limited time only
            </span>
          </div>

          <p className="home-hero-sub">
            Hand-picked bestsellers, self-help &amp; fiction from just ₹1 — free
            shipping, Cash on Delivery &amp; easy 7-day returns across India.
          </p>

          <div className="home-hero-stats">
            {stats.map(({ icon: Icon, label, highlight }) => (
              <div
                key={label}
                className={`home-hero-stat${highlight ? " highlight" : ""}`}
              >
                <Icon size={15} className="home-hero-stat-icon" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Primary actions — Search + Suggest */}
          <div className="hero-actions">
            <button
              type="button"
              className="hero-search-btn"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} /> Search book
            </button>
            <button
              type="button"
              className="hero-suggest-btn"
              onClick={() => setSuggestOpen(true)}
            >
              <Sparkles size={18} /> Suggest me
            </button>
          </div>

          {/* First-time helper — opens the book-suggestion flow */}
          <button
            type="button"
            className="hero-expert-cta"
            onClick={() => setSuggestOpen(true)}
          >
            <span className="hero-expert-ic">
              <FaWhatsapp size={18} />
            </span>
            <span className="hero-expert-txt">
              <strong>First time here?</strong> Talk with an expert for support
            </span>
            <ChevronRight size={16} className="hero-expert-arrow" />
          </button>

          {/* Live-order social-proof ticker */}
          <LiveOrdersStrip />
        </div>

        {/* Readers' top-3 picks — right on desktop, stacked below on mobile */}
        {picks.length > 0 && (
          <aside className="hero-picks">
            {/* Winners' podium: #1 tallest in the centre, #2 right, #3 left.
              Rises into place when scrolled into view, retracts when past. */}
            <motion.div
              className="hero-podium"
              initial="hide"
              whileInView="show"
              viewport={{ once: false, amount: 0.35 }}
            >
              {/* tiny confetti */}
              <motion.span
                className="hpz-confetti"
                aria-hidden="true"
                variants={{ hide: { opacity: 0 }, show: { opacity: 1 } }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className={`hpz-cf hpz-cf-${i}`} />
                ))}
              </motion.span>

              {[
                { b: picks[2], rank: 3 },
                { b: picks[0], rank: 1 },
                { b: picks[1], rank: 2 },
              ]
                .filter((x) => x.b)
                .map(({ b, rank }, idx) => {
                  const url = `/books/${slugify(b.name)}`;
                  return (
                    <motion.div
                      className={`hpz hpz-r${rank}`}
                      key={b.id}
                      variants={{
                        hide: { opacity: 0, y: 48 },
                        show: { opacity: 1, y: 0 },
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                        delay: idx * 0.1,
                      }}
                    >
                      <button
                        type="button"
                        className="hpz-book"
                        aria-label={`Add ${b.name} to bag`}
                        onClick={() => {
                          addToCart(b.id);
                          showToast(
                            `Added to your bag 🎉 “${b.name}”`,
                            "success",
                          );
                        }}
                      >
                        <span className="hpz-coverwrap">
                          <span className="hpz-cover">
                            <img
                              src={b.image}
                              alt={`${b.name}${b.author ? ` by ${b.author}` : ""} — buy online at ₹${b.discountedPrice} on TheBookX`}
                              loading="lazy"
                            />
                          </span>
                          <span
                            className="hpz-bm hpz-bm-back"
                            aria-hidden="true"
                          />
                          <span
                            className="hpz-bm hpz-bm-front"
                            aria-hidden="true"
                          >
                            <span className="hpz-bm-txt">BOOKMARK</span>
                          </span>
                        </span>
                        <span className="hpz-title">{b.name}</span>
                      </button>
                      <div className="hpz-pillar">
                        <span className="hpz-rank">{rank}</span>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>

            <button
              type="button"
              className="hero-picks-addall"
              onClick={() => {
                picks.forEach((b) => addToCart(b.id));
                showToast("Added all 3 picks to your bag 🎉", "success");
              }}
            >
              <Plus size={16} /> Add all 3 to bag
            </button>
          </aside>
        )}
      </div>

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

        <div className="hero-scratch-copy">
          <span className="hero-scratch-kicker">
            <Gift size={13} /> Scratch &amp; win
          </span>
          <span className="hero-scratch-amt">
            Cashback upto <span className="hero-scratch-amt-big">₹100</span>
          </span>
          <span className="hero-scratch-sub">
            <Sparkles size={13} /> Every order wins — tap the card to reveal
          </span>
        </div>

        <span className="hero-scratch-teaser" aria-hidden="true">
          <ScratchTeaserCard visualOnly />
        </span>
      </div>

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
              <div className="offer-sheet-list">
                {offers.map((o) => {
                  const unlocked = cartAmount >= o.target;
                  const left = Math.max(o.target - cartAmount, 0);
                  return (
                    <div
                      key={`${o.type}-${o.target}`}
                      className={`offer-tier${unlocked ? " unlocked" : ""}`}
                    >
                      <span className="offer-tier-ic">
                        {unlocked ? <Check size={14} /> : <Lock size={13} />}
                      </span>
                      <span className="offer-tier-main">
                        <span className="offer-tier-reward">{o.reward}</span>
                        <span className="offer-tier-note">
                          {unlocked
                            ? "Unlocked"
                            : `Add ₹${left} more (spend ₹${o.target})`}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
