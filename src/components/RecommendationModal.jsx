"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  User,
  Heart,
  BookOpen,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { books } from "@/utils/book";
import { useRouter } from "next/navigation";
import LoadingButton from "./UI/LoadingButton";
import BookCard from "./BookCard";

// Get unique categories from books
const getAllCategories = () => {
  const categories = new Set();
  books.forEach((book) => {
    book.catalogue?.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories).slice(0, 15);
};

const GENRES = getAllCategories();

const AGE_GROUPS = [
  { id: "0-12", label: "Children (0-12 years)" },
  { id: "13-17", label: "Teen (13-17 years)" },
  { id: "18-25", label: "Young Adult (18-25 years)" },
  { id: "26-35", label: "Adult (26-35 years)" },
  { id: "36-50", label: "Mature (36-50 years)" },
  { id: "50+", label: "Senior (50+ years)" },
  { id: "any", label: "Any age" },
];

const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "prefer-not", label: "Prefer not to say" },
];

const READING_PREFERENCES = [
  { id: "entertainment", label: "Entertainment & Fun" },
  { id: "knowledge", label: "Knowledge & Learning" },
  { id: "self-improvement", label: "Self Improvement" },
  { id: "career", label: "Career & Business" },
];

export default function RecommendationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    genres: [],
    gender: "",
    ageGroup: "",
    preference: "",
  });
  const [recommendations, setRecommendations] = useState({
    categories: [],
    books: [],
  });
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenModal = sessionStorage.getItem("recommendationModalSeen");
      if (!hasSeenModal) {
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("recommendationModalSeen", "true");
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      "Hi! I'm looking for book recommendations. Can you help me?",
    );
    window.open(`https://wa.me/91771089108?text=${message}`, "_blank");
    handleClose();
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

  // Improved recommendation algorithm
  const generateRecommendations = () => {
    setIsLoading(true);

    setTimeout(() => {
      let filteredBooks = [...books];

      // 1. Filter by selected genres
      if (formData.genres.length > 0) {
        filteredBooks = filteredBooks.filter((book) =>
          book.catalogue?.some((cat) => formData.genres.includes(cat)),
        );
      }

      // 2. Score each book based on multiple factors
      const scoredBooks = filteredBooks.map((book) => {
        let score = 0;

        // Genre match score (multiple genres = higher score)
        if (formData.genres.length > 0) {
          const matchingGenres =
            book.catalogue?.filter((cat) => formData.genres.includes(cat))
              .length || 0;
          score += (matchingGenres / formData.genres.length) * 40;
        }

        // Reading preference matching
        if (formData.preference) {
          // You can add specific logic based on book metadata
          // For example, if preference is "entertainment", give higher score to fiction
          // If preference is "self-improvement", give higher score to self-help books
          const isFiction = book.catalogue?.some((cat) =>
            [
              "fiction",
              "novel",
              "story",
              "romance",
              "thriller",
              "mystery",
            ].includes(cat.toLowerCase()),
          );
          const isSelfHelp = book.catalogue?.some((cat) =>
            ["self-help", "motivation", "business", "psychology"].includes(
              cat.toLowerCase(),
            ),
          );

          if (formData.preference === "entertainment" && isFiction) score += 30;
          if (formData.preference === "self-improvement" && isSelfHelp)
            score += 30;
          if (formData.preference === "knowledge" && !isFiction) score += 30;
          if (formData.preference === "career" && isSelfHelp) score += 30;
        }

        // Price factor (give preference to books with good discounts)
        const discountPercent =
          ((book.originalPrice - book.discountedPrice) / book.originalPrice) *
          100;
        if (discountPercent > 30) score += 10;
        if (book.discountedPrice === 1) score += 5;

        // Stock availability
        if (book.stock > 0 && book.stock < 50) score += 5; // Limited stock - urgency

        // Randomization factor to avoid always showing same books (±5 points)
        score += Math.random() * 10;

        return { ...book, score };
      });

      // Sort by score (highest first)
      scoredBooks.sort((a, b) => b.score - a.score);

      // Get top 8 books
      const recommendedBooks = scoredBooks.slice(0, 8);

      // Get unique categories from recommended books
      const recommendedCategories = [
        ...new Set(recommendedBooks.flatMap((book) => book.catalogue || [])),
      ].slice(0, 4);

      setRecommendations({
        categories: recommendedCategories,
        books: recommendedBooks,
      });
      setStep(4);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = () => {
    generateRecommendations();
  };

  const handleCategoryClick = (category) => {
    handleClose();
    router.push(`/category/${category.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const handleBookClick = (bookId, bookName) => {
    handleClose();
    // Add to recently viewed
    const recentlyViewed = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]",
    );
    const filtered = recentlyViewed.filter((id) => id !== bookId);
    const updated = [bookId, ...filtered].slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("bookViewed", { detail: { bookId } }));

    router.push(`/books/${bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="bill-modal-overlay" onClick={handleClose}>
          <motion.div
            className="bill-modal recommendation-modal"
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

                    <LoadingButton
                      className="sec-big-btn width100"
                      onClick={handleWhatsAppRedirect}
                    >
                      <div className="flex flex-col">
                        <p className="weight-600 flex items-center gap-8 justify-center">
                          <MessageCircle size={16} />
                          Looking for some book?
                        </p>
                        <span className="font-10">
                          Chat with us on WhatsApp
                        </span>
                      </div>
                    </LoadingButton>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Genre Selection */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-16"
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
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          className={`sec-mid-btn ${formData.genres.includes(genre) ? "active" : ""}`}
                          onClick={() => toggleGenre(genre)}
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
                          style={{ padding: "8px 16px" }}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-16 weight-600 mb-8">
                      Gender (Optional)
                    </h3>
                    <div className="flex flex-wrap gap-8">
                      {GENDERS.map((gender) => (
                        <button
                          key={gender.id}
                          className={`sec-mid-btn ${formData.gender === gender.id ? "active" : ""}`}
                          onClick={() => updateFormData("gender", gender.id)}
                          style={{ padding: "8px 16px" }}
                        >
                          {gender.label}
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
                      Get Recommendations
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
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
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
                      {recommendations.books?.length > 0 && (
                        <div>
                          <h3 className="font-16 weight-600 mb-12">
                            Books You Might Love
                          </h3>
                          <div className="grid-2 margin-tp-12px">
                            {recommendations.books.map((book) => (
                              <BookCard key={book.id} book={book} />
                            ))}
                          </div>

                          {recommendations.books.length === 0 && (
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
                        </div>
                      )}

                      {recommendations.books.length > 0 && (
                        <button
                          className="pri-big-btn flex flex-row gap-4 items-center justify-center width100"
                          onClick={handleClose}
                        >
                          Start Exploring
                          <ArrowRight size={16} />
                        </button>
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
