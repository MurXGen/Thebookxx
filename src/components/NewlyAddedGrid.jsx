"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Loader2, Sparkles } from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Compact 2-row scrollable rail of the newest books (with price + savings).
export default function NewlyAddedGrid() {
  const { cart, addToCart } = useStore();
  const [loadingId, setLoadingId] = useState(null);

  const newest = [...books]
    .slice(-50)
    .reverse()
    .filter((b) => b.image)
    .slice(0, 24);
  if (!newest.length) return null;

  const inCart = (id) => cart.some((i) => i.id === id);

  const handleAdd = (book) => {
    if (loadingId) return;
    setLoadingId(book.id);
    setTimeout(() => {
      addToCart(book.id);
      setLoadingId(null);
      showToast(`Added to your bag 🎉 “${book.name}”`, "success");
    }, 450);
  };

  return (
    <section className="or1-section" aria-labelledby="na-heading">
      <div className="section-1200 or1-inner">
        <div className="or1-head">
          <div className="or1-head-left">
            <span className="or1-badge">
              <Sparkles size={13} /> NEW ARRIVALS
            </span>
            <h2 id="na-heading" className="or1-title">
              Fresh off the shelf
            </h2>
            <p className="or1-sub">Just added — be the first to grab them.</p>
          </div>
          <span className="or1-save-pill">
            <Sparkles size={13} /> Just in
          </span>
        </div>

        <div className="or1-scroll">
          <div className="or1-grid">
            {newest.map((b) => {
              const on = inCart(b.id);
              const loading = loadingId === b.id;
              const url = `/books/${slugify(b.name)}`;
              const mrp = Number(b.originalPrice) || 0;
              const now = Number(b.discountedPrice) || 0;
              const save = mrp > now ? mrp - now : 0;
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
                      aria-label={on ? "In your bag" : `Add ${b.name} to bag`}
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
                    <span className="or1-now">₹{now}</span>
                    {mrp > now && <span className="or1-mrp">₹{mrp}</span>}
                  </div>
                  {save > 0 && (
                    <span className="or1-save-tag">You save ₹{save}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
