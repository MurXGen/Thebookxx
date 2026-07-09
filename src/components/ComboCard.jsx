"use client";

import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { getComboBooks, getComboPricing } from "@/utils/combos";
import { ShoppingBag, Check, Layers } from "lucide-react";
import { useState } from "react";

/**
 * A single combo bundle card — fanned covers, title, savings and one-tap
 * "Add combo" that drops every book in the bundle into the cart (keeping
 * whatever is already there). Used by the homepage scroller and /combos grid.
 */
export default function ComboCard({ combo }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const items = getComboBooks(combo);
  const { price, mrp, savings, count } = getComboPricing(combo);
  if (items.length < 3) return null;

  const handleAdd = () => {
    items.forEach((b) => addToCart(b.id));
    setAdded(true);
    showToast(`${count} books from “${combo.title}” added to your bag`, "success");
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="combo-card">
      <div className="combo-badge-row">
        <span className="combo-cat">{combo.category}</span>
        <span className="combo-count">
          <Layers size={12} /> {count} books
        </span>
      </div>

      <div className="combo-covers" aria-hidden="true">
        {items.slice(0, 4).map((b, i) => (
          <span
            className="combo-cover"
            key={b.id}
            style={{ zIndex: items.length - i }}
          >
            {b.image && <img src={b.image} alt="" loading="lazy" />}
          </span>
        ))}
      </div>

      <h3 className="combo-title">{combo.title}</h3>
      <p className="combo-tagline">{combo.tagline}</p>

      <ul className="combo-books">
        {items.map((b) => (
          <li key={b.id} title={b.name}>
            {b.name}
          </li>
        ))}
      </ul>

      <div className="combo-price-row">
        <span className="combo-price">₹{price}</span>
        {mrp > price && <span className="combo-mrp">₹{mrp}</span>}
        {savings > 0 && <span className="combo-save">Save ₹{savings}</span>}
      </div>

      <button
        type="button"
        className={`combo-add ${added ? "added" : ""}`}
        onClick={handleAdd}
        aria-label={`Add the ${combo.title} combo to cart`}
      >
        {added ? (
          <>
            <Check size={17} /> Added to bag
          </>
        ) : (
          <>
            <ShoppingBag size={17} /> Add combo to bag
          </>
        )}
      </button>
    </article>
  );
}
