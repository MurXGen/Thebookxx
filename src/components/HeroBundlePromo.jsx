"use client";

import { useMemo } from "react";
import { Zap, Check, Plus } from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

// Trust-led hero bundle: three reader-favourite books that a shopper can add in
// one tap. Framed around the "pay online → up to ₹100 cashback" hook.
const BUNDLE_IDS = ["bk-541", "bk-002", "bk-184"]; // Power of Now, Art of Clarity, Manifest

export default function HeroBundlePromo() {
  const { cart, addToCart } = useStore();

  const picks = useMemo(
    () => BUNDLE_IDS.map((id) => books.find((b) => b.id === id)).filter(Boolean),
    [],
  );
  if (picks.length < 3) return null;

  const subtotal = picks.reduce((s, b) => s + b.discountedPrice, 0);
  const inCart = (id) => cart.some((i) => i.id === id);
  const allIn = picks.every((b) => inCart(b.id));

  const addAll = () => {
    picks.forEach((b) => {
      if (!inCart(b.id)) addToCart(b.id);
    });
    showToast("Added all 3 to your bag — pay online for cashback 🎉", "success");
  };

  const addOne = (b) => {
    if (inCart(b.id)) return;
    addToCart(b.id);
    showToast(`${b.name} added to bag`, "success");
  };

  return (
    <section className="hbp" aria-labelledby="hbp-heading">
      <div className="hbp-head">
        <span className="hbp-eyebrow">
          <Zap size={13} /> Reader favourites
        </span>
        <h2 id="hbp-heading" className="hbp-title">
          Start with these 3 — grab up to <span className="hbp-cash">₹100 cashback</span>
        </h2>
        <p className="hbp-sub">
          Loved by thousands of readers. Add all three, pay online and unlock up
          to ₹100 back — no code needed.
        </p>
      </div>

      <div className="hbp-books">
        {picks.map((b) => {
          const added = inCart(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className={`hbp-book${added ? " added" : ""}`}
              onClick={() => addOne(b)}
              aria-label={added ? `${b.name} in bag` : `Add ${b.name}`}
            >
              <span className="hbp-cover">
                {b.image ? (
                  <img src={b.image} alt={b.name} loading="lazy" />
                ) : null}
                <span className="hbp-badge">
                  {added ? <Check size={13} /> : <Plus size={13} />}
                </span>
              </span>
              <span className="hbp-name">{b.name.replace(/\s*\(.*\)$/, "")}</span>
              <span className="hbp-price">₹{b.discountedPrice}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="hbp-cta"
        onClick={addAll}
        disabled={allIn}
      >
        {allIn ? (
          <>
            <Check size={17} /> All 3 in your bag
          </>
        ) : (
          <>
            Add all 3 to bag · ₹{subtotal}
          </>
        )}
      </button>
    </section>
  );
}
