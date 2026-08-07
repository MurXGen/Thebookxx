"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Star, ArrowRight } from "lucide-react";

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
  // Show up to 2 neighbours per side, clamped so no photo repeats in two slots.
  const range = Math.min(2, Math.floor((total - 1) / 2));

  const wide = typeof window !== "undefined" && window.innerWidth > 680;
  const baseOffset = wide ? 230 : 150;
  const farOffset = wide ? 360 : 250;

  const visible = [];
  for (let i = -range; i <= range; i++) {
    const idx = ((safeIndex + i) % total + total) % total;
    let opacity = 0.5;
    let scale = 0.85;
    let zIndex = 1;
    let x = 0;
    if (i === 0) {
      opacity = 1;
      scale = 1.05;
      zIndex = 10;
    } else if (i === 1) {
      opacity = 0.5;
      scale = 0.9;
      zIndex = 5;
      x = baseOffset;
    } else if (i === -1) {
      opacity = 0.5;
      scale = 0.9;
      zIndex = 5;
      x = -baseOffset;
    } else if (i === 2) {
      opacity = 0.12;
      scale = 0.78;
      zIndex = 2;
      x = farOffset;
    } else if (i === -2) {
      opacity = 0.12;
      scale = 0.78;
      zIndex = 2;
      x = -farOffset;
    }
    visible.push({ review: reviews[idx], opacity, scale, zIndex, x });
  }

  return (
    <section ref={sectionRef} className="review-gallery-wrapper">
      <div className="section-1200 flex flex-col gap-12">
        <div className="review-cf-header">
          <h2 className="review-cf-title">Real photos from real readers</h2>
          <p className="review-cf-subtitle">
            Unfiltered snaps our customers sent in after their books arrived
          </p>
        </div>

        <div className="review-cf">
          {/* White edge masks left + right */}
          <div className="review-cf-mask review-cf-mask-left" />
          <div className="review-cf-mask review-cf-mask-right" />

          <div className="review-cf-track">
            {visible.map((p) => (
              <motion.div
                key={p.review.img}
                className="review-cf-card"
                style={{ zIndex: p.zIndex }}
                animate={{ opacity: p.opacity, scale: p.scale, x: p.x }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={p.review.img}
                  alt={`Book photo shared by ${p.review.name}`}
                  loading="lazy"
                  draggable={false}
                  onError={() =>
                    setBroken((prev) => ({ ...prev, [p.review.img]: true }))
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active buyer's review caption — updates as photos rotate */}
        <div className="review-cf-caption">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.img}
              className="review-cf-caption-inner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <Stars rating={active.rating} />
              <p className="review-cf-text">“{active.text}”</p>
              <span className="review-cf-author">
                {active.name} · {active.city}
                <span className="review-cf-verified">Verified buyer</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="review-cf-controls">
          {reviews.length > 1 && (
            <motion.button
              type="button"
              className="review-cf-playpause"
              onClick={() => setIsPlaying((v) => !v)}
              whileTap={{ scale: 0.95 }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </motion.button>
          )}

          <a
            href="https://www.thebookx.in/review"
            target="_blank"
            rel="noopener noreferrer"
            className="review-cf-write-btn"
          >
            Write a Review
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
