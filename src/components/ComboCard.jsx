"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { getComboBooks, getComboPricing } from "@/utils/combos";
import { ShoppingBag, Check, Layers, Plus } from "lucide-react";
import { useState } from "react";

/**
 * Star-burst savings badge ("SAVE ₹30 · 10% OFF"). Used on combo cards, the
 * combo cover art and the combo detail page.
 */
export function ComboSaveBurst({ amount, pct, size = "md" }) {
  if (!(amount > 0)) return null;
  return (
    <span className={`combo-burst ${size}`} aria-label={`Save ₹${amount}`}>
      <span className="combo-burst-in">
        <small>SAVE</small>
        <b>₹{amount}</b>
        {pct ? <em>{pct}% OFF</em> : null}
      </span>
    </span>
  );
}

/**
 * Combined cover art for a combo: two books sit side by side with a "+" (pairs)
 * or fan out (3–4 book sets). Shared by the card and the detail page.
 */
export function ComboCoverArt({ items, burst, className = "" }) {
  const pair = items.length === 2;
  return (
    <div className={`combo-covers${pair ? " pair" : ""} ${className}`} aria-hidden="true">
      {items.slice(0, 4).map((b, i) => (
        <span className="combo-cover" key={b.id} style={{ zIndex: items.length - i }}>
          {b.image && <img src={b.image} alt="" loading="lazy" />}
        </span>
      ))}
      {pair && (
        <span className="combo-plus">
          <Plus size={14} strokeWidth={3} />
        </span>
      )}
      {burst}
    </div>
  );
}

/**
 * A single combo bundle card — combined covers, title, savings and one-tap
 * "Add combo" that drops every book in the bundle into the cart (keeping
 * whatever is already there). Used by the homepage scroller and /combos grid.
 */
export default function ComboCard({ combo }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const items = getComboBooks(combo);
  const { price, mrp, sum, comboOff, savings, count } = getComboPricing(combo);
  if (items.length < 2) return null;
  const href = `/combos/${combo.slug}`;
  // Pair combos advertise the extra combo saving; sets show the MRP saving.
  const burstAmt = combo.discountPct ? comboOff : 0;

  const handleAdd = () => {
    items.forEach((b) => addToCart(b.id, "card"));
    setAdded(true);
    showToast(
      combo.discountPct
        ? `Combo added: ${combo.discountPct}% off applied in your bag`
        : `${count} books from “${combo.title}” added to your bag`,
      "success",
    );
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className={`combo-card${combo.discountPct ? " combo-card-deal" : ""}`}>
      <div className="combo-badge-row">
        <span className="combo-cat">{combo.category}</span>
        <span className="combo-count">
          <Layers size={12} /> {count} books
        </span>
      </div>

      <Link href={href} className="combo-cover-link" aria-label={`View the ${combo.title} combo`}>
        <ComboCoverArt
          items={items}
          burst={<ComboSaveBurst amount={burstAmt} pct={combo.discountPct} size="sm" />}
        />
      </Link>

      <h3 className="combo-title">
        <Link href={href}>{combo.title}</Link>
      </h3>
      <p className="combo-tagline">{combo.tagline}</p>

      {/* Fixed 4-row list so every card lines up; extra books roll into "+N more". */}
      <ul className="combo-books">
        {items.slice(0, items.length > 4 ? 3 : 4).map((b) => (
          <li key={b.id}>{b.name}</li>
        ))}
        {items.length > 4 && <li className="combo-books-more">+{items.length - 3} more</li>}
      </ul>

      <div className="combo-price-row">
        <span className="combo-price">₹{price}</span>
        {combo.discountPct ? (
          <>
            <span className="combo-mrp">₹{sum}</span>
            <span className="combo-save">Save ₹{comboOff}</span>
          </>
        ) : (
          <>
            {mrp > price && <span className="combo-mrp">₹{mrp}</span>}
            {savings > 0 && <span className="combo-save">Save ₹{savings}</span>}
          </>
        )}
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
