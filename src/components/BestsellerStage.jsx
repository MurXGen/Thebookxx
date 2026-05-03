"use client";

import { books } from "@/utils/book";
import { AnimatePresence, motion } from "framer-motion";
import {
  Book,
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
import { BsCash } from "react-icons/bs";

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [isStatTransitioning, setIsStatTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);

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
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((i) => (i + 1) % bestsellerBooks.length);
    }, SWAP_INTERVAL);
    return () => clearInterval(timer);
  }, [bestsellerBooks.length, isPlaying]);

  const handlePauseResume = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleBookClick = useCallback((bookId) => {
    window.location.href = `https://thebookx.in/books/${bookId}`;
  }, []);

  if (bestsellerBooks.length < 2) return null;

  // Get books for the carousel (current + neighbors)
  const getVisibleBooks = () => {
    const books = [];
    const total = bestsellerBooks.length;

    for (let i = -2; i <= 2; i++) {
      let idx = (currentIndex + i + total) % total;
      books.push({ ...bestsellerBooks[idx], position: i });
    }
    return books;
  };

  const visibleBooks = getVisibleBooks();
  const currentStat = orderStats[currentStatIndex];

  return (
    <section className="bestseller-stage">
      {/* Header */}
      <div className="stage-header">
        <h2 className="stage-title">Bestsellers</h2>
        <p className="stage-subtitle">Loved by readers across India</p>
      </div>

      {/* Order Stats Section */}
      <motion.div
        className="order-stats-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-row gap-12">
          <div className="green-check">
            <BsCash size={16} fill="#22c55e" stroke="#22c55e" />
            <span>COD Available</span>
          </div>
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>100% Trusted</span>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Carousel */}
      <div className="carousel-container">
        <div className="carousel-track">
          {visibleBooks.map((book) => {
            // Calculate position styles
            // 🔥 Responsive base distance
            const baseOffset =
              typeof window !== "undefined" && window.innerWidth > 680
                ? 220
                : 150;

            const farOffset =
              typeof window !== "undefined" && window.innerWidth > 680
                ? 340
                : 240;

            let opacity = 0.5;
            let scale = 0.85;
            let zIndex = 1;
            let translateX = 0;

            if (book.position === 0) {
              opacity = 1;
              scale = 1.1;
              zIndex = 10;
              translateX = 0;
            } else if (book.position === 1) {
              opacity = 0.5;
              scale = 0.92;
              zIndex = 5;
              translateX = baseOffset;
            } else if (book.position === -1) {
              opacity = 0.5;
              scale = 0.92;
              zIndex = 5;
              translateX = -baseOffset;
            } else if (book.position === 2) {
              opacity = 0.1;
              scale = 0.75;
              zIndex = 2;
              translateX = farOffset;
            } else if (book.position === -2) {
              opacity = 0.1;
              scale = 0.75;
              zIndex = 2;
              translateX = -farOffset;
            }
            return (
              <div
                key={book.id}
                className="carousel-book"
                style={{
                  position: "absolute",
                  width: "180px",
                  height: "270px",
                  left: "50%",
                  marginLeft: "-90px",
                  opacity: opacity,
                  transform: `scale(${scale}) translateX(${translateX}px)`,
                  zIndex: zIndex,
                  transition: "all 0.5s ease-in-out",
                  cursor: "pointer",
                }}
                onClick={() => handleBookClick(book.id)}
              >
                <div className="book-cover">
                  <Image
                    src={book.image}
                    alt={book.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 130px, 180px"
                  />
                </div>
                {/* {book.position === 0 && (
                  <div className="book-info">
                    <h3 className="book-title">{book.name}</h3>
                    {book.author && (
                      <p className="book-author">by {book.author}</p>
                    )}
                    <div className="book-price">
                      <span className="discounted">
                        ₹{book.discountedPrice}
                      </span>
                      {book.originalPrice > book.discountedPrice && (
                        <span className="original">₹{book.originalPrice}</span>
                      )}
                    </div>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>

        {/* Shadow beneath carousel */}
        <div className="carousel-shadow" />
      </div>

      {/* Pause/Resume Button */}
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
        </motion.button>
      </motion.div>

      {/* Trust Strip */}
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
          <span>Free Delivery*</span>
        </div>

        <Link href="/blogs" className="trust-item">
          <Book size={14} />
          <span>Read blog</span>
        </Link>
        <Link
          href="https://wa.me/917710892108?text=Hey%20hi%20I'm%20looking%20for%20a%20book%20that's%20not%20listed%20on%20your%20site.%20Could%20you%20please%20help%20me%20find%20it%3F"
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
