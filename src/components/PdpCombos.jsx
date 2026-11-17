"use client";

// Compact combo strip on the book page: the author's collections, then combos
// on the same shelf (genre + fiction side). Each card adds every book in one tap.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Check, Layers } from "lucide-react";
import { combos, getComboBooks, getComboPricing, primaryGenre, bookSide, sameShelf } from "@/utils/combos";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/ga";

const MAX = 60; // candidates kept
const BATCH = 10; // cards revealed per scroll batch

// Order: this author's collections → curated combos with this book that stay
// on its shelf → genre packs for its shelf → other on-shelf combos. A combo
// only shows when every other book shares this book's genre (no mixed sets).
function pickCombos(book) {
  const authorK = String(book.author || "").toLowerCase().replace(/[^a-z]/g, "");
  const inStock = (c) => {
    const items = getComboBooks(c);
    return items.length >= 2 && items.every((b) => b.stock !== 0);
  };
  const onShelf = (c) =>
    getComboBooks(c).every((b) => b.id === book.id || sameShelf(book, b));
  const shelf = `${primaryGenre(book)}|${bookSide(book)}`;

  const tiers = [
    // 1. Same author (with this book first in line)
    combos
      .filter((c) => c.auto === "author" && String(c.author || "").toLowerCase().replace(/[^a-z]/g, "") === authorK)
      .sort((a, b) => Number(b.bookIds.includes(book.id)) - Number(a.bookIds.includes(book.id))),
    // 2. Curated combos that include this book and stay on its shelf
    combos.filter((c) => !c.auto && c.bookIds.includes(book.id) && onShelf(c)),
    // 3. Genre packs for this shelf
    combos.filter((c) => c.auto === "genre" && c.genre === shelf),
    // 4. Other combos made only of same-shelf books
    combos.filter((c) => !c.auto && !c.bookIds.includes(book.id) && getComboBooks(c).every((b) => sameShelf(book, b))),
  ];
  const seen = new Set();
  const out = [];
  tiers.forEach((list, t) =>
    list.forEach((c) => {
      if (seen.has(c.id) || !inStock(c)) return;
      seen.add(c.id);
      out.push({ c, own: t < 2 || c.bookIds.includes(book.id) });
    }),
  );
  return out.slice(0, MAX);
}

export function MiniCombo({ combo, own, source = "pdp_combo" }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const items = getComboBooks(combo);
  const { price, mrp, sum, count } = getComboPricing(combo);
  const was = combo.discountPct ? sum : mrp;

  const add = () => {
    if (added) return;
    items.forEach((b) => addToCart(b.id, source));
    trackEvent(`${source}_add`, { combo_id: combo.id, own, price });
    showToast(
      combo.discountPct ? `Combo added: ${combo.discountPct}% off applied in your bag` : `${count} books added to your bag`,
      "success",
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className={`pdc-card${own ? " own" : ""}`}>
      <Link href={`/combos/${combo.slug}`} className="pdc-link" aria-label={`View the ${combo.title} combo`}>
        <span className="pdc-covers" aria-hidden="true">
          {items.slice(0, 3).map((b, i) => (
            <span key={b.id} className="pdc-cover" style={{ zIndex: 3 - i }}>
              {b.image && <img src={typeof b.image === "string" ? b.image : b.image?.src} alt="" loading="lazy" />}
            </span>
          ))}
          {count > 3 && <span className="pdc-more">+{count - 3}</span>}
        </span>
        <span className="pdc-title">{combo.title}</span>
      </Link>
      <div className="pdc-foot">
        <span className="pdc-price">
          <b>₹{price}</b>
          {was > price && <s>₹{was}</s>}
        </span>
        <button
          type="button"
          className={`pdc-add${added ? " on" : ""}`}
          onClick={add}
          aria-label={`Add the ${combo.title} combo to bag`}
        >
          {added ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
          {added ? "Added" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function PdpCombos({ book }) {
  const list = useMemo(() => pickCombos(book), [book]);
  const [shown, setShown] = useState(BATCH);
  const rowRef = useRef(null);
  const moreRef = useRef(null);

  // Start over on a new book.
  useEffect(() => {
    const t = setTimeout(() => setShown(BATCH), 0);
    rowRef.current?.scrollTo?.({ left: 0 });
    return () => clearTimeout(t);
  }, [book.id]);

  // Reveal the next batch when the skeletons at the end scroll into view.
  const hasMore = shown < list.length;
  useEffect(() => {
    const el = moreRef.current;
    if (!hasMore || !el || !("IntersectionObserver" in window)) return;
    let t;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || t) return;
        t = setTimeout(() => setShown((n) => Math.min(n + BATCH, list.length)), 450);
      },
      { root: rowRef.current, rootMargin: "0px 120px 0px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [hasMore, shown, list.length]);

  if (!list.length) return null;
  const hasOwn = list[0].own;

  return (
    <section className="pdc" aria-labelledby="pdc-h">
      <div className="pdc-head">
        <h2 id="pdc-h">
          <Layers size={15} strokeWidth={2.4} aria-hidden="true" />
          {hasOwn ? "Combos with this book" : "Popular combos"}
          <span className="pdc-count">{list.length}</span>
        </h2>
        <Link href="/combos" className="pdc-all">
          See all
        </Link>
      </div>
      <div className="pdc-row" ref={rowRef}>
        {list.slice(0, shown).map(({ c, own }) => (
          <MiniCombo key={c.id} combo={c} own={own} />
        ))}
        {hasMore && (
          <div ref={moreRef} className="pdc-skel-group" aria-label="Loading more combos">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pdc-card pdc-skel" aria-hidden="true">
                <span className="pdc-skel-covers" />
                <span className="pdc-skel-line" />
                <span className="pdc-skel-line short" />
                <span className="pdc-skel-foot" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
