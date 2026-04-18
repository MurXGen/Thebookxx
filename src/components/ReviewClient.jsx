"use client";

import { books } from "@/utils/book";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Star,
  BookOpen,
  Store,
  Gift,
  Phone,
  Award,
  Instagram,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("store"); // "store" or "book"
  const [selectedBook, setSelectedBook] = useState("");
  const [storeReview, setStoreReview] = useState("");
  const [bookReview, setBookReview] = useState("");
  const [storeRating, setStoreRating] = useState(0);
  const [bookRating, setBookRating] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

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

  const handleStoreSubmit = async () => {
    if (!storeReview || storeRating === 0) {
      setMessage("Please provide a rating and write your feedback.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `https://api.journalx.app/api/bookxTelegram/store-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review: storeReview,
            rating: storeRating,
            phoneNumber: phoneSubmitted ? phoneNumber : null,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Thank you for your feedback!");
        setStoreReview("");
        setStoreRating(0);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async () => {
    if (!selectedBook || !bookReview || bookRating === 0) {
      setMessage("Please select a book, rate it, and write a review.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `https://api.journalx.app/api/bookxTelegram/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: selectedBook,
            review: bookReview,
            rating: bookRating,
            phoneNumber: phoneSubmitted ? phoneNumber : null,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Book review submitted successfully!");
        setBookReview("");
        setBookRating(0);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `https://api.journalx.app/api/bookxTelegram/phone`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, type: activeTab }),
        },
      );

      if (res.ok) {
        setPhoneSubmitted(true);
        setMessage(
          "🎉 Great! You're now eligible to win! We'll notify you on WhatsApp.",
        );
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (err) {
      setMessage("Failed to save number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="star-button"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Star
              size={28}
              fill={star <= rating ? "#FFB800" : "none"}
              color={star <= rating ? "#FFB800" : "#D1D5DB"}
              style={{ transition: "all 0.2s" }}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="section-1200" style={{ padding: "40px 20px" }}>
      {/* Tabs */}
      <div className="flex flex-row gap-12 margin-btm-32px justify-center">
        <button
          className={`tab-button ${activeTab === "store" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("store");
            setMessage("");
            setShowPhoneInput(false);
          }}
        >
          <Store size={18} />
          Store Review
        </button>
        <button
          className={`tab-button ${activeTab === "book" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("book");
            setMessage("");
            setShowPhoneInput(false);
          }}
        >
          <BookOpen size={18} />
          Book Review
        </button>
      </div>

      {/* Store Review Tab */}
      {activeTab === "store" && (
        <div
          className="review-container"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div className="text-center margin-btm-24px">
            <h2 className="font-24 weight-600 margin-btm-8px">
              How was your experience?
            </h2>
            <p className="font-14 gray-500">
              Your feedback helps us serve you better
            </p>
          </div>

          {/* Rating Stars */}
          <div className="margin-btm-24px text-center">
            <label className="font-14 weight-500 margin-btm-12px block">
              Rate your experience
            </label>
            <StarRating rating={storeRating} onRatingChange={setStoreRating} />
          </div>

          {/* Review Input */}
          <div className="margin-btm-24px">
            <label className="font-14 weight-500 margin-btm-12px block">
              Your Feedback
            </label>
            <textarea
              className="sec-mid-btn"
              placeholder="Tell us about your experience with TheBookX..."
              value={storeReview}
              onChange={(e) => setStoreReview(e.target.value)}
              rows={5}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          {/* Prize Info Banner */}
          <div
            className="prize-banner"
            style={{
              background: "linear-gradient(135deg, #fb8500, #ffb703)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              color: "white",
            }}
          >
            <div className="flex flex-col gap-12 margin-btm-12px">
              <Gift size={32} />
              <span className="weight-600">Win Books Set Worth ₹499! 🎁</span>
            </div>
            <p className="font-14" style={{ opacity: 0.9 }}>
              Share your phone number to participate in our weekly lucky draw.
              Winners announced every Monday on Instagram!
            </p>
          </div>

          {/* Phone Number Input */}
          {!phoneSubmitted ? (
            <div className="flex flex-col gap-12">
              <div className="flex gap-12">
                <input
                  type="tel"
                  className="sec-mid-btn"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handlePhoneSubmit}
                  className="pri-big-btn"
                  disabled={loading}
                  style={{ padding: "0 24px" }}
                >
                  Submit
                </button>
              </div>
              <div className="font-12 gray-500 margin-tp-8px flex flex-row gap-12 items-center">
                <Instagram size={32} />
                Follow us on Instagram @thebookx for winner announcements
              </div>
            </div>
          ) : (
            <div
              className="success-message"
              style={{
                background: "#D1FAE5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle size={18} color="#10B981" />
              <span className="font-12">
                Number saved! You're in the lucky draw 🎉
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            className="pri-big-btn width100"
            onClick={handleStoreSubmit}
            disabled={loading || !storeReview || storeRating === 0}
            style={{ padding: "14px" }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>

          {message && (
            <div
              className={`margin-tp-16px text-center ${message.includes("✅") ? "green" : "red"}`}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* Book Review Tab */}
      {activeTab === "book" && (
        <div
          className="review-container"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div className="text-center margin-btm-24px">
            <h2 className="font-24 weight-600 margin-btm-8px">Review a Book</h2>
            <p className="font-14 gray-500">
              Share your thoughts about your favorite read
            </p>
          </div>

          {/* Book Selection */}
          <div className="margin-btm-24px">
            <label className="font-14 weight-500 margin-btm-12px block">
              Select Book
            </label>
            <select
              className="sec-mid-btn"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              style={{ width: "100%", padding: "12px" }}
            >
              <option value="">Choose a book...</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Preview */}
          {selectedBookData && (
            <div
              className="book-preview"
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px",
                background: "#F9FAFB",
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              {selectedBookData.image && (
                <Image
                  src={selectedBookData.image}
                  alt={selectedBookData.name}
                  width={80}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              )}
              <div>
                <h3 className="font-16 weight-600 margin-btm-4px">
                  {selectedBookData.name}
                </h3>
                <p className="font-12 gray-500">
                  by {selectedBookData.author || "Unknown Author"}
                </p>
              </div>
            </div>
          )}

          {/* Rating Stars */}
          <div className="margin-btm-24px text-center">
            <label className="font-14 weight-500 margin-btm-12px block">
              Rate this book
            </label>
            <StarRating rating={bookRating} onRatingChange={setBookRating} />
          </div>

          {/* Review Input */}
          <div className="margin-btm-24px">
            <label className="font-14 weight-500 margin-btm-12px block">
              Your Review
            </label>
            <textarea
              className="sec-mid-btn"
              placeholder="What did you think about this book? Share your honest opinion..."
              value={bookReview}
              onChange={(e) => setBookReview(e.target.value)}
              rows={5}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          {/* Prize Info Banner */}
          <div
            className="prize-banner"
            style={{
              background: "linear-gradient(135deg, #fb8500, #ffb703)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              color: "white",
            }}
          >
            <div className="flex flex-col gap-12 margin-btm-12px">
              <Gift size={32} />
              <span className="weight-600">Win Books Set Worth ₹499! 🎁</span>
            </div>
            <p className="font-14" style={{ opacity: 0.9 }}>
              Share your phone number to participate in our weekly lucky draw.
              Winners announced every Monday on Instagram!
            </p>
          </div>

          {/* Phone Number Input */}
          {!phoneSubmitted ? (
            <div className="flex flex-col gap-12">
              <div className="flex gap-12">
                <input
                  type="tel"
                  className="sec-mid-btn"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handlePhoneSubmit}
                  className="pri-big-btn"
                  disabled={loading}
                  style={{ padding: "0 24px" }}
                >
                  Submit
                </button>
              </div>
              <div className="font-12 gray-500 margin-tp-8px flex flex-row gap-12 items-center">
                <Instagram size={32} />
                Follow us on Instagram @thebookx for winner announcements
              </div>
            </div>
          ) : (
            <div
              className="success-message"
              style={{
                background: "#D1FAE5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle size={18} color="#10B981" />
              <span className="font-12">
                Number saved! You're in the lucky draw 🎉
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            className="pri-big-btn width100"
            onClick={handleBookSubmit}
            disabled={
              loading || !selectedBook || !bookReview || bookRating === 0
            }
            style={{ padding: "14px" }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>

          {message && (
            <div
              className={`margin-tp-16px text-center ${message.includes("✅") ? "green" : "red"}`}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
