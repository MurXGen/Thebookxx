"use client";

import { useMemo } from "react";
import { Zap, Check } from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

// Trust-led "top 3 reader favourites" podium. Ranked #1 The Art of Clarity,
// #2 The Power of Now, #3 Manifest. No prices — pure social proof + one-tap add,
// framed around the "pay online, get up to ₹100 cashback" hook.
const RANKED = [
  { id: "bk-005", rank: 1 }, // Atomic Habits
  { id: "bk-002", rank: 2 }, // The Art of Clarity
  { id: "bk-391", rank: 3 }, // Ikigai
];
// Visual podium order: 2nd, 1st (centre, tallest), 3rd.
const PODIUM_ORDER = [2, 1, 3];

export default function HeroBundlePromo() {
  const { cart, addToCart } = useStore();

  const picks = useMemo(
    () =>
      RANKED.map((r) => {
        const b = books.find((x) => x.id === r.id);
        return b ? { ...b, rank: r.rank } : null;
      }).filter(Boolean),
    [],
  );
  if (picks.length < 3) return null;

  const byRank = (r) => picks.find((b) => b.rank === r);
  const inCart = (id) => cart.some((i) => i.id === id);
  const allIn = picks.every((b) => inCart(b.id));

  const cleanName = (n) => String(n || "").replace(/\s*\(.*\)$/, "").trim();

  const addAll = () => {
    picks.forEach((b) => {
      if (!inCart(b.id)) addToCart(b.id);
    });
    showToast("Added all 3 to your bag. Pay online for cashback 🎉", "success");
  };

  const addOne = (b) => {
    if (inCart(b.id)) return;
    addToCart(b.id);
    showToast(`${cleanName(b.name)} added to bag`, "success");
  };

  // Lightweight SEO: an ItemList of the ranked titles.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Most-read books on TheBookX",
    itemListElement: picks
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((b) => ({
        "@type": "ListItem",
        position: b.rank,
        name: cleanName(b.name),
      })),
  };

  return (
    <section className="hbp" aria-labelledby="hbp-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="hbp-head">
        <span className="hbp-eyebrow">
          <Zap size={13} /> Reader favourites
        </span>
        <h2 id="hbp-heading" className="hbp-title">
          The 3 books readers can&apos;t put down
        </h2>
        <p className="hbp-sub">
          Thousands of readers are reading these right now. Add all three, pay
          online and unlock up to <b className="hbp-cash">₹100 cashback</b>.
        </p>
      </div>

      <div className="hbp-podium" role="list">
        {PODIUM_ORDER.map((r) => {
          const b = byRank(r);
          if (!b) return null;
          const added = inCart(b.id);
          return (
            <button
              key={b.id}
              type="button"
              role="listitem"
              className={`hbp-slot hbp-rank-${r}${added ? " added" : ""}`}
              onClick={() => addOne(b)}
              aria-label={
                added
                  ? `${cleanName(b.name)} is in your bag`
                  : `Add ${cleanName(b.name)}, ranked number ${r}`
              }
            >
              <span className={`hbp-medal hbp-medal-${r}`}>{r}</span>
              <span className="hbp-cover">
                {b.image ? (
                  <img
                    src={b.image}
                    alt={`${cleanName(b.name)} — #${r} most-read book on TheBookX`}
                    loading="lazy"
                  />
                ) : null}
                {added && (
                  <span className="hbp-added-tick">
                    <Check size={14} />
                  </span>
                )}
              </span>
              <span className="hbp-name">{cleanName(b.name)}</span>
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
          "Add all 3 to bag"
        )}
      </button>
      <span className="hbp-proof">📖 Being read by thousands of readers now</span>
    </section>
  );
}
