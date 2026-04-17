"use client";

import { books } from "@/utils/book";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  Gift,
  Phone,
  Send,
  Award,
  Instagram,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("store"); // "store" or "book"
  const [selectedBook, setSelectedBook] = useState("");
  const [review, setReview] = useState("");
  const [storeFeedback, setStoreFeedback] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
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

  const handleStoreReviewSubmit = async () => {
    if (!storeFeedback) {
      setMessageType("error");
      setMessage("Please share your experience with us.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`/api/storeReview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: storeFeedback,
          phoneNumber: phoneSubmitted ? phoneNumber : null,
          type: "store",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage("✅ Thank you for your feedback!");
        setStoreFeedback("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookReviewSubmit = async () => {
    if (!selectedBook || !review) {
      setMessageType("error");
      setMessage("Please select a book and write a review.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`/api/bookReview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook,
          review,
          phoneNumber: phoneSubmitted ? phoneNumber : null,
          type: "book",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage("✅ Review submitted successfully!");
        setReview("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      setMessageType("error");
      setMessage("Please enter a valid 10-digit mobile number.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/contestEntry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          reviewType: activeTab === "store" ? storeFeedback : review,
          bookId: activeTab === "book" ? selectedBook : null,
        }),
      });

      if (res.ok) {
        setPhoneSubmitted(true);
        setMessageType("success");
        setMessage(
          "🎉 Great! You're now entered in the contest. Winners announced every week on Instagram!",
        );
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-1200" style={{ padding: "40px 20px" }}>
      <div className="review-header text-center mb-32">
        <h1 className="font-28 weight-600 mb-8">Share Your Thoughts</h1>
        <p className="font-14 dark-50">
          Your feedback helps us grow and serve you better
        </p>
      </div>

      {/* Tabs */}
      <div
        className="review-tabs flex flex-row gap-8 mb-32"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          className={`review-tab ${activeTab === "store" ? "active" : ""}`}
          onClick={() => setActiveTab("store")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
            color: activeTab === "store" ? "#8b5cf6" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          <div className="flex items-center gap-8">
            <MessageSquare size={18} />
            Store Experience
          </div>
          {activeTab === "store" && (
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "2px",
                background: "#8b5cf6",
                borderRadius: "2px",
              }}
            />
          )}
        </button>

        <button
          className={`review-tab ${activeTab === "book" ? "active" : ""}`}
          onClick={() => setActiveTab("book")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
            color: activeTab === "book" ? "#8b5cf6" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          <div className="flex items-center gap-8">
            <Star size={18} />
            Book Review
          </div>
          {activeTab === "book" && (
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "2px",
                background: "#8b5cf6",
                borderRadius: "2px",
              }}
            />
          )}
        </button>
      </div>

      {/* Store Review Tab */}
      {activeTab === "store" && (
        <div className="review-content">
          <div
            className="review-card"
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div className="text-center mb-24">
              <div
                className="price-drop-badge"
                style={{
                  width: "auto",
                  display: "inline-flex",
                  marginBottom: "16px",
                }}
              >
                <MessageSquare size={16} />
                <span className="weight-600">How was your experience?</span>
              </div>
              <p className="font-14 dark-50">
                We'd love to hear your honest feedback about our store
              </p>
            </div>

            <textarea
              className="review-textarea"
              placeholder="Share your experience with TheBookX... (e.g., delivery speed, packaging, customer support, etc.)"
              value={storeFeedback}
              onChange={(e) => setStoreFeedback(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "24px",
              }}
            />

            <button
              className="pri-big-btn width100"
              onClick={handleStoreReviewSubmit}
              disabled={loading}
              style={{ marginBottom: "24px" }}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Book Review Tab */}
      {activeTab === "book" && (
        <div className="review-content">
          <div
            className="review-card"
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div className="text-center mb-24">
              <div
                className="price-drop-badge"
                style={{
                  width: "auto",
                  display: "inline-flex",
                  marginBottom: "16px",
                }}
              >
                <Star size={16} />
                <span className="weight-600">Review a Book</span>
              </div>
              <p className="font-14 dark-50">
                Help others discover great reads with your honest review
              </p>
            </div>

            {/* Book Selection Dropdown */}
            <div className="form-group mb-20">
              <label className="font-14 weight-500 mb-8 block">
                Select Book
              </label>
              <div className="relative">
                <select
                  className="book-select"
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "14px",
                    background: "#fff",
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="">Choose a book...</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#9ca3af",
                  }}
                />
              </div>
            </div>

            {/* Book Preview */}
            {selectedBookData && (
              <div
                className="book-preview mb-24"
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  alignItems: "center",
                }}
              >
                {selectedBookData.image && (
                  <Image
                    src={selectedBookData.image}
                    alt={selectedBookData.name}
                    width={60}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                )}
                <div>
                  <h3 className="font-16 weight-600">
                    {selectedBookData.name}
                  </h3>
                  <p className="font-12 dark-50 mt-4">
                    by {selectedBookData.author || "Unknown Author"}
                  </p>
                </div>
              </div>
            )}

            {/* Review Textarea */}
            <textarea
              className="review-textarea"
              placeholder="Write your honest review... What did you like? What could be better?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "24px",
              }}
            />

            <button
              className="pri-big-btn width100"
              onClick={handleBookReviewSubmit}
              disabled={loading}
              style={{ marginBottom: "24px" }}
            >
              {loading ? "Submitting..." : "Submit Review"}
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Contest Section */}
      {!phoneSubmitted ? (
        <div
          className="contest-section mt-32"
          style={{
            background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid #e9d5ff",
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-24">
            <div className="flex-shrink-0">
              <div
                className="gift-icon"
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Gift size={40} color="white" />
              </div>
            </div>

            <div className="flex-grow text-center md:text-left">
              <h3 className="font-20 weight-600 mb-8 flex items-center justify-center md:justify-start gap-8">
                <Award size={20} className="purple" />
                Win a ₹499 Books Gift Set!
              </h3>
              <p className="font-14 dark-50 mb-12">
                Share your review and get a chance to win exciting book sets
                worth ₹499 with FREE shipping!
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-8 justify-center md:justify-start">
                  <CheckCircle size={14} className="green" />
                  <span className="font-12">Weekly winners announced</span>
                </div>
                <div className="flex items-center gap-8 justify-center md:justify-start">
                  <Instagram size={14} className="purple" />
                  <span className="font-12">
                    Follow us on Instagram for winner announcements
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 width100 md:width-auto">
              {!showPhoneInput ? (
                <button
                  className="pri-big-btn width100"
                  onClick={() => setShowPhoneInput(true)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Phone size={16} />
                  Enter to Win
                </button>
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="flex gap-8">
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
                      className="pri-big-btn"
                      onClick={handlePhoneSubmit}
                      disabled={loading}
                      style={{ padding: "12px 24px" }}
                    >
                      Submit
                    </button>
                  </div>
                  <p className="font-10 dark-50 text-center">
                    Winners announced every week on our Instagram page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="contest-success mt-32"
          style={{
            background: "#ecfdf5",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #a7f3d0",
            textAlign: "center",
          }}
        >
          <CheckCircle
            size={40}
            className="green"
            style={{ marginBottom: "12px" }}
          />
          <h3 className="font-18 weight-600 mb-8">You're in the Contest! 🎉</h3>
          <p className="font-14 dark-50 mb-12">
            Your number {phoneNumber} has been registered. Winners are announced
            every week on our Instagram page.
          </p>
          <a
            href="https://instagram.com/thebookx.in"
            target="_blank"
            rel="noopener noreferrer"
            className="pri-big-btn inline-flex"
            style={{ width: "auto", padding: "10px 24px" }}
          >
            <Instagram size={16} />
            Follow us on Instagram
          </a>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`message-display mt-20 p-16 rounded-12 flex items-center gap-8 justify-center ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
          style={{
            background: messageType === "success" ? "#ecfdf5" : "#fef2f2",
            color: messageType === "success" ? "#065f46" : "#991b1b",
            borderRadius: "12px",
          }}
        >
          {messageType === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="font-14">{message}</span>
        </div>
      )}
    </div>
  );
}
