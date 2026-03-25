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
        `https://api.journalx.app/api/thebookxpayments/review`,
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
    <div className="section flex justify-center">
      <div className="review-container flex flex-col gap-24 width100">
        {/* Dropdown */}
        <select
          className="review-dropdown"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">Select a Book</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))}
        </select>

        {/* ChatGPT Style Box */}
        <div className="review-box flex flex-col gap-16">
          {/* Book Image */}
          {selectedBookData && (
            <div className="review-image-wrapper">
              <img
                src={selectedBookData.image}
                alt={selectedBookData.name}
                className="review-image"
              />
            </div>
          )}

          {/* Textarea */}
          <textarea
            className="review-textarea"
            placeholder="Write your thoughts about this book..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="review-button"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Message */}
        {message && <p className="green font-14">{message}</p>}
      </div>
    </div>
  );
}
