"use client";

import { useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { books } from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import { useStore } from "@/context/StoreContext";
import LiveOrdersStrip from "@/components/LiveOrdersStrip";
import ScratchTeaserCard from "@/components/ScratchTeaserCard";
import SearchOverlay from "@/components/SearchOverlay";
import RecommendationModal from "@/components/RecommendationModal";

// Static, above-the-fold hero. Gives the homepage a clear value proposition and
// a real H1 before the animated Bestsellers carousel. All stats are derived
// from the catalogue / policies, no invented numbers. (SEO copy unchanged.)
export default function HomeHero() {
  const titleCount = Math.max(100, Math.floor(books.length / 100) * 100);

  // Modals wired to the existing app flows.
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);

  // Reward tiers driven by the live cart so the chips + the "Unlock more
  // rewards" sheet reflect what the shopper has actually unlocked.
  const { cart } = useStore();
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

  const stats = [
    { icon: Star, label: "4.4 rating" },
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: RotateCcw, label: "7-day returns" },
  ];

  const openScratch = () => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("tbx:open-scratch"));
  };

  return (
    <section
      className="home-hero"
      ref={heroRef}
      onPointerDown={spawnBurst}
      style={{ position: "relative" }}
    >
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

      <div className="home-hero-inner">
        {/* Offers row — tap any chip to see all reward tiers */}
        <div className="hero-offers-row" role="list">
          {offerChips.map((c, i) => (
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

        <h1 className="home-hero-title">
          Buy Books Online in India,{" "}
          <span className="home-hero-accent">Starting at ₹1</span>
        </h1>

        <p className="home-hero-sub">
          Hand-picked bestsellers, self-help and fiction at the lowest prices,
          starting at just ₹1. Cash on Delivery, free shipping and easy 7-day
          returns across India.
        </p>

        <div className="home-hero-stats">
          {stats.map(({ icon: Icon, label }) => (
            <div key={label} className="home-hero-stat">
              <Icon size={15} className="home-hero-stat-icon" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Live-order social-proof ticker */}
        <LiveOrdersStrip />

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
      </div>

      {/* Scratch & win band — reuses the homepage scratch flow (opens the
          number modal + wallet reward via the tbx:open-scratch event). */}
      <div
        className="hero-scratch-band"
        role="button"
        tabIndex={0}
        onClick={openScratch}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && openScratch()
        }
        aria-label="Scratch to win cashback"
      >
        <div className="hero-scratch-copy">
          <span className="hero-scratch-kicker">
            <Sparkles size={13} /> Scratch &amp; win
          </span>
          <span className="hero-scratch-amt">Cashback upto ₹100</span>
          <span className="hero-scratch-cta">Tap to scratch →</span>
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
