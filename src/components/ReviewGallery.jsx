"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Gift,
  Zap,
} from "lucide-react";

// Real buyer photos + their short review. Drop the photos into
// /public/review/bookreviews/ named review-1.jpeg … review-N.jpeg. Any missing
// image is skipped, and the carousel loops infinitely. Edit name/city/text to
// match each photo; ratings are 1–5.
const REVIEWS = [
  {
    img: "/review/bookreviews/review-1.jpeg",
    name: "Aarav Mehta",
    city: "Pune",
    rating: 5,
    text: "book came in perfect condition, tight binding and crisp pages. delivery bhi super fast tha!",
  },
  {
    img: "/review/bookreviews/review-2.jpeg",
    name: "Priya Nair",
    city: "Kochi",
    rating: 5,
    text: "genuine print, not a cheap copy. cover quality really surprised me for the price.",
  },
  {
    img: "/review/bookreviews/review-3.jpeg",
    name: "Rohan Das",
    city: "Kolkata",
    rating: 5,
    text: "packaging was sturdy, zero bent corners. book exactly jaisa photo me dikhaya tha.",
  },
  {
    img: "/review/bookreviews/review-4.jpeg",
    name: "Sneha Reddy",
    city: "Hyderabad",
    rating: 4,
    text: "loved the paper quality, feels premium and reads beautifully.",
  },
  {
    img: "/review/bookreviews/review-5.jpeg",
    name: "Karthik Iyer",
    city: "Chennai",
    rating: 5,
    text: "ordered a few books, all original and neatly wrapped. definitely buying again.",
  },
  {
    img: "/review/bookreviews/review-6.jpeg",
    name: "Ananya Sharma",
    city: "Delhi",
    rating: 5,
    text: "fast shipping and the book smells brand new. bahut khush hu quality se!",
  },
  {
    img: "/review/bookreviews/review-7.jpeg",
    name: "Vikram Singh",
    city: "Jaipur",
    rating: 4,
    text: "best price i found online and quality bhi mast nikli.",
  },
  {
    img: "/review/bookreviews/review-8.jpeg",
    name: "Meera Joshi",
    city: "Ahmedabad",
    rating: 5,
    text: "pages are thick and the print is sharp. lovely reading experience.",
  },
  {
    img: "/review/bookreviews/review-9.jpeg",
    name: "Aditya Rao",
    city: "Bengaluru",
    rating: 5,
    text: "arrived a day early, sealed and spotless. ekdum trustworthy store.",
  },
  {
    img: "/review/bookreviews/review-10.jpeg",
    name: "Fatima Khan",
    city: "Lucknow",
    rating: 5,
    text: "genuine edition and honestly itni acchi quality ki umeed nahi thi is price me.",
  },
  {
    img: "/review/bookreviews/review-11.jpeg",
    name: "Nikhil Verma",
    city: "Indore",
    rating: 4,
    text: "neatly packed with bubble wrap. book condition was absolutely A+.",
  },
  {
    img: "/review/bookreviews/review-12.jpeg",
    name: "Divya Menon",
    city: "Trivandrum",
    rating: 5,
    text: "excellent quality and the little bookmark inside was a sweet touch.",
  },
];

const SWAP_INTERVAL = 3200;

function Stars({ rating }) {
  return (
    <span className="review-cf-stars" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? "#ffb703" : "none"}
          stroke={i < rating ? "#ffb703" : "#d1d5db"}
        />
      ))}
    </span>
  );
}

export default function ReviewGallery() {
  const [broken, setBroken] = useState({});
  const reviews = useMemo(
    () => REVIEWS.filter((r) => !broken[r.img]),
    [broken],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);

  // Only animate while on screen (saves CPU + pauses when scrolled away).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isAnimating = isPlaying && inView;

  // Auto-advance one photo at a time — loops forever via modulo.
  useEffect(() => {
    if (reviews.length < 2 || !isAnimating) return;
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % reviews.length);
    }, SWAP_INTERVAL);
    return () => clearInterval(t);
  }, [reviews.length, isAnimating]);

  if (reviews.length === 0) return null;

  const total = reviews.length;
  const safeIndex = currentIndex % total;
  const active = reviews[safeIndex];

  const step = (dir) =>
    setCurrentIndex((i) => (i + dir + total) % total);

  // Duplicate the photos so the marquee scrolls seamlessly.
  const strip = [...reviews, ...reviews];

  const features = [
    { icon: Bookmark, label: "Free bookmarks" },
    { icon: Gift, label: "Gift wrap" },
    { icon: Zap, label: "Faster delivery" },
  ];

  return (
    <section ref={sectionRef} className="rg2-wrapper">
      <div className="section-1200 rg2-inner">
        {/* Header — SEO heading unchanged, arrows step the quote */}
        <div className="rg2-header">
          <div className="rg2-heads">
            <h2 className="rg2-title">Real photos from real readers</h2>
            <p className="rg2-subtitle">
              Unfiltered snaps our customers sent in after their books arrived
            </p>
          </div>
          {total > 1 && (
            <div className="rg2-arrows">
              <button
                type="button"
                className="rg2-arrow"
                onClick={() => step(-1)}
                aria-label="Previous review"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="rg2-arrow"
                onClick={() => step(1)}
                aria-label="Next review"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Smooth one-by-one horizontal photo marquee */}
        <div className="rg2-strip">
          <div className="rg2-strip-mask left" />
          <div className="rg2-strip-mask right" />
          <div
            className={`rg2-track${isAnimating ? " run" : " paused"}`}
            style={{ ["--rg2-count"]: total }}
          >
            {strip.map((r, i) => (
              <div className="rg2-photo" key={`${r.img}-${i}`}>
                <img
                  src={r.img}
                  alt={`Book photo shared by ${r.name}`}
                  loading="lazy"
                  draggable={false}
                  onError={() =>
                    setBroken((prev) => ({ ...prev, [r.img]: true }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Current review quote (clamped by height) + fixed Review-us button */}
        <div className="rg2-quote-row">
          <div className="rg2-quote">
            <Stars rating={active.rating} />
            <AnimatePresence mode="wait">
              <motion.p
                key={active.img}
                className="rg2-quote-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                “{active.text}”
                <span className="rg2-quote-author"> — {active.name}</span>
              </motion.p>
            </AnimatePresence>
          </div>
          <a
            href="https://www.thebookx.in/review"
            target="_blank"
            rel="noopener noreferrer"
            className="rg2-review-btn"
          >
            Review us <ArrowRight size={16} />
          </a>
        </div>

        {/* Feature badges — what customers love */}
        <div className="rg2-badges">
          {features.map(({ icon: Icon, label }) => (
            <span key={label} className="rg2-badge">
              <Icon size={15} className="rg2-badge-ic" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
