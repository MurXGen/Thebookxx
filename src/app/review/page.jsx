"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { books } from "@/utils/book";

export default function ReviewPage() {
  const searchParams = useSearchParams();

  const [selectedBook, setSelectedBook] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBookData = books.find((b) => b.id === selectedBook);

  useEffect(() => {
    const bookId = searchParams.get("bk");
    if (bookId) setSelectedBook(bookId);
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!selectedBook || !review) {
      setMessage("Please select a book and write a review.");
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
          body: JSON.stringify({ bookId: selectedBook, review }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Review submitted successfully!");
        setReview("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-page">
      <div className="review-container">
        <div className="review-header">
          <h1>Share Your Thoughts</h1>
          <p>Write a meaningful review for your favorite book</p>
        </div>

        <div className="review-form">
          {/* Custom Select Dropdown */}
          <div className="select-wrapper">
            <select
              className="book-select"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">Choose a book...</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Preview Card */}
          {selectedBookData && (
            <div className="book-preview">
              <div className="book-preview-image">
                <img src={selectedBookData.image} alt={selectedBookData.name} />
              </div>
              <div className="book-preview-info">
                <h3>{selectedBookData.name}</h3>
                {/* <p className="book-author">
                  {selectedBookData.author || "Unknown Author"}
                </p> */}
              </div>
            </div>
          )}

          {/* Review Input */}
          <div className="review-input-wrapper">
            <textarea
              className="review-textarea"
              placeholder="What did you think about this book? Share your experience, favorite moments, or constructive feedback..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              "Publish Review"
            )}
          </button>

          {/* Message Toast */}
          {message && (
            <div
              className={`message-toast ${message.includes("✅") ? "success" : "error"}`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
