"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Zap, BookOpen, Sparkles } from "lucide-react";
import { books } from "@/utils/book";
import {
  quickReadBookIds,
  quickReadFrameCount,
  QUICKREAD_PRICE,
} from "@/data/quickreads";
import { showToast } from "@/context/ToastContext";
import { useStore } from "@/context/StoreContext";
import { Check, Plus } from "lucide-react";

// Slug used by the /quickreads/[slug] route.
function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function QuickReadsSection() {
  const { addQuickRead, isInQrCart } = useStore();

  const seenNames = new Set();
  const items = quickReadBookIds()
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean)
    // Same title can exist under multiple catalogue ids — show it once.
    .filter((b) => {
      const key = (b.name || "").trim().toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

  return (
    <section className="qr-section section-1200">
      <div className="qr-section-head">
        <span className="qr-section-kicker">
          <Sparkles size={14} /> QuickReads by TheBookX
        </span>
        <h2 className="qr-section-title">
          Big ideas from great books — in minutes
        </h2>
        <p className="qr-section-sub">
          Skip the 200+ pages. Get the most valuable lessons, frameworks and
          insights, beautifully bite-sized.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="qr-empty-state">No QuickReads available yet.</div>
      ) : (
        <div className="qr-grid">
          {items.map((book, i) => {
            const count = quickReadFrameCount(book.id);
            return (
              <motion.article
                key={book.id}
                className="qr-book-card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/quickreads/${slugify(book.name)}`}
                  className="qr-book-cover"
                  aria-label={`Read QuickReads for ${book.name}`}
                >
                  {book.image ? (
                    <Image
                      src={book.image}
                      alt={book.name}
                      width={150}
                      height={210}
                      className="qr-book-img"
                    />
                  ) : (
                    <div className="qr-book-img qr-book-ph">
                      <BookOpen size={26} />
                    </div>
                  )}
                  <span className="qr-badge">
                    <Zap size={11} /> QuickReads
                  </span>
                </Link>

                <div className="qr-book-info">
                  <h3 className="qr-book-name">{book.name}</h3>
                  <span className="qr-book-author">{book.author}</span>
                  <span className="qr-book-meta">{count} insights</span>
                </div>

                <div className="qr-book-foot">
                  <span className="qr-book-price">₹{QUICKREAD_PRICE}</span>
                  {isInQrCart(book.id) ? (
                    <span
                      className="qr-cart-icon added"
                      title="Added to cart"
                      aria-label="Added to cart"
                    >
                      <Check size={17} />
                    </span>
                  ) : (
                    <button
                      className="qr-cart-icon"
                      onClick={() => {
                        addQuickRead(book.id);
                        showToast("Added to QuickReads cart", "success");
                      }}
                      title="Add to cart"
                      aria-label={`Add ${book.name} to cart`}
                    >
                      <Plus size={17} />
                    </button>
                  )}
                </div>
                <Link
                  href={`/quickreads/${slugify(book.name)}`}
                  className="qr-read-full"
                >
                  <BookOpen size={15} /> Read
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
