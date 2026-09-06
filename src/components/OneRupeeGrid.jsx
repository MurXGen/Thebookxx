"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Sparkles, Loader2 } from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Compact 2-row, horizontally-scrollable rail of ₹1 books. Two rows scroll
// together (grid-auto-flow: column) so twice the books fit in the same height.
export default function OneRupeeGrid() {
  const { cart, addToCart } = useStore();
  const [loadingId, setLoadingId] = useState(null);
  const oneRupee = books.filter((b) => b.discountedPrice === 1 && b.image);
  if (!oneRupee.length) return null;

  const inCart = (id) => cart.some((i) => i.id === id);
  // Allotment rule: only one ₹1 book per order.
  const oneRupeeInCartId = (() => {
    const it = cart.find((i) => {
      const b = books.find((x) => x.id === i.id);
      return b?.discountedPrice === 1;
    });
    return it?.id || null;
  })();

  const handleAdd = (book) => {
    // Already this book → gentle nudge, no dup.
    if (inCart(book.id)) {
      showToast("It's already in your bag 🛍️", "info");
      return;
    }
    // Another ₹1 book already claimed → friendly one-per-order message.
    if (oneRupeeInCartId && oneRupeeInCartId !== book.id) {
      showToast(
        "Just one ₹1 book per order 😊 Remove the one in your bag to pick this instead.",
        "info",
      );
      return;
    }
    if (loadingId) return;
    setLoadingId(book.id);
    // Brief loading so the tap feels responsive, then confirm.
    setTimeout(() => {
      addToCart(book.id);
      setLoadingId(null);
      showToast(`Added for ₹1 🎉 “${book.name}” is in your bag`, "success");
    }, 450);
  };
  const maxSave = Math.max(
    0,
    ...oneRupee.map((b) => (Number(b.originalPrice) || 0) - 1),
  );

  return (
    <section className="or1-section" aria-labelledby="or1-heading">
      <div className="section-1200 or1-inner">
        <div className="or1-head">
          <div className="or1-head-left">
            <span className="or1-badge">
              {/* coin / rupee savings mark */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
                <path
                  d="M8.5 7.5h7M8.5 10.5h7M14.5 7.5c0 3-2 4.2-4.8 4.2H9l4.5 4.8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ₹1 STORE
            </span>
            <h2 id="or1-heading" className="or1-title">
              Bestsellers at just <span className="or1-accent">₹1</span>
            </h2>
            <p className="or1-sub">Handpicked reads — pay ₹1, keep forever.</p>
          </div>
          <span className="or1-save-pill">
            <Sparkles size={13} /> Save up to ₹{maxSave}
          </span>
        </div>

        <div className="or1-scroll">
          <div className="or1-grid">
            {oneRupee.map((b) => {
              const on = inCart(b.id);
              const loading = loadingId === b.id;
              const url = `/books/${slugify(b.name)}`;
              return (
                <div className="or1-card" key={b.id}>
                  <div className="or1-cover">
                    <Link href={url} className="or1-cover-link" aria-label={b.name}>
                      <img src={b.image} alt={b.name} loading="lazy" />
                    </Link>
                    <button
                      type="button"
                      className={`or1-add${on ? " on" : ""}${loading ? " loading" : ""}`}
                      onClick={() => handleAdd(b)}
                      disabled={loading}
                      aria-label={on ? "Added to bag" : `Add ${b.name} to bag`}
                    >
                      {loading ? (
                        <Loader2 size={16} className="or1-spin" />
                      ) : on ? (
                        <Check size={16} strokeWidth={3} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                  </div>
                  <Link href={url} className="or1-name">
                    {b.name}
                  </Link>
                  <div className="or1-price">
                    <span className="or1-now">₹1</span>
                    {Number(b.originalPrice) > 1 && (
                      <span className="or1-mrp">₹{b.originalPrice}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
