"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
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
    img: "/review/bookreviews/thebookx-reader-order-ikigai-midnight-library-alchemist-monk-who-sold-his-ferrari.jpg",
    caption: "A 7-book TheBookX order, delivered sealed in shrink-wrap",
    books: ["Ikigai", "Myth = Mithya", "The Midnight Library", "Red Flags and Rishtas", "The Monk Who Sold His Ferrari", "The Alchemist"],
    alt: "TheBookX customer order: Ikigai, Myth = Mithya, The Midnight Library, Red Flags and Rishtas, The Monk Who Sold His Ferrari and The Alchemist, sealed in shrink-wrap with a free bookmark",
  },
  {
    img: "/review/bookreviews/thebookx-reader-order-psychology-of-money-mindset-manifest-art-of-reading-minds.jpg",
    caption: "Self-help picks from a reader's TheBookX order",
    books: ["The Psychology of Money", "Mindset", "Manifest", "The Art of Reading Minds"],
    alt: "TheBookX customer order: The Psychology of Money by Morgan Housel, Mindset by Carol Dweck, Manifest by Roxie Nafousi and The Art of Reading Minds by Henrik Fexeus",
  },
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

  // Auto-advance: scroll the row by one card while it's on screen and the
  // shopper isn't touching it; wrap to the start at the end.
  const stripRef = useRef(null);
  const scrollByCard = (dir) => {
    const el = stripRef.current;
    if (!el) return;
    const card = el.querySelector(".rg3-card");
    const w = card ? card.getBoundingClientRect().width + 14 : 280;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * w, behavior: "smooth" });
  };
  useEffect(() => {
    if (reviews.length < 2 || !isAnimating) return;
    const t = setInterval(() => scrollByCard(1), SWAP_INTERVAL);
    return () => clearInterval(t);
  }, [reviews.length, isAnimating]);

  if (reviews.length === 0) return null;

  const total = reviews.length;
  const safeIndex = currentIndex % total;
  const active = reviews[safeIndex];

  const step = (dir) => scrollByCard(dir);

  const strip = reviews;

  const features = [
    { icon: Bookmark, label: "Free bookmarks" },
    { icon: Gift, label: "Gift wrap" },
    { icon: Zap, label: "Faster delivery" },
  ];

  // Search: describe the photos as an image gallery (honest, no star ratings
  // attached to placeholder names).
  const galleryLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Real photos from TheBookX readers",
    description:
      "Unfiltered photos customers shared after their TheBookX orders arrived: genuine books, sealed packaging and free bookmarks.",
    url: "https://www.thebookx.in/#reader-photos",
    image: reviews.map((r) => ({
      "@type": "ImageObject",
      contentUrl: `https://www.thebookx.in${r.img}`,
      caption: r.caption || r.text,
      description: r.alt || `Book photo shared by a TheBookX reader${r.city ? ` from ${r.city}` : ""}`,
    })),
  };

  return (
    <section ref={sectionRef} className="rg2-wrapper rg3" id="reader-photos" aria-labelledby="rg3-h">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryLd) }} />
      <div className="section-1200 rg2-inner">
        <div className="rg3-head">
          <div className="rg3-heads">
            <span className="rg3-kicker">
              <Star size={13} fill="#ffb703" stroke="#ffb703" /> Loved by readers across India
            </span>
            <h2 id="rg3-h" className="rg2-title">Real photos from real readers</h2>
            <p className="rg2-subtitle">Unfiltered snaps our customers sent after their books arrived</p>
          </div>
          {total > 1 && (
            <div className="rg2-arrows">
              <button type="button" className="rg2-arrow" onClick={() => step(-1)} aria-label="Previous photo">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="rg2-arrow" onClick={() => step(1)} aria-label="Next photo">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Big photo cards, each with its own feedback on the photo */}
        <div
          className="rg3-strip"
          ref={stripRef}
          onTouchStart={() => setIsPlaying(false)}
          onTouchEnd={() => setTimeout(() => setIsPlaying(true), 4000)}
        >
          <div className="rg3-track">
            {strip.map((r, i) => {
              return (
                <figure
                  className="rg3-card"
                  key={r.img}
                  onMouseEnter={() => setIsPlaying(false)}
                  onMouseLeave={() => setIsPlaying(true)}
                >
                  <Image
                    src={r.img}
                    alt={r.alt || `Book photo shared by a TheBookX reader${r.city ? ` from ${r.city}` : ""}`}
                    width={480}
                    height={600}
                    sizes="(max-width: 767px) 64vw, 280px"
                    quality={70}
                    priority={i < 2}
                    loading={i < 2 ? undefined : "lazy"}
                    draggable={false}
                    onError={() => setBroken((prev) => ({ ...prev, [r.img]: true }))}
                  />
                  <figcaption className="rg3-cap">
                    {r.text ? (
                      <>
                        <Stars rating={r.rating} />
                        <span className="rg3-quote">“{r.text}”</span>
                        <span className="rg3-who">
                          {r.name}
                          {r.city ? ` · ${r.city}` : ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="rg3-tag">Customer photo</span>
                        <span className="rg3-quote">{r.caption}</span>
                        {r.books && <span className="rg3-who">{r.books.slice(0, 3).join(" · ")}{r.books.length > 3 ? ` +${r.books.length - 3}` : ""}</span>}
                      </>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        <div className="rg3-foot">
          <div className="rg2-badges">
            {features.map(({ icon: Icon, label }) => (
              <span key={label} className="rg2-badge">
                <Icon size={15} className="rg2-badge-ic" />
                {label}
              </span>
            ))}
          </div>
          <a
            href={`https://wa.me/917710892108?text=${encodeURIComponent(
              "Hi TheBookX! Sharing a photo of the books I received 📚",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rg2-review-btn"
          >
            <FaWhatsapp size={16} /> Share your photo
          </a>
        </div>
      </div>
    </section>
  );
}
