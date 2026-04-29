"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { books } from "@/utils/book";
import { useRouter } from "next/navigation";
import LoadingButton from "./UI/LoadingButton";
import BookCard from "./BookCard";
import { FaWhatsapp } from "react-icons/fa";
import { useStore } from "@/context/StoreContext";

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
  const { addToCart, toggleWishlist } = useStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    genres: [],
    gender: "",
    ageGroup: "",
    preference: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const router = useRouter();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

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

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedModalState = localStorage.getItem("recommendationModalState");
    if (savedModalState) {
      const parsed = JSON.parse(savedModalState);
      if (parsed.isOpen && !parsed.isClosed) {
        setInternalIsOpen(true);
        if (parsed.step === 4 && parsed.recommendations?.length > 0) {
          setStep(4);
          setRecommendations(parsed.recommendations);
          setSavedRecommendations(parsed.recommendations);
          if (parsed.formData) {
            setFormData(parsed.formData);
          }
        }
      }
    }
  }, []);

  // Save modal state to localStorage
  const saveModalState = (open, currentStep, recs, formDataState) => {
    const state = {
      isOpen: open,
      isClosed: false,
      step: currentStep,
      recommendations: recs,
      formData: formDataState,
      timestamp: Date.now(),
    };
    localStorage.setItem("recommendationModalState", JSON.stringify(state));
  };

  const handleClose = () => {
    // Save that modal is closed
    const closedState = {
      isOpen: false,
      isClosed: true,
      step: 1,
      recommendations: [],
      timestamp: Date.now(),
    };
    localStorage.setItem(
      "recommendationModalState",
      JSON.stringify(closedState),
    );

    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }

    setTimeout(() => {
      setStep(1);
      setFormData({
        genres: [],
        gender: "",
        ageGroup: "",
        preference: "",
      });
      setRecommendations([]);
    }, 300);
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      `Hi! I'm looking for a book. Can you help me?`,
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

  const generateRecommendations = () => {
    setIsLoading(true);

    setTimeout(() => {
      const scoredBooks = books.map((book) => {
        const { score } = calculateBookScore(book, formData);
        return { ...book, score };
      });

      scoredBooks.sort((a, b) => b.score - a.score);
      const topRecommendations = scoredBooks.slice(0, 30);

      setRecommendations(topRecommendations);
      setSavedRecommendations(topRecommendations);
      setStep(4);
      setIsLoading(false);

      // Save recommendations to localStorage
      saveModalState(true, 4, topRecommendations, formData);
    }, 1500);
  };

  const handleSubmit = () => {
    generateRecommendations();
  };

  const handleAddAllToCart = () => {
    recommendations.forEach((book) => {
      addToCart(book.id);
    });
    handleClose();
  };

  const handleAddAllToWishlist = () => {
    recommendations.forEach((book) => {
      toggleWishlist(book.id);
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="bill-modal-overlay" onClick={handleClose}>
          <motion.div
            className="bill-modal"
            style={{ maxHeight: "800px" }}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bill-header">
              <span className="weight-600 font-16 flex items-center gap-8">
                <Sparkles size={16} />
                Book Recommendations
              </span>
              <span className="cursor-pointer" onClick={handleClose}>
                <X size={16} />
              </span>
            </div>

            <div className="address-form-content">
              {/* Step 1: Initial Choice */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-16"
                >
                  <div className="text-center">
                    <p className="font-14 dark-50 mt-8">
                      We're here to help you discover the perfect read!
                    </p>
                  </div>

                  <div className="flex flex-col gap-12 mt-16">
                    <LoadingButton
                      className="pri-big-btn width100"
                      onClick={() => setStep(2)}
                    >
                      <div className="flex flex-col">
                        <p className="weight-600">Need help choosing a book?</p>
                        <span className="font-10">
                          Get personalized recommendations
                        </span>
                      </div>
                    </LoadingButton>

                    <div className="flex flex-row gap-12">
                      <LoadingButton
                        className="sec-big-btn width100"
                        onClick={handleWhatsAppRedirect}
                      >
                        <div className="flex flex-row gap-8">
                          <FaWhatsapp size={20} color="#25D366" />
                          <p className="weight-600">Chat with us</p>
                        </div>
                      </LoadingButton>

                      <LoadingButton
                        className="sec-big-btn width100"
                        onClick={handleWhatsAppCommunity}
                      >
                        <div className="flex flex-row gap-8">
                          <FaWhatsapp size={20} color="#25D366" />
                          <p className="weight-600">Join community</p>
                        </div>
                      </LoadingButton>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Genre Selection */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-16 recommendation-modal"
                >
                  <div>
                    <div className="flex justify-between items-center mb-12">
                      <span className="font-12 gray-500">Step 1 of 3</span>
                      <span className="font-12 purple">
                        {formData.genres.length} selected
                      </span>
                    </div>
                    <h3 className="font-18 weight-600 mb-8">
                      Which genres interest you?
                    </h3>
                    <p className="font-12 dark-50 mb-12">
                      Select multiple genres you enjoy reading
                    </p>

                    <div
                      className="chips-container flex flex-row flex-wrap gap-8"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          className={`sec-mid-btn ${formData.genres.includes(genre) ? "active" : ""}`}
                          onClick={() => toggleGenre(genre)}
                          style={{ fontSize: "12px" }}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="dashed-border my-8"></div>

                  <div>
                    <h3 className="font-16 weight-600 mb-8">Age Group</h3>
                    <div className="flex flex-wrap gap-8">
                      {AGE_GROUPS.map((age) => (
                        <button
                          key={age.id}
                          className={`sec-mid-btn ${formData.ageGroup === age.id ? "active" : ""}`}
                          onClick={() => updateFormData("ageGroup", age.id)}
                          style={{ padding: "8px 16px", fontSize: "12px" }}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row gap-12">
                    <button
                      className="sec-big-btn width100 flex flex-row items-center justify-center gap-4"
                      onClick={handleWhatsAppRedirect}
                    >
                      Chat with us
                      <MessageCircle size={16} />
                    </button>
                    <button
                      className="pri-big-btn width100 flex flex-row items-center justify-center gap-4"
                      onClick={() => setStep(3)}
                      disabled={formData.genres.length === 0}
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Reading Preference */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-16"
                >
                  <div>
                    <span className="font-12 gray-500">Step 2 of 3</span>
                    <h3 className="font-18 weight-600 mt-8 mb-8">
                      What's your reading goal?
                    </h3>
                    <p className="font-12 dark-50 mb-12">
                      Choose what matters most to you
                    </p>

                    <div className="flex flex-col gap-8">
                      {READING_PREFERENCES.map((pref) => (
                        <button
                          key={pref.id}
                          className={`sec-mid-btn width100 ${formData.preference === pref.id ? "active" : ""}`}
                          onClick={() => updateFormData("preference", pref.id)}
                          style={{ padding: "12px 16px", textAlign: "left" }}
                        >
                          {pref.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row gap-12">
                    <button
                      className="sec-big-btn width100 flex flex-row items-center justify-center gap-4"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button
                      className="pri-big-btn width100 flex flex-row items-center justify-center gap-4"
                      onClick={handleSubmit}
                      disabled={!formData.preference}
                    >
                      Submit
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Recommendations */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-16"
                  style={{ maxHeight: "75vh", overflowY: "auto" }}
                >
                  {isLoading ? (
                    <div className="text-center py-32">
                      <div className="loading-spinner mb-12"></div>
                      <p className="font-14 dark-50">
                        Finding your perfect books...
                      </p>
                    </div>
                  ) : (
                    <>
                      {recommendations.length > 0 && (
                        <div>
                          <div className="text-center mb-16">
                            <p className="font-12 dark-50 mt-8">
                              Found {recommendations.length} books matching your
                              preferences
                            </p>
                          </div>

                          {/* Add All Buttons */}
                          <div className="flex flex-row gap-12 mb-16">
                            <button
                              onClick={handleAddAllToCart}
                              className="pri-big-btn flex flex-row gap-4 items-center justify-center"
                              style={{ flex: 1, background: "#10B981" }}
                            >
                              <ShoppingCart size={16} />
                              Add All to Cart
                            </button>
                            <button
                              onClick={handleAddAllToWishlist}
                              className="sec-big-btn flex flex-row gap-4 items-center justify-center"
                              style={{ flex: 1 }}
                            >
                              <Heart size={16} />
                              Add All to Wishlist
                            </button>
                          </div>

                          <div className="grid-2 margin-tp-12px">
                            {recommendations.map((book) => (
                              <BookCard key={book.id} book={book} />
                            ))}
                          </div>
                        </div>
                      )}

                      {recommendations.length === 0 && (
                        <div className="text-center py-32">
                          <p className="font-14 dark-50">
                            No books found matching your preferences. Try
                            different genres!
                          </p>
                          <button
                            className="sec-mid-btn mt-16"
                            onClick={() => setStep(2)}
                          >
                            Go back and select different genres
                          </button>
                        </div>
                      )}

                      {recommendations.length > 0 && (
                        <div className="flex flex-row gap-12">
                          <button
                            className="sec-big-btn flex flex-row gap-4 items-center justify-center width100"
                            onClick={handleWhatsAppRedirect}
                          >
                            <FaWhatsapp size={20} color="#25d366" />
                            Confused? Chat.
                          </button>
                          <button
                            className="pri-big-btn flex flex-row gap-4 items-center justify-center width100"
                            onClick={handleClose}
                          >
                            Start Exploring
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
