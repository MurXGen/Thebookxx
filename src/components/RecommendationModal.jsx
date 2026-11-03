"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Check,
  RotateCcw,
  Smile,
  Brain,
  Rocket,
  BookOpen,
  Users,
  Truck,
  Star,
} from "lucide-react";
import { books } from "@/utils/book";
import { useRouter } from "next/navigation";
import BookCard from "./BookCard";
import { FaWhatsapp } from "react-icons/fa";
import { useStore } from "@/context/StoreContext";
import { trackCartEvent } from "@/utils/cartEvents";
import { showToast } from "@/context/ToastContext";
import { getCatalogueData } from "@/utils/catalogueUtils";

// Get all unique categories from books with their frequency
const getAllCategoriesWithFrequency = () => {
  const categoryMap = new Map();
  books.forEach((book) => {
    book.catalogue?.forEach((cat) => {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
  });

  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([category]) => category);
};

const GENRES = getAllCategoriesWithFrequency();

// Friendly labels + emoji for genre chips.
const GENRE_META = Object.fromEntries(
  getCatalogueData().map((c) => [c.key, { label: c.label, emoji: c.emoji }]),
);

// Visual meta for the reading-goal cards (keyed by READING_PREFERENCES id).
const GOAL_META = {
  entertainment: { Icon: Smile, sub: "Stories you can't put down", tint: "#ec4899" },
  knowledge: { Icon: BookOpen, sub: "Learn something new", tint: "#0ea5e9" },
  "self-improvement": { Icon: Brain, sub: "Habits, mindset & growth", tint: "#a855f7" },
  career: { Icon: Rocket, sub: "Money, business & leadership", tint: "#10b981" },
};

const TOP_PICKS = 3;
const imgSrc = (b) => (typeof b.image === "string" ? b.image : b.image?.src);

// Results are shown in batches and lazy-loaded as the shopper scrolls.
const INITIAL_VISIBLE = 30;
const LOAD_BATCH = 20;

const AGE_GROUPS = [
  {
    id: "0-12",
    label: "Children (0-12 years)",
    keywords: ["children", "kids", "picture", "young"],
  },
  {
    id: "13-17",
    label: "Teen (13-17 years)",
    keywords: ["young-adult", "teen", "ya"],
  },
  {
    id: "18-25",
    label: "Young Adult (18-25 years)",
    keywords: ["new-adult", "college", "campus"],
  },
  {
    id: "26-35",
    label: "Adult (26-35 years)",
    keywords: ["adult", "contemporary", "romance"],
  },
  {
    id: "36-50",
    label: "Mature (36-50 years)",
    keywords: ["classic", "literary", "historical"],
  },
  {
    id: "50+",
    label: "Senior (50+ years)",
    keywords: ["classic", "biography", "history"],
  },
  { id: "any", label: "Any age", keywords: [] },
];

const READING_PREFERENCES = [
  {
    id: "entertainment",
    label: "Entertainment & Fun",
    keywords: [
      "romance",
      "fiction",
      "fantasy",
      "thriller",
      "mystery",
      "horror",
      "adventure",
      "comedy",
      "humor",
    ],
    weight: 1.5,
  },
  {
    id: "knowledge",
    label: "Knowledge & Learning",
    keywords: [
      "educational",
      "science",
      "history",
      "philosophy",
      "academic",
      "reference",
      "textbook",
    ],
    weight: 1.5,
  },
  {
    id: "self-improvement",
    label: "Self Improvement",
    keywords: [
      "self-help",
      "motivation",
      "psychology",
      "health",
      "wellness",
      "mindfulness",
      "productivity",
    ],
    weight: 1.5,
  },
  {
    id: "career",
    label: "Career & Business",
    keywords: [
      "business",
      "entrepreneurship",
      "finance",
      "management",
      "leadership",
      "marketing",
      "economics",
    ],
    weight: 1.5,
  },
];

// Calculate book score based on multiple factors
const calculateBookScore = (book, formData) => {
  let score = 0;

  // 1. Genre matching (40% weight)
  if (formData.genres.length > 0) {
    const matchingGenres =
      book.catalogue?.filter((cat) => formData.genres.includes(cat)).length ||
      0;
    const genreScore = (matchingGenres / formData.genres.length) * 40;
    score += genreScore;
  }

  // 2. Reading preference matching (30% weight)
  if (formData.preference) {
    const preference = READING_PREFERENCES.find(
      (p) => p.id === formData.preference,
    );
    if (preference) {
      const matchingKeywords =
        book.catalogue?.filter((cat) =>
          preference.keywords.some((keyword) =>
            cat.toLowerCase().includes(keyword.toLowerCase()),
          ),
        ).length || 0;
      const preferenceScore = Math.min((matchingKeywords / 3) * 30, 30);
      score += preferenceScore;
    }
  }

  // 3. Age group matching (15% weight)
  if (formData.ageGroup && formData.ageGroup !== "any") {
    const ageGroup = AGE_GROUPS.find((a) => a.id === formData.ageGroup);
    if (ageGroup && ageGroup.keywords.length > 0) {
      const ageMatches =
        book.catalogue?.filter((cat) =>
          ageGroup.keywords.some((keyword) =>
            cat.toLowerCase().includes(keyword.toLowerCase()),
          ),
        ).length || 0;
      const ageScore = Math.min(ageMatches * 7.5, 15);
      score += ageScore;
    } else {
      score += 7.5;
    }
  } else {
    score += 7.5;
  }

  // 4. Popularity & trends (10% weight)
  if (book.catalogue?.includes("bestseller")) score += 5;
  if (book.catalogue?.includes("trending")) score += 5;

  // 5. Value for money (5% weight)
  const discountPercent =
    ((book.originalPrice - book.discountedPrice) / book.originalPrice) * 100;
  if (discountPercent > 50) score += 5;
  else if (discountPercent > 30) score += 3;
  else if (book.discountedPrice === 1) score += 5;

  // 6. Stock availability boost
  if (book.stock > 0 && book.stock < 10) score += 2;

  return { score };
};

export default function RecommendationModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) {
  const { addToCart, cart } = useStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  // 1 welcome · 2 goal · 3 genres · 4 who-for · 5 results
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    genres: [],
    gender: "",
    ageGroup: "",
    preference: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  // Portal to <body> so the dark overlay always covers the viewport — otherwise,
  // when opened from inside the cart bar (which uses transform/will-change), the
  // fixed overlay gets trapped and the backdrop doesn't show on the home page.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const inCart = (id) => cart?.some((i) => i.id === id);

  // Record "Suggest me" engagement on the shopper's abandoned-cart row whenever
  // this modal opens (covers every suggest-me trigger across the site).
  useEffect(() => {
    if (isOpen) trackCartEvent("suggest");
  }, [isOpen]);

  useEffect(() => {
    if (externalIsOpen === undefined && typeof window !== "undefined") {
      const hasSuggestParam = window.location.search.includes("suggest");

      if (hasSuggestParam) {
        setInternalIsOpen(true);

        // Remove the suggest parameter from URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete("suggest");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [externalIsOpen]);

  // Restore a finished quiz (results) after a reload.
  useEffect(() => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem("recommendationModalState") || "null",
      );
      if (parsed?.isOpen && !parsed.isClosed && parsed.recommendations?.length) {
        setInternalIsOpen(true);
        setStep(5);
        setRecommendations(parsed.recommendations);
        if (parsed.formData) setFormData(parsed.formData);
      }
    } catch {
      /* ignore bad state */
    }
  }, []);

  const saveModalState = (open, recs, formDataState) => {
    try {
      localStorage.setItem(
        "recommendationModalState",
        JSON.stringify({
          isOpen: open,
          isClosed: false,
          step: 5,
          recommendations: recs,
          formData: formDataState,
          timestamp: Date.now(),
        }),
      );
    } catch {
      /* storage full / blocked */
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setFormData({ genres: [], gender: "", ageGroup: "", preference: "" });
    setRecommendations([]);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const handleClose = () => {
    try {
      localStorage.setItem(
        "recommendationModalState",
        JSON.stringify({ isOpen: false, isClosed: true, timestamp: Date.now() }),
      );
    } catch {
      /* ignore */
    }
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
    setTimeout(resetQuiz, 300);
  };

  const handleWhatsAppRedirect = () => {
    const picked = formData.genres
      .map((g) => GENRE_META[g]?.label || g)
      .join(", ");
    const message = encodeURIComponent(
      picked
        ? `Hi! I'm looking for a book. I like ${picked}. Can you suggest something?`
        : `Hi! I'm looking for a book. Can you help me?`,
    );
    window.open(`https://wa.me/917710892108?text=${message}`, "_blank");
  };

  const handleWhatsAppCommunity = () => {
    window.open(
      `https://chat.whatsapp.com/Lk3okPbq21s8kJeoM3UA4c?mode=gi_t`,
      "_blank",
    );
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const generateRecommendations = (data = formData) => {
    setIsLoading(true);
    setStep(5);
    setTimeout(() => {
      const ranked = books
        .filter((b) => b.stock === undefined || b.stock === null || b.stock > 0)
        .map((book) => ({ ...book, score: calculateBookScore(book, data).score }))
        .sort((a, b) => b.score - a.score);

      setRecommendations(ranked);
      setVisibleCount(INITIAL_VISIBLE);
      setIsLoading(false);
      // Persist a trimmed slice so restore is fast and localStorage stays small.
      saveModalState(true, ranked.slice(0, 60), data);
    }, 1100);
  };

  // Top picks: best matches, at most one ₹1 book (one ₹1 book per order).
  const topPicks = (() => {
    const out = [];
    let rupee = false;
    for (const b of recommendations) {
      if (b.discountedPrice === 1) {
        if (rupee) continue;
        rupee = true;
      }
      out.push(b);
      if (out.length === TOP_PICKS) break;
    }
    return out;
  })();
  const topIds = new Set(topPicks.map((b) => b.id));
  const morePicks = recommendations.filter((b) => !topIds.has(b.id));
  const topTotal = topPicks.reduce((s, b) => s + (b.discountedPrice || 0), 0);
  const topMrp = topPicks.reduce((s, b) => s + (b.originalPrice || 0), 0);
  const allTopInCart = topPicks.length > 0 && topPicks.every((b) => inCart(b.id));

  const addOne = (b) => {
    if (inCart(b.id)) return;
    addToCart(b.id);
    showToast(`${b.name} added to your bag`, "success");
  };

  const addTopPicks = () => {
    topPicks.forEach((b) => !inCart(b.id) && addToCart(b.id));
    showToast(`Your ${topPicks.length} picks are in the bag 🎉`, "success");
  };

  const quizStep = step >= 2 && step <= 4 ? step - 1 : 0;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="bill-modal-overlay" onClick={handleClose}>
          <motion.div
            className="bill-modal rq"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rq-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) handleClose();
            }}
          >
            {/* Header */}
            <div className="rq-head">
              {quizStep > 0 || step === 5 ? (
                <button
                  type="button"
                  className="rq-icon-btn"
                  aria-label="Back"
                  onClick={() =>
                    step === 5 ? setStep(4) : setStep((s) => Math.max(1, s - 1))
                  }
                >
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <span className="rq-head-ic">
                  <BookOpen size={16} />
                </span>
              )}
              <span id="rq-title" className="rq-head-title">
                {step === 5 ? "Our picks for you" : "Help me choose a book"}
              </span>
              <button
                type="button"
                className="rq-icon-btn"
                aria-label="Close"
                onClick={handleClose}
              >
                <X size={18} />
              </button>
            </div>

            {quizStep > 0 && (
              <div className="rq-progress" aria-label={`Question ${quizStep} of 3`}>
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= quizStep ? "on" : ""} />
                ))}
              </div>
            )}

            <div className="rq-body">
              <AnimatePresence mode="wait">
                {/* 1 · Welcome */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    className="rq-step"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    <div className="rq-hero">
                      <div className="rq-covers" aria-hidden="true">
                        {books
                          .filter((b) => b.image && b.catalogue?.includes("bestseller"))
                          .slice(0, 3)
                          .map((b, i) => (
                            <img key={b.id} src={imgSrc(b)} alt="" className={`rq-cover rq-cover-${i}`} />
                          ))}
                      </div>
                      <h3 className="rq-h">Not sure what to read next?</h3>
                      <p className="rq-p">
                        Tell us a little about what you like and we&apos;ll pull{" "}
                        <b>3 books off our shelves</b> for you. Books start at ₹1.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rq-primary"
                      onClick={() => setStep(2)}
                    >
                      Pick books for me <ArrowRight size={18} />
                    </button>

                    <div className="rq-or"><span>or ask our team</span></div>

                    <div className="rq-alt">
                      <button type="button" className="rq-alt-btn" onClick={handleWhatsAppRedirect}>
                        <FaWhatsapp size={20} color="#25D366" />
                        <span>
                          <b>WhatsApp us</b>
                          <small>Tell us what you like</small>
                        </span>
                      </button>
                      <button type="button" className="rq-alt-btn" onClick={handleWhatsAppCommunity}>
                        <Users size={20} color="#25D366" />
                        <span>
                          <b>Join community</b>
                          <small>See what others are reading</small>
                        </span>
                      </button>
                    </div>

                    <div className="rq-trust">
                      <span><Star size={13} /> 4.4 rated</span>
                      <span><Truck size={13} /> Cash on Delivery</span>
                      <span><RotateCcw size={13} /> 7-day returns</span>
                    </div>
                  </motion.div>
                )}

                {/* 2 · Reading goal (one tap → next) */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    className="rq-step"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                  >
                    <span className="rq-kicker">Question 1 of 3</span>
                    <h3 className="rq-h">What are you in the mood for?</h3>
                    <div className="rq-goals">
                      {READING_PREFERENCES.map((pref) => {
                        const m = GOAL_META[pref.id] || {};
                        const on = formData.preference === pref.id;
                        return (
                          <button
                            key={pref.id}
                            type="button"
                            className={`rq-goal${on ? " on" : ""}`}
                            style={{ "--t": m.tint }}
                            onClick={() => {
                              updateFormData("preference", pref.id);
                              setTimeout(() => setStep(3), 180);
                            }}
                          >
                            <span className="rq-goal-ic">
                              {m.Icon ? <m.Icon size={20} /> : null}
                            </span>
                            <span className="rq-goal-txt">
                              <b>{pref.label}</b>
                              <small>{m.sub}</small>
                            </span>
                            {on && <Check size={18} className="rq-goal-tick" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 3 · Genres */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    className="rq-step"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                  >
                    <span className="rq-kicker">Question 2 of 3</span>
                    <h3 className="rq-h">Which kinds of books do you like?</h3>
                    <p className="rq-p">Pick as many as you want.</p>
                    <div className="rq-chips">
                      {GENRES.map((g) => {
                        const on = formData.genres.includes(g);
                        const m = GENRE_META[g];
                        return (
                          <button
                            key={g}
                            type="button"
                            className={`rq-chip${on ? " on" : ""}`}
                            onClick={() => toggleGenre(g)}
                            aria-pressed={on}
                          >
                            {m?.emoji ? <span aria-hidden="true">{m.emoji}</span> : null}
                            {m?.label || g}
                            {on && <Check size={13} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 4 · Who is it for */}
                {step === 4 && (
                  <motion.div
                    key="s4"
                    className="rq-step"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                  >
                    <span className="rq-kicker">Question 3 of 3</span>
                    <h3 className="rq-h">Who&apos;s the reader?</h3>
                    <p className="rq-p">So we don&apos;t send a teen a business book.</p>
                    <div className="rq-chips">
                      {AGE_GROUPS.map((age) => (
                        <button
                          key={age.id}
                          type="button"
                          className={`rq-chip${formData.ageGroup === age.id ? " on" : ""}`}
                          onClick={() => updateFormData("ageGroup", age.id)}
                          aria-pressed={formData.ageGroup === age.id}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5 · Results */}
                {step === 5 && (
                  <motion.div
                    key="s5"
                    className="rq-step rq-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (
                        el.scrollTop + el.clientHeight >= el.scrollHeight - 240 &&
                        visibleCount < morePicks.length
                      ) {
                        setVisibleCount((v) => Math.min(v + LOAD_BATCH, morePicks.length));
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="rq-loading">
                        <span className="rq-loading-book" aria-hidden="true">
                          <BookOpen size={30} />
                        </span>
                        <b>Pulling books off the shelf…</b>
                      </div>
                    ) : recommendations.length === 0 ? (
                      <div className="rq-loading">
                        <b>No matches yet</b>
                        <small>Try a few different genres.</small>
                        <button type="button" className="rq-ghost" onClick={() => setStep(3)}>
                          Change genres
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="rq-res-head">
                          <span className="rq-kicker">Based on what you told us</span>
                          <h3 className="rq-h">Start with these {topPicks.length}</h3>
                        </div>

                        <div className="rq-top">
                          {topPicks.map((b, i) => (
                            <div key={b.id} className="rq-pick">
                              {i === 0 && <span className="rq-best">Top pick</span>}
                              <img src={imgSrc(b)} alt={b.name} loading="lazy" />
                              <span className="rq-pick-name">{b.name}</span>
                              <span className="rq-pick-price">
                                ₹{b.discountedPrice}
                                {b.originalPrice > b.discountedPrice && (
                                  <s>₹{b.originalPrice}</s>
                                )}
                              </span>
                              <button
                                type="button"
                                className={`rq-pick-add${inCart(b.id) ? " on" : ""}`}
                                onClick={() => addOne(b)}
                              >
                                {inCart(b.id) ? (
                                  <><Check size={13} strokeWidth={3} /> Added</>
                                ) : (
                                  "Add"
                                )}
                              </button>
                            </div>
                          ))}
                        </div>

                        {morePicks.length > 0 && (
                          <>
                            <div className="rq-more-head">
                              <b>You might also like</b>
                              <small>{morePicks.length} books</small>
                            </div>
                            <div className="grid-2">
                              {morePicks.slice(0, visibleCount).map((book) => (
                                <BookCard key={book.id} book={book} />
                              ))}
                            </div>
                            {visibleCount < morePicks.length && (
                              <button
                                type="button"
                                className="reco-lazy-more"
                                onClick={() =>
                                  setVisibleCount((v) => Math.min(v + LOAD_BATCH, morePicks.length))
                                }
                              >
                                <span className="reco-lazy-spinner" />
                                Loading more books…
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky footer per step */}
            {step === 3 && (
              <div className="rq-foot">
                <button type="button" className="rq-ghost" onClick={handleWhatsAppRedirect}>
                  <FaWhatsapp size={18} color="#25D366" /> Ask us
                </button>
                <button
                  type="button"
                  className="rq-next"
                  disabled={formData.genres.length === 0}
                  onClick={() => setStep(4)}
                >
                  {formData.genres.length
                    ? `Continue (${formData.genres.length})`
                    : "Pick at least one"}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            {step === 4 && (
              <div className="rq-foot">
                <button
                  type="button"
                  className="rq-ghost"
                  onClick={() => {
                    const d = { ...formData, ageGroup: "any" };
                    setFormData(d);
                    generateRecommendations(d);
                  }}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="rq-next"
                  disabled={!formData.ageGroup}
                  onClick={() => generateRecommendations()}
                >
                  See my books <ArrowRight size={16} />
                </button>
              </div>
            )}
            {step === 5 && !isLoading && topPicks.length > 0 && (
              <div className="rq-foot rq-foot-buy">
                <button type="button" className="rq-ghost" onClick={resetQuiz} aria-label="Retake quiz">
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  className="rq-next"
                  disabled={allTopInCart}
                  onClick={addTopPicks}
                >
                  <ShoppingBag size={16} />
                  {allTopInCart ? (
                    "All picks in your bag"
                  ) : (
                    <>
                      Add top {topPicks.length} · ₹{topTotal}
                      {topMrp > topTotal && <s>₹{topMrp}</s>}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
