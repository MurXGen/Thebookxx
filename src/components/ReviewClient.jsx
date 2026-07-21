"use client";

import { books } from "@/utils/book";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  BookOpen,
  Store,
  Gift,
  Mail,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import ScratchCard from "@/components/UI/ScratchCard";
import ReviewsShowcase from "@/components/ReviewsShowcase";
import {
  submitReviewToSheet,
  isReviewRateLimited,
  recordReviewSubmission,
} from "@/utils/reviewForm";

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("store");
  const [selectedBook, setSelectedBook] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showScratch, setShowScratch] = useState(false);

  const selectedBookData = books.find(
    (b) => b.id.trim() === selectedBook.trim(),
  );

  useEffect(() => {
    const bookId = searchParams.get("bk");
    if (bookId) {
      setSelectedBook(bookId);
      setActiveTab("book");
    }
  }, [searchParams]);

  const resetForm = () => {
    setReview("");
    setRating(0);
  };

  const contactValid = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const phoneOk = /^\d{10}$/.test(phone.replace(/\D/g, ""));
    return emailOk || phoneOk;
  };

  const notifyTelegram = async (payload) => {
    const url =
      activeTab === "book"
        ? "https://api.journalx.app/api/bookxTelegram/review"
        : "https://api.journalx.app/api/bookxTelegram/store-review";
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Review Telegram failed:", e);
    }
  };

  const handleSubmit = async () => {
    setMessage("");
    if (rating === 0 || !review.trim()) {
      setMessage("Please give a rating and write your review.");
      return;
    }
    if (activeTab === "book" && !selectedBook) {
      setMessage("Please pick the book you're reviewing.");
      return;
    }
    if (!contactValid()) {
      setMessage("Add your email or 10-digit phone to enter the giveaway.");
      return;
    }
    if (isReviewRateLimited()) {
      setMessage("Too many reviews from this device. Please try again later.");
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, "");
    const bookName = activeTab === "book" ? selectedBookData?.name || "" : "";
    const payload = {
      review: review.trim(),
      rating,
      email: email.trim() || null,
      phoneNumber: cleanPhone || null,
      bookId: activeTab === "book" ? selectedBook : undefined,
      bookName: bookName || undefined,
      type: activeTab === "book" ? "Book" : "Store",
    };

    try {
      await notifyTelegram(payload);
      await submitReviewToSheet({
        type: activeTab === "book" ? "Book" : "Store",
        bookName,
        rating,
        review: review.trim(),
        email: email.trim(),
        phone: cleanPhone,
        timestamp: new Date().toLocaleString("en-IN"),
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent.slice(0, 300)
            : "",
      });
      recordReviewSubmission();
      resetForm();
      setShowScratch(true);
    } catch (e) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange }) => (
    <div className="rv-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="rv-star-btn"
          onClick={() => onChange(star)}
          aria-label={`${star} star`}
        >
          <Star
            size={34}
            fill={star <= value ? "#FFB800" : "none"}
            color={star <= value ? "#FFB800" : "#D1D5DB"}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="rv-page">
      {/* Hero */}
      <div className="rv-hero">
        <h1 className="rv-hero-title">Share your experience</h1>
        <p className="rv-hero-sub">
          Your honest words help thousands of readers — and help us do better.
        </p>
        <div className="rv-win">
          <Gift size={18} />
          <span>
            Leave a review for a <b>chance to win a book for FREE</b> 🎁
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="rv-tabs">
        <button
          className={`rv-tab${activeTab === "store" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("store");
            setMessage("");
          }}
        >
          <Store size={17} /> Store
        </button>
        <button
          className={`rv-tab${activeTab === "book" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("book");
            setMessage("");
          }}
        >
          <BookOpen size={17} /> A Book
        </button>
      </div>

      <div className="rv-card">
        {activeTab === "book" && (
          <div className="rv-field">
            <label className="rv-label">Which book?</label>
            <select
              className="rv-select"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">Choose a book…</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {selectedBookData && (
              <div className="rv-book-preview">
                {selectedBookData.image && (
                  <Image
                    src={selectedBookData.image}
                    alt={selectedBookData.name}
                    width={54}
                    height={76}
                    className="rv-book-cover"
                  />
                )}
                <div>
                  <div className="rv-book-name">{selectedBookData.name}</div>
                  <div className="rv-book-author">
                    by {selectedBookData.author || "Unknown"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rv-field rv-rating-field">
          <label className="rv-label">
            {activeTab === "book" ? "Rate this book" : "Rate your experience"}
          </label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div className="rv-field">
          <label className="rv-label">Your review</label>
          <textarea
            className="rv-textarea"
            rows={4}
            placeholder={
              activeTab === "book"
                ? "What did you think of this book?"
                : "How was your experience with TheBookX?"
            }
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        {/* Contact / giveaway */}
        <div className="rv-contact">
          <div className="rv-contact-head">
            <Sparkles size={15} /> Enter the giveaway — email or phone
          </div>
          <div className="rv-contact-row">
            <div className="rv-input-wrap">
              <Mail size={15} />
              <input
                type="email"
                className="rv-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="rv-input-wrap">
              <Phone size={15} />
              <input
                type="tel"
                inputMode="numeric"
                className="rv-input"
                placeholder="Phone"
                value={phone}
                maxLength={10}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />
            </div>
          </div>
        </div>

        <button
          className="rv-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting…" : "Submit & Scratch to win"}
        </button>

        {message && <div className="rv-message">{message}</div>}
      </div>

      {/* Reviews from readers (real + curated) */}
      <ReviewsShowcase />

      {/* Scratch card reward */}
      <AnimatePresence>
        {showScratch && (
          <motion.div
            className="rv-scratch-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rv-scratch-modal"
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <button
                type="button"
                className="rv-scratch-close"
                onClick={() => setShowScratch(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="rv-scratch-head">
                🎉 Thanks for your review!
              </div>
              <p className="rv-scratch-sub">Scratch the card below</p>
              <ScratchCard
                revealText="Better luck next time"
                revealSub="We'll be in touch if you win 💛"
              />
              <button
                type="button"
                className="rv-scratch-done"
                onClick={() => setShowScratch(false)}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
