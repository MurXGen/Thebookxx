"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Zap, BookOpen, Plus, Check, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartBar from "@/components/CartBar";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import QuickReadsReader from "./QuickReadsReader";
import { getQuickRead, QUICKREAD_PRICE } from "@/data/quickreads";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

// Client landing for a single book's QuickReads (opened from /quickreads/[slug]).
// The insight TITLES are shown as a table of contents — great for SEO and a
// teaser — while the full insight content stays behind the reader/paywall.
export default function QuickReadBookLanding({ book }) {
  // Open the reader straight away on this page (resume where they left off);
  // closing it reveals the landing + insight table of contents underneath.
  const [open, setOpen] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [resume, setResume] = useState(true);
  const { addQuickRead, isInQrCart } = useStore();
  const data = getQuickRead(book.id);
  const frames = data?.frames || [];

  // Jump to a specific insight.
  const readFrame = (i) => {
    setResume(false);
    setStartIndex(i);
    setOpen(true);
  };

  // Continue from wherever the reader last left off.
  const readResume = () => {
    setResume(true);
    setOpen(true);
  };

  return (
    <>
      <Navbar />

      <div className="qrb-landing">
        <Breadcrumbs
          items={[
            { label: "QuickReads", href: "/quickreads" },
            { label: `${book.name} QuickReads` },
          ]}
        />

        <div className="qrb-hero">
          <div className="qrb-cover">
            {book.image ? (
              <img src={book.image} alt={`${book.name} book cover`} />
            ) : (
              <BookOpen size={30} />
            )}
          </div>
          <div className="qrb-info">
            <span className="qrb-kicker">
              <Zap size={12} /> QuickReads by TheBookX
            </span>
            <h1 className="qrb-title">{book.name} QuickReads</h1>
            {book.author && <p className="qrb-author">by {book.author}</p>}
            <p className="qrb-meta">
              {frames.length} key insights · read in minutes · ₹{QUICKREAD_PRICE}
            </p>
          </div>
        </div>

        {/* Full-width CTA row, below the hero */}
        <div className="qrb-actions">
          <button type="button" className="pri-big-btn" onClick={readResume}>
            <BookOpen size={16} /> Read QuickReads
          </button>
          {isInQrCart(book.id) ? (
            <span className="sec-big-btn">
              <Check size={15} /> Added to Cart
            </span>
          ) : (
            <button
              type="button"
              className="sec-big-btn"
              onClick={() => {
                addQuickRead(book.id);
                showToast("Added to QuickReads cart", "success");
              }}
            >
              <Plus size={15} /> Add to Cart · ₹{QUICKREAD_PRICE}
            </button>
          )}
        </div>

        <section className="qrb-toc">
          <h2 className="qrb-toc-title">
            What you&apos;ll learn — {frames.length} insights from {book.name}
          </h2>
          <div className="qrb-toc-list">
            {frames.map((f, i) => (
              <div key={f.id} className="qrb-toc-item">
                <span className="qrb-toc-num">{i + 1}</span>
                <span className="qrb-toc-text">{f.title}</span>
                <button
                  type="button"
                  className="qr-read-outline"
                  onClick={() => readFrame(i)}
                  aria-label={`Read insight ${i + 1}: ${f.title}`}
                >
                  <Play size={13} /> Read
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {open && (
          <QuickReadsReader
            book={book}
            startIndex={startIndex}
            resume={resume}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <CartBar tab="quickreads" />
    </>
  );
}
