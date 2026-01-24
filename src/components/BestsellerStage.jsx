"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { books } from "@/utils/book";

const SWAP_INTERVAL = 3000;

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

  useEffect(() => {
    if (bestsellerBooks.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % bestsellerBooks.length),
      SWAP_INTERVAL,
    );
    return () => clearInterval(timer);
  }, [bestsellerBooks.length]);

  if (bestsellerBooks.length < 2) return null;

  const leftBook = bestsellerBooks[index];
  const rightBook = bestsellerBooks[(index + 1) % bestsellerBooks.length];

  return (
    <section className="bestseller-stage">
      {/* Confetti */}
      <div className="confetti-layer">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="confetti-piece" />
        ))}
      </div>

      {/* Header */}
      <div className="stage-header">
        <h2 className="stage-title">Bestsellers</h2>
        <p className="stage-subtitle">Loved by readers across India</p>
      </div>

      {/* Stage */}
      <div className="stage-floor">
        <AnimatePresence mode="wait">
          <motion.div
            key={leftBook.id + "-left"}
            className="stage-book left"
            initial={{ opacity: 0, x: -40, rotate: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: -12, scale: 1 }}
            exit={{ opacity: 0, x: -40, rotate: -20, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <Image src={leftBook.image} alt={leftBook.name} fill />
          </motion.div>

          <motion.div
            key={rightBook.id + "-right"}
            className="stage-book right"
            initial={{ opacity: 0, x: 40, rotate: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: 12, scale: 1 }}
            exit={{ opacity: 0, x: 40, rotate: 20, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <Image src={rightBook.image} alt={rightBook.name} fill />
          </motion.div>
        </AnimatePresence>

        <div className="stage-shadow" />
      </div>

      {/* Premium Badge */}
      <motion.div
        className="premium-badge"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.span
          className="badge-star"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <Star size={14} />
        </motion.span>
        <Link href="/terms" aria-label="View terms and conditions">
          <span className="badge-text cursor-pointer">
            Grab with 7-day return/exchange *
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
