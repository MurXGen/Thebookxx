"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { books } from "@/utils/book";
import Image from "next/image";

export default function ReviewClient() {
  const searchParams = useSearchParams();

  const [selectedBook, setSelectedBook] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBookData = books.find(
    (b) => b.id.trim() === selectedBook.trim(),
  );

  useEffect(() => {
    const bookId = searchParams.get("bk");

    if (bookId) {
      setSelectedBook(bookId);
    }
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
        {/* Dropdown */}
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

        {/* Book Preview */}
        {selectedBookData && (
          <div className="book-preview">
            <Image
              src={selectedBookData.image}
              alt={selectedBookData.name}
              width={120}
              height={160}
            />
            <h3>{selectedBookData.name}</h3>
          </div>
        )}

        {/* Textarea */}
        <textarea
          className="review-textarea"
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        {/* Button */}
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
