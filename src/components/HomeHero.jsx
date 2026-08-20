"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Truck,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { books } from "@/utils/book";
import HomeGreeting from "@/components/HomeGreeting";
import RakshaBandhanDecor from "@/components/RakshaBandhanDecor";

const INSTAGRAM_URL = "https://www.instagram.com/thebookx.in/";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/Lk3okPbq21s8kJeoM3UA4c?mode=gi_t";

// Overlapping member avatars shown in the Join-community sheet. Drop these
// files into /public/review/promotions/ — any missing one is skipped.
const COMMUNITY_AVATARS = [
  "/review/promotions/member-1.jpeg",
  "/review/promotions/member-2.jpeg",
  "/review/promotions/member-3.jpeg",
  "/review/promotions/member-4.jpeg",
  "/review/promotions/member-5.jpeg",
];

// Static, above-the-fold hero. Gives the homepage a clear value proposition and
// a real H1 before the animated Bestsellers carousel. All stats are derived
// from the catalogue / policies, no invented numbers.
export default function HomeHero() {
  const titleCount = Math.max(100, Math.floor(books.length / 100) * 100);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState({});
  const avatars = COMMUNITY_AVATARS.filter((src) => !avatarBroken[src]);

  // Tap-anywhere firecracker: spawn a short-lived sparkle burst at the pointer.
  const heroRef = useRef(null);
  const [bursts, setBursts] = useState([]);
  // Brand + festive palette (orange / saffron / gold / marigold / red).
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
    setTimeout(
      () => setBursts((b) => b.filter((z) => z.id !== id)),
      750,
    );
  };

  const stats = [
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: Star, label: "4.4 avg rating" },
    { icon: Truck, label: "Free delivery" },
    { icon: RotateCcw, label: "7-day returns" },
  ];

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
        <span className="home-hero-eyebrow">
          India’s friendly online bookstore
        </span>

        <HomeGreeting />

        <h1 className="home-hero-title">
          Buy Books Online in India,{" "}
          <span className="home-hero-accent">Starting at ₹1</span>
        </h1>

        <p className="home-hero-sub">
          Hand-picked bestsellers, self-help and fiction at the lowest prices,
          starting at just ₹1. Cash on Delivery, free shipping and easy 7-day
          returns across India.
        </p>

        {/* Raksha Bandhan promo — banner only (ribbon lives below the navbar),
            sits right above the community CTA */}
        <RakshaBandhanDecor ribbon={false} confetti={false} banner />



        <div className="home-hero-cta">
          <button
            type="button"
            className="home-hero-community-btn"
            onClick={() => setCommunityOpen(true)}
            aria-label="Join our community"
          >
            {avatars.length > 0 && (
              <span className="community-avatars">
                {avatars.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="community-avatar"
                    loading="lazy"
                    onError={() =>
                      setAvatarBroken((prev) => ({ ...prev, [src]: true }))
                    }
                  />
                ))}
              </span>
            )}
            <span className="home-hero-community-label">
              Join community
              <span className="home-hero-community-sub">
                5,000+ book lovers
              </span>
            </span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="home-hero-stats">
          {stats.map(({ icon: Icon, label }) => (
            <div key={label} className="home-hero-stat">
              <Icon size={15} className="home-hero-stat-icon" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Join-community bottom sheet — Instagram + WhatsApp group */}
      <AnimatePresence>
        {communityOpen && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommunityOpen(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal community-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 700)
                  setCommunityOpen(false);
              }}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Join our community</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setCommunityOpen(false)}
                >
                  <X size={18} />
                </span>
              </div>

              {avatars.length > 0 && (
                <div className="community-avatars">
                  {avatars.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="community-avatar"
                      loading="lazy"
                      onError={() =>
                        setAvatarBroken((prev) => ({ ...prev, [src]: true }))
                      }
                    />
                  ))}
                  <span className="community-avatars-note">
                    Join 5,000+ book lovers
                  </span>
                </div>
              )}

              <p className="community-sub">
                Be first to know about ₹1 drops, new arrivals and exclusive
                offers. Pick where you’d like to join us.
              </p>

              <div className="community-actions">
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-btn wa"
                  onClick={() => setCommunityOpen(false)}
                >
                  <FaWhatsapp size={20} />
                  <span>Join WhatsApp group</span>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-btn ig"
                  onClick={() => setCommunityOpen(false)}
                >
                  <FaInstagram size={20} />
                  <span>Follow on Instagram</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
