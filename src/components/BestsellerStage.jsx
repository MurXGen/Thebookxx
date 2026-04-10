"use client";

import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Pause,
  Phone,
  Play,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const SWAP_INTERVAL = 3000;
const STATS_ROTATION_INTERVAL = 5000;

// Order stats with different timeframes
const orderStats = [
  { label: "in last hour", value: 29, suffix: "+", icon: "🔥" },
  { label: "for the today", value: 100, suffix: "+", icon: "🔥" },
  { label: "for this week", value: 210, suffix: "+", icon: "⭐" },
  { label: "for this month", value: 329, suffix: "+", icon: "🏆" },
];

export default function BestsellerStage() {
  const bestsellerBooks = useMemo(
    () =>
      books.filter((b) =>
        b.catalogue?.some((c) =>
          ["novel", "bestseller", "trending"].includes(c.toLowerCase()),
        ),
      ),
    [],
  );

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [isStatTransitioning, setIsStatTransitioning] = useState(false);

  // Rotate order stats with smooth transition
  useEffect(() => {
    const timer = setInterval(() => {
      setIsStatTransitioning(true);
      setTimeout(() => {
        setCurrentStatIndex((prev) => (prev + 1) % orderStats.length);
        setIsStatTransitioning(false);
      }, 300);
    }, STATS_ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate books with pause/resume support
  useEffect(() => {
    if (bestsellerBooks.length < 2 || !isPlaying) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % bestsellerBooks.length),
      SWAP_INTERVAL,
    );
    return () => clearInterval(timer);
  }, [bestsellerBooks.length, isPlaying]);

  const handlePauseResume = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleBookClick = useCallback((bookId) => {
    window.location.href = `https://thebookx.in/books/${bookId}`;
  }, []);

  if (bestsellerBooks.length < 2) return null;

  const leftBook = bestsellerBooks[index];
  const rightBook = bestsellerBooks[(index + 1) % bestsellerBooks.length];
  const currentStat = orderStats[currentStatIndex];

  return (
    <section className="bestseller-stage">
      {/* Header */}
      <div className="stage-header">
        <h2 className="stage-title">Bestsellers</h2>
        <p className="stage-subtitle">Loved by readers across India</p>
      </div>

      {/* Order Stats Section - Above the carousel */}
      <motion.div
        className="order-stats-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* <div className="stats-rotator">
          <motion.div
            className="stats-content"
            animate={{
              opacity: isStatTransitioning ? 0 : 1,
              y: isStatTransitioning ? -10 : 0,
            }}
            transition={{ duration: 0.25 }}
          >
            <span className="stats-icon">{currentStat.icon}</span>
            <span className="stats-number">
              {currentStat.value.toLocaleString()}
              {currentStat.suffix}
            </span>
            <span className="stats-label">{currentStat.label}</span>
          </motion.div>
        </div> */}
        <div className="flex flex-row gap-12">
          <div className="green-check">
            <Star size={14} fill="#22c55e" stroke="#22c55e" />
            <span>Verified Orders</span>
          </div>
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>100% Trusted</span>
          </div>
        </div>
      </motion.div>

      {/* Stage - Original sliding cards */}
      <div className="stage-floor">
        <AnimatePresence mode="wait">
          <motion.div
            key={leftBook.id + "-left"}
            className="stage-book left"
            initial={{ opacity: 0, x: -60, rotate: -15, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, rotate: -8, scale: 1 }}
            exit={{ opacity: 0, x: -80, rotate: -20, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => handleBookClick(leftBook.id)}
          >
            <Image src={leftBook.image} alt={leftBook.name} fill />
          </motion.div>

          <motion.div
            key={rightBook.id + "-right"}
            className="stage-book right"
            initial={{ opacity: 0, x: 80, rotate: 15, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, rotate: 8, scale: 1 }}
            exit={{ opacity: 0, x: 100, rotate: 25, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => handleBookClick(rightBook.id)}
          >
            <Image src={rightBook.image} alt={rightBook.name} fill />
          </motion.div>
        </AnimatePresence>

        <div className="stage-shadow" />
      </div>

      {/* Pause/Resume Button - Below the carousel */}
      <motion.div
        className="controls-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="play-pause-btn"
          onClick={handlePauseResume}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {/* <span>{isPlaying ? "Pause" : "Resume"} Carousel</span> */}
        </motion.button>
      </motion.div>

      {/* Trust Strip */}
      <motion.div
        className="trust-strip"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          href="/terms"
          className="trust-item"
          style={{ textDecoration: "underline" }}
        >
          <FileText size={14} />
          <span>Trusted Terms</span>
        </Link>

        <div className="trust-item">
          <Truck size={14} />
          <span>Delhivery / India Post</span>
        </div>
        <div className="trust-item">
          <ShieldCheck size={14} />
          <span>Secure Checkout</span>
        </div>
        <Link
          href="https://wa.me/917710892108?text=Hey%20hi%20I'm%20looking%20for%20a%20book%20that's%20not%20listed%20on%20your%20site.%20Could%20you%20please%20help%20me%20find%20it%3F"
          target="_blank"
          className="trust-item"
          style={{ textDecoration: "underline" }}
        >
          <Phone size={14} />
          <span>Contact us</span>
        </Link>
      </motion.div>
    </section>
  );
}
