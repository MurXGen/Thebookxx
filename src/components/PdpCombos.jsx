"use client";

// Compact combo strip on the book page: this book's combos first, then a few
// other popular combos. Each card adds every book in the combo in one tap.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Check, Layers } from "lucide-react";
import { combos, pairCombos, getComboBooks, getComboPricing } from "@/utils/combos";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/ga";

const MAX = 8;

function pickCombos(bookId) {
  const own = combos.filter((c) => c.bookIds.includes(bookId));
  const seen = new Set(own.map((c) => c.id));
  // Fill with other 2-book deals, then curated sets, so the row is never empty.
  const others = [...pairCombos, ...combos].filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  return [...own.map((c) => ({ c, own: true })), ...others.map((c) => ({ c, own: false }))]
    .filter(({ c }) => getComboBooks(c).length >= 2 && getComboBooks(c).every((b) => b.stock !== 0))
    .slice(0, MAX);
}

function MiniCombo({ combo, own }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const items = getComboBooks(combo);
  const { price, mrp, sum, count } = getComboPricing(combo);
  const was = combo.discountPct ? sum : mrp;

  const add = () => {
    if (added) return;
    items.forEach((b) => addToCart(b.id, "pdp_combo"));
    trackEvent("pdp_combo_add", { combo_id: combo.id, own, price });
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
  const list = useMemo(() => pickCombos(book.id), [book.id]);
  if (!list.length) return null;
  const hasOwn = list[0].own;

  return (
    <section className="pdc" aria-labelledby="pdc-h">
      <div className="pdc-head">
        <h2 id="pdc-h">
          <Layers size={15} strokeWidth={2.4} aria-hidden="true" />
          {hasOwn ? "Combos with this book" : "Popular combos"}
        </h2>
        <Link href="/combos" className="pdc-all">
          See all
        </Link>
      </div>
      <div className="pdc-row">
        {list.map(({ c, own }) => (
          <MiniCombo key={c.id} combo={c} own={own} />
        ))}
      </div>
    </section>
  );
}
