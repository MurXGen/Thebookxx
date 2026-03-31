"use client";

import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Phone, ShieldCheck, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
        <Link href="/terms">
          <span className="badge-text cursor-pointer">
            Grab with 7-day return/exchange *
          </span>
        </Link>
      </motion.div>

      <motion.div
        className="trust-strip"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link href="/terms" className="trust-item">
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
          href="https://wa.me/917710892108?text=Hey%20hi%20I’m%20looking%20for%20a%20book%20that’s%20not%20listed%20on%20your%20site.%20Could%20you%20please%20help%20me%20find%20it%3F"
          target="_blank"
          className="trust-item"
        >
          <Phone size={14} />
          <span>Contact us</span>
        </Link>
      </motion.div>
    </section>
  );
}
